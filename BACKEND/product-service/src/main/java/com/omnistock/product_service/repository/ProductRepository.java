package com.omnistock.product_service.repository;

import com.omnistock.product_service.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    Optional<Product> findBySku(String sku);
    boolean existsBySku(String sku);
    Optional<Product> findByBarcode(String barcode);
    boolean existsByBarcode(String barcode);
    Page<Product> findByNameContainingIgnoreCase(String name, Pageable pageable);
    Page<Product> findByCategoryIgnoreCase(String category, Pageable pageable);

    long countByCategoryIgnoreCase(String category);
    long countByBrandIgnoreCase(String brand);

    @Query("SELECT COUNT(p) FROM Product p WHERE p.category IS NOT NULL AND TRIM(p.category) <> ''")
    long countProductsWithCategory();
}
