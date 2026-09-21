package com.omnistock.auth_service.dto;

public class AuthResponse {
    private String token;
    private Boolean mustChangePassword = false;

    public AuthResponse(String token) {
        this.token = token;
        this.mustChangePassword = false;
    }

    public AuthResponse(String token, Boolean mustChangePassword) {
        this.token = token;
        this.mustChangePassword = mustChangePassword != null ? mustChangePassword : false;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public Boolean getMustChangePassword() { return mustChangePassword; }
    public void setMustChangePassword(Boolean mustChangePassword) { this.mustChangePassword = mustChangePassword; }
}
