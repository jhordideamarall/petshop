-- Pawvels Platform — Storage Buckets & Policies Setup
-- 1. Create Buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('products', 'products', true),
  ('banners', 'banners', true),
  ('pets', 'pets', true),
  ('reviews', 'reviews', true),
  ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Storage Policies
DO $$ BEGIN
    CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN null; END $$;
