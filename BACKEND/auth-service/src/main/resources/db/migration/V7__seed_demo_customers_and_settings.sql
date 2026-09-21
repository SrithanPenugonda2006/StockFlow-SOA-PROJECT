-- Seed synthetic demo customers for testing and order association
INSERT INTO users (username, email, is_email_verified, password_hash, role, status, organization_id) VALUES
('arjun_kumar', 'arjun.demo@example.com', true, '$2a$10$3YBsPuI3BlQ9ZyEaKjWQWOIu2wAuDRyNDi4tugo2wZ7kNPjShX3Be', 'CUSTOMER', 'ACTIVE', 1),
('priya_sharma', 'priya.demo@example.com', true, '$2a$10$3YBsPuI3BlQ9ZyEaKjWQWOIu2wAuDRyNDi4tugo2wZ7kNPjShX3Be', 'CUSTOMER', 'ACTIVE', 1),
('rahul_verma', 'rahul.demo@example.com', true, '$2a$10$3YBsPuI3BlQ9ZyEaKjWQWOIu2wAuDRyNDi4tugo2wZ7kNPjShX3Be', 'CUSTOMER', 'ACTIVE', 1)
ON CONFLICT (username) DO NOTHING;

-- Seed system configuration settings if not present
INSERT INTO system_settings (setting_key, setting_value) VALUES
('low_stock_alert_threshold', '25'),
('currency_code', 'INR'),
('currency_symbol', '₹')
ON CONFLICT (setting_key) DO NOTHING;
