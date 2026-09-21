-- Flyway Migration V5: Add full_name, phone to users and create user_warehouses table

ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50);

CREATE TABLE IF NOT EXISTS user_warehouses (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    warehouse_id BIGINT NOT NULL,
    warehouse_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_user_warehouse UNIQUE (user_id, warehouse_id)
);
