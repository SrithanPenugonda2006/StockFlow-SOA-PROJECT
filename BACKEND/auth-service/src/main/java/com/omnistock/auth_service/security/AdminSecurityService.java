package com.omnistock.auth_service.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AdminSecurityService {

    @Autowired
    private JwtUtil jwtUtil;

    public void checkAdminAccess(String roleHeader, String authHeader) {
        String role = roleHeader;

        if ((role == null || role.isBlank()) && authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            role = jwtUtil.extractRole(token);
        }

        if (role == null || !"ADMIN".equalsIgnoreCase(role)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access Denied: Admin role required.");
        }
    }

    public String extractActor(String userHeader, String authHeader) {
        if (userHeader != null && !userHeader.isBlank()) {
            return userHeader;
        }
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            String username = jwtUtil.extractUsername(token);
            if (username != null) return username;
        }
        return "admin";
    }
}
