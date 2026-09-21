package com.omnistock.auth_service.repository;

import com.omnistock.auth_service.entity.UserInvitation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserInvitationRepository extends JpaRepository<UserInvitation, Long> {
    Optional<UserInvitation> findByToken(String token);
    boolean existsByEmail(String email);
}
