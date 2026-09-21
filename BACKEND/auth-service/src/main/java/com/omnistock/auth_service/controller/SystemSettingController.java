package com.omnistock.auth_service.controller;

import com.omnistock.auth_service.dto.SystemSettingDTO;
import com.omnistock.auth_service.security.AdminSecurityService;
import com.omnistock.auth_service.service.SystemSettingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/settings")
public class SystemSettingController {

    @Autowired
    private SystemSettingService settingService;

    @Autowired
    private AdminSecurityService securityService;

    @GetMapping
    public ResponseEntity<List<SystemSettingDTO>> getAllSettings(
            @RequestHeader(value = "X-Auth-User-Role", required = false) String roleHeader,
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authHeader) {
        securityService.checkAdminAccess(roleHeader, authHeader);
        return ResponseEntity.ok(settingService.getAllSettings());
    }

    @PutMapping
    public ResponseEntity<SystemSettingDTO> updateSetting(
            @RequestBody Map<String, String> body,
            @RequestHeader(value = "X-Auth-User-Role", required = false) String roleHeader,
            @RequestHeader(value = "X-Auth-User-Id", required = false) String actorUsername,
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authHeader) {
        securityService.checkAdminAccess(roleHeader, authHeader);
        String actor = securityService.extractActor(actorUsername, authHeader);
        String key = body.get("key");
        String value = body.get("value");
        if (key == null || value == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Setting key and value are required.");
        }
        return ResponseEntity.ok(settingService.updateSetting(key, value, actor));
    }
}
