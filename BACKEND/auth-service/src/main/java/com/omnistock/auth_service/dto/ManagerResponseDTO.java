package com.omnistock.auth_service.dto;

import java.util.List;

public class ManagerResponseDTO {

    private Long id;
    private String fullName;
    private String username;
    private String email;
    private String phone;
    private String role;
    private String status;
    private Long organizationId;
    private List<AssignedWarehouseDTO> assignedWarehouses;
    private String createdAt;
    private Boolean mustChangePassword = false;
    private Boolean emailSent = false;
    private String message;

    public static class AssignedWarehouseDTO {
        private Long warehouseId;
        private String warehouseName;

        public AssignedWarehouseDTO() {}

        public AssignedWarehouseDTO(Long warehouseId, String warehouseName) {
            this.warehouseId = warehouseId;
            this.warehouseName = warehouseName;
        }

        public Long getWarehouseId() { return warehouseId; }
        public void setWarehouseId(Long warehouseId) { this.warehouseId = warehouseId; }

        public String getWarehouseName() { return warehouseName; }
        public void setWarehouseName(String warehouseName) { this.warehouseName = warehouseName; }
    }

    public ManagerResponseDTO() {}

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

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Long getOrganizationId() { return organizationId; }
    public void setOrganizationId(Long organizationId) { this.organizationId = organizationId; }

    public List<AssignedWarehouseDTO> getAssignedWarehouses() { return assignedWarehouses; }
    public void setAssignedWarehouses(List<AssignedWarehouseDTO> assignedWarehouses) { this.assignedWarehouses = assignedWarehouses; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public Boolean getMustChangePassword() { return mustChangePassword; }
    public void setMustChangePassword(Boolean mustChangePassword) { this.mustChangePassword = mustChangePassword; }

    public Boolean getEmailSent() { return emailSent; }
    public void setEmailSent(Boolean emailSent) { this.emailSent = emailSent; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
