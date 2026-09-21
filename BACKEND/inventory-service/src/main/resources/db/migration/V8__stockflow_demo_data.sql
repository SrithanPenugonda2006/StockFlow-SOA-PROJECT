-- Update existing warehouses or insert development warehouses
UPDATE warehouses 
SET code = 'HYD-WH01', name = 'Hyderabad Warehouse', location = 'Hyderabad, Telangana', city = 'Hyderabad', state = 'Telangana', country = 'India', total_capacity = 25000, status = 'ACTIVE'
WHERE id = 1;

UPDATE warehouses 
SET code = 'BLR-WH01', name = 'Bengaluru Warehouse', location = 'Bengaluru, Karnataka', city = 'Bengaluru', state = 'Karnataka', country = 'India', total_capacity = 20000, status = 'ACTIVE'
WHERE id = 2;

INSERT INTO warehouses (id, name, code, location, city, state, country, total_capacity, occupied_capacity, status)
VALUES 
(1, 'Hyderabad Warehouse', 'HYD-WH01', 'Hyderabad, Telangana', 'Hyderabad', 'Telangana', 'India', 25000, 5000, 'ACTIVE'),
(2, 'Bengaluru Warehouse', 'BLR-WH01', 'Bengaluru, Karnataka', 'Bengaluru', 'Karnataka', 'India', 20000, 4000, 'ACTIVE')
ON CONFLICT (id) DO UPDATE 
SET code = EXCLUDED.code, name = EXCLUDED.name, location = EXCLUDED.location, status = EXCLUDED.status;

SELECT setval('warehouses_id_seq', (SELECT COALESCE(MAX(id), 1) FROM warehouses));

-- Seed multi-warehouse inventory distribution
INSERT INTO inventory (product_id, warehouse_id, quantity, reserved_quantity, version) VALUES
(6, 1, 30, 2, 0), -- Enterprise Wireless Mouse (HYD)
(6, 2, 20, 0, 0), -- Enterprise Wireless Mouse (BLR)

(7, 1, 20, 1, 0), -- Mechanical Gaming Keyboard (HYD)
(7, 2, 15, 0, 0), -- Mechanical Gaming Keyboard (BLR)

(8, 1, 3, 0, 0),  -- Dell UltraSharp 27 Monitor (HYD - Low Stock)
(8, 2, 2, 0, 0),  -- Dell UltraSharp 27 Monitor (BLR - Low Stock)

(9, 1, 4, 0, 0),  -- Samsung 990 PRO 2TB SSD (HYD - Low Stock)
(9, 2, 3, 0, 0),  -- Samsung 990 PRO 2TB SSD (BLR - Low Stock)

(10, 1, 25, 0, 0), -- Samsung 980 1TB NVMe SSD (HYD)
(10, 2, 15, 0, 0), -- Samsung 980 1TB NVMe SSD (BLR)

(11, 1, 12, 0, 0), -- Apple Magic Keyboard (HYD)
(11, 2, 8, 0, 0),  -- Apple Magic Keyboard (BLR)

(12, 1, 18, 0, 0), -- Apple Magic Mouse (HYD)
(12, 2, 12, 0, 0), -- Apple Magic Mouse (BLR)

(13, 1, 10, 1, 0), -- Dell Latitude 5440 Laptop (HYD)
(13, 2, 5, 0, 0),  -- Dell Latitude 5440 Laptop (BLR)

(14, 1, 15, 0, 0), -- Logitech MX Master 3S (HYD)
(14, 2, 10, 0, 0), -- Logitech MX Master 3S (BLR)

(15, 1, 10, 0, 0), -- Samsung 32-inch Smart Monitor (HYD)
(15, 2, 8, 0, 0),  -- Samsung 32-inch Smart Monitor (BLR)

(16, 1, 2, 0, 0),  -- Steelcase Office Chair (HYD - Low Stock)
(16, 2, 1, 0, 0),  -- Steelcase Office Chair (BLR - Low Stock)

(17, 1, 5, 0, 0),  -- Steelcase Ergonomic Desk (HYD)
(17, 2, 3, 0, 0),  -- Steelcase Ergonomic Desk (BLR)

(18, 1, 12, 0, 0), -- Dell Docking Station WD19 (HYD)
(18, 2, 8, 0, 0),  -- Dell Docking Station WD19 (BLR)

(19, 1, 18, 0, 0), -- Logitech USB-C Hub (HYD)
(19, 2, 12, 0, 0), -- Logitech USB-C Hub (BLR)

(20, 1, 15, 0, 0), -- Samsung Portable SSD T7 (HYD)
(20, 2, 10, 0, 0)  -- Samsung Portable SSD T7 (BLR)

ON CONFLICT (product_id, warehouse_id) 
DO UPDATE SET quantity = EXCLUDED.quantity, reserved_quantity = EXCLUDED.reserved_quantity;

-- Seed realistic Batch records
INSERT INTO batches (batch_number, serial_number, product_id, warehouse_id, quantity, mfg_date, expiry_date, status) VALUES
('BCH-2026-EL01', NULL, 6, 1, 30, '2026-01-10', '2029-01-10', 'VALID'),
('BCH-2026-EL02', NULL, 7, 1, 20, '2026-02-01', '2029-02-01', 'VALID'),
('BCH-2026-SSD01', NULL, 9, 1, 15, '2026-03-01', '2031-03-01', 'VALID'),
('BCH-2026-SSD02', NULL, 10, 2, 15, '2026-03-10', '2031-03-10', 'VALID'),
('BCH-2026-MON01', NULL, 8, 1, 12, '2025-12-01', '2028-12-01', 'VALID'),

-- Serialized items
('BCH-2026-LAP01', 'SN-DEL-L544-001', 13, 1, 1, '2026-01-15', '2029-01-15', 'VALID'),
('BCH-2026-LAP02', 'SN-DEL-L544-002', 13, 1, 1, '2026-01-15', '2029-01-15', 'VALID'),
('BCH-2026-MON02', 'SN-DEL-U27-001', 8, 1, 1, '2026-02-10', '2029-02-10', 'VALID'),
('BCH-2026-KEY01', 'SN-APL-MKB-001', 11, 1, 1, '2026-02-20', '2029-02-20', 'VALID'),
('BCH-2026-MOU01', 'SN-APL-MMS-001', 12, 1, 1, '2026-02-22', '2029-02-22', 'VALID')
ON CONFLICT (batch_number) DO NOTHING;

-- Seed Stock Transfers
INSERT INTO stock_transfers (transfer_number, source_warehouse_id, destination_warehouse_id, product_id, quantity, status, requested_by, approved_by, notes) VALUES
('TRF-2026-001', 1, 2, 6, 5, 'COMPLETED', 'system.admin', 'manager.hyd', 'Inter-warehouse stock balancing for Enterprise Mouse'),
('TRF-2026-002', 2, 1, 18, 3, 'IN_TRANSIT', 'manager.blr', 'manager.hyd', 'Replenishing Dell WD19 docking stations'),
('TRF-2026-003', 1, 2, 13, 2, 'REQUESTED', 'manager.blr', NULL, 'Urgent laptop demand in Whitefield hub')
ON CONFLICT (transfer_number) DO NOTHING;

-- Seed Suppliers
INSERT INTO suppliers (name, code, contact_name, email, phone, address, status, rating) VALUES
('TechSource India', 'SUP-TSI-01', 'Rajesh V.', 'contact@techsource.in', '+91-9876543210', 'Whitefield, Bengaluru, Karnataka', 'ACTIVE', 4.80),
('Digital Supply Hub', 'SUP-DSH-02', 'Anitha R.', 'sales@digitalsupply.in', '+91-9876543211', 'HITEC City, Hyderabad, Telangana', 'ACTIVE', 4.90),
('Enterprise Hardware Solutions', 'SUP-EHS-03', 'Suresh K.', 'support@ehsolutions.in', '+91-9876543212', 'Guindy, Chennai, Tamil Nadu', 'ACTIVE', 4.70)
ON CONFLICT (code) DO NOTHING;

-- Seed Stock Movement Transactions
INSERT INTO inventory_transactions (product_id, warehouse_id, transaction_type, quantity, previous_quantity, new_quantity, reason, reference_id, performed_by) VALUES
(6, 1, 'RESTOCK', 30, 0, 30, 'Initial catalog stock ingestion', 'PO-2026-001', 'system.admin'),
(7, 1, 'RESTOCK', 20, 0, 20, 'Initial catalog stock ingestion', 'PO-2026-001', 'system.admin'),
(6, 1, 'TRANSFER_OUT', 5, 30, 25, 'Stock Transfer TRF-2026-001 to BLR-WH01', 'TRF-2026-001', 'manager.hyd'),
(6, 2, 'TRANSFER_IN', 5, 15, 20, 'Stock Transfer TRF-2026-001 from HYD-WH01', 'TRF-2026-001', 'manager.blr'),
(8, 1, 'ADJUSTMENT', -1, 4, 3, 'Cycle count physical audit discrepancy', 'AUD-2026-001', 'auditor.hyd');
