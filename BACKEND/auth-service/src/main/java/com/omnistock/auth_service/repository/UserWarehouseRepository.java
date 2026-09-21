package com.omnistock.auth_service.repository;

import com.omnistock.auth_service.entity.UserWarehouse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserWarehouseRepository extends JpaRepository<UserWarehouse, Long> {
    List<UserWarehouse> findByUserId(Long userId);
    void deleteByUserId(Long userId);
    boolean existsByUserIdAndWarehouseId(Long userId, Long warehouseId);
}
