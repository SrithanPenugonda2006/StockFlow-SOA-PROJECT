package com.omnistock.auth_service.controller;

import com.omnistock.auth_service.dto.RegisterRequest;
import com.omnistock.auth_service.dto.SendOtpRequest;
import com.omnistock.auth_service.entity.User;
import com.omnistock.auth_service.repository.UserRepository;
import com.omnistock.auth_service.security.JwtUtil;
import com.omnistock.auth_service.service.EmailService;
import com.omnistock.auth_service.service.OtpVerificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class AuthControllerTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private EmailService emailService;

    @Mock
    private OtpVerificationService otpVerificationService;

    @InjectMocks
    private AuthController authController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void register_NewUniqueEmail_Returns201Created() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("newuser");
        request.setEmail("newuser@example.com");
        request.setPassword("StockFlow@2026Secure!");
        request.setRole("CUSTOMER");

        when(userRepository.findByUsername("newuser")).thenReturn(Optional.empty());
        when(userRepository.existsByEmailIgnoreCase("newuser@example.com")).thenReturn(false);
        when(passwordEncoder.encode(any())).thenReturn("hashedPass");

        ResponseEntity<?> response = authController.register(request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void register_DuplicateEmailExactMatch_Returns409Conflict() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("user2");
        request.setEmail("existing@example.com");
        request.setPassword("StockFlow@2026Secure!");

        when(userRepository.findByUsername("user2")).thenReturn(Optional.empty());
        when(userRepository.existsByEmailIgnoreCase("existing@example.com")).thenReturn(true);

        ResponseEntity<?> response = authController.register(request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        Map<?, ?> body = (Map<?, ?>) response.getBody();
        assertThat(body.get("message")).isEqualTo("Email address is already registered.");
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void register_DuplicateEmailUppercaseMatch_Returns409Conflict() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("user3");
        request.setEmail("EXISTING@EXAMPLE.COM");
        request.setPassword("StockFlow@2026Secure!");

        when(userRepository.findByUsername("user3")).thenReturn(Optional.empty());
        when(userRepository.existsByEmailIgnoreCase("existing@example.com")).thenReturn(true);

        ResponseEntity<?> response = authController.register(request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        Map<?, ?> body = (Map<?, ?>) response.getBody();
        assertThat(body.get("message")).isEqualTo("Email address is already registered.");
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void register_DuplicateEmailWithWhitespace_NormalizesAndReturns409Conflict() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("user4");
        request.setEmail("  existing@example.com  ");
        request.setPassword("StockFlow@2026Secure!");

        when(userRepository.findByUsername("user4")).thenReturn(Optional.empty());
        when(userRepository.existsByEmailIgnoreCase("existing@example.com")).thenReturn(true);

        ResponseEntity<?> response = authController.register(request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        Map<?, ?> body = (Map<?, ?>) response.getBody();
        assertThat(body.get("message")).isEqualTo("Email address is already registered.");
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void register_DatabaseConstraintViolationRaceCondition_Returns409Conflict() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("raceuser");
        request.setEmail("race@example.com");
        request.setPassword("StockFlow@2026Secure!");

        when(userRepository.findByUsername("raceuser")).thenReturn(Optional.empty());
        when(userRepository.existsByEmailIgnoreCase("race@example.com")).thenReturn(false);
        when(passwordEncoder.encode(any())).thenReturn("hashedPass");
        when(userRepository.save(any(User.class))).thenThrow(new DataIntegrityViolationException("uk_users_email constraint violation"));

        ResponseEntity<?> response = authController.register(request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        Map<?, ?> body = (Map<?, ?>) response.getBody();
        assertThat(body.get("message")).isEqualTo("Email address is already registered.");
    }

    @Test
    void sendOtp_DuplicateEmail_Returns409Conflict() {
        SendOtpRequest request = new SendOtpRequest();
        request.setEmail("existing@example.com");

        when(otpVerificationService.sendOtp("existing@example.com"))
                .thenReturn(new OtpVerificationService.OtpResult(false, "Email address is already registered.", false));

        ResponseEntity<?> response = authController.sendOtp(request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        Map<?, ?> body = (Map<?, ?>) response.getBody();
        assertThat(body.get("message")).isEqualTo("Email address is already registered.");
    }
}
