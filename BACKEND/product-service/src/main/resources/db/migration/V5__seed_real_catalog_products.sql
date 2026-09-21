-- Ensure Storage category is seeded
INSERT INTO categories (name, description) VALUES
('Storage', 'Solid state drives, NVMe, portable SSDs and flash storage devices')
ON CONFLICT (name) DO NOTHING;

-- Seed real catalog products
INSERT INTO products (name, sku, barcode, category, brand, unit_cost, price, description) VALUES
('Enterprise Wireless Mouse', 'MOU-LOG-MX01', '8901234500012', 'Electronics', 'Logitech', 1200.00, 1799.00, 'High precision ergonomic wireless mouse with multi-device bluetooth pairing.'),
('Mechanical Gaming Keyboard', 'KEY-LOG-GM01', '8901234500013', 'Electronics', 'Logitech', 3500.00, 4999.00, 'Tactile RGB mechanical switches with aircraft-grade aluminum alloy body.'),
('Dell UltraSharp 27 Monitor', 'MON-DEL-U27', '8901234500014', 'Electronics', 'Dell', 22000.00, 29999.00, '27-inch 4K UHD IPS USB-C Hub monitor with 99% sRGB color gamut.'),
('Samsung 990 PRO 2TB SSD', 'SSD-SAM-990P2', '8901234500015', 'Storage', 'Samsung', 13500.00, 17999.00, 'PCIe Gen 4.0 x4 NVMe M.2 SSD up to 7450 MB/s sequential read speeds.'),
('Samsung 980 1TB NVMe SSD', 'SSD-SAM-98001', '8901234500016', 'Storage', 'Samsung', 6000.00, 7999.00, 'Reliable M.2 NVMe SSD for fast gaming and daily productivity.'),
('Apple Magic Keyboard', 'KEY-APL-MAG01', '8901234500017', 'Electronics', 'Apple', 8000.00, 10999.00, 'Rechargeable wireless keyboard with Touch ID for Mac models.'),
('Apple Magic Mouse', 'MOU-APL-MAG01', '8901234500018', 'Electronics', 'Apple', 6000.00, 7999.00, 'Wireless and rechargeable mouse with Multi-Touch surface.'),
('Dell Latitude 5440 Laptop', 'LAP-DEL-L544', '8901234500019', 'Electronics', 'Dell', 62000.00, 74999.00, '14-inch business laptop powered by Intel Core i7, 16GB RAM, 512GB SSD.'),
('Logitech MX Master 3S', 'MOU-LOG-MX03', '8901234500020', 'Electronics', 'Logitech', 6500.00, 8499.00, 'Performance wireless mouse with 8K DPI tracking and quiet clicks.'),
('Samsung 32-inch Smart Monitor', 'MON-SAM-M32', '8901234500021', 'Electronics', 'Samsung', 18000.00, 23999.00, 'Smart TV & PC monitor hybrid with AirPlay, Netflix, and USB-C power delivery.'),
('Steelcase Office Chair', 'FUR-STL-OFC01', '8901234500022', 'Furniture', 'Steelcase', 28000.00, 36999.00, 'Ergonomic task chair with 3D LiveBack technology and adjustable armrests.'),
('Steelcase Ergonomic Desk', 'FUR-STL-DSK01', '8901234500023', 'Furniture', 'Steelcase', 32000.00, 41999.00, 'Motorized height-adjustable standing desk with anti-collision safety sensor.'),
('Dell Docking Station WD19', 'ACC-DEL-WD19', '8901234500024', 'Accessories', 'Dell', 12000.00, 15999.00, '130W USB-C docking station supporting dual 4K external monitors.'),
('Logitech USB-C Hub', 'ACC-LOG-HUB01', '8901234500025', 'Accessories', 'Logitech', 3000.00, 4499.00, '7-in-1 multi-port adapter with HDMI 4K, SD card reader, and 100W PD charging.'),
('Samsung Portable SSD T7', 'SSD-SAM-T701', '8901234500026', 'Storage', 'Samsung', 7500.00, 9999.00, 'Compact rugged external SSD with USB 3.2 Gen 2 transfer speeds up to 1050 MB/s.')
ON CONFLICT (sku) DO NOTHING;
