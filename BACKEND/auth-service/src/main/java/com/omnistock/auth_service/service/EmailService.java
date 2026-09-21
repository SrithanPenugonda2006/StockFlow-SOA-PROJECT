package com.omnistock.auth_service.service;

import jakarta.annotation.PostConstruct;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.CompletableFuture;

@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:srithan06@gmail.com}")
    private String fromEmail;

    @Value("${spring.mail.password:}")
    private String mailPassword;

    @Value("${spring.mail.host:smtp.gmail.com}")
    private String mailHost;

    @Value("${spring.mail.port:587}")
    private String mailPort;

    @Value("${app.frontend.base-url:http://localhost:5173}")
    private String frontendBaseUrl;

    @PostConstruct
    public void logSmtpDiagnostics() {
        System.out.println("==========================================");
        System.out.println("[SMTP CONFIGURATION DIAGNOSTICS]");
        System.out.println("MAIL_HOST configured: " + mailHost);
        System.out.println("MAIL_PORT configured: " + mailPort);
        System.out.println("MAIL_USERNAME configured: " + fromEmail);
        System.out.println("MAIL_PASSWORD configured: " + (mailPassword != null && !mailPassword.trim().isEmpty()));
        System.out.println("FRONTEND_BASE_URL: " + frontendBaseUrl);
        System.out.println("JavaMailSender Bean Present: " + (mailSender != null));
        System.out.println("==========================================");
    }

    private String maskEmail(String email) {
        if (email == null || !email.contains("@")) return "***@***.com";
        int atIdx = email.indexOf("@");
        if (atIdx <= 2) return email.charAt(0) + "***" + email.substring(atIdx);
        return email.substring(0, 2) + "*****" + email.substring(atIdx);
    }

    public void sendOtpEmail(String toEmail, String otpCode) {
        System.out.println("==========================================");
        System.out.println("[OTP MAIL SERVICE] Dispatching OTP code " + otpCode + " to " + toEmail);
        System.out.println("==========================================");

        CompletableFuture.runAsync(() -> {
            if (mailSender != null && fromEmail != null && !fromEmail.trim().isEmpty()) {
                try {
                    SimpleMailMessage message = new SimpleMailMessage();
                    message.setFrom(fromEmail);
                    message.setTo(toEmail);
                    message.setSubject("StockFlow - Your 6-Digit Email Verification OTP");
                    message.setText("Hello,\n\nYour 6-digit verification OTP code for StockFlow is: " + otpCode + 
                                    "\n\nThis code is valid for 5 minutes. Do not share this code with anyone.\n\nThank you,\nStockFlow Security Team");
                    mailSender.send(message);
                    System.out.println("[OTP MAIL SERVICE] Real Email dispatched successfully to " + toEmail);
                } catch (Exception e) {
                    System.err.println("[OTP MAIL SERVICE WARNING] SMTP mail dispatch for " + toEmail + 
                                       " (" + e.getMessage() + "). OTP code " + otpCode + " logged to server console.");
                }
            }
        });
    }



    public boolean sendPasswordResetEmail(String toEmail, String userName, String resetToken) {
        System.out.println("==========================================");
        System.out.println("[RESET MAIL SERVICE] Dispatching Password Reset Link to " + toEmail);
        System.out.println("==========================================");

        String resetUrl = frontendBaseUrl + "/reset-password?token=" + resetToken;

        String htmlContent = "<!DOCTYPE html>"
                + "<html>"
                + "<head><style>"
                + "body { font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 20px; }"
                + ".card { background-color: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 32px; max-width: 580px; margin: 0 auto; }"
                + ".header { text-align: center; margin-bottom: 24px; border-bottom: 1px solid #334155; padding-bottom: 16px; }"
                + ".brand { font-size: 22px; font-weight: 900; color: #818cf8; text-transform: uppercase; letter-spacing: 1px; }"
                + ".subtitle { font-size: 12px; color: #94a3b8; font-weight: 600; text-transform: uppercase; }"
                + ".content { line-height: 1.6; font-size: 14px; color: #cbd5e1; }"
                + ".btn { display: inline-block; background-color: #4f46e5; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 14px; padding: 12px 24px; border-radius: 10px; margin: 20px 0; text-align: center; }"
                + ".notice { font-size: 11px; color: #fbbf24; margin-top: 20px; padding: 10px; background: rgba(251,191,36,0.1); border-radius: 8px; border: 1px solid rgba(251,191,36,0.2); }"
                + ".footer { margin-top: 24px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #334155; padding-top: 16px; }"
                + "</style></head>"
                + "<body>"
                + "<div class=\"card\">"
                + "<div class=\"header\">"
                + "<div class=\"brand\">StockFlow</div>"
                + "<div class=\"subtitle\">Security & Recovery</div>"
                + "</div>"
                + "<div class=\"content\">"
                + "<p>Hello <strong>" + userName + "</strong>,</p>"
                + "<p>We received a request to reset your StockFlow account password. Click the button below to create a new password:</p>"
                + "<div style=\"text-align:center;\">"
                + "<a href=\"" + resetUrl + "\" class=\"btn\">Reset Password</a>"
                + "</div>"
                + "<p style=\"font-size: 12px; color: #94a3b8;\">This password reset link will expire in 30 minutes.</p>"
                + "<p style=\"font-size: 12px; color: #94a3b8;\">If you did not request a password reset, you can safely ignore this email.</p>"
                + "<div class=\"notice\"><strong>Security Note:</strong> StockFlow will never ask you to send your password or credentials by email.</div>"
                + "</div>"
                + "<div class=\"footer\">This is an automated security message from StockFlow Administration. &copy; 2026 OmniStock.</div>"
                + "</div>"
                + "</body></html>";

        if (mailSender != null && fromEmail != null && !fromEmail.trim().isEmpty()) {
            if (mailPassword == null || mailPassword.trim().isEmpty()) {
                System.err.println("[RESET MAIL SERVICE ERROR] SPRING_MAIL_PASSWORD environment variable is NOT configured. Unable to authenticate with " + mailHost);
                return false;
            }

            try {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                helper.setFrom(fromEmail);
                helper.setTo(toEmail);
                helper.setSubject("StockFlow Password Reset");
                helper.setText(htmlContent, true);

                mailSender.send(message);
                System.out.println("[RESET MAIL SERVICE SUCCESS] Password reset email dispatched to " + toEmail);
                return true;
            } catch (Exception e) {
                System.err.println("[RESET MAIL SERVICE ERROR] Mail dispatch to " + toEmail + " failed: " + e.getMessage());
                e.printStackTrace();
                return false;
            }
        } else {
            System.out.println("[RESET MAIL SERVICE MOCK] MailSender unconfigured or fromEmail missing. Reset token for " + toEmail + ": " + resetToken);
            return false;
        }
    }

    public boolean sendPasswordChangedEmail(String toEmail, String userName) {
        System.out.println("[CONFIRMATION MAIL SERVICE] Dispatching Password Changed Notice to " + toEmail);

        String htmlContent = "<!DOCTYPE html><html><body>"
                + "<p>Hello <strong>" + userName + "</strong>,</p>"
                + "<p>Your StockFlow password was successfully changed.</p>"
                + "<p>If you did not make this change, please contact your administrator or support team immediately.</p>"
                + "<p>Regards,<br/>StockFlow Administration</p>"
                + "</body></html>";

        if (mailSender != null && fromEmail != null && !fromEmail.trim().isEmpty() && mailPassword != null && !mailPassword.trim().isEmpty()) {
            try {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                helper.setFrom(fromEmail);
                helper.setTo(toEmail);
                helper.setSubject("StockFlow Password Changed");
                helper.setText(htmlContent, true);

                mailSender.send(message);
                return true;
            } catch (Exception e) {
                System.err.println("[CONFIRMATION MAIL SERVICE ERROR] Mail dispatch to " + toEmail + " failed: " + e.getMessage());
                return false;
            }
        }
        return false;
    }

    public boolean sendTestEmail(String toEmail) {
        System.out.println("==========================================");
        System.out.println("[TEST MAIL SERVICE] Dispatching Diagnostic Test Email to " + toEmail);
        System.out.println("==========================================");

        if (mailSender == null) {
            System.err.println("[TEST MAIL SERVICE ERROR] JavaMailSender bean is NULL.");
            return false;
        }

        if (mailPassword == null || mailPassword.trim().isEmpty()) {
            System.err.println("[TEST MAIL SERVICE ERROR] SPRING_MAIL_PASSWORD environment variable is missing/empty.");
            return false;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("StockFlow Email Diagnostic Test");
            message.setText("This is a test email from StockFlow Auth Service to verify SMTP connection and authentication.");

            mailSender.send(message);
            System.out.println("[TEST MAIL SERVICE SUCCESS] Test email accepted by SMTP server for " + toEmail);
            return true;
        } catch (Exception e) {
            System.err.println("[TEST MAIL SERVICE ERROR] Failed to send test email to " + toEmail + ": " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
}
