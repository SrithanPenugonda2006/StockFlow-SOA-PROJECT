package com.omnistock.auth_service.service;

import com.omnistock.auth_service.dto.SystemSettingDTO;
import com.omnistock.auth_service.entity.SystemSetting;
import com.omnistock.auth_service.repository.SystemSettingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SystemSettingService {

    @Autowired
    private SystemSettingRepository settingRepository;

    @Autowired
    private AdminAuditService auditService;

    public List<SystemSettingDTO> getAllSettings() {
        return settingRepository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public SystemSettingDTO updateSetting(String key, String value, String actorUsername) {
        SystemSetting setting = settingRepository.findBySettingKey(key)
                .orElseGet(() -> {
                    SystemSetting s = new SystemSetting();
                    s.setSettingKey(key);
                    return s;
                });

        setting.setSettingValue(value);
        SystemSetting saved = settingRepository.save(setting);

        auditService.logAction(
                actorUsername,
                "UPDATE_SYSTEM_SETTING",
                "SYSTEM_SETTING",
                key,
                "Updated setting '" + key + "' to '" + value + "'"
        );

        return toDTO(saved);
    }

    private SystemSettingDTO toDTO(SystemSetting setting) {
        return new SystemSettingDTO(setting.getSettingKey(), setting.getSettingValue(), setting.getUpdatedAt());
    }
}
