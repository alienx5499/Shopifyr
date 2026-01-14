package com.shopifyr.backend.dto;

import java.math.BigDecimal;

public record PaymentSessionResponse(
        Long orderId,
        BigDecimal amount,
        String provider,
        String status,
        String checkoutUrl
) {
}

