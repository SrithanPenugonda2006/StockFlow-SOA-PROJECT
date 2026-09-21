-- Flyway Migration V4: Add Organizations, User Invitations, Admin Audit Logs, System Settings, and User Status/Org fields

-- 1. Organizations table
CREATE TABLE IF NOT EXISTS organizations (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    code VARCHAR(100) NOT NULL UNIQUE,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. User Invitations table
CREATE TABLE IF NOT EXISTS user_invitations (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    invited_by VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Admin Audit Logs table
CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id BIGSERIAL PRIMARY KEY,
    actor_username VARCHAR(255) NOT NULL,
    action VARCHAR(255) NOT NULL,
    resource_type VARCHAR(255) NOT NULL,
    resource_id VARCHAR(255),
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. System Settings table
CREATE TABLE IF NOT EXISTS system_settings (
    id BIGSERIAL PRIMARY KEY,
    setting_key VARCHAR(255) NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Add status and organization_id columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'ACTIVE';
ALTER TABLE users ADD COLUMN IF NOT EXISTS organization_id BIGINT;

-- 6. Insert default organization
INSERT INTO organizations (id, name, code, status)
VALUES (1, 'StockFlow Global Enterprises', 'ORG-GLOBAL', 'ACTIVE')
ON CONFLICT (code) DO NOTHING;

-- Assign default organization to existing users
UPDATE users SET organization_id = 1 WHERE organization_id IS NULL;

-- 7. Insert initial system settings
INSERT INTO system_settings (setting_key, setting_value) VALUES
('low_stock_threshold', '25'),
('default_concurrency_mode', 'PESSIMISTIC_WRITE'),
('jwt_auth_protocol', 'HMAC-SHA256'),
('email_verification_enabled', 'true')
ON CONFLICT (setting_key) DO NOTHING;
