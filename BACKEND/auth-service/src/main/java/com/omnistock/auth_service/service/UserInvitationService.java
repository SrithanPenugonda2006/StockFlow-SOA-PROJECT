package com.omnistock.auth_service.service;

import com.omnistock.auth_service.dto.UserInvitationDTO;
import com.omnistock.auth_service.entity.UserInvitation;
import com.omnistock.auth_service.repository.UserInvitationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UserInvitationService {

    @Autowired
    private UserInvitationRepository invitationRepository;

    @Autowired
    private AdminAuditService auditService;

    public List<UserInvitationDTO> getAllInvitations() {
        return invitationRepository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserInvitationDTO createInvitation(UserInvitationDTO dto, String actorUsername) {
        UserInvitation inv = new UserInvitation();
        inv.setEmail(dto.getEmail());
        inv.setRole(dto.getRole().toUpperCase());
        inv.setInvitedBy(actorUsername != null ? actorUsername : "admin");
        inv.setStatus("PENDING");
        inv.setToken(UUID.randomUUID().toString());

        UserInvitation saved = invitationRepository.save(inv);

        auditService.logAction(
                actorUsername,
                "CREATE_INVITATION",
                "USER_INVITATION",
                saved.getId().toString(),
                "Created user invitation for " + saved.getEmail() + " with role " + saved.getRole()
        );

        return toDTO(saved);
    }

    private UserInvitationDTO toDTO(UserInvitation inv) {
        UserInvitationDTO dto = new UserInvitationDTO();
        dto.setId(inv.getId());
        dto.setEmail(inv.getEmail());
        dto.setRole(inv.getRole());
        dto.setStatus(inv.getStatus());
        dto.setInvitedBy(inv.getInvitedBy());
        dto.setToken(inv.getToken());
        dto.setCreatedAt(inv.getCreatedAt());
        return dto;
    }
}
