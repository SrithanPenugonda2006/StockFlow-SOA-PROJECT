package com.omnistock.order_service.controller;

import com.omnistock.order_service.dto.CreateOrderRequest;
import com.omnistock.order_service.dto.OrderDTO;
import com.omnistock.order_service.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<OrderDTO> createOrder(
            @Valid @RequestBody CreateOrderRequest request,
            @RequestHeader(value = "X-Auth-User-Id", required = false) String userId) {
        return new ResponseEntity<>(orderService.createOrder(request, userId), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<Page<OrderDTO>> getOrders(Pageable pageable) {
        return ResponseEntity.ok(orderService.getOrders(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderDTO> getOrder(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrder(id));
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<Page<OrderDTO>> getOrdersByCustomer(
            @PathVariable String customerId,
            @RequestHeader(value = "X-Auth-User-Id", required = false) String userId,
            @RequestHeader(value = "X-Auth-User-Role", required = false) String role,
            Pageable pageable) {
        return ResponseEntity.ok(orderService.getOrdersByCustomer(customerId, userId, role));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<OrderDTO> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> statusMap,
            @RequestHeader(value = "X-Auth-User-Role", required = false) String role) {
        String status = statusMap.get("status");
        return ResponseEntity.ok(orderService.updateOrderStatus(id, status, role));
    }
}
