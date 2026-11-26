package com.orproject.claim.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Lightweight in-memory rate limiting filter for expensive endpoints
 * (SimPy simulation runs, experiments, and RPA batch operations)
 * to prevent abuse on public endpoints.
 */
@Component
@Order(1)
public class RateLimitingFilter implements Filter {

    private static final Logger LOGGER = LoggerFactory.getLogger(RateLimitingFilter.class);

    // Limit expensive operations per minute per IP
    private static final int SIMULATION_LIMIT_PER_MINUTE = 30;
    private static final int RPA_BATCH_LIMIT_PER_MINUTE = 20;

    private static class RequestCounter {
        final long windowStartMs;
        final AtomicInteger count;

        RequestCounter(long windowStartMs) {
            this.windowStartMs = windowStartMs;
            this.count = new AtomicInteger(1);
        }
    }

    private final Map<String, RequestCounter> simulationCounters = new ConcurrentHashMap<>();
    private final Map<String, RequestCounter> rpaCounters = new ConcurrentHashMap<>();

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) servletRequest;
        HttpServletResponse response = (HttpServletResponse) servletResponse;

        String path = request.getRequestURI();
        String method = request.getMethod();

        if ("OPTIONS".equalsIgnoreCase(method)) {
            chain.doFilter(servletRequest, servletResponse);
            return;
        }

        String clientIp = getClientIp(request);

        // Rate limit /api/simulation/run and /api/simulation/experiments
        if (path.startsWith("/api/simulation/run") || path.startsWith("/api/simulation/experiments")) {
            if (!isAllowed(simulationCounters, clientIp, SIMULATION_LIMIT_PER_MINUTE)) {
                sendRateLimitResponse(response, "Simulation rate limit exceeded. Please wait a moment before running another simulation.");
                return;
            }
        }

        // Rate limit /api/rpa/batch
        if (path.startsWith("/api/rpa/batch")) {
            if (!isAllowed(rpaCounters, clientIp, RPA_BATCH_LIMIT_PER_MINUTE)) {
                sendRateLimitResponse(response, "RPA Batch rate limit exceeded. Please wait a moment before triggering another batch.");
                return;
            }
        }

        chain.doFilter(servletRequest, servletResponse);
    }

    private boolean isAllowed(Map<String, RequestCounter> counters, String key, int maxRequestsPerMinute) {
        long now = System.currentTimeMillis();
        RequestCounter counter = counters.compute(key, (k, existing) -> {
            if (existing == null || (now - existing.windowStartMs) > 60000) {
                return new RequestCounter(now);
            }
            existing.count.incrementAndGet();
            return existing;
        });

        if (counter.count.get() > maxRequestsPerMinute) {
            LOGGER.warn("Rate limit exceeded for key={}, count={}", key, counter.count.get());
            return false;
        }
        return true;
    }

    private void sendRateLimitResponse(HttpServletResponse response, String message) throws IOException {
        response.setStatus(429);
        response.setContentType("application/json");
        response.setHeader("Retry-After", "60");
        String json = String.format("{\"status\":429,\"error\":\"Too Many Requests\",\"message\":\"%s\"}", message);
        response.getWriter().write(json);
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}

