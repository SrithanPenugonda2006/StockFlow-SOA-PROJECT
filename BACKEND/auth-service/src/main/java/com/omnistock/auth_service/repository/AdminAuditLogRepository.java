package com.omnistock.auth_service.repository;

import com.omnistock.auth_service.entity.AdminAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AdminAuditLogRepository extends JpaRepository<AdminAuditLog, Long> {
    List<AdminAuditLog> findTop100ByOrderByCreatedAtDesc();
    List<AdminAuditLog> findByActorUsernameOrderByCreatedAtDesc(String actorUsername);
}
