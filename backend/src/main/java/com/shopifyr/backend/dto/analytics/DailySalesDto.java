package com.shopifyr.backend.dto.analytics;

import java.math.BigDecimal;
import java.time.LocalDate;

public record DailySalesDto(LocalDate date, BigDecimal totalAmount) {
}

