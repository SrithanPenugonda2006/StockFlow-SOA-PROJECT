package com.omnistock.order_service.repository;

import com.omnistock.order_service.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Page<Order> findByCustomerId(String customerId, Pageable pageable);
    Optional<Order> findByIdempotencyKey(String idempotencyKey);
}
