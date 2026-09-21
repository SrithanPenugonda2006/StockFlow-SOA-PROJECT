package com.omnistock.auth_service.controller;

import com.omnistock.auth_service.dto.AdminOverviewStatsDTO;
import com.omnistock.auth_service.repository.AdminAuditLogRepository;
import com.omnistock.auth_service.repository.OrganizationRepository;
import com.omnistock.auth_service.repository.UserRepository;
import com.omnistock.auth_service.security.AdminSecurityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/admin/analytics")
public class AdminAnalyticsController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private AdminAuditLogRepository auditLogRepository;

    @Autowired
    private AdminSecurityService securityService;

    @GetMapping("/overview")
    public ResponseEntity<AdminOverviewStatsDTO> getOverviewStats(
            @RequestHeader(value = "X-Auth-User-Role", required = false) String roleHeader,
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authHeader) {
        securityService.checkAdminAccess(roleHeader, authHeader);

        AdminOverviewStatsDTO dto = new AdminOverviewStatsDTO();
        dto.setTotalUsers(userRepository.count());
        dto.setTotalAdminUsers(userRepository.countByRole("ADMIN"));
        dto.setTotalManagerUsers(userRepository.countByRole("MANAGER"));
        dto.setTotalCustomerUsers(userRepository.countByRole("CUSTOMER"));
        dto.setTotalOrganizations(organizationRepository.count());
        dto.setTotalAuditLogs(auditLogRepository.count());

        return ResponseEntity.ok(dto);
    }

    @GetMapping("/reports/export")
    public ResponseEntity<byte[]> exportReport(
            @RequestParam(defaultValue = "users") String reportType,
            @RequestHeader(value = "X-Auth-User-Role", required = false) String roleHeader,
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authHeader) {
        securityService.checkAdminAccess(roleHeader, authHeader);

        StringBuilder csv = new StringBuilder();
        String fileName = reportType + "-report.csv";

        if ("users".equalsIgnoreCase(reportType)) {
            csv.append("User ID,Username,Email,Role,Status,Email Verified,Organization ID\n");
            userRepository.findAll().forEach(u -> {
                csv.append(u.getId()).append(",")
                   .append(u.getUsername()).append(",")
                   .append(u.getEmail() != null ? u.getEmail() : "").append(",")
                   .append(u.getRole()).append(",")
                   .append(u.getStatus() != null ? u.getStatus() : "ACTIVE").append(",")
                   .append(u.getIsEmailVerified()).append(",")
                   .append(u.getOrganizationId() != null ? u.getOrganizationId() : 1).append("\n");
            });
        } else if ("organizations".equalsIgnoreCase(reportType)) {
            csv.append("Organization ID,Name,Code,Status,Created At\n");
            organizationRepository.findAll().forEach(o -> {
                csv.append(o.getId()).append(",")
                   .append(o.getName()).append(",")
                   .append(o.getCode()).append(",")
                   .append(o.getStatus()).append(",")
                   .append(o.getCreatedAt()).append("\n");
            });
        } else {
            csv.append("Audit ID,Actor Username,Action,Resource Type,Resource ID,Details,Created At\n");
            auditLogRepository.findAll().forEach(a -> {
                csv.append(a.getId()).append(",")
                   .append(a.getActorUsername()).append(",")
                   .append(a.getAction()).append(",")
                   .append(a.getResourceType()).append(",")
                   .append(a.getResourceId() != null ? a.getResourceId() : "").append(",")
                   .append("\"").append(a.getDetails() != null ? a.getDetails().replace("\"", "'") : "").append("\",")
                   .append(a.getCreatedAt()).append("\n");
            });
        }

        byte[] bytes = csv.toString().getBytes(StandardCharsets.UTF_8);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv"));
        headers.setContentDisposition(ContentDisposition.attachment().filename(fileName).build());

        return new ResponseEntity<>(bytes, headers, HttpStatus.OK);
    }
}
