DELETE FROM products;
INSERT INTO products (id, name, description, price, sku, category) VALUES
(1, 'Mechanical Keyboard', 'RGB Blue Switches Mechanical Keyboard', 89.99, 'KB-100', 'Electronics'),
(2, 'Wireless Gaming Mouse', 'Ergonomic 16K DPI wireless mouse', 59.99, 'GM-9000', 'Electronics'),
(3, 'Smart Watch Pro', 'Fitness tracking smartwatch with heart rate & OLED screen', 199.99, 'SW-1000', 'Electronics'),
(4, 'ProBook 14 Business Laptop', '14-inch business laptop with 16GB RAM, 512GB SSD', 749.99, 'LAP-PB14-01', 'Computers')
ON CONFLICT (sku) DO NOTHING;
SELECT setval('products_id_seq', (SELECT COALESCE(MAX(id), 1) FROM products));
