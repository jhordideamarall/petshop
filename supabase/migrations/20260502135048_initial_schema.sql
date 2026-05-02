-- Pawvels Platform — Database Schema (Phase 1)
-- Target: Supabase (PostgreSQL)

-- 0. EXTENSIONS & FUNCTIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Function to handle updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. ENUMS
CREATE TYPE user_role AS ENUM ('admin', 'customer', 'staff');
CREATE TYPE pet_type AS ENUM ('cat', 'dog', 'other');
CREATE TYPE pet_gender AS ENUM ('male', 'female');
CREATE TYPE order_status AS ENUM ('pending_payment', 'processing', 'shipped', 'delivered', 'cancelled', 'completed');
CREATE TYPE booking_status AS ENUM ('pending_payment', 'confirmed', 'in_progress', 'completed', 'cancelled');
CREATE TYPE voucher_type AS ENUM ('fixed', 'percentage');
CREATE TYPE service_type AS ENUM ('grooming', 'hotel');

-- 2. USER PROFILES
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    phone_number TEXT UNIQUE,
    address TEXT,
    role user_role DEFAULT 'customer',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER set_updated_at_profiles
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- 3. PETS
CREATE TABLE pets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    type pet_type NOT NULL,
    breed TEXT,
    gender pet_gender,
    birth_date DATE,
    weight NUMERIC(5,2), -- in kg
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER set_updated_at_pets
BEFORE UPDATE ON pets
FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- 4. E-COMMERCE: CATEGORIES & PRODUCTS
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    is_frozen BOOLEAN DEFAULT FALSE, -- for shipping rules
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER set_updated_at_products
BEFORE UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- 5. PRODUCT VARIANTS & INVENTORY
CREATE TABLE product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    sku TEXT UNIQUE NOT NULL,
    price NUMERIC(12,2) NOT NULL,
    weight_grams INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER set_updated_at_product_variants
BEFORE UPDATE ON product_variants
FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE UNIQUE NOT NULL,
    stock_quantity INTEGER DEFAULT 0 NOT NULL,
    low_stock_threshold INTEGER DEFAULT 5 NOT NULL,
    last_restocked_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. VOUCHERS
CREATE TABLE vouchers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    type voucher_type NOT NULL,
    value NUMERIC(12,2) NOT NULL,
    min_purchase NUMERIC(12,2) DEFAULT 0,
    max_discount NUMERIC(12,2),
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    usage_limit INTEGER,
    used_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE
);

-- 7. ORDERS & ORDER ITEMS
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES profiles(id) NOT NULL,
    status order_status DEFAULT 'pending_payment' NOT NULL,
    subtotal NUMERIC(12,2) NOT NULL,
    shipping_cost NUMERIC(12,2) NOT NULL,
    voucher_id UUID REFERENCES vouchers(id) ON DELETE SET NULL,
    voucher_discount NUMERIC(12,2) DEFAULT 0,
    loyalty_discount NUMERIC(12,2) DEFAULT 0,
    total_amount NUMERIC(12,2) NOT NULL,
    payment_id TEXT, -- Midtrans/Xendit transaction ID
    shipping_address JSONB NOT NULL,
    tracking_number TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER set_updated_at_orders
BEFORE UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    variant_id UUID REFERENCES product_variants(id) NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(12,2) NOT NULL,
    total_price NUMERIC(12,2) NOT NULL
);

-- 8. BOOKING: SERVICES & SLOTS
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    type service_type NOT NULL,
    description TEXT,
    base_price NUMERIC(12,2) NOT NULL,
    duration_minutes INTEGER, -- for grooming
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE booking_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID REFERENCES services(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    capacity INTEGER DEFAULT 1 NOT NULL,
    booked_count INTEGER DEFAULT 0 NOT NULL,
    UNIQUE(service_id, date, start_time)
);

CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_number TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES profiles(id) NOT NULL,
    pet_id UUID REFERENCES pets(id) NOT NULL,
    service_id UUID REFERENCES services(id) NOT NULL,
    slot_id UUID REFERENCES booking_slots(id) NOT NULL,
    status booking_status DEFAULT 'pending_payment' NOT NULL,
    notes TEXT,
    total_price NUMERIC(12,2) NOT NULL,
    deposit_amount NUMERIC(12,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER set_updated_at_bookings
BEFORE UPDATE ON bookings
FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- 9. LOYALTY & REVIEWS
CREATE TABLE loyalty_points (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    points INTEGER NOT NULL,
    source TEXT NOT NULL, -- e.g. 'order', 'referral', 'adjustment'
    transaction_type TEXT NOT NULL, -- 'earn', 'redeem'
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    comment TEXT,
    images TEXT[], -- Array of image URLs
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (product_id IS NOT NULL OR service_id IS NOT NULL)
);

-- 10. LOCATION & SHIPPING
CREATE TABLE districts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    province TEXT NOT NULL
);

CREATE TABLE shipping_rates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    district_id UUID REFERENCES districts(id) ON DELETE CASCADE UNIQUE NOT NULL,
    base_rate NUMERIC(12,2) NOT NULL,
    extra_per_kg NUMERIC(12,2) NOT NULL,
    min_days INTEGER DEFAULT 1,
    max_days INTEGER DEFAULT 3
);

-- 11. NOTIFICATIONS & AUDIT
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT NOT NULL, -- 'order', 'booking', 'info'
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_name TEXT NOT NULL,
    entity_id UUID NOT NULL,
    old_data JSONB,
    new_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. ENABLE RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 13. INITIAL RLS POLICIES (BASIC)

-- Profiles: Users can only see and edit their own profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Pets: Users can only see and edit their own pets
CREATE POLICY "Users can view own pets" ON pets FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Users can insert own pets" ON pets FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update own pets" ON pets FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Users can delete own pets" ON pets FOR DELETE USING (auth.uid() = owner_id);

-- Categories & Products & Services: Publicly viewable
CREATE POLICY "Public can view categories" ON categories FOR SELECT USING (TRUE);
CREATE POLICY "Public can view products" ON products FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public can view variants" ON product_variants FOR SELECT USING (TRUE);
CREATE POLICY "Public can view services" ON services FOR SELECT USING (TRUE);
CREATE POLICY "Public can view booking slots" ON booking_slots FOR SELECT USING (TRUE);

-- Orders: Users can only see their own orders
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Reviews: Publicly viewable, users can insert their own
CREATE POLICY "Public can view reviews" ON reviews FOR SELECT USING (TRUE);
CREATE POLICY "Users can insert own reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Districts & Shipping: Publicly viewable
CREATE POLICY "Public can view districts" ON districts FOR SELECT USING (TRUE);
CREATE POLICY "Public can view shipping rates" ON shipping_rates FOR SELECT USING (TRUE);
