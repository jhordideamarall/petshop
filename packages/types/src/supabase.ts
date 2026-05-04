export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          email: string | null
          phone: string | null
          role: 'admin' | 'customer' | 'staff' | 'owner'
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
      }
      addresses: {
        Row: {
          id: string
          user_id: string
          label: string
          recipient_name: string
          phone: string
          full_address: string
          city: string
          district: string | null
          postal_code: string | null
          is_default: boolean
          created_at: string
        }
      }
      products: {
        Row: {
          id: string
          category_id: string | null
          name: string
          slug: string
          description: string | null
          price: number
          promo_price: number | null
          stock: number
          image_url: string | null
          sold_count: number
          avg_rating: number
          review_count: number
          is_active: boolean
        }
      }
      product_variants: {
        Row: {
          id: string
          product_id: string
          name: string
          price: number
          promo_price: number | null
          stock: number
          is_active: boolean
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          image_url: string | null
        }
      }
    }
  }
}
