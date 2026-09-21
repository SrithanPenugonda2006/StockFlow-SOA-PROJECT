package com.omnistock.auth_service.dto;

import java.time.LocalDateTime;

public class SystemSettingDTO {
    private String settingKey;
    private String settingValue;
    private LocalDateTime updatedAt;

    public SystemSettingDTO() {}
    public SystemSettingDTO(String settingKey, String settingValue, LocalDateTime updatedAt) {
        this.settingKey = settingKey;
        this.settingValue = settingValue;
        this.updatedAt = updatedAt;
    }

    public String getSettingKey() { return settingKey; }
    public void setSettingKey(String settingKey) { this.settingKey = settingKey; }

    public String getSettingValue() { return settingValue; }
    public void setSettingValue(String settingValue) { this.settingValue = settingValue; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
