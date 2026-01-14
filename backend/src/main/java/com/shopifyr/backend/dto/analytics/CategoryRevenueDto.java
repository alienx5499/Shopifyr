package com.shopifyr.backend.dto.analytics;

import java.math.BigDecimal;

public record CategoryRevenueDto(Long categoryId, String categoryName, BigDecimal revenue) {
}

