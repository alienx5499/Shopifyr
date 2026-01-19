package com.shopifyr.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.Builder;

@Builder
public record ProductResponse(
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
                LocalDateTime createdAt,
                LocalDateTime updatedAt) {
}
