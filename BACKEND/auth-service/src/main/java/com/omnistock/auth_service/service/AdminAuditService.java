package com.omnistock.auth_service.service;

import com.omnistock.auth_service.dto.AdminAuditLogDTO;
import com.omnistock.auth_service.entity.AdminAuditLog;
import com.omnistock.auth_service.repository.AdminAuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminAuditService {

    @Autowired
    private AdminAuditLogRepository auditLogRepository;

    @Transactional
    public void logAction(String actorUsername, String action, String resourceType, String resourceId, String details) {
        AdminAuditLog log = new AdminAuditLog();
        log.setActorUsername(actorUsername != null ? actorUsername : "SYSTEM");
        log.setAction(action);
        log.setResourceType(resourceType);
        log.setResourceId(resourceId);
        log.setDetails(details);
        log.setCreatedAt(LocalDateTime.now());
        auditLogRepository.save(log);
    }

    public List<AdminAuditLogDTO> getRecentAuditLogs() {
        return auditLogRepository.findTop100ByOrderByCreatedAtDesc()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    private AdminAuditLogDTO toDTO(AdminAuditLog log) {
        AdminAuditLogDTO dto = new AdminAuditLogDTO();
        dto.setId(log.getId());
        dto.setActorUsername(log.getActorUsername());
        dto.setAction(log.getAction());
        dto.setResourceType(log.getResourceType());
        dto.setResourceId(log.getResourceId());
        dto.setDetails(log.getDetails());
        dto.setCreatedAt(log.getCreatedAt());
        return dto;
    }
}
