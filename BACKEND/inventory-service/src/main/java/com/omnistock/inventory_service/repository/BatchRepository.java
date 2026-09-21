package com.omnistock.inventory_service.repository;

import com.omnistock.inventory_service.entity.Batch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BatchRepository extends JpaRepository<Batch, Long> {
    Optional<Batch> findByBatchNumber(String batchNumber);
    boolean existsByBatchNumber(String batchNumber);
    List<Batch> findByBatchNumberContainingIgnoreCaseOrSerialNumberContainingIgnoreCase(String batchNumber, String serialNumber);
}
