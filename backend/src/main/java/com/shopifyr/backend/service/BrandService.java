package com.shopifyr.backend.service;

import com.shopifyr.backend.dto.BrandRequest;
import com.shopifyr.backend.exception.ResourceNotFoundException;
import com.shopifyr.backend.model.Brand;
import com.shopifyr.backend.repository.BrandRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BrandService {

    private final BrandRepository brandRepository;

    public BrandService(BrandRepository brandRepository) {
        this.brandRepository = brandRepository;
    }

    @Transactional
    @CacheEvict(value = "brands", allEntries = true)
    public Brand createBrand(BrandRequest request) {
        if (brandRepository.existsByName(request.name())) {
            throw new IllegalArgumentException("Brand with this name already exists");
        }

        Brand brand = Brand.builder()
                .name(request.name())
                .description(request.description())
                .logoUrl(request.logoUrl())
                .build();

        return brandRepository.save(brand);
    }

    @Transactional
    @CacheEvict(value = "brands", allEntries = true)
    public Brand updateBrand(Long id, BrandRequest request) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Brand not found"));

        if (!brand.getName().equals(request.name()) && brandRepository.existsByName(request.name())) {
            throw new IllegalArgumentException("Brand with this name already exists");
        }

        brand.setName(request.name());
        brand.setDescription(request.description());
        brand.setLogoUrl(request.logoUrl());

        return brandRepository.save(brand);
    }

    public Brand getBrandById(Long id) {
        return brandRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Brand not found"));
    }

    @Cacheable(value = "brands")
    public List<Brand> getAllBrands() {
        return brandRepository.findAll();
    }

    @Transactional
    @CacheEvict(value = "brands", allEntries = true)
    public void deleteBrand(Long id) {
        if (!brandRepository.existsById(id)) {
            throw new ResourceNotFoundException("Brand not found");
        }
        brandRepository.deleteById(id);
    }
}
