package com.omnistock.auth_service.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_warehouses", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "warehouse_id"})
})
public class UserWarehouse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "warehouse_id", nullable = false)
    private Long warehouseId;

    @Column(name = "warehouse_name")
    private String warehouseName;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public UserWarehouse() {}

    public UserWarehouse(Long userId, Long warehouseId, String warehouseName) {
        this.userId = userId;
        this.warehouseId = warehouseId;
        this.warehouseName = warehouseName;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Long getWarehouseId() { return warehouseId; }
    public void setWarehouseId(Long warehouseId) { this.warehouseId = warehouseId; }

    public String getWarehouseName() { return warehouseName; }
    public void setWarehouseName(String warehouseName) { this.warehouseName = warehouseName; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
