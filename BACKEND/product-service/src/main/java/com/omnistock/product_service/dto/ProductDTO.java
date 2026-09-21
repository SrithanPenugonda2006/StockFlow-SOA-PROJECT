package com.omnistock.product_service.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ProductDTO {
    
    private Long id;
    
    @NotBlank(message = "Product name is required")
    @JsonAlias({"productName"})
    private String name;
    
    private String description;
    
    @NotNull(message = "Selling price is required")
    @DecimalMin(value = "0.00", message = "Selling price must be non-negative")
    @JsonAlias({"sellingPrice"})
    private BigDecimal price;
    
    @NotBlank(message = "SKU Code is required")
    @JsonAlias({"skuCode"})
    private String sku;

    private String barcode;

    private String brand;

    @DecimalMin(value = "0.00", message = "Unit cost must be non-negative")
    private BigDecimal unitCost = BigDecimal.ZERO;

    @Min(value = 0, message = "Initial stock must be non-negative")
    private Integer initialStock = 0;
    
    @NotBlank(message = "Category is required")
    private String category;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getProductName() { return name; }
    public void setProductName(String productName) { if (productName != null) this.name = productName; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public BigDecimal getSellingPrice() { return price; }
    public void setSellingPrice(BigDecimal sellingPrice) { if (sellingPrice != null) this.price = sellingPrice; }

    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }
    public String getSkuCode() { return sku; }
    public void setSkuCode(String skuCode) { if (skuCode != null) this.sku = skuCode; }

    public String getBarcode() { return barcode; }
    public void setBarcode(String barcode) { this.barcode = barcode; }

    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }

    public BigDecimal getUnitCost() { return unitCost; }
    public void setUnitCost(BigDecimal unitCost) { this.unitCost = unitCost; }

    public Integer getInitialStock() { return initialStock; }
    public void setInitialStock(Integer initialStock) { this.initialStock = initialStock; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}

