CREATE TABLE IF NOT EXISTS categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS brands (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    country VARCHAR(100),
    status VARCHAR(20) DEFAULT 'ACTIVE',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed initial categories
INSERT INTO categories (name, description) VALUES
('Electronics', 'Computing, displays & consumer electronics'),
('Computers', 'Laptops, desktops and workstation devices'),
('Accessories', 'Peripherals, adapters, cables and add-on hardware'),
('Furniture', 'Ergonomic chairs, standing desks & office furniture'),
('Networking', 'Routers, switches, access points & cabling')
ON CONFLICT (name) DO NOTHING;

-- Seed initial brands
INSERT INTO brands (name, country, status) VALUES
('Apple', 'United States', 'ACTIVE'),
('Dell', 'United States', 'ACTIVE'),
('Logitech', 'Switzerland', 'ACTIVE'),
('Samsung', 'South Korea', 'ACTIVE'),
('Steelcase', 'United States', 'ACTIVE')
ON CONFLICT (name) DO NOTHING;
