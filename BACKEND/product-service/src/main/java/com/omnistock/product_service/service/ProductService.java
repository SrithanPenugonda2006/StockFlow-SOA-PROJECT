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
        String trimmedSku = dto.getSku() != null ? dto.getSku().trim() : null;
        if (trimmedSku != null && productRepository.existsBySku(trimmedSku)) {
            throw new IllegalArgumentException("SKU already exists: " + trimmedSku);
        }

        String trimmedBarcode = dto.getBarcode() != null ? dto.getBarcode().trim() : null;
        if (trimmedBarcode != null && !trimmedBarcode.isEmpty() && productRepository.existsByBarcode(trimmedBarcode)) {
            throw new IllegalArgumentException("Barcode already exists: " + trimmedBarcode);
        }

        Product product = new Product();
        mapDtoToEntity(dto, product);
        
        product = productRepository.save(product);
        ProductDTO resultDto = mapEntityToDto(product);
        resultDto.setInitialStock(dto.getInitialStock() != null ? dto.getInitialStock() : 0);
        return resultDto;
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

        String trimmedSku = dto.getSku() != null ? dto.getSku().trim() : null;
        if (trimmedSku != null && !trimmedSku.equals(product.getSku()) && productRepository.existsBySku(trimmedSku)) {
            throw new IllegalArgumentException("SKU already exists: " + trimmedSku);
        }

        String trimmedBarcode = dto.getBarcode() != null ? dto.getBarcode().trim() : null;
        if (trimmedBarcode != null && !trimmedBarcode.isEmpty()
                && !trimmedBarcode.equals(product.getBarcode())
                && productRepository.existsByBarcode(trimmedBarcode)) {
            throw new IllegalArgumentException("Barcode already exists: " + trimmedBarcode);
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
        entity.setName(dto.getName() != null ? dto.getName().trim() : null);
        entity.setDescription(dto.getDescription());
        entity.setPrice(dto.getPrice());
        entity.setSku(dto.getSku() != null ? dto.getSku().trim() : null);
        entity.setCategory(dto.getCategory() != null ? dto.getCategory().trim() : null);
        entity.setBarcode(dto.getBarcode() != null && !dto.getBarcode().trim().isEmpty() ? dto.getBarcode().trim() : null);
        entity.setBrand(dto.getBrand() != null && !dto.getBrand().trim().isEmpty() ? dto.getBrand().trim() : null);
        entity.setUnitCost(dto.getUnitCost());
    }

    private ProductDTO mapEntityToDto(Product entity) {
        ProductDTO dto = new ProductDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setDescription(entity.getDescription());
        dto.setPrice(entity.getPrice());
        dto.setSku(entity.getSku());
        dto.setCategory(entity.getCategory());
        dto.setBarcode(entity.getBarcode());
        dto.setBrand(entity.getBrand());
        dto.setUnitCost(entity.getUnitCost());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }

}
