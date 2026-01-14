package com.shopifyr.backend.dto.analytics;

import java.math.BigDecimal;

public record MonthlySalesDto(String month, BigDecimal totalAmount) {
}

