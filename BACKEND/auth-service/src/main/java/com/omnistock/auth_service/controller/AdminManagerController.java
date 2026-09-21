package com.omnistock.auth_service.controller;

import com.omnistock.auth_service.dto.*;
import com.omnistock.auth_service.security.AdminSecurityService;
import com.omnistock.auth_service.service.AdminManagerService;
import com.omnistock.auth_service.service.EmailService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/managers")
public class AdminManagerController {

    @Autowired
    private AdminManagerService managerService;

    @Autowired
    private AdminSecurityService securityService;

    @Autowired
    private EmailService emailService;

    @GetMapping
    public ResponseEntity<List<ManagerResponseDTO>> getAllManagers(
            @RequestHeader(value = "X-Auth-User-Role", required = false) String roleHeader,
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authHeader) {
        securityService.checkAdminAccess(roleHeader, authHeader);
        return ResponseEntity.ok(managerService.getAllManagers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ManagerResponseDTO> getManagerById(
            @PathVariable Long id,
            @RequestHeader(value = "X-Auth-User-Role", required = false) String roleHeader,
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authHeader) {
        securityService.checkAdminAccess(roleHeader, authHeader);
        return ResponseEntity.ok(managerService.getManagerById(id));
    }

    @PostMapping
    public ResponseEntity<ManagerResponseDTO> createManager(
            @Valid @RequestBody ManagerCreateDTO dto,
            @RequestHeader(value = "X-Auth-User-Role", required = false) String roleHeader,
            @RequestHeader(value = "X-Auth-User-Id", required = false) String actorUsername,
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authHeader) {
        securityService.checkAdminAccess(roleHeader, authHeader);
        String actor = securityService.extractActor(actorUsername, authHeader);
        return ResponseEntity.status(HttpStatus.CREATED).body(managerService.createManager(dto, actor));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ManagerResponseDTO> updateManager(
            @PathVariable Long id,
            @Valid @RequestBody ManagerUpdateDTO dto,
            @RequestHeader(value = "X-Auth-User-Role", required = false) String roleHeader,
            @RequestHeader(value = "X-Auth-User-Id", required = false) String actorUsername,
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authHeader) {
        securityService.checkAdminAccess(roleHeader, authHeader);
        String actor = securityService.extractActor(actorUsername, authHeader);
        return ResponseEntity.ok(managerService.updateManager(id, dto, actor));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ManagerResponseDTO> updateManagerStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @RequestHeader(value = "X-Auth-User-Role", required = false) String roleHeader,
            @RequestHeader(value = "X-Auth-User-Id", required = false) String actorUsername,
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authHeader) {
        securityService.checkAdminAccess(roleHeader, authHeader);
        String actor = securityService.extractActor(actorUsername, authHeader);
        String status = body.getOrDefault("status", "ACTIVE");
        return ResponseEntity.ok(managerService.updateManagerStatus(id, status, actor));
    }

    @PostMapping("/{id}/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(
            @PathVariable Long id,
            @Valid @RequestBody ResetPasswordDTO dto,
            @RequestHeader(value = "X-Auth-User-Role", required = false) String roleHeader,
            @RequestHeader(value = "X-Auth-User-Id", required = false) String actorUsername,
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authHeader) {
        securityService.checkAdminAccess(roleHeader, authHeader);
        String actor = securityService.extractActor(actorUsername, authHeader);
        managerService.resetPassword(id, dto.getNewPassword(), actor);
        return ResponseEntity.ok(Map.of("message", "Password reset successfully."));
    }

    @PostMapping("/email/test")
    public ResponseEntity<Map<String, Object>> testEmail(
            @RequestBody Map<String, String> body,
            @RequestHeader(value = "X-Auth-User-Role", required = false) String roleHeader,
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authHeader) {
        securityService.checkAdminAccess(roleHeader, authHeader);
        String recipient = body.get("recipient");
        if (recipient == null || recipient.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("success", false, "message", "Recipient email is required."));
        }
        boolean sent = emailService.sendTestEmail(recipient.trim());
        if (sent) {
            return ResponseEntity.ok(Map.of("success", true, "message", "StockFlow SMTP test email sent successfully to " + recipient));
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "SMTP test failed. Check server console logs for exact JavaMailSender exception."));
        }
    }

    @GetMapping("/{id}/activity")
    public ResponseEntity<List<AdminAuditLogDTO>> getManagerActivity(
            @PathVariable Long id,
            @RequestHeader(value = "X-Auth-User-Role", required = false) String roleHeader,
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authHeader) {
        securityService.checkAdminAccess(roleHeader, authHeader);
        return ResponseEntity.ok(managerService.getManagerActivity(id));
    }
}
