package com.omnistock.auth_service.service;

import com.omnistock.auth_service.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpVerificationService {

    @Autowired
    private EmailService emailService;

    @Autowired
    private UserRepository userRepository;

    private static final Map<String, OtpRecord> otpCache = new ConcurrentHashMap<>();

    public static class OtpRecord {
        private final String otp;
        private final long expiryTime;
        private boolean verified;
        private int attemptsCount;

        public OtpRecord(String otp, long expiryTime) {
            this.otp = otp;
            this.expiryTime = expiryTime;
            this.verified = false;
            this.attemptsCount = 0;
        }

        public String getOtp() { return otp; }
        public boolean isExpired() { return System.currentTimeMillis() > expiryTime; }
        public boolean isVerified() { return verified; }
        public void setVerified(boolean verified) { this.verified = verified; }
        public int getAttemptsCount() { return attemptsCount; }
        public void incrementAttempts() { this.attemptsCount++; }
    }

    public static class OtpResult {
        private final boolean success;
        private final String message;
        private final boolean verified;

        public OtpResult(boolean success, String message, boolean verified) {
            this.success = success;
            this.message = message;
            this.verified = verified;
        }

        public boolean isSuccess() { return success; }
        public String getMessage() { return message; }
        public boolean isVerified() { return verified; }
    }

    public OtpResult sendOtp(String rawEmail) {
        String email = rawEmail != null ? rawEmail.toLowerCase().trim() : "";
        if (email.isEmpty()) {
            return new OtpResult(false, "Email address is required.", false);
        }

        if (userRepository.existsByEmailIgnoreCase(email)) {
            return new OtpResult(false, "Email address is already registered.", false);
        }

        SecureRandom secureRandom = new SecureRandom();
        String generatedOtp = String.format("%06d", secureRandom.nextInt(900000) + 100000);
        long expiry = System.currentTimeMillis() + 5 * 60 * 1000; // 5 minutes

        otpCache.put(email, new OtpRecord(generatedOtp, expiry));

        try {
            emailService.sendOtpEmail(email, generatedOtp);
        } catch (Exception e) {
            otpCache.remove(email);
            return new OtpResult(false, "Unable to send verification code. Please try again.", false);
        }

        return new OtpResult(true, "Verification OTP code sent to " + email, false);
    }

    public OtpResult verifyOtp(String rawEmail, String otpCode) {
        String email = rawEmail != null ? rawEmail.toLowerCase().trim() : "";
        String code = otpCode != null ? otpCode.trim() : "";

        OtpRecord record = otpCache.get(email);

        if (record == null || record.isExpired()) {
            return new OtpResult(false, "Verification code expired. Please request a new code.", false);
        }

        if (record.isVerified()) {
            return new OtpResult(true, "Email address is already verified.", true);
        }

        if (record.getAttemptsCount() >= 5) {
            otpCache.remove(email);
            return new OtpResult(false, "Maximum OTP verification attempts exceeded. Please request a new verification code.", false);
        }

        if (!record.getOtp().equals(code)) {
            record.incrementAttempts();
            int remaining = 5 - record.getAttemptsCount();
            return new OtpResult(false, "Invalid verification code. " + remaining + " attempts remaining.", false);
        }

        record.setVerified(true);
        return new OtpResult(true, "Email verified successfully.", true);
    }

    public boolean isEmailVerified(String rawEmail) {
        if (rawEmail == null || rawEmail.isBlank()) return false;
        String email = rawEmail.toLowerCase().trim();
        OtpRecord record = otpCache.get(email);
        return record != null && record.isVerified() && !record.isExpired();
    }

    public void consumeVerification(String rawEmail) {
        if (rawEmail != null) {
            otpCache.remove(rawEmail.toLowerCase().trim());
        }
    }
}
