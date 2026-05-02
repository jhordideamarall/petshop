-- Pawvels Platform — Granular Role Security (Phase 1 Final Polish)
-- Distinguishing between Owner, Admin, and Staff roles according to PRD §6 & §7.

-- 1. REFINED SECURITY FUNCTIONS
CREATE OR REPLACE FUNCTION is_owner()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role = 'owner'
    FROM profiles
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role = 'admin'
    FROM profiles
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_staff()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role = 'staff'
    FROM profiles
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. RESET POLICIES FOR OPERATIONAL VS MANAGEMENT TABLES

-- AUDIT LOGS: Owner Only (Security & Integrity)
DROP POLICY IF EXISTS "admin_owner_all_audit_logs" ON audit_logs;
CREATE POLICY "owner_full_audit_logs" ON audit_logs FOR ALL USING (is_owner());

-- STORE LOCATIONS: Owner Only (Settings/Configuration)
DROP POLICY IF EXISTS "admin_owner_all_store_locations" ON store_locations;
CREATE POLICY "owner_full_store_locations" ON store_locations FOR ALL USING (is_owner());
CREATE POLICY "public_view_store_locations" ON store_locations FOR SELECT USING (is_active = TRUE);

-- STOCK MOVEMENTS: Owner & Admin (Operational Inventory)
DROP POLICY IF EXISTS "admin_owner_all_stock_movements" ON stock_movements;
CREATE POLICY "admin_owner_stock_movements" ON stock_movements FOR ALL USING (is_owner() OR is_admin());

-- VOUCHERS: Owner & Admin (Operational Marketing)
DROP POLICY IF EXISTS "admin_owner_all_vouchers" ON vouchers;
CREATE POLICY "admin_owner_vouchers" ON vouchers FOR ALL USING (is_owner() OR is_admin());

-- ORDERS: Owner & Admin & Staff (Different levels of access)
-- Note: All can view, but only Admin/Owner can update status/delete. Staff can view for fulfillment.
DROP POLICY IF EXISTS "admin_owner_all_orders" ON orders;
CREATE POLICY "management_orders_view" ON orders FOR SELECT USING (is_owner() OR is_admin() OR is_staff());
CREATE POLICY "management_orders_update" ON orders FOR UPDATE USING (is_owner() OR is_admin());
CREATE POLICY "owner_orders_delete" ON orders FOR DELETE USING (is_owner());

-- ORDER ITEMS: Linked to Order visibility
DROP POLICY IF EXISTS "admin_owner_all_order_items" ON order_items;
CREATE POLICY "management_order_items_view" ON order_items FOR SELECT USING (
    is_owner() OR is_admin() OR is_staff()
);

-- PRODUCTS & VARIANTS: Admin/Owner manage, Staff view, Public view
DROP POLICY IF EXISTS "admin_owner_all_products" ON products;
CREATE POLICY "management_products_all" ON products FOR ALL USING (is_owner() OR is_admin());
DROP POLICY IF EXISTS "admin_owner_all_product_variants" ON product_variants;
CREATE POLICY "management_variants_all" ON product_variants FOR ALL USING (is_owner() OR is_admin());

-- SERVICES & SLOTS: Admin/Owner manage, Staff view
DROP POLICY IF EXISTS "admin_owner_all_services" ON services;
CREATE POLICY "management_services_all" ON services FOR ALL USING (is_owner() OR is_admin());
DROP POLICY IF EXISTS "admin_owner_all_booking_slots" ON booking_slots;
CREATE POLICY "management_booking_slots_all" ON booking_slots FOR ALL USING (is_owner() OR is_admin());

-- BOOKINGS: Owner, Admin, and Staff (Staff need this for daily operations)
DROP POLICY IF EXISTS "admin_owner_all_bookings" ON bookings;
CREATE POLICY "management_bookings_view" ON bookings FOR SELECT USING (is_owner() OR is_admin() OR is_staff());
CREATE POLICY "management_bookings_update" ON bookings FOR UPDATE USING (is_owner() OR is_admin() OR is_staff());

-- PROFILES: Admin can view all users, but only Owner can promote to Admin/Owner
DROP POLICY IF EXISTS "admin_owner_all_profiles" ON profiles;
CREATE POLICY "admin_owner_view_profiles" ON profiles FOR SELECT USING (is_owner() OR is_admin());
CREATE POLICY "owner_manage_profiles" ON profiles FOR ALL USING (is_owner());

-- LOYALTY & POINTS: Admin can manage, Owner view reports
DROP POLICY IF EXISTS "admin_owner_all_loyalty" ON loyalty;
CREATE POLICY "management_loyalty_all" ON loyalty FOR ALL USING (is_owner() OR is_admin());
DROP POLICY IF EXISTS "admin_owner_all_loyalty_history" ON loyalty_history;
CREATE POLICY "management_loyalty_history_all" ON loyalty_history FOR ALL USING (is_owner() OR is_admin());

-- 3. ENFORCING COLUMN-LEVEL SECURITY (CONCEPTUAL HINT)
-- Since RLS doesn't hide columns, we advise that the 'Admin Dashboard' app 
-- should not fetch 'hpp_total' and 'profit' columns from 'orders' table.
-- To enforce this at DB level, one would use Views, which we will implement if needed in Phase 5.
