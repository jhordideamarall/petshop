-- Pawvels Platform — Complete Schema Alignment (Phase 1 Final Audit)
-- Target: Supabase (PostgreSQL)

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS (Ensuring all are present)
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'customer', 'staff', 'owner');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE product_type AS ENUM ('normal', 'frozen', 'parcel');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE order_status AS ENUM ('pending', 'paid', 'processing', 'shipped', 'delivered', 'completed', 'cancelled', 'expired', 'return_requested', 'returned', 'refunded');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('unpaid', 'paid', 'refunded', 'partial_refund', 'dp_paid');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. CORE TABLES (Alignment with PRD §15)

-- PROFILES (Rename or ensure columns match PRD 'users')
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT UNIQUE,
    phone_number TEXT UNIQUE,
    role user_role DEFAULT 'customer',
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ADDRESSES
CREATE TABLE IF NOT EXISTS addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    label TEXT DEFAULT 'Rumah',
    recipient_name TEXT,
    phone TEXT,
    full_address TEXT NOT NULL,
    city TEXT DEFAULT 'Jakarta',
    district TEXT,
    postal_code TEXT,
    latitude NUMERIC,
    longitude NUMERIC,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PETS (Adding type check constraint)
CREATE TABLE IF NOT EXISTS pets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('dog','cat','bird','hamster','rabbit','fish','other')),
    breed TEXT,
    weight_kg NUMERIC,
    birth_date DATE,
    notes TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    parent_id UUID REFERENCES categories(id),
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRODUCTS
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES categories(id),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL DEFAULT 0,
    promo_price NUMERIC,
    cost_price NUMERIC NOT NULL DEFAULT 0,
    stock INT DEFAULT 0,
    weight_grams INT DEFAULT 0,
    type product_type DEFAULT 'normal',
    meta_title TEXT,
    meta_description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    avg_rating NUMERIC DEFAULT 0,
    review_count INT DEFAULT 0,
    sold_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRODUCT_VARIANTS
CREATE TABLE IF NOT EXISTS product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    sku TEXT UNIQUE,
    price NUMERIC NOT NULL,
    promo_price NUMERIC,
    cost_price NUMERIC NOT NULL,
    stock INT DEFAULT 0,
    weight_grams INT DEFAULT 0,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRODUCT_IMAGES
CREATE TABLE IF NOT EXISTS product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    alt_text TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CARTS & CART_ITEMS
CREATE TABLE IF NOT EXISTS carts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cart_id UUID REFERENCES carts(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    variant_id UUID REFERENCES product_variants(id),
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ORDERS
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES profiles(id),
    address_id UUID REFERENCES addresses(id),
    status order_status DEFAULT 'pending',
    payment_status payment_status DEFAULT 'unpaid',
    payment_method TEXT,
    payment_id TEXT,
    shipping_method TEXT,
    shipping_tracking TEXT,
    shipping_courier TEXT,
    subtotal NUMERIC NOT NULL DEFAULT 0,
    discount NUMERIC DEFAULT 0,
    voucher_id UUID,
    shipping_cost NUMERIC DEFAULT 0,
    tax NUMERIC DEFAULT 0,
    total NUMERIC NOT NULL DEFAULT 0,
    hpp_total NUMERIC DEFAULT 0,
    profit NUMERIC DEFAULT 0,
    notes TEXT,
    paid_at TIMESTAMPTZ,
    shipped_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    expired_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ORDER_ITEMS
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    variant_id UUID REFERENCES product_variants(id),
    product_name TEXT NOT NULL,
    variant_name TEXT,
    quantity INT NOT NULL,
    price NUMERIC NOT NULL,
    cost_price NUMERIC NOT NULL,
    discount NUMERIC DEFAULT 0,
    subtotal NUMERIC NOT NULL
);

-- ORDER_RETURNS
CREATE TABLE IF NOT EXISTS order_returns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id),
    user_id UUID REFERENCES profiles(id),
    reason TEXT NOT NULL,
    description TEXT,
    photo_urls TEXT[],
    status TEXT DEFAULT 'requested' CHECK (status IN ('requested','approved','rejected','refunded')),
    refund_amount NUMERIC,
    refund_method TEXT,
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- SERVICES
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('grooming','hotel')),
    description TEXT,
    price NUMERIC NOT NULL,
    duration_minutes INT,
    requires_dp BOOLEAN DEFAULT FALSE,
    dp_percentage NUMERIC DEFAULT 50,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- BOOKING_SLOTS
CREATE TABLE IF NOT EXISTS booking_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    time_slot TIME,
    type TEXT NOT NULL CHECK (type IN ('grooming','hotel')),
    capacity INT NOT NULL,
    booked INT DEFAULT 0,
    UNIQUE(date, time_slot, type)
);

-- BOOKINGS
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_number TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES profiles(id),
    pet_id UUID REFERENCES pets(id),
    service_id UUID REFERENCES services(id),
    slot_id UUID REFERENCES booking_slots(id),
    date_start DATE NOT NULL,
    date_end DATE,
    time_slot TIME,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending','confirmed','in_progress','completed','cancelled')),
    dp_amount NUMERIC DEFAULT 0,
    total_amount NUMERIC NOT NULL,
    payment_status payment_status DEFAULT 'unpaid',
    notes TEXT,
    cancellation_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- VOUCHERS
CREATE TABLE IF NOT EXISTS vouchers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('percentage','fixed')),
    value NUMERIC NOT NULL,
    min_order NUMERIC DEFAULT 0,
    max_discount NUMERIC,
    usage_limit INT,
    used_count INT DEFAULT 0,
    valid_from TIMESTAMPTZ NOT NULL,
    valid_until TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- BANNERS
CREATE TABLE IF NOT EXISTS banners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('hero','promo','category')),
    image_url TEXT NOT NULL,
    link TEXT,
    priority INT DEFAULT 0,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- STORE_LOCATIONS
CREATE TABLE IF NOT EXISTS store_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    full_address TEXT NOT NULL,
    city TEXT DEFAULT 'Jakarta',
    district TEXT,
    phone TEXT,
    whatsapp TEXT,
    latitude NUMERIC NOT NULL,
    longitude NUMERIC NOT NULL,
    operating_hours JSONB,
    services_available TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- LOYALTY
CREATE TABLE IF NOT EXISTS loyalty (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
    total_points INT DEFAULT 0,
    lifetime_points INT DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- LOYALTY_HISTORY
CREATE TABLE IF NOT EXISTS loyalty_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id),
    order_id UUID REFERENCES orders(id),
    points_change INT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('earn','redeem','expire','adjustment')),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- REVIEWS
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id),
    product_id UUID REFERENCES products(id),
    order_id UUID REFERENCES orders(id),
    service_id UUID REFERENCES services(id),
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    photo_urls TEXT[],
    admin_reply TEXT,
    is_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- WISHLISTS
CREATE TABLE IF NOT EXISTS wishlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- STOCK_MOVEMENTS
CREATE TABLE IF NOT EXISTS stock_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id),
    variant_id UUID REFERENCES product_variants(id),
    type TEXT NOT NULL CHECK (type IN ('in','out','adjustment','return')),
    quantity INT NOT NULL,
    reference_type TEXT,
    reference_id UUID,
    notes TEXT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    body TEXT,
    type TEXT CHECK (type IN ('order','booking','promo','loyalty','system')),
    reference_type TEXT,
    reference_id UUID,
    channel TEXT DEFAULT 'in_app' CHECK (channel IN ('in_app','whatsapp','push')),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TRIGGERS FOR UPDATED_AT
-- Re-apply to ensure consistency
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ 
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name FROM information_schema.columns 
        WHERE column_name = 'updated_at' AND table_schema = 'public'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS set_updated_at_%I ON %I', t, t);
        EXECUTE format('CREATE TRIGGER set_updated_at_%I BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION handle_updated_at()', t, t);
    END LOOP;
END $$;

-- 5. RLS POLICIES ENFORCEMENT

-- Function to check if user is admin or owner
CREATE OR REPLACE FUNCTION is_admin_or_owner()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role IN ('admin', 'owner')
    FROM profiles
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on all tables
DO $$ 
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public'
    LOOP
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    END LOOP;
END $$;

-- Drop all existing policies to re-apply clean ones
DO $$ 
DECLARE
    pol record;
BEGIN
    FOR pol IN 
        SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, pol.tablename);
    END LOOP;
END $$;

-- POLICY: Admin/Owner Full Access
DO $$ 
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public'
    LOOP
        EXECUTE format('CREATE POLICY "admin_owner_all_%I" ON %I FOR ALL USING (is_admin_or_owner())', t, t);
    END LOOP;
END $$;

-- POLICY: Customer Specifics
CREATE POLICY "users_own_profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_update_own_profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "addresses_own" ON addresses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "pets_own" ON pets FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "orders_own_view" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "orders_own_insert" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "order_items_own_view" ON order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);

CREATE POLICY "bookings_own_view" ON bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "bookings_own_insert" ON bookings FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "carts_own" ON carts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "cart_items_own" ON cart_items FOR ALL USING (
  EXISTS (SELECT 1 FROM carts WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid())
);

CREATE POLICY "wishlists_own" ON wishlists FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "notifications_own" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "loyalty_own" ON loyalty FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "loyalty_history_own" ON loyalty_history FOR SELECT USING (auth.uid() = user_id);

-- POLICY: Public Access
CREATE POLICY "products_public_view" ON products FOR SELECT USING (is_active = TRUE);
CREATE POLICY "variants_public_view" ON product_variants FOR SELECT USING (is_active = TRUE);
CREATE POLICY "categories_public_view" ON categories FOR SELECT USING (is_active = TRUE);
CREATE POLICY "product_images_public_view" ON product_images FOR SELECT USING (TRUE);
CREATE POLICY "banners_public_view" ON banners FOR SELECT USING (is_active = TRUE AND (start_date IS NULL OR start_date <= NOW()) AND (end_date IS NULL OR end_date >= NOW()));
CREATE POLICY "services_public_view" ON services FOR SELECT USING (is_active = TRUE);
CREATE POLICY "booking_slots_public_view" ON booking_slots FOR SELECT USING (TRUE);
CREATE POLICY "reviews_public_view" ON reviews FOR SELECT USING (is_visible = TRUE);
CREATE POLICY "locations_public_view" ON store_locations FOR SELECT USING (is_active = TRUE);

-- POLICY: Reviews (Insert own)
CREATE POLICY "reviews_insert_own" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
