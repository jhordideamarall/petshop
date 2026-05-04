import { createClient } from '@/lib/supabase/server';
import type { Database } from '@petshop/types/supabase';

export type Product = Database['public']['Tables']['products']['Row'];
export type Category = Database['public']['Tables']['categories']['Row'];

/**
 * Returns a relevant high-quality image from Unsplash if the product has no image.
 */
function getSmartFallbackImage(_productName: string): string {
  // Use a reliable Unsplash ID for pet-related images
  return `https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&q=80`;
}

export async function getActiveProducts() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('products')
    .select('id, name, price, promo_price, slug, avg_rating, sold_count, product_images(url)')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }

  type ProductRowWithImages = Product & {
    product_images: { url: string }[];
  };

  // Map the nested data to a flat structure for UI compatibility (camelCase)
  return ((data as unknown as ProductRowWithImages[]) || []).map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: Number(p.price),
    promoPrice: p.promo_price ? Number(p.promo_price) : null,
    imageUrl: p.product_images?.[0]?.url || getSmartFallbackImage(p.name),
    rating: Number(p.avg_rating) || 0,
    soldCount: Number(p.sold_count) || 0,
  }));
}

export async function getActiveCategories() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  return data;
}

export async function getProductBySlug(slug: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('products')
    .select('*, product_images(url), product_variants(*)')
    .eq('slug', slug)
    .single();

  if (error || !data) {
    console.error('ERROR_GET_PRODUCT_BY_SLUG:', error?.message);
    return null;
  }

  type ProductRowWithDetails = Product & {
    product_images: { url: string }[];
    product_variants: Database['public']['Tables']['product_variants']['Row'][];
  };

  const product = data as unknown as ProductRowWithDetails;

  // Map to UI-friendly structure
  const mappedImages = product.product_images?.map((img) => img.url) || [];
  const imageUrl = mappedImages[0] || getSmartFallbackImage(product.name);

  return {
    ...product,
    imageUrl,
    images: mappedImages.length > 0 ? mappedImages : [imageUrl],
    variants: product.product_variants || [],
    rating: Number(product.avg_rating) || 0,
    reviewCount: product.review_count || 0,
    soldCount: product.sold_count || 0,
    promoPrice: product.promo_price,
    description:
      product.description ||
      `*${product.name}* adalah produk pilihan untuk kebutuhan harian peliharaan Anda.\n\n· Produk dikurasi untuk kualitas dan kenyamanan\n· Cocok untuk kebutuhan perawatan rutin\n· Stok dan harga dapat berubah sesuai ketersediaan`,
  };
}
