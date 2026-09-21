DELETE FROM inventory;
DELETE FROM warehouses;
INSERT INTO warehouses (id, name, location) VALUES
(1, 'Hyderabad Central Hub', 'HITEC City, Hyderabad'),
(2, 'Bengaluru Logistics Park', 'Whitefield, Bengaluru')
ON CONFLICT (id) DO NOTHING;
SELECT setval('warehouses_id_seq', (SELECT COALESCE(MAX(id), 1) FROM warehouses));

INSERT INTO inventory (product_id, warehouse_id, quantity, reserved_quantity, version) VALUES
(1, 1, 100, 0, 0),
(1, 2, 50, 0, 0),
(2, 1, 120, 0, 0),
(2, 2, 60, 0, 0),
(3, 1, 45, 0, 0),
(3, 2, 30, 0, 0),
(4, 1, 25, 0, 0),
(4, 2, 15, 0, 0)
ON CONFLICT (product_id, warehouse_id) DO NOTHING;
