package com.omnistock.api_gateway.filter;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;

@Component
public class AuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private RouteValidator validator;

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // Always allow CORS OPTIONS preflight requests to pass through
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
        boolean isSecured = validator.isSecured(request);

        if (isSecured && (authHeader == null || !authHeader.startsWith("Bearer "))) {
            response.sendError(HttpStatus.UNAUTHORIZED.value(), "Missing or invalid authorization header");
            return;
        }

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            try {
                jwtUtil.validateToken(token);
                Claims claims = jwtUtil.getClaims(token);

                HeaderMapRequestWrapper requestWrapper = new HeaderMapRequestWrapper(request);
                requestWrapper.addHeader("X-Auth-User-Id", claims.getSubject());
                requestWrapper.addHeader("X-Auth-User-Role", claims.get("role", String.class));

                filterChain.doFilter(requestWrapper, response);
                return;
            } catch (Exception e) {
                if (isSecured) {
                    logger.error("JWT Token Validation Failed: " + e.getMessage(), e);
                    response.sendError(HttpStatus.UNAUTHORIZED.value(), "Unauthorized access to application: " + e.getMessage());
                    return;
                }
            }
        }

        filterChain.doFilter(request, response);
    }

    public static class HeaderMapRequestWrapper extends HttpServletRequestWrapper {
        private final Map<String, String> headerMap = new HashMap<>();

        public HeaderMapRequestWrapper(HttpServletRequest request) {
            super(request);
        }

        public void addHeader(String name, String value) {
            headerMap.put(name, value);
        }

        @Override
        public String getHeader(String name) {
            if (headerMap.containsKey(name)) {
                return headerMap.get(name);
            }
            return super.getHeader(name);
        }

        @Override
        public Enumeration<String> getHeaderNames() {
            java.util.List<String> names = java.util.Collections.list(super.getHeaderNames());
            for (String name : headerMap.keySet()) {
                if (!names.contains(name)) {
                    names.add(name);
                }
            }
            return java.util.Collections.enumeration(names);
        }

        @Override
        public Enumeration<String> getHeaders(String name) {
            if (headerMap.containsKey(name)) {
                return java.util.Collections.enumeration(java.util.Collections.singletonList(headerMap.get(name)));
            }
            return super.getHeaders(name);
        }
    }
}
