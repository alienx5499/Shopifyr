#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROP_FILE="$ROOT_DIR/backend/src/main/resources/application-dev.properties"

if [[ ! -f "$PROP_FILE" ]]; then
  echo "[ERROR] Cannot find $PROP_FILE"
  exit 1
fi

echo "[INFO] Reading database configuration from $PROP_FILE"

DB_URL="$(grep '^spring\.datasource\.url=' "$PROP_FILE" | cut -d'=' -f2- | tr -d '[:space:]')"
DB_USER="$(grep '^spring\.datasource\.username=' "$PROP_FILE" | cut -d'=' -f2- | tr -d '[:space:]')"
DB_PASS="$(grep '^spring\.datasource\.password=' "$PROP_FILE" | cut -d'=' -f2- | tr -d '[:space:]')"

if [[ -z "${DB_URL:-}" || -z "${DB_USER:-}" || -z "${DB_PASS:-}" ]]; then
  echo "[ERROR] Could not parse DB url/username/password from application-dev.properties"
  exit 1
fi

# Parse host, port, and database from JDBC URL: jdbc:postgresql://host:port/db
CONN="${DB_URL#jdbc:postgresql://}"   # strip scheme
DB_HOST="${CONN%%:*}"                 # before :
REST="${CONN#*:}"                     # after :
DB_PORT="${REST%%/*}"                 # before /
DB_NAME="${REST#*/}"                  # after /

echo "[INFO] Connecting to PostgreSQL:"
echo "       Host: $DB_HOST"
echo "       Port: $DB_PORT"
echo "       DB:   $DB_NAME"
echo "       User: $DB_USER"

command -v psql >/dev/null 2>&1 || { echo "[ERROR] psql command not found. Install PostgreSQL client tools."; exit 1; }

echo "[INFO] Seeding mock data (admin user 'alienx5499' and sample catalog)..."

PGPASSWORD="$DB_PASS" psql -v ON_ERROR_STOP=1 --echo-errors -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" <<'SQL'
-- Enable pgcrypto for bcrypt hashing (for Spring Security BCryptPasswordEncoder compatibility)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) Ensure roles exist
INSERT INTO roles (name) VALUES ('ROLE_ADMIN') ON CONFLICT (name) DO NOTHING;
INSERT INTO roles (name) VALUES ('ROLE_CUSTOMER') ON CONFLICT (name) DO NOTHING;

-- 2) Create or update admin user with username/password = 'alienx5499'
DO $$
DECLARE
    v_user_id BIGINT;
BEGIN
    -- Insert or update user
    INSERT INTO users (email, username, password)
    VALUES ('alienx5499@example.com', 'alienx5499', crypt('alienx5499', gen_salt('bf')))
    ON CONFLICT (username) DO UPDATE
      SET email = EXCLUDED.email,
          password = crypt('alienx5499', gen_salt('bf'))
    RETURNING id INTO v_user_id;

    -- Attach ROLE_ADMIN
    INSERT INTO user_roles (user_id, role_id)
    SELECT v_user_id, r.id
    FROM roles r
    WHERE r.name = 'ROLE_ADMIN'
      AND NOT EXISTS (
        SELECT 1 FROM user_roles ur
        WHERE ur.user_id = v_user_id AND ur.role_id = r.id
      );

    -- Attach ROLE_CUSTOMER as well (optional, for testing)
    INSERT INTO user_roles (user_id, role_id)
    SELECT v_user_id, r.id
    FROM roles r
    WHERE r.name = 'ROLE_CUSTOMER'
      AND NOT EXISTS (
        SELECT 1 FROM user_roles ur
        WHERE ur.user_id = v_user_id AND ur.role_id = r.id
      );
END
$$;

-- 3) Seed categories
INSERT INTO categories (name, description, image_url)
SELECT 'Electronics', 'Phones, laptops, and gadgets', NULL
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Electronics');

INSERT INTO categories (name, description, image_url)
SELECT 'Fashion', 'Clothing and accessories', NULL
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Fashion');

INSERT INTO categories (name, description, image_url)
SELECT 'Books', 'Fiction and non-fiction', NULL
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Books');

-- 4) Seed brands
INSERT INTO brands (name, description, logo_url)
SELECT 'Apple', 'Premium electronics brand', NULL
WHERE NOT EXISTS (SELECT 1 FROM brands WHERE name = 'Apple');

INSERT INTO brands (name, description, logo_url)
SELECT 'Nike', 'Sportswear and shoes', NULL
WHERE NOT EXISTS (SELECT 1 FROM brands WHERE name = 'Nike');

INSERT INTO brands (name, description, logo_url)
SELECT 'Penguin', 'Book publisher', NULL
WHERE NOT EXISTS (SELECT 1 FROM brands WHERE name = 'Penguin');

-- 5) Seed products (with created_at / updated_at required by NOT NULL)
WITH cat_elec AS (
    SELECT id FROM categories WHERE name = 'Electronics' LIMIT 1
), cat_fash AS (
    SELECT id FROM categories WHERE name = 'Fashion' LIMIT 1
), cat_books AS (
    SELECT id FROM categories WHERE name = 'Books' LIMIT 1
), brand_apple AS (
    SELECT id FROM brands WHERE name = 'Apple' LIMIT 1
), brand_nike AS (
    SELECT id FROM brands WHERE name = 'Nike' LIMIT 1
), brand_penguin AS (
    SELECT id FROM brands WHERE name = 'Penguin' LIMIT 1
)
INSERT INTO products (name, description, price, image_url, category_id, brand_id, is_active, created_at, updated_at)
SELECT 'iPhone 15', 'Latest iPhone with great camera', 799.00, NULL, ce.id, ba.id, TRUE, now(), now()
FROM cat_elec ce, brand_apple ba
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'iPhone 15');

WITH cat_elec AS (
    SELECT id FROM categories WHERE name = 'Electronics' LIMIT 1
), brand_apple AS (
    SELECT id FROM brands WHERE name = 'Apple' LIMIT 1
)
INSERT INTO products (name, description, price, image_url, category_id, brand_id, is_active, created_at, updated_at)
SELECT 'MacBook Pro 14\"', 'Powerful laptop for developers', 1999.00, NULL, ce.id, ba.id, TRUE, now(), now()
FROM cat_elec ce, brand_apple ba
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'MacBook Pro 14\"');

WITH cat_fash AS (
    SELECT id FROM categories WHERE name = 'Fashion' LIMIT 1
), brand_nike AS (
    SELECT id FROM brands WHERE name = 'Nike' LIMIT 1
)
INSERT INTO products (name, description, price, image_url, category_id, brand_id, is_active, created_at, updated_at)
SELECT 'Nike Air Zoom', 'Comfortable running shoes', 149.00, NULL, cf.id, bn.id, TRUE, now(), now()
FROM cat_fash cf, brand_nike bn
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Nike Air Zoom');

WITH cat_books AS (
    SELECT id FROM categories WHERE name = 'Books' LIMIT 1
), brand_penguin AS (
    SELECT id FROM brands WHERE name = 'Penguin' LIMIT 1
)
INSERT INTO products (name, description, price, image_url, category_id, brand_id, is_active, created_at, updated_at)
SELECT 'Clean Code', 'A Handbook of Agile Software Craftsmanship', 39.00, NULL, cb.id, bp.id, TRUE, now(), now()
FROM cat_books cb, brand_penguin bp
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Clean Code');

-- 6) Seed inventory for each product
INSERT INTO inventory (product_id, quantity)
SELECT p.id, 50
FROM products p
WHERE NOT EXISTS (SELECT 1 FROM inventory i WHERE i.product_id = p.id);

SQL

echo "[INFO] Mock data seeded successfully."
echo "[INFO] You can now log in with:"
echo "       username: alienx5499"
echo "       password: alienx5499"

