package com.shopifyr.backend.dto.analytics;

public record LowStockItemDto(Long productId, String productName, int quantity) {
}

