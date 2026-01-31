package com.shopifyr.backend.config;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Ensures CORS headers on every response (including preflight OPTIONS).
 * Must be registered first via SecurityConfig so it runs before Spring Security.
 */
public class CorsResponseFilter extends OncePerRequestFilter {

    private static final List<String> ALLOWED_ORIGINS = buildOrigins();
    private static final String ALLOWED_METHODS = "GET, POST, PUT, DELETE, OPTIONS";
    private static final String ALLOWED_HEADERS = "Authorization, Content-Type, Accept";

    private static List<String> buildOrigins() {
        List<String> list = Stream.of(
                "http://localhost:3000",
                "http://127.0.0.1:3000",
                "https://shopifyr.vercel.app"
        ).collect(Collectors.toList());
        String extra = System.getenv("CORS_ALLOWED_ORIGINS");
        if (extra != null && !extra.isBlank()) {
            for (String origin : extra.split(",")) {
                String trimmed = origin.trim();
                if (!trimmed.isEmpty()) list.add(trimmed);
            }
        }
        return list;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                   FilterChain filterChain) throws ServletException, IOException {
        String origin = request.getHeader("Origin");
        // Always set CORS headers so preflight and actual responses pass
        if (origin != null && (ALLOWED_ORIGINS.contains(origin) || origin.endsWith(".vercel.app"))) {
            response.setHeader("Access-Control-Allow-Origin", origin);
        }
        response.setHeader("Access-Control-Allow-Credentials", "true");
        response.setHeader("Access-Control-Allow-Methods", ALLOWED_METHODS);
        response.setHeader("Access-Control-Allow-Headers", ALLOWED_HEADERS);
        response.setHeader("Access-Control-Max-Age", "3600");

        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            response.setStatus(HttpServletResponse.SC_OK);
            response.setContentLength(0);
            return;
        }

        filterChain.doFilter(request, response);
    }
}
