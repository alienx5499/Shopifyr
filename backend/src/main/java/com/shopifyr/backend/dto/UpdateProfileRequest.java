package com.shopifyr.backend.dto;

public record UpdateProfileRequest(
        String firstName,
        String lastName,
        String phoneNumber,
        String addressLine1,
        String addressLine2,
        String city,
        String state,
        String zipCode,
        String country) {
}
