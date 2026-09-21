package com.omnistock.product_service;

import com.omnistock.product_service.dto.ProductDTO;
import com.omnistock.product_service.entity.Product;
import com.omnistock.product_service.exception.ResourceNotFoundException;
import com.omnistock.product_service.repository.ProductRepository;
import com.omnistock.product_service.service.ProductService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProductServiceApplicationTests {

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private ProductService productService;

    @Test
    void createProduct_ValidProduct_ReturnsCreatedProduct() {
        ProductDTO dto = new ProductDTO();
        dto.setName("Laptop");
        dto.setPrice(new BigDecimal("999.99"));
        dto.setSku("LAP-001");
        dto.setCategory("Electronics");

        Product savedProduct = new Product();
        savedProduct.setId(1L);
        savedProduct.setName("Laptop");
        savedProduct.setPrice(new BigDecimal("999.99"));
        savedProduct.setSku("LAP-001");

        when(productRepository.existsBySku("LAP-001")).thenReturn(false);
        when(productRepository.save(any(Product.class))).thenReturn(savedProduct);

        ProductDTO result = productService.createProduct(dto);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getSku()).isEqualTo("LAP-001");
    }

    @Test
    void createProduct_DuplicateSku_ThrowsException() {
        ProductDTO dto = new ProductDTO();
        dto.setName("Laptop");
        dto.setPrice(new BigDecimal("999.99"));
        dto.setSku("LAP-001");

        when(productRepository.existsBySku("LAP-001")).thenReturn(true);

        assertThatThrownBy(() -> productService.createProduct(dto))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("SKU already exists");
    }

    @Test
    void getProduct_NotFound_ThrowsException() {
        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> productService.getProduct(999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Product not found with id: 999");
    }
}
