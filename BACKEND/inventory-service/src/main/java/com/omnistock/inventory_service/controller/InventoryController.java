package com.omnistock.inventory_service.controller;

import com.omnistock.inventory_service.dto.*;
import com.omnistock.inventory_service.entity.InventoryTransaction;
import com.omnistock.inventory_service.service.InventoryService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    // ─── Warehouse Endpoints ─────────────────────────────────────────────────

    @PostMapping("/warehouses")
    public ResponseEntity<WarehouseDTO> createWarehouse(@Valid @RequestBody WarehouseDTO dto) {
        return new ResponseEntity<>(inventoryService.createWarehouse(dto), HttpStatus.CREATED);
    }

    @GetMapping("/warehouses")
    public ResponseEntity<List<WarehouseDTO>> getAllWarehouses() {
        return ResponseEntity.ok(inventoryService.getAllWarehouses());
    }

    @GetMapping("/warehouses/{id}")
    public ResponseEntity<WarehouseDTO> getWarehouse(@PathVariable Long id) {
        return ResponseEntity.ok(inventoryService.getWarehouse(id));
    }

    @PutMapping("/warehouses/{id}")
    public ResponseEntity<WarehouseDTO> updateWarehouse(@PathVariable Long id, @Valid @RequestBody WarehouseDTO dto) {
        return ResponseEntity.ok(inventoryService.updateWarehouse(id, dto));
    }

    @DeleteMapping("/warehouses/{id}")
    public ResponseEntity<Void> deleteWarehouse(@PathVariable Long id) {
        inventoryService.deleteWarehouse(id);
        return ResponseEntity.noContent().build();
    }

    // ─── Inventory Endpoints ─────────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<List<InventoryDTO>> getAllInventory() {
        return ResponseEntity.ok(inventoryService.getAllInventory());
    }

    @PostMapping
    public ResponseEntity<InventoryDTO> addInventory(
            @Valid @RequestBody InventoryDTO dto,
            @RequestHeader(value = "X-Auth-User-Id", required = false) String userId) {
        return new ResponseEntity<>(inventoryService.addInventory(dto, userId), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<InventoryDTO> updateInventory(
            @PathVariable Long id,
            @Valid @RequestBody InventoryDTO dto,
            @RequestHeader(value = "X-Auth-User-Id", required = false) String userId) {
        return ResponseEntity.ok(inventoryService.updateInventory(id, dto, userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<InventoryDTO> getInventory(@PathVariable Long id) {
        return ResponseEntity.ok(inventoryService.getInventory(id));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<InventoryDTO>> getInventoryByProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(inventoryService.getInventoryByProduct(productId));
    }

    @GetMapping("/warehouse/{warehouseId}")
    public ResponseEntity<List<InventoryDTO>> getInventoryByWarehouse(@PathVariable Long warehouseId) {
        return ResponseEntity.ok(inventoryService.getInventoryByWarehouse(warehouseId));
    }

    // ─── Stock Reservation Endpoints ─────────────────────────────────────────

    @PostMapping("/reserve")
    public ResponseEntity<InventoryDTO> reserveStock(@Valid @RequestBody StockReservationRequest request) {
        return ResponseEntity.ok(inventoryService.reserveStock(request));
    }

    @PostMapping("/release")
    public ResponseEntity<InventoryDTO> releaseStock(@Valid @RequestBody StockReservationRequest request) {
        return ResponseEntity.ok(inventoryService.releaseStock(request));
    }

    @PostMapping("/confirm")
    public ResponseEntity<InventoryDTO> confirmReservation(@Valid @RequestBody StockReservationRequest request) {
        return ResponseEntity.ok(inventoryService.confirmReservation(request));
    }

    // ─── Reconciliation Endpoints ─────────────────────────────────────────────

    @PostMapping("/reconcile")
    public ResponseEntity<InventoryDTO> reconcileInventory(
            @Valid @RequestBody ReconciliationRequest request,
            @RequestHeader(value = "X-Auth-User-Id", required = false) String userId) {
        if (request.getPerformedBy() == null) {
            request.setPerformedBy(userId);
        }
        return ResponseEntity.ok(inventoryService.reconcileInventory(request));
    }

    // ─── Low Stock Endpoint ───────────────────────────────────────────────────

    @GetMapping("/low-stock")
    public ResponseEntity<List<LowStockDTO>> getLowStockInventory() {
        return ResponseEntity.ok(inventoryService.getLowStockInventory());
    }

    // ─── Transaction History Endpoint ─────────────────────────────────────────

    @GetMapping("/transactions")
    public ResponseEntity<Page<InventoryTransaction>> getTransactionHistory(
            @RequestParam(required = false) Long productId,
            @RequestParam(required = false) Long warehouseId,
            Pageable pageable) {
        return ResponseEntity.ok(inventoryService.getTransactionHistory(productId, warehouseId, pageable));
    }
}
