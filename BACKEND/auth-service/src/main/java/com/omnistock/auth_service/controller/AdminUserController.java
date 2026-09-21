package com.omnistock.auth_service.controller;

import com.omnistock.auth_service.dto.UserResponseDTO;
import com.omnistock.auth_service.dto.UserRoleUpdateDTO;
import com.omnistock.auth_service.dto.UserStatusUpdateDTO;
import com.omnistock.auth_service.security.AdminSecurityService;
import com.omnistock.auth_service.service.AdminUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    @Autowired
    private AdminUserService adminUserService;

    @Autowired
    private AdminSecurityService securityService;

    @GetMapping
    public ResponseEntity<List<UserResponseDTO>> getAllUsers(
            @RequestHeader(value = "X-Auth-User-Role", required = false) String roleHeader,
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authHeader) {
        securityService.checkAdminAccess(roleHeader, authHeader);
        return ResponseEntity.ok(adminUserService.getAllUsers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDTO> getUserById(
            @PathVariable Long id,
            @RequestHeader(value = "X-Auth-User-Role", required = false) String roleHeader,
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authHeader) {
        securityService.checkAdminAccess(roleHeader, authHeader);
        return ResponseEntity.ok(adminUserService.getUserById(id));
    }

    @PutMapping("/{id}/role")
    public ResponseEntity<UserResponseDTO> updateUserRole(
            @PathVariable Long id,
            @RequestBody UserRoleUpdateDTO dto,
            @RequestHeader(value = "X-Auth-User-Role", required = false) String roleHeader,
            @RequestHeader(value = "X-Auth-User-Id", required = false) String actorUsername,
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authHeader) {
        securityService.checkAdminAccess(roleHeader, authHeader);
        String actor = securityService.extractActor(actorUsername, authHeader);
        return ResponseEntity.ok(adminUserService.updateUserRole(id, dto.getRole(), actor));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<UserResponseDTO> updateUserStatus(
            @PathVariable Long id,
            @RequestBody UserStatusUpdateDTO dto,
            @RequestHeader(value = "X-Auth-User-Role", required = false) String roleHeader,
            @RequestHeader(value = "X-Auth-User-Id", required = false) String actorUsername,
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authHeader) {
        securityService.checkAdminAccess(roleHeader, authHeader);
        String actor = securityService.extractActor(actorUsername, authHeader);
        return ResponseEntity.ok(adminUserService.updateUserStatus(id, dto.getStatus(), actor));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(
            @PathVariable Long id,
            @RequestHeader(value = "X-Auth-User-Role", required = false) String roleHeader,
            @RequestHeader(value = "X-Auth-User-Id", required = false) String actorUsername,
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authHeader) {
        securityService.checkAdminAccess(roleHeader, authHeader);
        String actor = securityService.extractActor(actorUsername, authHeader);
        adminUserService.deleteUser(id, actor);
        return ResponseEntity.noContent().build();
    }
}
