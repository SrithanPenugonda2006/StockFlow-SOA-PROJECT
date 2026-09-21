package com.omnistock.product_service.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

public class BrandDTO {

    private Long id;

    @NotBlank(message = "Brand name is required")
    private String name;

    private String country;
    private String status = "ACTIVE";
    private String description;
    private long productCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public BrandDTO() {}

    public BrandDTO(Long id, String name, String country, String status, String description, long productCount) {
        this.id = id;
        this.name = name;
        this.country = country;
        this.status = status != null ? status : "ACTIVE";
        this.description = description;
        this.productCount = productCount;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public long getProductCount() { return productCount; }
    public void setProductCount(long productCount) { this.productCount = productCount; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
