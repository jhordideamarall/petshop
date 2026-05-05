import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

interface ShippingMetadata {
  biteship_order_id?: string;
  courier_tracking_id?: string;
}

// Inisialisasi admin client secara lazy/aman untuk build
const getSupabaseAdmin = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !key) {
    return null;
  }
  
  return createClient(url, key);
};

const XENDIT_CALLBACK_TOKEN = process.env.XENDIT_CALLBACK_TOKEN || '';
const BITESHIP_API_KEY = process.env.BITESHIP_API_KEY || '';

export async function POST(req: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      console.error('Supabase Admin Client not initialized - Missing Keys');
      return NextResponse.json({ error: 'Configuration Error' }, { status: 500 });
    }

    const body = await req.json();
    const headers = req.headers;
    const callbackToken = headers.get('x-callback-token');

    console.log('Xendit Webhook Received:', JSON.stringify(body, null, 2));

    if (XENDIT_CALLBACK_TOKEN && callbackToken !== XENDIT_CALLBACK_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { external_id, status } = body;

    if (status === 'PAID' || status === 'SETTLED') {
      // 1. Ambil data order dasar
      const { data: order, error: orderError } = await supabaseAdmin
        .from('orders')
        .select('*, addresses(*)')
        .eq('order_number', external_id)
        .single();

      if (orderError || !order) {
        console.warn(`Webhook received for unknown order: ${external_id}`);
        return NextResponse.json({ success: true, message: 'Order not found, skipping' });
      }

      // 1b. Ambil data profil, items, dan store settings
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', order.user_id)
        .single();

      const { data: orderItems } = await supabaseAdmin
        .from('order_items')
        .select('*, products(name, weight_grams)')
        .eq('order_id', order.id);

      const { data: storeSettings } = await supabaseAdmin
        .from('store_settings')
        .select('*')
        .single();

      // 2. Update status di database kita
      await supabaseAdmin
        .from('orders')
        .update({
          status: 'paid',
          payment_status: 'paid',
          paid_at: new Date().toISOString(),
          payment_metadata: body
        })
        .eq('order_number', external_id);

      // 3. KIRIM KE BITESHIP (Hanya jika belum pernah dikirim)
      if (!order.shipping_metadata?.biteship_order_id) {
        try {
          if (!BITESHIP_API_KEY) {
            console.error('Biteship Webhook Error: BITESHIP_API_KEY is not defined in environment variables');
            return NextResponse.json({ success: true, message: 'Biteship API Key missing' });
          }

          const address = order.addresses;
          if (!address) throw new Error('Order address not found');

          // Mapping shipping service (e.g., "JNE - Reguler" -> "reg")
          const [courierName, serviceName] = (order.shipping_method || "").split(' - ');

          const biteshipPayload = {
            shipper_contact_name: storeSettings?.store_name || "Pawvels Petshop",
            shipper_contact_phone: "082281872174", 
            shipper_contact_email: "hello@pawvels.com",
            shipper_organization: "Pawvels",
            origin_contact_name: "Pawvels Store",
            origin_contact_phone: "082281872174",
            origin_address: storeSettings?.origin_address || "Tangerang",
            origin_note: "",
            origin_postal_code: storeSettings?.origin_postal_code || 15811, 
            origin_area_id: storeSettings?.origin_area_id || "IDNP3IDNC445IDND5601",
            destination_contact_name: address.recipient_name || profile?.name || "Customer",
            destination_contact_phone: address.phone || profile?.phone || "",
            destination_contact_email: profile?.email || "",
            destination_address: address.full_address,
            destination_note: "",
            destination_postal_code: parseInt(address.postal_code || "0"),
            destination_area_id: address.biteship_area_id,
            courier_company: BITESHIP_API_KEY.startsWith('biteship_test_') 
              ? "biteship" 
              : (order.shipping_courier || courierName || "").toLowerCase(),
            courier_type: BITESHIP_API_KEY.startsWith('biteship_test_')
              ? "standard"
              : (serviceName || "reg").toLowerCase(),
            delivery_type: BITESHIP_API_KEY.startsWith('biteship_test_')
              ? "now"
              : (["grab", "gojek", "lalamove"].includes((order.shipping_courier || courierName || "").toLowerCase()) ? "now" : "later"),
            pickup_date: new Date().toISOString().split('T')[0],
            pickup_time: "12:00", 
            items: ((orderItems || []) as unknown[]).map((item) => {
              const it = item as { 
                products?: { name: string, weight_grams: number }, 
                product_name?: string, 
                price: number, 
                quantity: number 
              };
              return {
                name: it.products?.name || it.product_name || "Produk",
                description: "-",
                value: it.price,
                quantity: it.quantity,
                weight: Math.max(1, it.products?.weight_grams || 100)
              };
            })
          };

          console.log('Attempting Biteship Order Creation for:', order.order_number);
          console.log('Biteship Payload:', JSON.stringify(biteshipPayload, null, 2));

          const biteshipRes = await fetch('https://api.biteship.com/v1/orders', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${BITESHIP_API_KEY}`
            },
            body: JSON.stringify(biteshipPayload)
          });

          const biteshipData = await biteshipRes.json();
          
          if (biteshipRes.ok) {
            await supabaseAdmin
              .from('orders')
              .update({
                shipping_metadata: {
                  ...(order.shipping_metadata as ShippingMetadata),
                  biteship_order_id: biteshipData.id,
                  courier_tracking_id: biteshipData.courier?.tracking_id,
                  biteship_status: biteshipData.status
                }
              })
              .eq('id', order.id);
            
            console.log('Biteship Order Created Successfully:', biteshipData.id);
          } else {
            console.error('Biteship API Error Response for Order', order.order_number, ':', JSON.stringify(biteshipData, null, 2));
            // Save error to metadata for debugging
            await supabaseAdmin
              .from('orders')
              .update({
                shipping_metadata: {
                  ...order.shipping_metadata,
                  biteship_error: biteshipData,
                  last_retry_at: new Date().toISOString()
                }
              })
              .eq('id', order.id);
          }
        } catch (bsError) {
          console.error('Failed to call Biteship API for Order', order.order_number, ':', bsError);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const err = error as Error;
    console.error('WEBHOOK_ERROR:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
