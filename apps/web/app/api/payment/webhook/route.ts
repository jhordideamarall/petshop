import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const XENDIT_CALLBACK_TOKEN = process.env.XENDIT_CALLBACK_TOKEN || '';
const BITESHIP_API_KEY = process.env.BITESHIP_API_KEY || '';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const headers = req.headers;
    const callbackToken = headers.get('x-callback-token');

    console.log('Xendit Webhook Received:', JSON.stringify(body, null, 2));

    if (XENDIT_CALLBACK_TOKEN && callbackToken !== XENDIT_CALLBACK_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { external_id, status } = body;

    if (status === 'PAID' || status === 'SETTLED') {
      // 1. Ambil data order lengkap untuk Biteship
      const { data: order, error: orderError } = await supabaseAdmin
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (name, weight_grams)
          ),
          profiles (*)
        `)
        .eq('order_number', external_id)
        .single();

      if (orderError || !order) {
        throw new Error('Order not found for webhook');
      }

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
          const biteshipPayload = {
            shipper_contact_name: "Pawvels Petshop",
            shipper_contact_phone: "08123456789", // Ganti dengan no telp toko Anda
            shipper_contact_email: "hello@pawvels.com",
            shipper_organization: "Pawvels",
            origin_contact_name: "Pawvels Admin",
            origin_contact_phone: "08123456789",
            origin_address: "Jl. Petshop No. 1, Jakarta", // Ganti dengan alamat pickup Anda
            origin_note: "Dekat warung kopi",
            origin_postal_code: 12345, // Ganti dengan kode pos origin
            destination_contact_name: order.profiles?.name || "Customer",
            destination_contact_phone: order.profiles?.phone || "",
            destination_contact_email: order.profiles?.email || "",
            destination_address: order.shipping_address,
            destination_note: "",
            destination_postal_code: parseInt(order.shipping_postal_code),
            courier_company: order.shipping_courier,
            courier_type: order.shipping_service,
            delivery_type: "now",
            items: order.order_items.map((item: { products?: { name?: string, weight_grams?: number }, price: number, quantity: number }) => ({
              name: item.products?.name || "Produk",
              description: "-",
              value: item.price,
              quantity: item.quantity,
              weight: item.products?.weight_grams || 100
            }))
          };

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
            // Simpan ID pesanan Biteship ke database kita
            await supabaseAdmin
              .from('orders')
              .update({
                shipping_status: 'processing',
                shipping_metadata: {
                  ...order.shipping_metadata,
                  biteship_order_id: biteshipData.id,
                  courier_tracking_id: biteshipData.courier?.tracking_id
                }
              })
              .eq('id', order.id);
            
            console.log('Biteship Order Created:', biteshipData.id);
          } else {
            console.error('Biteship API Error:', biteshipData);
          }
        } catch (bsError) {
          console.error('Failed to call Biteship API:', bsError);
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
