package com.omnistock.auth_service.controller;

import com.omnistock.auth_service.dto.*;
import com.omnistock.auth_service.entity.PasswordResetToken;
import com.omnistock.auth_service.entity.User;
import com.omnistock.auth_service.repository.PasswordResetTokenRepository;
import com.omnistock.auth_service.repository.UserRepository;
import com.omnistock.auth_service.security.JwtUtil;
import com.omnistock.auth_service.service.EmailService;
import com.omnistock.auth_service.service.OtpVerificationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordResetTokenRepository resetTokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private EmailService emailService;

    @Autowired
    private OtpVerificationService otpVerificationService;



    private String hashToken(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder(2 * hash.length);
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }

    private String generateRawResetToken() {
        byte[] randomBytes = new byte[32];
        new SecureRandom().nextBytes(randomBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
    }

    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@Valid @RequestBody SendOtpRequest request) {
        String email = request.getEmail() != null ? request.getEmail().toLowerCase().trim() : "";
        OtpVerificationService.OtpResult result = otpVerificationService.sendOtp(email);
        if (!result.isSuccess()) {
            HttpStatus status = result.getMessage().contains("already registered") ? HttpStatus.CONFLICT : HttpStatus.BAD_REQUEST;
            return ResponseEntity.status(status).body(Map.of("message", result.getMessage()));
        }
        return ResponseEntity.ok(Map.of("message", result.getMessage(), "email", email));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        String email = request.getEmail() != null ? request.getEmail().toLowerCase().trim() : "";
        OtpVerificationService.OtpResult result = otpVerificationService.verifyOtp(email, request.getOtp());
        if (!result.isSuccess()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", result.getMessage()));
        }
        return ResponseEntity.ok(Map.of("message", result.getMessage(), "verified", true, "email", email));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        String email = request.getEmail() != null ? request.getEmail().toLowerCase().trim() : "";
        String username = request.getUsername() != null ? request.getUsername().trim() : "";

        if (userRepository.findByUsername(username).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "Username already exists"));
        }

        if (userRepository.existsByEmailIgnoreCase(email)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "Email address is already registered."));
        }

        if (request.getRole() != null && !request.getRole().equalsIgnoreCase("CUSTOMER")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Direct registration is restricted to CUSTOMER role."));
        }

        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setIsEmailVerified(true);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole("CUSTOMER");
        user.setMustChangePassword(false);

        try {
            userRepository.save(user);
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "Email address is already registered."));
        } catch (Exception e) {
            if (e.getMessage() != null && e.getMessage().toLowerCase().contains("email")) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "Email address is already registered."));
            }
            throw e;
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "User registered successfully"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        if (authentication.isAuthenticated()) {
            User user = userRepository.findByUsername(request.getUsername()).get();
            String token = jwtUtil.generateToken(user.getUsername(), user.getRole());
            boolean mustChange = Boolean.TRUE.equals(user.getMustChangePassword());
            return ResponseEntity.ok(new AuthResponse(token, mustChange));
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }
    }

    @PostMapping("/test-email")
    public ResponseEntity<?> testEmail(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Email parameter is required.", "success", false));
        }

        boolean sent = emailService.sendTestEmail(email.trim());
        if (sent) {
            return ResponseEntity.ok(Map.of("message", "Diagnostic test email dispatched successfully to " + email, "success", true));
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to dispatch test email. Check server logs for SMTP errors.", "success", false));
        }
    }

    @PostMapping("/forgot-password")
    @Transactional
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Email address is required.", "success", false));
        }

        String normalizedEmail = email.toLowerCase().trim();
        Optional<User> userOpt = userRepository.findByEmailIgnoreCase(normalizedEmail);

        if (userOpt.isPresent()) {
            User user = userOpt.get();

            // Invalidate previous unused reset tokens
            List<PasswordResetToken> activeTokens = resetTokenRepository.findByUserIdAndUsedFalse(user.getId());
            for (PasswordResetToken t : activeTokens) {
                t.setUsed(true);
            }
            resetTokenRepository.saveAll(activeTokens);

            // Generate new reset token (SHA-256 hash stored in DB)
            String rawToken = generateRawResetToken();
            String tokenHash = hashToken(rawToken);

            PasswordResetToken resetToken = new PasswordResetToken();
            resetToken.setUserId(user.getId());
            resetToken.setTokenHash(tokenHash);
            resetToken.setExpiresAt(LocalDateTime.now().plusMinutes(30));
            resetToken.setUsed(false);
            resetTokenRepository.save(resetToken);

            System.out.println("[FORGOT PASSWORD] Account found for user ID " + user.getId() + ". Reset token generated & stored.");
            boolean emailSent = emailService.sendPasswordResetEmail(user.getEmail(), user.getFullName() != null ? user.getFullName() : user.getUsername(), rawToken);
            System.out.println("[FORGOT PASSWORD] Email dispatch result: " + (emailSent ? "SUCCESS" : "FAILED (Check SMTP credentials / logs)"));
        }

        // Anti-Account Enumeration: Always return identical generic success message
        return ResponseEntity.ok(Map.of(
            "message", "If the email address is registered with StockFlow, you will receive a password reset link shortly.",
            "success", true
        ));
    }

    @GetMapping("/verify-reset-token")
    public ResponseEntity<?> verifyResetToken(@RequestParam("token") String rawToken) {
        if (rawToken == null || rawToken.trim().isEmpty()) {
            return ResponseEntity.ok(Map.of("valid", false, "message", "Token is missing."));
        }

        String tokenHash = hashToken(rawToken.trim());
        Optional<PasswordResetToken> tokenOpt = resetTokenRepository.findByTokenHash(tokenHash);

        if (tokenOpt.isEmpty()) {
            return ResponseEntity.ok(Map.of("valid", false, "message", "Invalid reset link."));
        }

        PasswordResetToken token = tokenOpt.get();
        if (Boolean.TRUE.equals(token.getUsed()) || token.getExpiresAt().isBefore(LocalDateTime.now())) {
            return ResponseEntity.ok(Map.of("valid", false, "message", "Password reset link has expired or already been used."));
        }

        return ResponseEntity.ok(Map.of("valid", true));
    }

    @PostMapping("/reset-password")
    @Transactional
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> body) {
        String rawToken = body.get("token");
        String newPassword = body.get("newPassword");

        if (rawToken == null || rawToken.trim().isEmpty() || newPassword == null || newPassword.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Token and new password are required.", "success", false));
        }

        if (newPassword.length() < 6) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Password must be at least 6 characters.", "success", false));
        }

        String tokenHash = hashToken(rawToken.trim());
        Optional<PasswordResetToken> tokenOpt = resetTokenRepository.findByTokenHash(tokenHash);

        if (tokenOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Invalid or expired password reset link.", "success", false));
        }

        PasswordResetToken token = tokenOpt.get();
        if (Boolean.TRUE.equals(token.getUsed()) || token.getExpiresAt().isBefore(LocalDateTime.now())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "This password reset link has expired or already been used. Please request a new link.", "success", false));
        }

        User user = userRepository.findById(token.getUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "User not found"));

        user.setPasswordHash(passwordEncoder.encode(newPassword.trim()));
        user.setMustChangePassword(false);
        userRepository.save(user);

        token.setUsed(true);
        token.setUsedAt(LocalDateTime.now());
        resetTokenRepository.save(token);

        // Invalidate all other active reset tokens for this user
        List<PasswordResetToken> activeTokens = resetTokenRepository.findByUserIdAndUsedFalse(user.getId());
        for (PasswordResetToken t : activeTokens) {
            t.setUsed(true);
        }
        resetTokenRepository.saveAll(activeTokens);

        emailService.sendPasswordChangedEmail(user.getEmail(), user.getFullName() != null ? user.getFullName() : user.getUsername());

        return ResponseEntity.ok(Map.of(
            "message", "Password reset successful. You can now sign in with your new password.",
            "success", true
        ));
    }

    @PostMapping("/change-password")
    @Transactional
    public ResponseEntity<?> changePassword(
            @RequestBody Map<String, String> body,
            @RequestHeader(value = "X-Auth-User-Id", required = false) String usernameHeader,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        
        String currentPassword = body.get("oldPassword");
        String newPassword = body.get("newPassword");

        if (newPassword == null || newPassword.trim().length() < 6) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "New password must be at least 6 characters.", "success", false));
        }

        String username = usernameHeader;
        if (username == null && authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            username = jwtUtil.extractUsername(token);
        }

        if (username == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized"));
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (currentPassword != null && !currentPassword.trim().isEmpty()) {
            if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Current password does not match.", "success", false));
            }
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword.trim()));
        user.setMustChangePassword(false);
        userRepository.save(user);

        String newToken = jwtUtil.generateToken(user.getUsername(), user.getRole());

        return ResponseEntity.ok(Map.of(
            "message", "Password updated successfully.",
            "token", newToken,
            "success", true
        ));
    }
}
