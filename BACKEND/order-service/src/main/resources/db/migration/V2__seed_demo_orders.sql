-- Seed Realistic Demo Orders using valid OrderStatus enum values (PENDING, CONFIRMED, FAILED, CANCELLED)
INSERT INTO orders (id, customer_id, status, total_amount, idempotency_key, created_at) VALUES
(1, 'arjun.demo@example.com', 'CONFIRMED', 3598.00, 'IDEMP-ORD-2026-001', CURRENT_TIMESTAMP - INTERVAL '3 days'),
(2, 'priya.demo@example.com', 'CONFIRMED', 4999.00, 'IDEMP-ORD-2026-002', CURRENT_TIMESTAMP - INTERVAL '2 days'),
(3, 'rahul.demo@example.com', 'PENDING', 59998.00, 'IDEMP-ORD-2026-003', CURRENT_TIMESTAMP - INTERVAL '1 day'),
(4, 'arjun.demo@example.com', 'PENDING', 29997.00, 'IDEMP-ORD-2026-004', CURRENT_TIMESTAMP - INTERVAL '5 hours'),
(5, 'priya.demo@example.com', 'CONFIRMED', 74999.00, 'IDEMP-ORD-2026-005', CURRENT_TIMESTAMP - INTERVAL '4 days')
ON CONFLICT (idempotency_key) DO UPDATE SET status = EXCLUDED.status, total_amount = EXCLUDED.total_amount;

SELECT setval('orders_id_seq', (SELECT COALESCE(MAX(id), 1) FROM orders));

-- Seed Order Items matching exact products and prices
INSERT INTO order_items (order_id, product_id, quantity, price) VALUES
-- Order 1: Enterprise Wireless Mouse x 2 @ 1799.00
(1, 6, 2, 1799.00),

-- Order 2: Mechanical Gaming Keyboard x 1 @ 4999.00
(2, 7, 1, 4999.00),

-- Order 3: Dell UltraSharp 27 Monitor x 2 @ 29999.00
(3, 8, 2, 29999.00),

-- Order 4: Samsung Portable SSD T7 x 3 @ 9999.00
(4, 20, 3, 9999.00),

-- Order 5: Dell Latitude 5440 Laptop x 1 @ 74999.00
(5, 13, 1, 74999.00);
