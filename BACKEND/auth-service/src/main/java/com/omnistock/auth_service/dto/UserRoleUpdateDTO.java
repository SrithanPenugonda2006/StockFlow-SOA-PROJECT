package com.omnistock.auth_service.dto;

public class UserRoleUpdateDTO {
    private String role;

    public UserRoleUpdateDTO() {}
    public UserRoleUpdateDTO(String role) { this.role = role; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
