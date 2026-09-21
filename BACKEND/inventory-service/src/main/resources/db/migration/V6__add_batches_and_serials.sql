CREATE TABLE IF NOT EXISTS batches (
    id BIGSERIAL PRIMARY KEY,
    batch_number VARCHAR(100) NOT NULL UNIQUE,
    serial_number VARCHAR(100),
    product_id BIGINT NOT NULL,
    warehouse_id BIGINT NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    mfg_date DATE,
    expiry_date DATE,
    status VARCHAR(30) DEFAULT 'VALID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed initial batch records
INSERT INTO batches (batch_number, serial_number, product_id, warehouse_id, quantity, mfg_date, expiry_date, status) VALUES
('BCH-2026-A1', 'SN-APL-884910', 1, 1, 95, '2026-01-15', '2029-01-15', 'VALID'),
('BCH-2026-A2', 'SN-APL-884915', 1, 2, 50, '2026-02-01', '2029-02-01', 'VALID'),
('BCH-2026-D1', 'SN-DEL-441092', 2, 2, 12, '2025-11-10', '2028-11-10', 'VALID'),
('BCH-2026-S8', 'SN-SAM-889104', 3, 3, 450, '2026-03-01', '2031-03-01', 'VALID')
ON CONFLICT (batch_number) DO NOTHING;
