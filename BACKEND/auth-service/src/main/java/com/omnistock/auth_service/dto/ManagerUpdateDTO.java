package com.omnistock.auth_service.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public class ManagerUpdateDTO {

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    private String phone;

    private String role = "MANAGER";

    private String status = "ACTIVE";

    @NotEmpty(message = "At least one warehouse must be assigned")
    private List<Long> warehouseIds;

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public List<Long> getWarehouseIds() { return warehouseIds; }
    public void setWarehouseIds(List<Long> warehouseIds) { this.warehouseIds = warehouseIds; }
}
