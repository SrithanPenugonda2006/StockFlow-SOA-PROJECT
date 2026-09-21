INSERT INTO inventory (product_id, warehouse_id, quantity, reserved_quantity, version) VALUES
(6, 1, 50, 0, 0),
(7, 1, 35, 0, 0),
(8, 1, 20, 0, 0),
(9, 1, 25, 0, 0),
(10, 1, 40, 0, 0),
(11, 1, 20, 0, 0),
(12, 1, 30, 0, 0),
(13, 1, 15, 0, 0),
(14, 1, 25, 0, 0),
(15, 1, 18, 0, 0),
(16, 1, 10, 0, 0),
(17, 1, 8, 0, 0),
(18, 1, 20, 0, 0),
(19, 1, 30, 0, 0),
(20, 1, 25, 0, 0)
ON CONFLICT (product_id, warehouse_id) DO UPDATE SET quantity = EXCLUDED.quantity;
