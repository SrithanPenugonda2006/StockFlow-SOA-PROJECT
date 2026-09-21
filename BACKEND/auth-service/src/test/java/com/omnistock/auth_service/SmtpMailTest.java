package com.omnistock.auth_service;

import com.omnistock.auth_service.service.EmailService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@TestPropertySource(properties = {
    "spring.mail.host=smtp.gmail.com",
    "spring.mail.port=587",
    "spring.mail.username=srithan06@gmail.com",
    "spring.mail.password=cetmvfvblhttiobk",
    "spring.mail.properties.mail.smtp.auth=true",
    "spring.mail.properties.mail.smtp.starttls.enable=true",
    "spring.mail.properties.mail.smtp.starttls.required=true",
    "spring.mail.properties.mail.smtp.ssl.trust=smtp.gmail.com"
})
@org.junit.jupiter.api.Disabled("Diagnostic SMTP test for live Gmail SMTP connection")
class SmtpMailTest {

    @Autowired
    private EmailService emailService;

    @Test
    void testSendDiagnosticEmail() {
        System.out.println("Running SMTP Diagnostic Test...");
        boolean result = emailService.sendTestEmail("srithan06@gmail.com");
        System.out.println("sendTestEmail result: " + result);
        assertThat(result).isTrue();
    }
}
