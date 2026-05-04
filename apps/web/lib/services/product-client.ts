import { createClient } from '@/lib/supabase/client';
import type { Database } from '@petshop/types/supabase';

export type Product = Database['public']['Tables']['products']['Row'];
export type Category = Database['public']['Tables']['categories']['Row'];

/**
 * Returns a relevant high-quality image from Unsplash if the product has no image.
 */
function getSmartFallbackImage(productName: string): string {
  const p = productName.toLowerCase();
  let id = '1583337130417-3346a1be7dee'; // Default Dog

  if (p.includes('kucing') || p.includes('cat')) id = '1514888286974-6c03e2ca1dba';
  if (p.includes('vitamin') || p.includes('obat')) id = '1584017945396-b371190c121e';
  if (p.includes('makanan')) id = '1589924691995-400dc9ecc119';

  return `https://images.unsplash.com/photo-${id}?w=800&q=80`;
}

export interface ProductWithDetails {
  id: string;
  name: string;
  slug: string;
  price: number;
  promoPrice: number | null;
  imageUrl: string;
  rating: number;
  soldCount: number;
  category_slug?: string | null;
}

export async function getActiveProducts(): Promise<ProductWithDetails[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('products')
    .select(
      'id, name, price, promo_price, slug, avg_rating, sold_count, categories(slug), product_images(url)',
    )
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('SUPABASE_FETCH_ERROR_MESSAGE:', error.message);
    return [];
  }

  // Type definition for the joined data from Supabase
  type ProductRowWithJoins = {
    id: string;
    name: string;
    slug: string;
    price: number;
    promo_price: number | null;
    avg_rating: number;
    sold_count: number;
    categories: { slug: string } | null;
    product_images: { url: string }[];
  };

  // Map the nested data to a flat structure for UI compatibility (camelCase)
  return ((data as unknown as ProductRowWithJoins[]) || []).map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: Number(p.price),
    promoPrice: p.promo_price ? Number(p.promo_price) : null,
    imageUrl: p.product_images?.[0]?.url || getSmartFallbackImage(p.name),
    rating: Number(p.avg_rating) || 0,
    soldCount: Number(p.sold_count) || 0,
    category_slug: p.categories?.slug || null,
  }));
}

export async function getActiveCategories(): Promise<Category[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  return data || [];
}
