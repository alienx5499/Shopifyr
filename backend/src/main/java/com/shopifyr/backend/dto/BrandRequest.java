package com.shopifyr.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record BrandRequest(
        @NotBlank @Size(max = 100) String name,
        @Size(max = 500) String description,
        String logoUrl
) {
}
