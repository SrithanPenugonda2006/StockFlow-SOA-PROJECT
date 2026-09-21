package com.omnistock.product_service.service;

import com.omnistock.product_service.dto.CategoryDTO;
import com.omnistock.product_service.entity.Category;
import com.omnistock.product_service.exception.ResourceNotFoundException;
import com.omnistock.product_service.repository.CategoryRepository;
import com.omnistock.product_service.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProductRepository productRepository;

    @Transactional(readOnly = true)
    public List<CategoryDTO> getAllCategories(String search) {
        List<Category> categories;
        if (search != null && !search.trim().isEmpty()) {
            categories = categoryRepository.findByNameContainingIgnoreCase(search.trim());
        } else {
            categories = categoryRepository.findAll();
        }

        return categories.stream().map(cat -> {
            long count = productRepository.countByCategoryIgnoreCase(cat.getName());
            CategoryDTO dto = new CategoryDTO(cat.getId(), cat.getName(), cat.getDescription(), count);
            dto.setCreatedAt(cat.getCreatedAt());
            dto.setUpdatedAt(cat.getUpdatedAt());
            return dto;
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CategoryDTO getCategoryById(Long id) {
        Category cat = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        long count = productRepository.countByCategoryIgnoreCase(cat.getName());
        CategoryDTO dto = new CategoryDTO(cat.getId(), cat.getName(), cat.getDescription(), count);
        dto.setCreatedAt(cat.getCreatedAt());
        dto.setUpdatedAt(cat.getUpdatedAt());
        return dto;
    }

    @Transactional
    public CategoryDTO createCategory(CategoryDTO dto) {
        String cleanName = dto.getName().trim();
        if (categoryRepository.existsByNameIgnoreCase(cleanName)) {
            throw new IllegalArgumentException("Category with name '" + cleanName + "' already exists.");
        }

        Category category = new Category(cleanName, dto.getDescription() != null ? dto.getDescription().trim() : null);
        Category saved = categoryRepository.save(category);
        long count = productRepository.countByCategoryIgnoreCase(saved.getName());

        CategoryDTO res = new CategoryDTO(saved.getId(), saved.getName(), saved.getDescription(), count);
        res.setCreatedAt(saved.getCreatedAt());
        res.setUpdatedAt(saved.getUpdatedAt());
        return res;
    }

    @Transactional
    public CategoryDTO updateCategory(Long id, CategoryDTO dto) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        String cleanName = dto.getName().trim();
        if (!category.getName().equalsIgnoreCase(cleanName) && categoryRepository.existsByNameIgnoreCase(cleanName)) {
            throw new IllegalArgumentException("Category with name '" + cleanName + "' already exists.");
        }

        category.setName(cleanName);
        if (dto.getDescription() != null) {
            category.setDescription(dto.getDescription().trim());
        }

        Category updated = categoryRepository.save(category);
        long count = productRepository.countByCategoryIgnoreCase(updated.getName());

        CategoryDTO res = new CategoryDTO(updated.getId(), updated.getName(), updated.getDescription(), count);
        res.setCreatedAt(updated.getCreatedAt());
        res.setUpdatedAt(updated.getUpdatedAt());
        return res;
    }
}
