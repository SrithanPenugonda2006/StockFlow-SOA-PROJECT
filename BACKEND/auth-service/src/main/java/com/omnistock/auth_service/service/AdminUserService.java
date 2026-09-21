package com.omnistock.auth_service.service;

import com.omnistock.auth_service.dto.UserResponseDTO;
import com.omnistock.auth_service.entity.User;
import com.omnistock.auth_service.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminUserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AdminAuditService auditService;

    public List<UserResponseDTO> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public UserResponseDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        return toDTO(user);
    }

    @Transactional
    public UserResponseDTO updateUserRole(Long userId, String newRole, String actorUsername) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        String oldRole = user.getRole();
        user.setRole(newRole.toUpperCase());
        User updated = userRepository.save(user);

        auditService.logAction(
                actorUsername,
                "UPDATE_ROLE",
                "USER",
                userId.toString(),
                "Changed role for user " + user.getUsername() + " from " + oldRole + " to " + newRole
        );

        return toDTO(updated);
    }

    @Transactional
    public UserResponseDTO updateUserStatus(Long userId, String newStatus, String actorUsername) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        String oldStatus = user.getStatus();
        user.setStatus(newStatus.toUpperCase());
        User updated = userRepository.save(user);

        auditService.logAction(
                actorUsername,
                "UPDATE_STATUS",
                "USER",
                userId.toString(),
                "Changed status for user " + user.getUsername() + " from " + oldStatus + " to " + newStatus
        );

        return toDTO(updated);
    }

    @Transactional
    public void deleteUser(Long userId, String actorUsername) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        if ("admin".equalsIgnoreCase(user.getUsername())) {
            throw new RuntimeException("Cannot delete default admin superuser account.");
        }

        userRepository.delete(user);

        auditService.logAction(
                actorUsername,
                "DELETE_USER",
                "USER",
                userId.toString(),
                "Deleted user account: " + user.getUsername()
        );
    }

    public UserResponseDTO toDTO(User user) {
        return new UserResponseDTO(
                user.getId(),
                user.getFullName() != null ? user.getFullName() : user.getUsername(),
                user.getUsername(),
                user.getEmail(),
                user.getPhone() != null ? user.getPhone() : "",
                user.getIsEmailVerified(),
                user.getRole(),
                user.getStatus() != null ? user.getStatus() : "ACTIVE",
                user.getOrganizationId() != null ? user.getOrganizationId() : 1L
        );
    }
}
