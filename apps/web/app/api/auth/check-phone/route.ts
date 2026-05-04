import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { phone } = await request.json();
  if (!phone) return NextResponse.json({ exists: false });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    return NextResponse.json({ exists: false });
  }

  const supabase = createClient(url, serviceKey);

  const { data } = await supabase.from('profiles').select('id').eq('phone', phone).maybeSingle();

  return NextResponse.json({ exists: !!data });
}
