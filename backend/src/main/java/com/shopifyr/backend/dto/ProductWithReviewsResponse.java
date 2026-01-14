package com.shopifyr.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record ProductWithReviewsResponse(
        Long id,
        String name,
        String description,
        BigDecimal price,
        String imageUrl,
        Long categoryId,
        String categoryName,
        Long brandId,
        String brandName,
        Boolean isActive,
        Boolean isFeatured,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        Double averageRating,
        List<ReviewResponse> reviews
) {
}

