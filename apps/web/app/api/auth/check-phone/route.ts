import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { phone } = await request.json();
  if (!phone) return NextResponse.json({ exists: false });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data } = await supabase.from('profiles').select('id').eq('phone', phone).maybeSingle();

  return NextResponse.json({ exists: !!data });
}
