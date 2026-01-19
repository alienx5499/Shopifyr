package com.shopifyr.backend.dto;

import com.shopifyr.backend.model.OrderStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record OrderResponse(
                Long id,
                Long userId,
                List<OrderItemResponse> items,
                BigDecimal totalAmount,
                OrderStatus status,
                LocalDateTime createdAt,
                LocalDateTime estimatedDeliveryDate) {
}
