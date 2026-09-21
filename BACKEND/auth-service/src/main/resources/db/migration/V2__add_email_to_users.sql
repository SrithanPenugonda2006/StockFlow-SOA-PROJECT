ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_email_verified BOOLEAN DEFAULT FALSE;

DELETE FROM users;
INSERT INTO users (id, username, email, is_email_verified, password_hash, role) VALUES
(1, 'admin', 'admin@omnistock.com', true, '$2a$10$1LDAzd/4iLJJJ1h5H8EA6egcYty0ZJtkqBVwENe7mbkMS7lhpOLNm', 'ADMIN'),
(2, 'manager', 'manager@omnistock.com', true, '$2a$10$ejF2Ri20F4NxbcmZFl8Fcex3z0L5cKhcwH08shTCrcyZ3EQvpQ5EC', 'MANAGER'),
(3, 'customer', 'customer@omnistock.com', true, '$2a$10$3YBsPuI3BlQ9ZyEaKjWQWOIu2wAuDRyNDi4tugo2wZ7kNPjShX3Be', 'CUSTOMER')
ON CONFLICT (username) DO NOTHING;
SELECT setval('users_id_seq', (SELECT COALESCE(MAX(id), 1) FROM users));
