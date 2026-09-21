package com.omnistock.auth_service.repository;

import com.omnistock.auth_service.entity.Organization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OrganizationRepository extends JpaRepository<Organization, Long> {
    Optional<Organization> findByCode(String code);
    boolean existsByName(String name);
    boolean existsByCode(String code);
}
