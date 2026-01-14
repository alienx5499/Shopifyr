package com.shopifyr.backend.util;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class JwtUtilTest {

    @Test
    void generateAndValidateToken_roundTrip() {
        JwtUtil jwtUtil = new JwtUtil("test-secret-key-test-secret-key-test-secret-key", 3600000);

        String token = jwtUtil.generateToken("user123");

        assertThat(jwtUtil.validateToken(token, "user123")).isTrue();
        assertThat(jwtUtil.extractUsername(token)).isEqualTo("user123");
    }
}

