package com.omnistock.order_service.service;

import com.omnistock.order_service.client.InventoryClient;
import com.omnistock.order_service.client.ProductClient;
import com.omnistock.order_service.dto.CreateOrderRequest;
import com.omnistock.order_service.dto.OrderDTO;
import com.omnistock.order_service.entity.Order;
import com.omnistock.order_service.entity.OrderItem;
import com.omnistock.order_service.exception.InsufficientStockException;
import com.omnistock.order_service.exception.ResourceNotFoundException;
import com.omnistock.order_service.exception.UnauthorizedException;
import com.omnistock.order_service.repository.OrderRepository;
import feign.FeignException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    private final OrderRepository orderRepository;
    private final ProductClient productClient;
    private final InventoryClient inventoryClient;

    public OrderService(OrderRepository orderRepository, ProductClient productClient,
                        InventoryClient inventoryClient) {
        this.orderRepository = orderRepository;
        this.productClient = productClient;
        this.inventoryClient = inventoryClient;
    }

    @Transactional
    public OrderDTO createOrder(CreateOrderRequest request, String authenticatedUser) {

        // ── Idempotency Check ────────────────────────────────────────────────
        if (request.getIdempotencyKey() != null) {
            Optional<Order> existing = orderRepository.findByIdempotencyKey(request.getIdempotencyKey());
            if (existing.isPresent()) {
                log.info("Duplicate order request detected, returning existing order: {}", existing.get().getId());
                return mapToDto(existing.get());
            }
        }

        // ── Create PENDING Order ─────────────────────────────────────────────
        Order order = new Order();
        order.setCustomerId(request.getCustomerId());
        order.setStatus(Order.OrderStatus.PENDING);
        order.setIdempotencyKey(request.getIdempotencyKey());

        List<OrderItem> items = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        // ── Validate Products & Prices ───────────────────────────────────────
        for (CreateOrderRequest.OrderItemRequest itemReq : request.getItems()) {
            if (itemReq.getQuantity() == null || itemReq.getQuantity() <= 0) {
                throw new IllegalArgumentException("Item quantity must be positive for product: " + itemReq.getProductId());
            }

            Map<String, Object> product;
            try {
                product = productClient.getProductById(itemReq.getProductId());
            } catch (FeignException.NotFound e) {
                throw new ResourceNotFoundException("Product not found: " + itemReq.getProductId());
            } catch (FeignException e) {
                throw new RuntimeException("Product service unavailable: " + e.getMessage());
            }

            BigDecimal price = new BigDecimal(product.get("price").toString());

            OrderItem item = new OrderItem();
            item.setOrder(order);
            item.setProductId(itemReq.getProductId());
            item.setQuantity(itemReq.getQuantity());
            item.setPrice(price);

            items.add(item);
            total = total.add(price.multiply(BigDecimal.valueOf(itemReq.getQuantity())));
        }

        order.setItems(items);
        order.setTotalAmount(total);
        order = orderRepository.save(order);
        final Long orderId = order.getId();

        // ── Reserve Stock (with compensating transaction on failure) ─────────
        List<Long> reservedProductIds = new ArrayList<>();
        try {
            for (CreateOrderRequest.OrderItemRequest itemReq : request.getItems()) {
                Map<String, Object> reserveReq = new HashMap<>();
                reserveReq.put("productId", itemReq.getProductId());
                reserveReq.put("quantity", itemReq.getQuantity());
                reserveReq.put("referenceId", "ORDER-" + orderId);
                reserveReq.put("performedBy", authenticatedUser);

                try {
                    inventoryClient.reserveStock(reserveReq);
                    reservedProductIds.add(itemReq.getProductId());
                } catch (FeignException.Conflict e) {
                    // Insufficient stock — release previously reserved items
                    releaseReservedStock(reservedProductIds, request, orderId, authenticatedUser);
                    order.setStatus(Order.OrderStatus.FAILED);
                    orderRepository.save(order);
                    throw new InsufficientStockException("Insufficient stock for product: " + itemReq.getProductId());
                } catch (FeignException e) {
                    releaseReservedStock(reservedProductIds, request, orderId, authenticatedUser);
                    order.setStatus(Order.OrderStatus.FAILED);
                    orderRepository.save(order);
                    throw new RuntimeException("Inventory service unavailable: " + e.getMessage());
                }
            }
        } catch (RuntimeException ex) {
            throw ex;
        }

        // ── Confirm Reservations ─────────────────────────────────────────────
        try {
            for (CreateOrderRequest.OrderItemRequest itemReq : request.getItems()) {
                Map<String, Object> confirmReq = new HashMap<>();
                confirmReq.put("productId", itemReq.getProductId());
                confirmReq.put("quantity", itemReq.getQuantity());
                confirmReq.put("referenceId", "ORDER-" + orderId);
                confirmReq.put("performedBy", authenticatedUser);
                inventoryClient.confirmReservation(confirmReq);
            }
        } catch (Exception e) {
            // Release all reservations if confirmation fails
            releaseReservedStock(reservedProductIds, request, orderId, authenticatedUser);
            order.setStatus(Order.OrderStatus.FAILED);
            orderRepository.save(order);
            throw new RuntimeException("Failed to confirm inventory reservation: " + e.getMessage());
        }

        order.setStatus(Order.OrderStatus.CONFIRMED);
        order = orderRepository.save(order);

        log.info("Order {} created and confirmed for customer {}", orderId, request.getCustomerId());
        return mapToDto(order);
    }

    private void releaseReservedStock(List<Long> reservedProductIds, CreateOrderRequest request,
                                      Long orderId, String performedBy) {
        for (Long productId : reservedProductIds) {
            Integer qty = request.getItems().stream()
                    .filter(i -> i.getProductId().equals(productId))
                    .map(CreateOrderRequest.OrderItemRequest::getQuantity)
                    .findFirst().orElse(0);

            try {
                Map<String, Object> releaseReq = new HashMap<>();
                releaseReq.put("productId", productId);
                releaseReq.put("quantity", qty);
                releaseReq.put("referenceId", "ORDER-" + orderId + "-RELEASE");
                releaseReq.put("performedBy", performedBy);
                inventoryClient.releaseStock(releaseReq);
            } catch (Exception ex) {
                log.error("Failed to release stock for product {} after order failure: {}", productId, ex.getMessage());
            }
        }
    }

    public Page<OrderDTO> getOrders(Pageable pageable) {
        return orderRepository.findAll(pageable).map(this::mapToDto);
    }

    public OrderDTO getOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + id));
        return mapToDto(order);
    }

    public Page<OrderDTO> getOrdersByCustomer(String customerId, String authenticatedUser, String role) {
        // Customers can only see their own orders
        if ("CUSTOMER".equals(role) && !customerId.equals(authenticatedUser)) {
            throw new UnauthorizedException("You are not authorized to view orders for customer: " + customerId);
        }
        return orderRepository.findByCustomerId(customerId, Pageable.unpaged()).map(this::mapToDto);
    }

    @Transactional
    public OrderDTO updateOrderStatus(Long id, String status, String role) {
        if (!"ADMIN".equals(role) && !"MANAGER".equals(role)) {
            throw new UnauthorizedException("Only ADMIN or MANAGER can update order status");
        }

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + id));

        order.setStatus(Order.OrderStatus.valueOf(status.toUpperCase()));
        order = orderRepository.save(order);
        return mapToDto(order);
    }

    private OrderDTO mapToDto(Order order) {
        OrderDTO dto = new OrderDTO();
        dto.setId(order.getId());
        dto.setCustomerId(order.getCustomerId());
        dto.setStatus(order.getStatus());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setCreatedAt(order.getCreatedAt());
        dto.setUpdatedAt(order.getUpdatedAt());

        List<OrderDTO.OrderItemDTO> itemDtos = order.getItems().stream().map(item -> {
            OrderDTO.OrderItemDTO itemDto = new OrderDTO.OrderItemDTO();
            itemDto.setId(item.getId());
            itemDto.setProductId(item.getProductId());
            itemDto.setQuantity(item.getQuantity());
            itemDto.setPrice(item.getPrice());
            return itemDto;
        }).collect(Collectors.toList());

        dto.setItems(itemDtos);
        return dto;
    }
}
