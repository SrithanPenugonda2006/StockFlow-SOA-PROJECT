package com.omnistock.auth_service.controller;

import com.omnistock.auth_service.dto.AdminAuditLogDTO;
import com.omnistock.auth_service.security.AdminSecurityService;
import com.omnistock.auth_service.service.AdminAuditService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/audit-logs")
public class AdminAuditController {

    @Autowired
    private AdminAuditService auditService;

    @Autowired
    private AdminSecurityService securityService;

    @GetMapping
    public ResponseEntity<List<AdminAuditLogDTO>> getAuditLogs(
            @RequestHeader(value = "X-Auth-User-Role", required = false) String roleHeader,
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authHeader) {
        securityService.checkAdminAccess(roleHeader, authHeader);
        return ResponseEntity.ok(auditService.getRecentAuditLogs());
    }
}
