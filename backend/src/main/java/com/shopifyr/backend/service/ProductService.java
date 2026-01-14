package com.shopifyr.backend.service;

import java.math.BigDecimal;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.shopifyr.backend.dto.ProductRequest;
import com.shopifyr.backend.dto.ProductResponse;
import com.shopifyr.backend.dto.ProductWithReviewsResponse;
import com.shopifyr.backend.dto.ReviewResponse;
import com.shopifyr.backend.exception.ResourceNotFoundException;
import com.shopifyr.backend.model.Brand;
import com.shopifyr.backend.model.Category;
import com.shopifyr.backend.model.Product;
import com.shopifyr.backend.repository.BrandRepository;
import com.shopifyr.backend.repository.CategoryRepository;
import com.shopifyr.backend.repository.ProductRepository;
import com.shopifyr.backend.repository.ReviewRepository;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final ReviewRepository reviewRepository;

    public ProductService(ProductRepository productRepository,
                          CategoryRepository categoryRepository,
                          BrandRepository brandRepository,
                          ReviewRepository reviewRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.brandRepository = brandRepository;
        this.reviewRepository = reviewRepository;
    }

    @Transactional
    @CacheEvict(value = {"products", "bestsellers"}, allEntries = true)
    public ProductResponse createProduct(ProductRequest request) {
        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        Brand brand = null;
        if (request.brandId() != null) {
            brand = brandRepository.findById(request.brandId())
                    .orElseThrow(() -> new ResourceNotFoundException("Brand not found"));
        }

        Product product = Product.builder()
                .name(request.name())
                .description(request.description())
                .price(request.price())
                .imageUrl(request.imageUrl())
                .category(category)
                .brand(brand)
                .isActive(request.isActive() != null ? request.isActive() : true)
                .build();

        product = productRepository.save(product);
        return toResponse(product);
    }

    @Transactional
    @CacheEvict(value = {"product", "products", "bestsellers"}, allEntries = true)
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        Brand brand = null;
        if (request.brandId() != null) {
            brand = brandRepository.findById(request.brandId())
                    .orElseThrow(() -> new ResourceNotFoundException("Brand not found"));
        }

        product.setName(request.name());
        product.setDescription(request.description());
        product.setPrice(request.price());
        product.setImageUrl(request.imageUrl());
        product.setCategory(category);
        product.setBrand(brand);
        if (request.isActive() != null) {
            product.setIsActive(request.isActive());
        }

        product = productRepository.save(product);
        return toResponse(product);
    }

    @Cacheable(value = "product", key = "#id")
    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        return toResponse(product);
    }

    @Transactional(readOnly = true)
    public Page<ProductResponse> getAllProducts(Pageable pageable) {
        return productRepository.findAll(pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<ProductResponse> searchProducts(
            Long categoryId,
            Long brandId,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Boolean isActive,
            Pageable pageable
    ) {
        Page<Product> products = productRepository.findWithFilters(
                categoryId, brandId, minPrice, maxPrice, isActive, pageable
        );
        return products.map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<ProductResponse> searchProductsByQuery(String query, Pageable pageable) {
        Page<Product> products = productRepository.searchActiveProductsByQuery(query, pageable);
        return products.map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<ProductResponse> getFeaturedProducts(Pageable pageable) {
        Page<Product> products = productRepository.findByIsActiveTrueAndIsFeaturedTrue(pageable);
        return products.map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public ProductWithReviewsResponse getProductWithReviews(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        var reviews = reviewRepository.findByProductId(id).stream()
                .map(r -> new ReviewResponse(
                        r.getId(),
                        r.getUser().getId(),
                        r.getUser().getUsername(),
                        r.getRating(),
                        r.getComment(),
                        r.getCreatedAt()
                ))
                .toList();

        Double avgRating = reviewRepository.getAverageRatingByProductId(id);

        return new ProductWithReviewsResponse(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getPrice(),
                product.getImageUrl(),
                product.getCategory().getId(),
                product.getCategory().getName(),
                product.getBrand() != null ? product.getBrand().getId() : null,
                product.getBrand() != null ? product.getBrand().getName() : null,
                product.getIsActive(),
                product.getIsFeatured(),
                product.getCreatedAt(),
                product.getUpdatedAt(),
                avgRating != null ? avgRating : 0.0,
                reviews
        );
    }

    @Transactional
    @CacheEvict(value = {"product", "products", "bestsellers"}, allEntries = true)
    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundException("Product not found");
        }
        productRepository.deleteById(id);
    }

    private ProductResponse toResponse(Product product) {
        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getPrice(),
                product.getImageUrl(),
                product.getCategory().getId(),
                product.getCategory().getName(),
                product.getBrand() != null ? product.getBrand().getId() : null,
                product.getBrand() != null ? product.getBrand().getName() : null,
                product.getIsActive(),
                product.getCreatedAt(),
                product.getUpdatedAt()
        );
    }
}
