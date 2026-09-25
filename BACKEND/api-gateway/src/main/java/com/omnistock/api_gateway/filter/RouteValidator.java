package com.omnistock.api_gateway.filter;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class RouteValidator {

    public static final List<String> openApiEndpoints = List.of(
            "/api/auth/register",
            "/api/auth/login",
            "/api/auth/send-otp",
            "/api/auth/verify-otp",
            "/api/auth/forgot-password",
            "/api/auth/verify-reset-token",
            "/api/auth/reset-password",
            "/eureka"
    );

    public boolean isSecured(HttpServletRequest request) {
        String uri = request.getRequestURI();
        String method = request.getMethod();

        // Public GET endpoints for catalog browsing and inventory lookups
        if ("GET".equalsIgnoreCase(method) && (uri.startsWith("/api/products") || uri.startsWith("/api/inventory/product"))) {
            return false;
        }

        return openApiEndpoints.stream()
                .noneMatch(endpoint -> uri.contains(endpoint));
    }
}
