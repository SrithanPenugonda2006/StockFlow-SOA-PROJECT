ALTER TABLE products
ADD COLUMN IF NOT EXISTS barcode VARCHAR(100),
ADD COLUMN IF NOT EXISTS brand VARCHAR(100),
ADD COLUMN IF NOT EXISTS unit_cost DECIMAL(10, 2) DEFAULT 0.00;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uk_products_barcode'
    ) THEN
        ALTER TABLE products ADD CONSTRAINT uk_products_barcode UNIQUE (barcode);
    END IF;
END $$;
