package com.omnistock.product_service.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

public class CategoryDTO {

    private Long id;

    @NotBlank(message = "Category name is required")
    private String name;

    private String description;
    private Long productCount = 0L;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public CategoryDTO() {}

    public CategoryDTO(Long id, String name, String description, Long productCount) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.productCount = productCount != null ? productCount : 0L;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Long getProductCount() { return productCount; }
    public void setProductCount(Long productCount) { this.productCount = productCount != null ? productCount : 0L; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
