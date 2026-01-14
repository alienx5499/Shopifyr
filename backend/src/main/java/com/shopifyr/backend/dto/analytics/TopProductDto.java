package com.shopifyr.backend.dto.analytics;

import java.math.BigDecimal;

public record TopProductDto(Long productId, String productName, long quantitySold, BigDecimal revenue) {
}

