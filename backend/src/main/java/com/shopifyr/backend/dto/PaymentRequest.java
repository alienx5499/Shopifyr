package com.shopifyr.backend.dto;

import jakarta.validation.constraints.NotNull;

public record PaymentRequest(
        @NotNull Long orderId,
        String provider,
        String providerPaymentId
) {
}
