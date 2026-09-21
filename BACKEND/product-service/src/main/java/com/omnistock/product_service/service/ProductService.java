package com.omnistock.product_service.service;

import com.omnistock.product_service.dto.ProductDTO;
import com.omnistock.product_service.entity.Product;
import com.omnistock.product_service.exception.ResourceNotFoundException;
import com.omnistock.product_service.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    public ProductDTO createProduct(ProductDTO dto) {
        if (productRepository.existsBySku(dto.getSku())) {
            throw new IllegalArgumentException("SKU already exists: " + dto.getSku());
        }

        Product product = new Product();
        mapDtoToEntity(dto, product);
        
        product = productRepository.save(product);
        return mapEntityToDto(product);
    }

    public Page<ProductDTO> getProducts(String name, String category, Pageable pageable) {
        Page<Product> productPage;
        
        if (name != null && !name.isEmpty()) {
            productPage = productRepository.findByNameContainingIgnoreCase(name, pageable);
        } else if (category != null && !category.isEmpty()) {
            productPage = productRepository.findByCategoryIgnoreCase(category, pageable);
        } else {
            productPage = productRepository.findAll(pageable);
        }

        return productPage.map(this::mapEntityToDto);
    }

    public ProductDTO getProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        return mapEntityToDto(product);
    }
    
    public ProductDTO getProductBySku(String sku) {
        Product product = productRepository.findBySku(sku)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with sku: " + sku));
        return mapEntityToDto(product);
    }

    public ProductDTO updateProduct(Long id, ProductDTO dto) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        if (!product.getSku().equals(dto.getSku()) && productRepository.existsBySku(dto.getSku())) {
            throw new IllegalArgumentException("SKU already exists: " + dto.getSku());
        }

        mapDtoToEntity(dto, product);
        product = productRepository.save(product);
        return mapEntityToDto(product);
    }

    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundException("Product not found with id: " + id);
        }
        productRepository.deleteById(id);
    }

    private void mapDtoToEntity(ProductDTO dto, Product entity) {
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setPrice(dto.getPrice());
        entity.setSku(dto.getSku());
        entity.setCategory(dto.getCategory());
    }

    private ProductDTO mapEntityToDto(Product entity) {
        ProductDTO dto = new ProductDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setDescription(entity.getDescription());
        dto.setPrice(entity.getPrice());
        dto.setSku(entity.getSku());
        dto.setCategory(entity.getCategory());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }
}
