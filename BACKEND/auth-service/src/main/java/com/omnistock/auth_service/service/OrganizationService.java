package com.omnistock.auth_service.service;

import com.omnistock.auth_service.dto.OrganizationDTO;
import com.omnistock.auth_service.dto.UserResponseDTO;
import com.omnistock.auth_service.entity.Organization;
import com.omnistock.auth_service.repository.OrganizationRepository;
import com.omnistock.auth_service.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrganizationService {

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AdminAuditService auditService;

    @Autowired
    private AdminUserService adminUserService;

    public List<OrganizationDTO> getAllOrganizations() {
        return organizationRepository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public OrganizationDTO getOrganizationById(Long id) {
        Organization org = organizationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Organization not found with id: " + id));
        return toDTO(org);
    }

    public List<UserResponseDTO> getOrganizationUsers(Long orgId) {
        return userRepository.findByOrganizationId(orgId)
                .stream()
                .map(adminUserService::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public OrganizationDTO createOrganization(OrganizationDTO dto, String actorUsername) {
        if (organizationRepository.existsByName(dto.getName())) {
            throw new RuntimeException("Organization with name '" + dto.getName() + "' already exists.");
        }
        if (organizationRepository.existsByCode(dto.getCode())) {
            throw new RuntimeException("Organization with code '" + dto.getCode() + "' already exists.");
        }

        Organization org = new Organization();
        org.setName(dto.getName());
        org.setCode(dto.getCode().toUpperCase());
        org.setStatus(dto.getStatus() != null ? dto.getStatus() : "ACTIVE");

        Organization saved = organizationRepository.save(org);

        auditService.logAction(
                actorUsername,
                "CREATE_ORGANIZATION",
                "ORGANIZATION",
                saved.getId().toString(),
                "Created organization: " + saved.getName() + " (" + saved.getCode() + ")"
        );

        return toDTO(saved);
    }

    @Transactional
    public OrganizationDTO updateOrganization(Long id, OrganizationDTO dto, String actorUsername) {
        Organization org = organizationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Organization not found with id: " + id));

        org.setName(dto.getName());
        org.setCode(dto.getCode().toUpperCase());
        if (dto.getStatus() != null) {
            org.setStatus(dto.getStatus());
        }

        Organization updated = organizationRepository.save(org);

        auditService.logAction(
                actorUsername,
                "UPDATE_ORGANIZATION",
                "ORGANIZATION",
                id.toString(),
                "Updated organization: " + updated.getName()
        );

        return toDTO(updated);
    }

    @Transactional
    public OrganizationDTO updateOrganizationStatus(Long id, String status, String actorUsername) {
        Organization org = organizationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Organization not found with id: " + id));

        org.setStatus(status.toUpperCase());
        Organization updated = organizationRepository.save(org);

        auditService.logAction(
                actorUsername,
                "UPDATE_ORGANIZATION_STATUS",
                "ORGANIZATION",
                id.toString(),
                "Changed organization status to " + status + " for " + org.getName()
        );

        return toDTO(updated);
    }

    @Transactional
    public void deleteOrganization(Long id, String actorUsername) {
        Organization org = organizationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Organization not found with id: " + id));

        if (id == 1L || "ORG-GLOBAL".equalsIgnoreCase(org.getCode())) {
            throw new RuntimeException("Cannot delete default global organization.");
        }

        organizationRepository.delete(org);

        auditService.logAction(
                actorUsername,
                "DELETE_ORGANIZATION",
                "ORGANIZATION",
                id.toString(),
                "Deleted organization: " + org.getName()
        );
    }

    private OrganizationDTO toDTO(Organization org) {
        return new OrganizationDTO(
                org.getId(),
                org.getName(),
                org.getCode(),
                org.getStatus(),
                org.getCreatedAt(),
                org.getUpdatedAt()
        );
    }
}
