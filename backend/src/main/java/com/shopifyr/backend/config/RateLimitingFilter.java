package com.shopifyr.backend.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    private static final long WINDOW_MILLIS = 60_000; // 1 minute
    private static final int MAX_REQUESTS = 60;       // per IP+path per minute

    private static class Counter {
        long windowStart;
        int count;
    }

    private final Map<String, Counter> counters = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String path = request.getRequestURI();
        // Limit only sensitive / high-traffic endpoints
        boolean shouldLimit =
                path.startsWith("/api/auth/login") ||
                        path.startsWith("/api/products");

        if (!shouldLimit) {
            filterChain.doFilter(request, response);
            return;
        }

        String ip = request.getRemoteAddr();
        String key = ip + ":" + path;

        long now = Instant.now().toEpochMilli();
        Counter counter = counters.computeIfAbsent(key, k -> {
            Counter c = new Counter();
            c.windowStart = now;
            c.count = 0;
            return c;
        });

        synchronized (counter) {
            if (now - counter.windowStart > WINDOW_MILLIS) {
                counter.windowStart = now;
                counter.count = 0;
            }

            counter.count++;
            if (counter.count > MAX_REQUESTS) {
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.getWriter().write("Too many requests. Please try again later.");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }
}

