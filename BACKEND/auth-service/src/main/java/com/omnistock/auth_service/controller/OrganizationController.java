package com.omnistock.auth_service.controller;

import com.omnistock.auth_service.dto.OrganizationDTO;
import com.omnistock.auth_service.dto.UserResponseDTO;
import com.omnistock.auth_service.security.AdminSecurityService;
import com.omnistock.auth_service.service.OrganizationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/organizations")
public class OrganizationController {

    @Autowired
    private OrganizationService organizationService;

    @Autowired
    private AdminSecurityService securityService;

    @GetMapping
    public ResponseEntity<List<OrganizationDTO>> getAllOrganizations(
            @RequestHeader(value = "X-Auth-User-Role", required = false) String roleHeader,
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authHeader) {
        securityService.checkAdminAccess(roleHeader, authHeader);
        return ResponseEntity.ok(organizationService.getAllOrganizations());
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrganizationDTO> getOrganizationById(
            @PathVariable Long id,
            @RequestHeader(value = "X-Auth-User-Role", required = false) String roleHeader,
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authHeader) {
        securityService.checkAdminAccess(roleHeader, authHeader);
        return ResponseEntity.ok(organizationService.getOrganizationById(id));
    }

    @GetMapping("/{id}/users")
    public ResponseEntity<List<UserResponseDTO>> getOrganizationUsers(
            @PathVariable Long id,
            @RequestHeader(value = "X-Auth-User-Role", required = false) String roleHeader,
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authHeader) {
        securityService.checkAdminAccess(roleHeader, authHeader);
        return ResponseEntity.ok(organizationService.getOrganizationUsers(id));
    }

    @PostMapping
    public ResponseEntity<OrganizationDTO> createOrganization(
            @RequestBody OrganizationDTO dto,
            @RequestHeader(value = "X-Auth-User-Role", required = false) String roleHeader,
            @RequestHeader(value = "X-Auth-User-Id", required = false) String actorUsername,
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authHeader) {
        securityService.checkAdminAccess(roleHeader, authHeader);
        String actor = securityService.extractActor(actorUsername, authHeader);
        return ResponseEntity.status(HttpStatus.CREATED).body(organizationService.createOrganization(dto, actor));
    }

    @PutMapping("/{id}")
    public ResponseEntity<OrganizationDTO> updateOrganization(
            @PathVariable Long id,
            @RequestBody OrganizationDTO dto,
            @RequestHeader(value = "X-Auth-User-Role", required = false) String roleHeader,
            @RequestHeader(value = "X-Auth-User-Id", required = false) String actorUsername,
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authHeader) {
        securityService.checkAdminAccess(roleHeader, authHeader);
        String actor = securityService.extractActor(actorUsername, authHeader);
        return ResponseEntity.ok(organizationService.updateOrganization(id, dto, actor));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<OrganizationDTO> updateOrganizationStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> statusBody,
            @RequestHeader(value = "X-Auth-User-Role", required = false) String roleHeader,
            @RequestHeader(value = "X-Auth-User-Id", required = false) String actorUsername,
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authHeader) {
        securityService.checkAdminAccess(roleHeader, authHeader);
        String actor = securityService.extractActor(actorUsername, authHeader);
        String status = statusBody.getOrDefault("status", "ACTIVE");
        return ResponseEntity.ok(organizationService.updateOrganizationStatus(id, status, actor));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrganization(
            @PathVariable Long id,
            @RequestHeader(value = "X-Auth-User-Role", required = false) String roleHeader,
            @RequestHeader(value = "X-Auth-User-Id", required = false) String actorUsername,
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authHeader) {
        securityService.checkAdminAccess(roleHeader, authHeader);
        String actor = securityService.extractActor(actorUsername, authHeader);
        organizationService.deleteOrganization(id, actor);
        return ResponseEntity.noContent().build();
    }
}
