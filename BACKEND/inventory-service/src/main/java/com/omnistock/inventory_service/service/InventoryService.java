package com.omnistock.inventory_service.service;

import com.omnistock.inventory_service.dto.*;
import com.omnistock.inventory_service.entity.Inventory;
import com.omnistock.inventory_service.entity.InventoryTransaction;
import com.omnistock.inventory_service.entity.InventoryTransaction.TransactionType;
import com.omnistock.inventory_service.entity.Warehouse;
import com.omnistock.inventory_service.exception.InsufficientStockException;
import com.omnistock.inventory_service.exception.ResourceNotFoundException;
import com.omnistock.inventory_service.repository.InventoryRepository;
import com.omnistock.inventory_service.repository.InventoryTransactionRepository;
import com.omnistock.inventory_service.repository.WarehouseRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final InventoryTransactionRepository transactionRepository;
    private final WarehouseRepository warehouseRepository;

    @Value("${omnistock.inventory.low-stock-threshold:25}")
    private int lowStockThreshold;

    public InventoryService(InventoryRepository inventoryRepository,
                            InventoryTransactionRepository transactionRepository,
                            WarehouseRepository warehouseRepository) {
        this.inventoryRepository = inventoryRepository;
        this.transactionRepository = transactionRepository;
        this.warehouseRepository = warehouseRepository;
    }

    // ─── Warehouse Operations ─────────────────────────────────────────────────

    public WarehouseDTO createWarehouse(WarehouseDTO dto) {
        Warehouse warehouse = new Warehouse();
        warehouse.setName(dto.getName());
        warehouse.setLocation(dto.getLocation());
        warehouse = warehouseRepository.save(warehouse);
        return mapWarehouseToDto(warehouse);
    }

    public List<WarehouseDTO> getAllWarehouses() {
        return warehouseRepository.findAll().stream()
                .map(this::mapWarehouseToDto)
                .collect(Collectors.toList());
    }

    public WarehouseDTO getWarehouse(Long id) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found: " + id));
        return mapWarehouseToDto(warehouse);
    }

    public WarehouseDTO updateWarehouse(Long id, WarehouseDTO dto) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found: " + id));
        warehouse.setName(dto.getName());
        warehouse.setLocation(dto.getLocation());
        warehouse = warehouseRepository.save(warehouse);
        return mapWarehouseToDto(warehouse);
    }

    @Transactional
    public void deleteWarehouse(Long id) {
        if (!warehouseRepository.existsById(id)) {
            throw new ResourceNotFoundException("Warehouse not found: " + id);
        }
        List<Inventory> activeInventory = inventoryRepository.findByWarehouseId(id);
        if (!activeInventory.isEmpty()) {
            inventoryRepository.deleteAll(activeInventory);
        }
        warehouseRepository.deleteById(id);
    }

    // ─── Inventory Operations ─────────────────────────────────────────────────

    @Transactional
    public InventoryDTO addInventory(InventoryDTO dto, String performedBy) {
        if (!warehouseRepository.existsById(dto.getWarehouseId())) {
            throw new ResourceNotFoundException("Warehouse not found: " + dto.getWarehouseId());
        }

        Inventory inventory = inventoryRepository
                .findByProductIdAndWarehouseId(dto.getProductId(), dto.getWarehouseId())
                .orElse(null);

        if (inventory == null) {
            inventory = new Inventory();
            inventory.setProductId(dto.getProductId());
            inventory.setWarehouseId(dto.getWarehouseId());
            inventory.setQuantity(0);
            inventory.setReservedQuantity(0);
        }

        int previousQuantity = inventory.getQuantity();
        inventory.setQuantity(inventory.getQuantity() + dto.getQuantity());
        inventory = inventoryRepository.save(inventory);

        recordTransaction(inventory.getProductId(), inventory.getWarehouseId(),
                TransactionType.RESTOCK, dto.getQuantity(), previousQuantity,
                inventory.getQuantity(), "Stock added", null, performedBy);

        return mapInventoryToDto(inventory);
    }

    @Transactional
    public InventoryDTO updateInventory(Long id, InventoryDTO dto, String performedBy) {
        Inventory inventory = inventoryRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory not found: " + id));

        if (dto.getQuantity() < 0) {
            throw new IllegalArgumentException("Quantity cannot be negative");
        }

        int previousQuantity = inventory.getQuantity();
        inventory.setQuantity(dto.getQuantity());
        inventory = inventoryRepository.save(inventory);

        int diff = dto.getQuantity() - previousQuantity;
        recordTransaction(inventory.getProductId(), inventory.getWarehouseId(),
                TransactionType.ADJUSTMENT, Math.abs(diff), previousQuantity,
                inventory.getQuantity(), "Manual inventory update", null, performedBy);

        return mapInventoryToDto(inventory);
    }

    public InventoryDTO getInventory(Long id) {
        Inventory inventory = inventoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory not found: " + id));
        return mapInventoryToDto(inventory);
    }

    public List<InventoryDTO> getInventoryByProduct(Long productId) {
        return inventoryRepository.findByProductId(productId).stream()
                .map(this::mapInventoryToDto)
                .collect(Collectors.toList());
    }

    public List<InventoryDTO> getInventoryByWarehouse(Long warehouseId) {
        return inventoryRepository.findByWarehouseId(warehouseId).stream()
                .map(this::mapInventoryToDto)
                .collect(Collectors.toList());
    }

    // ─── Stock Reservation ────────────────────────────────────────────────────

    /**
     * Reserves stock from the warehouse with the most available inventory.
     * Uses pessimistic locking to prevent overselling under concurrent load.
     */
    @Transactional
    public InventoryDTO reserveStock(StockReservationRequest request) {
        List<Inventory> inventories = inventoryRepository.findByProductId(request.getProductId());

        // Select warehouse with highest available stock (deterministic strategy)
        Inventory bestInventory = inventories.stream()
                .filter(i -> i.getAvailableQuantity() >= request.getQuantity())
                .max((a, b) -> Integer.compare(a.getAvailableQuantity(), b.getAvailableQuantity()))
                .orElseThrow(() -> new InsufficientStockException(
                        "Insufficient stock for product: " + request.getProductId()));

        // Re-fetch with pessimistic lock to prevent concurrent overselling
        Inventory inventory = inventoryRepository.findByIdForUpdate(bestInventory.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Inventory not found"));

        // Re-check after acquiring lock
        if (inventory.getAvailableQuantity() < request.getQuantity()) {
            throw new InsufficientStockException(
                    "Insufficient stock for product: " + request.getProductId() +
                    " (available: " + inventory.getAvailableQuantity() + ", requested: " + request.getQuantity() + ")");
        }

        int previousReserved = inventory.getReservedQuantity();
        inventory.setReservedQuantity(inventory.getReservedQuantity() + request.getQuantity());
        inventory = inventoryRepository.save(inventory);

        recordTransaction(inventory.getProductId(), inventory.getWarehouseId(),
                TransactionType.RESERVATION, request.getQuantity(), previousReserved,
                inventory.getReservedQuantity(), "Stock reserved",
                request.getReferenceId(), request.getPerformedBy());

        return mapInventoryToDto(inventory);
    }

    @Transactional
    public InventoryDTO releaseStock(StockReservationRequest request) {
        List<Inventory> inventories = inventoryRepository.findByProductId(request.getProductId());

        Inventory inventory = inventories.stream()
                .filter(i -> i.getReservedQuantity() > 0)
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No reserved stock found for product: " + request.getProductId()));

        Inventory locked = inventoryRepository.findByIdForUpdate(inventory.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Inventory not found"));

        int previousReserved = locked.getReservedQuantity();
        int toRelease = Math.min(request.getQuantity(), locked.getReservedQuantity());
        locked.setReservedQuantity(locked.getReservedQuantity() - toRelease);
        locked = inventoryRepository.save(locked);

        recordTransaction(locked.getProductId(), locked.getWarehouseId(),
                TransactionType.RELEASE, toRelease, previousReserved,
                locked.getReservedQuantity(), "Stock released",
                request.getReferenceId(), request.getPerformedBy());

        return mapInventoryToDto(locked);
    }

    @Transactional
    public InventoryDTO confirmReservation(StockReservationRequest request) {
        List<Inventory> inventories = inventoryRepository.findByProductId(request.getProductId());

        Inventory inventory = inventories.stream()
                .filter(i -> i.getReservedQuantity() >= request.getQuantity())
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No sufficient reservation found for product: " + request.getProductId()));

        Inventory locked = inventoryRepository.findByIdForUpdate(inventory.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Inventory not found"));

        int previousQty = locked.getQuantity();
        int previousReserved = locked.getReservedQuantity();

        locked.setQuantity(locked.getQuantity() - request.getQuantity());
        locked.setReservedQuantity(locked.getReservedQuantity() - request.getQuantity());

        if (locked.getQuantity() < 0) {
            throw new InsufficientStockException("Inventory quantity cannot go negative");
        }

        locked = inventoryRepository.save(locked);

        recordTransaction(locked.getProductId(), locked.getWarehouseId(),
                TransactionType.SALE, request.getQuantity(), previousQty,
                locked.getQuantity(), "Reservation confirmed / sale completed",
                request.getReferenceId(), request.getPerformedBy());

        return mapInventoryToDto(locked);
    }

    // ─── Reconciliation ───────────────────────────────────────────────────────

    @Transactional
    public InventoryDTO reconcileInventory(ReconciliationRequest request) {
        Inventory inventory = inventoryRepository
                .findByProductIdAndWarehouseIdForUpdate(request.getProductId(), request.getWarehouseId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Inventory not found for product " + request.getProductId() +
                        " in warehouse " + request.getWarehouseId()));

        int previousQuantity = inventory.getQuantity();
        int difference = request.getPhysicalQuantity() - previousQuantity;

        inventory.setQuantity(request.getPhysicalQuantity());
        inventory = inventoryRepository.save(inventory);

        recordTransaction(inventory.getProductId(), inventory.getWarehouseId(),
                TransactionType.RECONCILIATION, Math.abs(difference), previousQuantity,
                inventory.getQuantity(),
                request.getReason() != null ? request.getReason() : "Stock reconciliation (diff: " + difference + ")",
                null, request.getPerformedBy());

        return mapInventoryToDto(inventory);
    }

    // ─── Low Stock ────────────────────────────────────────────────────────────

    public List<LowStockDTO> getLowStockInventory() {
        List<Inventory> lowStock = inventoryRepository.findLowStockInventory(lowStockThreshold);

        return lowStock.stream().map(i -> {
            LowStockDTO dto = new LowStockDTO();
            dto.setProductId(i.getProductId());
            dto.setWarehouseId(i.getWarehouseId());
            dto.setQuantity(i.getQuantity());
            dto.setReservedQuantity(i.getReservedQuantity());
            dto.setAvailableQuantity(i.getAvailableQuantity());
            dto.setThreshold(lowStockThreshold);

            warehouseRepository.findById(i.getWarehouseId())
                    .ifPresent(w -> dto.setWarehouseName(w.getName()));

            return dto;
        }).collect(Collectors.toList());
    }

    // ─── Transaction History ──────────────────────────────────────────────────

    public Page<InventoryTransaction> getTransactionHistory(Long productId, Long warehouseId, Pageable pageable) {
        if (productId != null && warehouseId != null) {
            return transactionRepository.findByProductIdAndWarehouseId(productId, warehouseId, pageable);
        } else if (productId != null) {
            return transactionRepository.findByProductId(productId, pageable);
        } else if (warehouseId != null) {
            return transactionRepository.findByWarehouseId(warehouseId, pageable);
        }
        return transactionRepository.findAll(pageable);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private void recordTransaction(Long productId, Long warehouseId, TransactionType type,
                                   int quantity, int previousQty, int newQty,
                                   String reason, String referenceId, String performedBy) {
        InventoryTransaction tx = new InventoryTransaction();
        tx.setProductId(productId);
        tx.setWarehouseId(warehouseId);
        tx.setTransactionType(type);
        tx.setQuantity(quantity);
        tx.setPreviousQuantity(previousQty);
        tx.setNewQuantity(newQty);
        tx.setReason(reason);
        tx.setReferenceId(referenceId);
        tx.setPerformedBy(performedBy);
        transactionRepository.save(tx);
    }

    private WarehouseDTO mapWarehouseToDto(Warehouse w) {
        WarehouseDTO dto = new WarehouseDTO();
        dto.setId(w.getId());
        dto.setName(w.getName());
        dto.setLocation(w.getLocation());
        return dto;
    }

    private InventoryDTO mapInventoryToDto(Inventory i) {
        InventoryDTO dto = new InventoryDTO();
        dto.setId(i.getId());
        dto.setProductId(i.getProductId());
        dto.setWarehouseId(i.getWarehouseId());
        dto.setQuantity(i.getQuantity());
        dto.setReservedQuantity(i.getReservedQuantity());
        dto.setAvailableQuantity(i.getAvailableQuantity());
        dto.setVersion(i.getVersion());
        return dto;
    }
}
