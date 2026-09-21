package com.omnistock.auth_service.controller;

import com.omnistock.auth_service.dto.UserInvitationDTO;
import com.omnistock.auth_service.security.AdminSecurityService;
import com.omnistock.auth_service.service.UserInvitationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/invitations")
public class UserInvitationController {

    @Autowired
    private UserInvitationService invitationService;

    @Autowired
    private AdminSecurityService securityService;

    @GetMapping
    public ResponseEntity<List<UserInvitationDTO>> getAllInvitations(
            @RequestHeader(value = "X-Auth-User-Role", required = false) String roleHeader,
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authHeader) {
        securityService.checkAdminAccess(roleHeader, authHeader);
        return ResponseEntity.ok(invitationService.getAllInvitations());
    }

    @PostMapping
    public ResponseEntity<UserInvitationDTO> createInvitation(
            @RequestBody UserInvitationDTO dto,
            @RequestHeader(value = "X-Auth-User-Role", required = false) String roleHeader,
            @RequestHeader(value = "X-Auth-User-Id", required = false) String actorUsername,
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authHeader) {
        securityService.checkAdminAccess(roleHeader, authHeader);
        String actor = securityService.extractActor(actorUsername, authHeader);
        return ResponseEntity.status(HttpStatus.CREATED).body(invitationService.createInvitation(dto, actor));
    }
}
