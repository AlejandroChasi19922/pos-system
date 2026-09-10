-- Supabase PostgreSQL Relational Schema (3NF Normalization)
-- Point of Sale & Invoicing System

-- 1. Create Customers Table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dni_tax_id VARCHAR(13) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create Products Table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(150) NOT NULL,
  unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
  stock INTEGER NOT NULL CHECK (stock >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create Sales Orders Header Table
CREATE TABLE IF NOT EXISTS sales_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number SERIAL UNIQUE NOT NULL,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  issue_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
  tax_rate NUMERIC(4, 2) NOT NULL DEFAULT 0.15,
  tax_amount NUMERIC(10, 2) NOT NULL CHECK (tax_amount >= 0),
  total NUMERIC(10, 2) NOT NULL CHECK (total >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create Sales Order Details Table
CREATE TABLE IF NOT EXISTS sales_order_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sales_order_id UUID NOT NULL REFERENCES sales_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
  CONSTRAINT unique_product_per_order UNIQUE (sales_order_id, product_id)
);

-- Indexing for search performance
CREATE INDEX IF NOT EXISTS idx_customers_search ON customers (dni_tax_id, first_name, last_name);
CREATE INDEX IF NOT EXISTS idx_products_search ON products (code, name, stock);
CREATE INDEX IF NOT EXISTS idx_sales_orders_customer ON sales_orders (customer_id);

-- Sample Data Seeder for Supabase PostgreSQL
INSERT INTO customers (dni_tax_id, first_name, last_name, email, phone, address) VALUES
('1803928174', 'Juan', 'Pérez', 'juan.perez@example.com', '0991234567', 'Av. Cevallos y Montalvo, Ambato'),
('1715243689', 'María', 'López', 'maria.lopez@example.com', '0987654321', 'Calle Bolivar y Castillo, Ambato'),
('0923456781', 'Carlos', 'Mendoza', 'carlos.mendoza@example.com', '0954321876', 'Av. Los Guaytambo, Ficoa'),
('1801234567', 'Ana', 'Torres', 'ana.torres@example.com', '0978901234', 'Av. Atahualpa, Huachi')
ON CONFLICT (dni_tax_id) DO NOTHING;

INSERT INTO products (code, name, unit_price, stock) VALUES
('PROD-001', 'Laptop Dell Inspiron 15', 750.00, 10),
('PROD-002', 'Mouse Inalámbrico Logitech', 25.50, 50),
('PROD-003', 'Teclado Mecánico RGB', 65.00, 25),
('PROD-004', 'Monitor LG 27'' IPS Full HD', 210.00, 8),
('PROD-005', 'Disco Duro Externo 1TB', 55.00, 0), -- Out of stock (should NOT appear in product search)
('PROD-006', 'Audífonos Bluetooth Sony', 89.99, 15),
('PROD-007', 'Impresora HP DeskJet', 120.00, 5)
ON CONFLICT (code) DO NOTHING;
