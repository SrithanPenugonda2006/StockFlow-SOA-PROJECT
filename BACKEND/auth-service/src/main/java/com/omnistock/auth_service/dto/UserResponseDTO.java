package com.omnistock.auth_service.dto;

public class UserResponseDTO {
    private Long id;
    private String fullName;
    private String username;
    private String email;
    private String phone;
    private Boolean isEmailVerified;
    private String role;
    private String status;
    private Long organizationId;

    public UserResponseDTO() {}

    public UserResponseDTO(Long id, String fullName, String username, String email, String phone, Boolean isEmailVerified, String role, String status, Long organizationId) {
        this.id = id;
        this.fullName = fullName;
        this.username = username;
        this.email = email;
        this.phone = phone;
        this.isEmailVerified = isEmailVerified;
        this.role = role;
        this.status = status;
        this.organizationId = organizationId;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public Boolean getIsEmailVerified() { return isEmailVerified; }
    public void setIsEmailVerified(Boolean isEmailVerified) { this.isEmailVerified = isEmailVerified; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Long getOrganizationId() { return organizationId; }
    public void setOrganizationId(Long organizationId) { this.organizationId = organizationId; }
}
