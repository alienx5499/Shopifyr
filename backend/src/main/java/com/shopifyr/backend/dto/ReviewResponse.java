package com.shopifyr.backend.dto;

import java.time.LocalDateTime;

public record ReviewResponse(
        Long id,
        Long userId,
        String username,
        Integer rating,
        String comment,
        LocalDateTime createdAt
) {
}

