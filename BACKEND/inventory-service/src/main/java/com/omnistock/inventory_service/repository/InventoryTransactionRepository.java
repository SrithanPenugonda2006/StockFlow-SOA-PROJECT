package com.omnistock.inventory_service.repository;

import com.omnistock.inventory_service.entity.InventoryTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventoryTransactionRepository extends JpaRepository<InventoryTransaction, Long> {
    Page<InventoryTransaction> findByProductIdAndWarehouseId(Long productId, Long warehouseId, Pageable pageable);
    Page<InventoryTransaction> findByProductId(Long productId, Pageable pageable);
    Page<InventoryTransaction> findByWarehouseId(Long warehouseId, Pageable pageable);
}
