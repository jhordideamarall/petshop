import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const BITESHIP_API_KEY = process.env.BITESHIP_API_KEY || '';

interface ShippingMetadata {
  biteship_order_id?: string;
  courier_tracking_id?: string;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;
    
    // 1. Inisialisasi Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 2. Ambil biteship_order_id dari database
    const { data: order, error } = await supabase
      .from('orders')
      .select('shipping_metadata')
      .eq('id', orderId)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const metadata = order.shipping_metadata as unknown as ShippingMetadata;
    const biteshipOrderId = metadata?.biteship_order_id;
    const courierTrackingId = metadata?.courier_tracking_id;

    if (!biteshipOrderId && !courierTrackingId) {
      return NextResponse.json({ error: 'Tracking not available yet' }, { status: 400 });
    }

    // 3. Panggil API Biteship
    const trackingId = courierTrackingId || biteshipOrderId;
    const biteshipRes = await fetch(`https://api.biteship.com/v1/trackings/${trackingId}`, {
      headers: {
        'Authorization': `Bearer ${BITESHIP_API_KEY}`
      }
    });

    const trackingData = await biteshipRes.json();

    if (!biteshipRes.ok) {
      return NextResponse.json(trackingData, { status: biteshipRes.status });
    }

    return NextResponse.json(trackingData);
  } catch (error) {
    console.error('TRACKING_API_ERROR:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal Server Error' 
    }, { status: 500 });
  }
}
