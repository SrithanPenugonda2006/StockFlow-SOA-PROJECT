package com.omnistock.inventory_service.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public class ReconciliationRequest {
    @NotNull
    private Long productId;

    @NotNull
    private Long warehouseId;

    @NotNull
    @PositiveOrZero
    private Integer physicalQuantity;

    private String reason;
    private String performedBy;

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public Long getWarehouseId() { return warehouseId; }
    public void setWarehouseId(Long warehouseId) { this.warehouseId = warehouseId; }

    public Integer getPhysicalQuantity() { return physicalQuantity; }
    public void setPhysicalQuantity(Integer physicalQuantity) { this.physicalQuantity = physicalQuantity; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getPerformedBy() { return performedBy; }
    public void setPerformedBy(String performedBy) { this.performedBy = performedBy; }
}
