package com.shopifyr.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank @Email String email,
        @NotBlank @Size(min = 3, max = 50) String username,
        @NotBlank @Size(min = 6, max = 100) String password,
        String firstName,
        String lastName,
        String phoneNumber,
        String addressLine1,
        String addressLine2,
        String city,
        String state,
        String zipCode,
        String country
) {
}
