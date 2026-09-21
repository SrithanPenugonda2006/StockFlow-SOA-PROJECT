package com.omnistock.inventory_service.service;

import com.omnistock.inventory_service.dto.BatchDTO;
import com.omnistock.inventory_service.entity.Batch;
import com.omnistock.inventory_service.entity.Warehouse;
import com.omnistock.inventory_service.exception.ResourceNotFoundException;
import com.omnistock.inventory_service.repository.BatchRepository;
import com.omnistock.inventory_service.repository.WarehouseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class BatchService {

    @Autowired
    private BatchRepository batchRepository;

    @Autowired
    private WarehouseRepository warehouseRepository;

    // Hardcoded fallback product names for demo catalog resolution if external product service is offline
    private static final Map<Long, String> PRODUCT_NAMES = Map.of(
        1L, "MacBook Pro 16\" M3 Max",
        2L, "Dell UltraSharp 32\" 4K Monitor",
        3L, "Samsung 990 PRO 2TB NVMe M.2 SSD",
        4L, "Mechanical Keyboard RGB"
    );

    @Transactional(readOnly = true)
    public List<BatchDTO> getAllBatches(String search) {
        List<Batch> batches;
        if (search != null && !search.trim().isEmpty()) {
            batches = batchRepository.findByBatchNumberContainingIgnoreCaseOrSerialNumberContainingIgnoreCase(search.trim(), search.trim());
        } else {
            batches = batchRepository.findAll();
        }

        Map<Long, String> warehouseMap = warehouseRepository.findAll().stream()
                .collect(Collectors.toMap(Warehouse::getId, Warehouse::getName, (a, b) -> a));

        return batches.stream().map(b -> mapToDTO(b, warehouseMap)).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BatchDTO getBatchById(Long id) {
        Batch b = batchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found with id: " + id));
        String whName = warehouseRepository.findById(b.getWarehouseId())
                .map(Warehouse::getName)
                .orElse("WH-" + b.getWarehouseId());
        return mapToDTO(b, Map.of(b.getWarehouseId(), whName));
    }

    @Transactional
    public BatchDTO createBatch(BatchDTO dto) {
        String cleanBatchNum = dto.getBatchNumber().trim();
        if (batchRepository.existsByBatchNumber(cleanBatchNum)) {
            throw new IllegalArgumentException("Batch with number '" + cleanBatchNum + "' already exists.");
        }

        Batch batch = new Batch(
            cleanBatchNum,
            dto.getSerialNumber() != null ? dto.getSerialNumber().trim() : null,
            dto.getProductId(),
            dto.getWarehouseId(),
            dto.getQuantity() != null ? dto.getQuantity() : 0,
            dto.getMfgDate(),
            dto.getExpiryDate(),
            dto.getStatus()
        );

        Batch saved = batchRepository.save(batch);
        return getBatchById(saved.getId());
    }

    @Transactional
    public BatchDTO updateBatch(Long id, BatchDTO dto) {
        Batch b = batchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found with id: " + id));

        if (dto.getBatchNumber() != null) b.setBatchNumber(dto.getBatchNumber().trim());
        if (dto.getSerialNumber() != null) b.setSerialNumber(dto.getSerialNumber().trim());
        if (dto.getQuantity() != null) b.setQuantity(dto.getQuantity());
        if (dto.getMfgDate() != null) b.setMfgDate(dto.getMfgDate());
        if (dto.getExpiryDate() != null) b.setExpiryDate(dto.getExpiryDate());
        if (dto.getStatus() != null) b.setStatus(dto.getStatus());

        Batch updated = batchRepository.save(b);
        return getBatchById(updated.getId());
    }

    private BatchDTO mapToDTO(Batch b, Map<Long, String> warehouseMap) {
        BatchDTO dto = new BatchDTO();
        dto.setId(b.getId());
        dto.setBatchNumber(b.getBatchNumber());
        dto.setSerialNumber(b.getSerialNumber());
        dto.setProductId(b.getProductId());
        dto.setProductName(PRODUCT_NAMES.getOrDefault(b.getProductId(), "Product #" + b.getProductId()));
        dto.setWarehouseId(b.getWarehouseId());
        dto.setWarehouseName(warehouseMap.getOrDefault(b.getWarehouseId(), "WH-" + b.getWarehouseId()));
        dto.setQuantity(b.getQuantity());
        dto.setMfgDate(b.getMfgDate());
        dto.setExpiryDate(b.getExpiryDate());
        dto.setStatus(b.getStatus());
        dto.setCreatedAt(b.getCreatedAt());
        dto.setUpdatedAt(b.getUpdatedAt());
        return dto;
    }
}
