package com.omnistock.auth_service.dto;

public class UserStatusUpdateDTO {
    private String status;

    public UserStatusUpdateDTO() {}
    public UserStatusUpdateDTO(String status) { this.status = status; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
