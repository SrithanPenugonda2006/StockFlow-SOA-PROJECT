package com.omnistock.product_service.service;

import com.omnistock.product_service.dto.BrandDTO;
import com.omnistock.product_service.entity.Brand;
import com.omnistock.product_service.exception.ResourceNotFoundException;
import com.omnistock.product_service.exception.BrandAlreadyExistsException;
import com.omnistock.product_service.exception.BrandInUseException;
import com.omnistock.product_service.repository.BrandRepository;
import com.omnistock.product_service.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BrandService {
    private static final Logger log = LoggerFactory.getLogger(BrandService.class);

    @Autowired
    private BrandRepository brandRepository;

    @Autowired
    private ProductRepository productRepository;

    @Transactional(readOnly = true)
    public List<BrandDTO> getAllBrands(String search) {
        List<Brand> brands;
        if (search != null && !search.trim().isEmpty()) {
            brands = brandRepository.findByNameContainingIgnoreCase(search.trim());
        } else {
            brands = brandRepository.findAll();
        }

        return brands.stream().map(brand -> {
            long count = productRepository.countByBrandIgnoreCase(brand.getName());
            BrandDTO dto = new BrandDTO(brand.getId(), brand.getName(), brand.getCountry(), brand.getStatus(), brand.getDescription(), count);
            dto.setCreatedAt(brand.getCreatedAt());
            dto.setUpdatedAt(brand.getUpdatedAt());
            return dto;
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BrandDTO getBrandById(Long id) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Brand not found with id: " + id));
        long count = productRepository.countByBrandIgnoreCase(brand.getName());
        BrandDTO dto = new BrandDTO(brand.getId(), brand.getName(), brand.getCountry(), brand.getStatus(), brand.getDescription(), count);
        dto.setCreatedAt(brand.getCreatedAt());
        dto.setUpdatedAt(brand.getUpdatedAt());
        return dto;
    }

    @Transactional
    public BrandDTO createBrand(BrandDTO dto) {
        String cleanName = dto.getName().trim();
        if (brandRepository.existsByNameIgnoreCase(cleanName)) {
            throw new BrandAlreadyExistsException("Brand '" + cleanName + "' already exists.");
        }

        Brand brand = new Brand(cleanName, dto.getCountry() != null ? dto.getCountry().trim() : null, dto.getStatus());
        if (dto.getDescription() != null) {
            brand.setDescription(dto.getDescription().trim());
        }

        Brand saved = brandRepository.save(brand);
        long count = productRepository.countByBrandIgnoreCase(saved.getName());

        BrandDTO res = new BrandDTO(saved.getId(), saved.getName(), saved.getCountry(), saved.getStatus(), saved.getDescription(), count);
        res.setCreatedAt(saved.getCreatedAt());
        res.setUpdatedAt(saved.getUpdatedAt());
        return res;
    }

    @Transactional
    public BrandDTO updateBrand(Long id, BrandDTO dto) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Brand not found with id: " + id));

        String cleanName = dto.getName().trim();
        if (!brand.getName().equalsIgnoreCase(cleanName) && brandRepository.existsByNameIgnoreCase(cleanName)) {
            throw new BrandAlreadyExistsException("Brand '" + cleanName + "' already exists.");
        }

        brand.setName(cleanName);
        if (dto.getCountry() != null) brand.setCountry(dto.getCountry().trim());
        if (dto.getStatus() != null) brand.setStatus(dto.getStatus().trim());
        if (dto.getDescription() != null) brand.setDescription(dto.getDescription().trim());

        Brand updated = brandRepository.save(brand);
        long count = productRepository.countByBrandIgnoreCase(updated.getName());

        BrandDTO res = new BrandDTO(updated.getId(), updated.getName(), updated.getCountry(), updated.getStatus(), updated.getDescription(), count);
        res.setCreatedAt(updated.getCreatedAt());
        res.setUpdatedAt(updated.getUpdatedAt());
        return res;
    }

    @Transactional
    public void deleteBrand(Long id) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Brand not found with id: " + id));

        long productCount = productRepository.countByBrandIgnoreCase(brand.getName());
        if (productCount > 0) {
            log.warn("Brand deletion blocked (in use): id={}, name={}, productCount={}", id, brand.getName(), productCount);
            throw new BrandInUseException("Brand '" + brand.getName() + "' cannot be deleted because " + productCount + (productCount == 1 ? " product is assigned to it." : " products are assigned to it."));
        }

        brandRepository.delete(brand);
        log.info("Brand deleted successfully: id={}, name={}", id, brand.getName());
    }
}
