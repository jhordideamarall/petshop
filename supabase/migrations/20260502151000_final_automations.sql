-- Pawvels Platform — Final Automations & Auth Sync
-- 1. Extensions
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 2. Auth Sync Function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role, tier)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE((NEW.raw_app_meta_data->>'role')::user_role, 'customer'),
    'bronze'
  );
  INSERT INTO public.carts (user_id) VALUES (NEW.id);
  INSERT INTO public.loyalty (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Auth Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Review Automation
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS avg_rating NUMERIC DEFAULT 0;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS review_count INT DEFAULT 0;

CREATE OR REPLACE FUNCTION public.update_avg_rating()
RETURNS TRIGGER AS $$
BEGIN
  IF (NEW.product_id IS NOT NULL) THEN
    UPDATE public.products
    SET 
      avg_rating = (SELECT AVG(rating) FROM public.reviews WHERE product_id = NEW.product_id),
      review_count = (SELECT COUNT(*) FROM public.reviews WHERE product_id = NEW.product_id)
    WHERE id = NEW.product_id;
  END IF;
  IF (NEW.service_id IS NOT NULL) THEN
    UPDATE public.services
    SET 
      avg_rating = (SELECT AVG(rating) FROM public.reviews WHERE service_id = NEW.service_id),
      review_count = (SELECT COUNT(*) FROM public.reviews WHERE service_id = NEW.service_id)
    WHERE id = NEW.service_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_review_added ON public.reviews;
CREATE TRIGGER on_review_added
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_avg_rating();
