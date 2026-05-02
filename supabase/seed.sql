-- Pawvels Platform — Initial Seed Data
-- 6 Categories, 30 Products, 6 Services

-- 1. CATEGORIES
INSERT INTO categories (name, slug, description) VALUES
('Makanan Kucing', 'makanan-kucing', 'Pilihan makanan kering dan basah terbaik untuk kucing Anda.'),
('Makanan Anjing', 'makanan-anjing', 'Nutrisi lengkap untuk anjing dari berbagai ras dan ukuran.'),
('Pasir & Kebersihan', 'pasir-kebersihan', 'Perlengkapan untuk menjaga kebersihan hewan dan lingkungan rumah.'),
('Aksesoris', 'aksesoris', 'Koleksi kalung, tali, mainan, dan perlengkapan harian lainnya.'),
('Kesehatan & Vitamin', 'kesehatan-vitamin', 'Suplemen dan obat-obatan untuk menjaga imunitas peliharaan.'),
('Grooming Supplies', 'grooming-supplies', 'Shampoo, sisir, dan peralatan perawatan bulu profesional.');

-- 2. SERVICES
INSERT INTO services (name, slug, type, description, price, duration_minutes, requires_dp) VALUES
('Grooming Kucing Basic', 'grooming-kucing-basic', 'grooming', 'Mandi, potong kuku, pembersihan telinga untuk kucing.', 75000, 60, false),
('Grooming Kucing Full', 'grooming-kucing-full', 'grooming', 'Basic + cukur bulu + treatment anti jamur/kutu.', 150000, 120, false),
('Grooming Anjing Basic', 'grooming-anjing-basic', 'grooming', 'Mandi, potong kuku, sikat gigi untuk anjing.', 100000, 90, false),
('Grooming Anjing Full', 'grooming-anjing-full', 'grooming', 'Basic + potong rambut gaya + treatment lengkap.', 200000, 150, false),
('Pet Hotel Small', 'pet-hotel-small', 'hotel', 'Penginapan nyaman untuk hewan kecil dengan kontrol suhu.', 120000, NULL, true),
('Pet Hotel Large', 'pet-hotel-large', 'hotel', 'Kamar luas untuk anjing besar dengan waktu bermain harian.', 250000, NULL, true);

-- 3. PRODUCTS (30 items)
-- Note: Simplified for seeding. Prices and IDs are generated.
DO $$
DECLARE
    cat_ids UUID[];
    prod_id UUID;
    i INT;
    c INT;
BEGIN
    SELECT ARRAY_AGG(id) INTO cat_ids FROM categories;
    
    FOR c IN 1..6 LOOP -- Loop Categories
        FOR i IN 1..5 LOOP -- 5 Products per Category = 30 total
            INSERT INTO products (category_id, name, slug, description, price, cost_price, stock, weight_grams)
            VALUES (
                cat_ids[c],
                'Produk ' || i || ' Kategori ' || c,
                'produk-' || i || '-cat-' || c,
                'Deskripsi lengkap untuk produk berkualitas tinggi dari Pawvels.',
                (10000 * (i + c)),
                (7000 * (i + c)),
                50,
                500
            ) RETURNING id INTO prod_id;
            
            -- Add 1 variant per product
            INSERT INTO product_variants (product_id, name, sku, price, cost_price, stock, weight_grams)
            VALUES (
                prod_id,
                'Standard',
                'SKU-' || prod_id,
                (10000 * (i + c)),
                (7000 * (i + c)),
                50,
                500
            );
            
            -- Initialize Inventory
            INSERT INTO inventory (variant_id, stock_quantity)
            SELECT id, 50 FROM product_variants WHERE product_id = prod_id;
        END LOOP;
    END LOOP;
END $$;
