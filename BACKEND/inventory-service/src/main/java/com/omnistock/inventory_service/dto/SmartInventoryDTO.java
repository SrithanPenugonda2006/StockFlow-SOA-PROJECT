package com.omnistock.inventory_service.dto;

import java.math.BigDecimal;

public class SmartInventoryDTO {

    private Long productId;
    private String productName;
    private String sku;
    private Integer currentStock;
    private Double avgDailyDemand;
    private Integer leadTimeDays;
    private Integer safetyStock;
    private Integer reorderPoint;
    private Integer recommendedReorderQty;
    private Boolean isReorderNeeded;
    private Boolean isOverstock;
    private Boolean isDeadStock;
    private BigDecimal inventoryValue;

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }

    public Integer getCurrentStock() { return currentStock; }
    public void setCurrentStock(Integer currentStock) { this.currentStock = currentStock; }

    public Double getAvgDailyDemand() { return avgDailyDemand; }
    public void setAvgDailyDemand(Double avgDailyDemand) { this.avgDailyDemand = avgDailyDemand; }

    public Integer getLeadTimeDays() { return leadTimeDays; }
    public void setLeadTimeDays(Integer leadTimeDays) { this.leadTimeDays = leadTimeDays; }

    public Integer getSafetyStock() { return safetyStock; }
    public void setSafetyStock(Integer safetyStock) { this.safetyStock = safetyStock; }

    public Integer getReorderPoint() { return reorderPoint; }
    public void setReorderPoint(Integer reorderPoint) { this.reorderPoint = reorderPoint; }

    public Integer getRecommendedReorderQty() { return recommendedReorderQty; }
    public void setRecommendedReorderQty(Integer recommendedReorderQty) { this.recommendedReorderQty = recommendedReorderQty; }

    public Boolean getIsReorderNeeded() { return isReorderNeeded; }
    public void setIsReorderNeeded(Boolean isReorderNeeded) { this.isReorderNeeded = isReorderNeeded; }

    public Boolean getIsOverstock() { return isOverstock; }
    public void setIsOverstock(Boolean isOverstock) { this.isOverstock = isOverstock; }

    public Boolean getIsDeadStock() { return isDeadStock; }
    public void setIsDeadStock(Boolean isDeadStock) { this.isDeadStock = isDeadStock; }

    public BigDecimal getInventoryValue() { return inventoryValue; }
    public void setInventoryValue(BigDecimal inventoryValue) { this.inventoryValue = inventoryValue; }
}
