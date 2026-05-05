import { NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';

// Inisialisasi admin client secara lazy/aman untuk build
const getSupabaseAdmin = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createAdminClient(url, key);
};

const XENDIT_SECRET_KEY = process.env.XENDIT_SECRET_KEY || '';
const XENDIT_URL = 'https://api.xendit.co/v2/invoices';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const supabaseAdmin = getSupabaseAdmin();
    
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Configuration Error' }, { status: 500 });
    }

    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
    }

    // 0. Cek Auth (Wajib biar tau siapa yang bayar)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Ambil data order dari database (Pakai Admin buat mastiin dapet data lengkap)
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (name)
        ),
        profiles (
          name,
          email,
          phone
        )
      `)
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // 2. Siapkan payload untuk Xendit
    const authString = Buffer.from(`${XENDIT_SECRET_KEY}:`).toString('base64');
    
    // Rincian barang
    const items = order.order_items.map((item: { product_name?: string, products?: { name: string }, quantity: number, price: number }) => ({
      name: (item.product_name || item.products?.name || 'Produk').slice(0, 255),
      quantity: item.quantity,
      price: Math.round(Number(item.price)),
    }));

    // Tambah Ongkir sebagai item
    if (order.shipping_cost && Number(order.shipping_cost) > 0) {
      items.push({
        name: `Ongkir (${order.shipping_courier || 'Kurir'})`,
        quantity: 1,
        price: Math.round(Number(order.shipping_cost)),
      });
    }

    // Tambah Diskon (Xendit Invoice butuh harga positif, nanti dikurangi di total? 
    // Tidak, Xendit Invoice v2 items price can be negative for discounts)
    if (order.discount && Number(order.discount) > 0) {
      items.push({
        name: 'Diskon',
        quantity: 1,
        price: -Math.round(Number(order.discount)),
      });
    }

    const customerEmail = order.profiles?.email || user.email || 'customer@pawvels.com';

    const xenditPayload = {
      external_id: order.order_number,
      amount: Math.round(Number(order.total)),
      payer_email: customerEmail,
      description: `Pembayaran Pesanan ${order.order_number} - Pawvels`,
      customer: {
        given_names: order.profiles?.name || user.email?.split('@')[0] || 'Customer',
        email: customerEmail,
        mobile_number: order.profiles?.phone || '',
      },
      items: items,
      success_redirect_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://pawvels.vercel.app'}/checkout/success?order_id=${order.id}`,
      failure_redirect_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://pawvels.vercel.app'}/account/orders`,
      currency: 'IDR',
      reminder_time: 1,
    };

    console.log('Sending to Xendit:', JSON.stringify(xenditPayload, null, 2));

    // 3. Panggil API Xendit
    const response = await fetch(XENDIT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authString}`,
      },
      body: JSON.stringify(xenditPayload),
    });

    const xenditData = await response.json();

    if (!response.ok) {
      console.error('Xendit API Error Response:', JSON.stringify(xenditData, null, 2));
      return NextResponse.json({ 
        error: 'Xendit Error', 
        details: xenditData 
      }, { status: response.status });
    }

    // 4. Update order dengan Payment ID & Metadata (Opsional)
    // 4. Update order dengan Payment ID & Metadata (Pakai Admin!)
    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        payment_id: xenditData.id,
        payment_metadata: {
          invoice_url: xenditData.invoice_url,
          external_id: xenditData.external_id,
          status: xenditData.status
        }
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('Failed to update order with payment_id:', updateError);
      // Tetap lanjutkan redirect karena invoice sudah terlanjur dibuat di Xendit
    }

    return NextResponse.json({ 
      token: xenditData.id, // Kita tetap sebut token agar frontend tidak perlu banyak berubah
      invoice_url: xenditData.invoice_url 
    });

  } catch (error) {
    const err = error as Error;
    console.error('PAYMENT_CREATE_ERROR:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
