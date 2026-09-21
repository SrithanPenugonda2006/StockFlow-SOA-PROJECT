package com.omnistock.auth_service.service;

import com.omnistock.auth_service.dto.*;
import com.omnistock.auth_service.entity.AdminAuditLog;
import com.omnistock.auth_service.entity.User;
import com.omnistock.auth_service.entity.UserWarehouse;
import com.omnistock.auth_service.repository.AdminAuditLogRepository;
import com.omnistock.auth_service.repository.UserRepository;
import com.omnistock.auth_service.repository.UserWarehouseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AdminManagerService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserWarehouseRepository userWarehouseRepository;

    @Autowired
    private AdminAuditLogRepository auditLogRepository;

    @Autowired
    private AdminAuditService auditService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    @Autowired
    private OtpVerificationService otpVerificationService;

    @Value("${app.frontend.base-url:http://localhost:5173}")
    private String frontendBaseUrl;    private static final Map<Long, String> WAREHOUSE_NAMES = Map.of(
        1L, "Hyderabad Central Hub",
        2L, "Bengaluru Logistics Park",
        3L, "Mumbai Fulfilment Center",
        4L, "Delhi Gateway Hub"
    );

    public List<ManagerResponseDTO> getAllManagers() {
        List<User> managers = userRepository.findAll()
                .stream()
                .filter(u -> "MANAGER".equalsIgnoreCase(u.getRole()))
                .collect(Collectors.toList());

        return managers.stream().map(this::toDTO).collect(Collectors.toList());
    }

    public ManagerResponseDTO getManagerById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Manager not found with id: " + id));

        return toDTO(user);
    }

    @Transactional
    public ManagerResponseDTO createManager(ManagerCreateDTO dto, String actorUsername) {
        String username = dto.getUsername() != null ? dto.getUsername().trim() : "";
        String email = dto.getEmail() != null ? dto.getEmail().toLowerCase().trim() : "";

        System.out.println("[MANAGER-CREATE] Starting manager creation for recipient: " + maskEmail(email));

        if (userRepository.findByUsername(username).isPresent()) {
            System.err.println("[MANAGER-CREATE ERROR] Username already exists: " + username);
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already exists");
        }

        if (userRepository.existsByEmailIgnoreCase(email)) {
            System.err.println("[MANAGER-CREATE ERROR] Email already registered: " + maskEmail(email));
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This email address is already registered.");
        }

        if (!otpVerificationService.isEmailVerified(email)) {
            System.err.println("[MANAGER-CREATE ERROR] Email OTP not verified for: " + maskEmail(email));
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Manager email must be verified before creating the account.");
        }

        System.out.println("[MANAGER-CREATE] Email verified: true");
        System.out.println("[MANAGER-CREATE] Username resolved: " + username);

        String rawPassword = dto.getPassword() != null ? dto.getPassword().trim() : "";
        if (rawPassword.length() < 6) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password must be at least 6 characters.");
        }

        User user = new User();
        user.setFullName(dto.getFullName() != null ? dto.getFullName().trim() : username);
        user.setUsername(username);
        user.setEmail(email);
        user.setPhone(dto.getPhone() != null ? dto.getPhone().trim() : "");
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        user.setRole("MANAGER");
        user.setStatus(dto.getStatus() != null ? dto.getStatus().toUpperCase() : "ACTIVE");
        user.setIsEmailVerified(true);
        user.setOrganizationId(1L);
        user.setMustChangePassword(false);

        User savedUser = userRepository.save(user);

        List<String> assignedWarehouseNames = new ArrayList<>();
        if (dto.getWarehouseIds() != null && !dto.getWarehouseIds().isEmpty()) {
            for (Long wId : dto.getWarehouseIds()) {
                String wName = WAREHOUSE_NAMES.getOrDefault(wId, "Warehouse #" + wId);
                userWarehouseRepository.save(new UserWarehouse(savedUser.getId(), wId, wName));
                assignedWarehouseNames.add(wName);
            }
        }

        auditService.logAction(
                actorUsername,
                "MANAGER_CREATED",
                "USER",
                savedUser.getId().toString(),
                "Created new manager account: " + savedUser.getUsername() + " (" + savedUser.getEmail() + ")"
        );

        otpVerificationService.consumeVerification(email);

        ManagerResponseDTO responseDTO = toDTO(savedUser);
        responseDTO.setEmailSent(false);
        responseDTO.setMustChangePassword(false);
        responseDTO.setMessage("Manager created successfully.");
        return responseDTO;
    }

    @Transactional
    public ManagerResponseDTO updateManager(Long id, ManagerUpdateDTO dto, String actorUsername) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Manager not found with id: " + id));

        String email = dto.getEmail() != null ? dto.getEmail().toLowerCase().trim() : "";
        if (!email.equalsIgnoreCase(user.getEmail()) && userRepository.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This email address is already registered.");
        }

        user.setFullName(dto.getFullName() != null ? dto.getFullName().trim() : user.getUsername());
        user.setEmail(email);
        user.setPhone(dto.getPhone() != null ? dto.getPhone().trim() : "");
        if (dto.getRole() != null) user.setRole(dto.getRole().toUpperCase());
        if (dto.getStatus() != null) user.setStatus(dto.getStatus().toUpperCase());

        User updatedUser = userRepository.save(user);

        userWarehouseRepository.deleteByUserId(id);
        if (dto.getWarehouseIds() != null && !dto.getWarehouseIds().isEmpty()) {
            for (Long wId : dto.getWarehouseIds()) {
                String wName = WAREHOUSE_NAMES.getOrDefault(wId, "Warehouse #" + wId);
                userWarehouseRepository.save(new UserWarehouse(updatedUser.getId(), wId, wName));
            }
        }

        auditService.logAction(
                actorUsername,
                "MANAGER_UPDATED",
                "USER",
                id.toString(),
                "Updated manager details for: " + updatedUser.getUsername()
        );

        return toDTO(updatedUser);
    }

    @Transactional
    public ManagerResponseDTO updateManagerStatus(Long id, String status, String actorUsername) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Manager not found with id: " + id));

        String newStatus = status.toUpperCase();
        user.setStatus(newStatus);
        User updated = userRepository.save(user);

        String action = "ACTIVE".equalsIgnoreCase(newStatus) ? "MANAGER_ACTIVATED" : "MANAGER_DEACTIVATED";
        auditService.logAction(
                actorUsername,
                action,
                "USER",
                id.toString(),
                "Changed manager status to " + newStatus + " for: " + user.getUsername()
        );

        return toDTO(updated);
    }

    @Transactional
    public void resetPassword(Long id, String newPassword, String actorUsername) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Manager not found with id: " + id));

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setMustChangePassword(true);
        userRepository.save(user);

        auditService.logAction(
                actorUsername,
                "MANAGER_PASSWORD_RESET",
                "USER",
                id.toString(),
                "Reset password for manager: " + user.getUsername()
        );
    }

    public List<AdminAuditLogDTO> getManagerActivity(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Manager not found with id: " + id));

        return auditLogRepository.findByActorUsernameOrderByCreatedAtDesc(user.getUsername())
                .stream()
                .map(this::toAuditDTO)
                .collect(Collectors.toList());
    }

    private String maskEmail(String email) {
        if (email == null || !email.contains("@")) return "***@***.com";
        int atIdx = email.indexOf("@");
        if (atIdx <= 2) return email.charAt(0) + "***" + email.substring(atIdx);
        return email.substring(0, 2) + "*****" + email.substring(atIdx);
    }

    private ManagerResponseDTO toDTO(User user) {
        ManagerResponseDTO dto = new ManagerResponseDTO();
        dto.setId(user.getId());
        dto.setFullName(user.getFullName() != null ? user.getFullName() : user.getUsername());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone() != null ? user.getPhone() : "");
        dto.setRole(user.getRole());
        dto.setStatus(user.getStatus() != null ? user.getStatus() : "ACTIVE");
        dto.setOrganizationId(user.getOrganizationId() != null ? user.getOrganizationId() : 1L);
        dto.setCreatedAt("2026-01-15");
        dto.setMustChangePassword(user.getMustChangePassword() != null ? user.getMustChangePassword() : false);

        List<UserWarehouse> uws = userWarehouseRepository.findByUserId(user.getId());
        List<ManagerResponseDTO.AssignedWarehouseDTO> assigned = uws.stream()
                .map(uw -> new ManagerResponseDTO.AssignedWarehouseDTO(uw.getWarehouseId(), uw.getWarehouseName()))
                .collect(Collectors.toList());

        dto.setAssignedWarehouses(assigned);
        return dto;
    }

    private AdminAuditLogDTO toAuditDTO(AdminAuditLog log) {
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
