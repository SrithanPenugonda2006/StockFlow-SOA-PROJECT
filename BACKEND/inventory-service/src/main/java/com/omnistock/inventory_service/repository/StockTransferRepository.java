package com.omnistock.inventory_service.repository;

import com.omnistock.inventory_service.entity.StockTransfer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StockTransferRepository extends JpaRepository<StockTransfer, Long> {
    Optional<StockTransfer> findByTransferNumber(String transferNumber);
    List<StockTransfer> findBySourceWarehouseId(Long sourceWarehouseId);
    List<StockTransfer> findByDestinationWarehouseId(Long destinationWarehouseId);
    Page<StockTransfer> findByStatus(StockTransfer.TransferStatus status, Pageable pageable);
}
