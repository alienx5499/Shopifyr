package com.shopifyr.backend.dto.analytics;

import java.math.BigDecimal;

public record TopCustomerDto(Long userId, String username, BigDecimal revenue) {
}

