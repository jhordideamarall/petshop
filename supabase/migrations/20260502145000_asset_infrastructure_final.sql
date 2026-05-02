-- Pawvels Platform — Asset Infrastructure Final Alignment
-- Ensuring all media columns and buckets are 100% precise.

-- 1. Table Updates
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 2. Storage Buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('categories', 'categories', true),
  ('services', 'services', true)
ON CONFLICT (id) DO NOTHING;
