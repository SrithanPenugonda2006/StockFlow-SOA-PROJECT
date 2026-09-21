package com.omnistock.order_service;

import com.omnistock.order_service.client.InventoryClient;
import com.omnistock.order_service.client.ProductClient;
import com.omnistock.order_service.dto.CreateOrderRequest;
import com.omnistock.order_service.dto.OrderDTO;
import com.omnistock.order_service.entity.Order;
import com.omnistock.order_service.exception.InsufficientStockException;
import com.omnistock.order_service.exception.ResourceNotFoundException;
import com.omnistock.order_service.repository.OrderRepository;
import com.omnistock.order_service.service.OrderService;
import feign.FeignException;
import feign.Request;
import feign.Response;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OrderServiceApplicationTests {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private ProductClient productClient;

    @Mock
    private InventoryClient inventoryClient;

    @InjectMocks
    private OrderService orderService;

    private CreateOrderRequest createOrderRequest;

    @BeforeEach
    void setUp() {
        CreateOrderRequest.OrderItemRequest item = new CreateOrderRequest.OrderItemRequest();
        item.setProductId(1L);
        item.setQuantity(2);

        createOrderRequest = new CreateOrderRequest();
        createOrderRequest.setCustomerId("CUST-100");
        createOrderRequest.setItems(List.of(item));
    }

    @Test
    void createOrder_SuccessfulReservation_CreatesOrderInConfirmedState() {
        Map<String, Object> productMap = new HashMap<>();
        productMap.put("id", 1L);
        productMap.put("name", "Test Product");
        productMap.put("price", "50.00");

        Order savedOrder = new Order();
        savedOrder.setId(1L);
        savedOrder.setCustomerId("CUST-100");
        savedOrder.setStatus(Order.OrderStatus.CONFIRMED);
        savedOrder.setTotalAmount(new BigDecimal("100.00"));
        savedOrder.setItems(Collections.emptyList());

        when(productClient.getProductById(1L)).thenReturn(productMap);
        when(inventoryClient.reserveStock(any())).thenReturn(Map.of("status", "SUCCESS"));
        when(inventoryClient.confirmReservation(any())).thenReturn(Map.of("status", "SUCCESS"));
        when(orderRepository.save(any(Order.class))).thenReturn(savedOrder);

        OrderDTO order = orderService.createOrder(createOrderRequest, "customer1");

        assertThat(order).isNotNull();
        assertThat(order.getCustomerId()).isEqualTo("CUST-100");
        verify(inventoryClient).confirmReservation(any());
    }

    @Test
    void createOrder_FailedReservation_ThrowsInsufficientStockException() {
        Map<String, Object> productMap = new HashMap<>();
        productMap.put("id", 1L);
        productMap.put("price", "50.00");

        when(productClient.getProductById(1L)).thenReturn(productMap);
        
        Request request = Request.create(Request.HttpMethod.POST, "/api/inventory/reserve", Map.of(), null, null, null);
        FeignException.Conflict feignConflict = new FeignException.Conflict("Stock unavailable", request, null, Map.of());
        
        when(inventoryClient.reserveStock(any())).thenThrow(feignConflict);
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        assertThatThrownBy(() -> orderService.createOrder(createOrderRequest, "customer1"))
                .isInstanceOf(InsufficientStockException.class)
                .hasMessageContaining("Insufficient stock");
    }

    @Test
    void getOrder_NotFound_ThrowsResourceNotFoundException() {
        when(orderRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> orderService.getOrder(99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
