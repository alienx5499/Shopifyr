package com.shopifyr.backend.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.Test;

import java.io.IOException;

import static org.mockito.Mockito.*;

class RateLimitingFilterTest {

    @Test
    void allowsSingleRequestWithinLimit() throws ServletException, IOException {
        RateLimitingFilter filter = new RateLimitingFilter();

        HttpServletRequest request = mock(HttpServletRequest.class);
        HttpServletResponse response = mock(HttpServletResponse.class);
        FilterChain chain = mock(FilterChain.class);

        when(request.getRequestURI()).thenReturn("/api/products");
        when(request.getRemoteAddr()).thenReturn("127.0.0.1");

        filter.doFilterInternal(request, response, chain);

        verify(chain, times(1)).doFilter(request, response);
        verify(response, never()).setStatus(429);
    }
}

