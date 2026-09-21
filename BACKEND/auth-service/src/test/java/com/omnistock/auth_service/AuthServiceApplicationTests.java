package com.omnistock.auth_service;

import com.omnistock.auth_service.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;

class AuthServiceApplicationTests {

    private JwtUtil jwtUtil;

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(jwtUtil, "secret", "default-secret-key-must-be-at-least-256-bits-long-for-hmac-sha-256");
        ReflectionTestUtils.setField(jwtUtil, "expiration", 86400000L);
    }

    @Test
    void contextLoads() {
        assertThat(jwtUtil).isNotNull();
    }

    @Test
    void generateToken_ValidClaims_ReturnsNonNullToken() {
        String token = jwtUtil.generateToken("testuser", "CUSTOMER");
        assertThat(token).isNotNull();
        assertThat(token).isNotEmpty();
    }

    @Test
    void generateToken_ContainsDifferentTokensForDifferentUsers() {
        String tokenA = jwtUtil.generateToken("alice", "CUSTOMER");
        String tokenB = jwtUtil.generateToken("bob", "ADMIN");
        assertThat(tokenA).isNotEqualTo(tokenB);
    }
}

