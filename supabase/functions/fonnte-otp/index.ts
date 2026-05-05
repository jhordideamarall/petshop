/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />


const FONNTE_TOKEN = Deno.env.get('FONNTE_TOKEN');

Deno.serve(async (req: Request) => {
  try {
    const payload = await req.json();

    if (!payload?.user?.phone || !payload?.sms?.otp) {
      return new Response(JSON.stringify({ error: 'Invalid payload format' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const { phone, user_metadata } = payload.user;
    const { otp } = payload.sms;

    // Get name from metadata, fallback to "Pelanggan" if not provided
    const name = user_metadata?.full_name || 'Pelanggan';

    // Clean phone number for Fonnte
    const target = phone.replace('+', '');

    // Custom branded message
    const message = `Halo Kak ${name}! 👋\n\nTerima kasih telah bergabung menjadi bagian dari Pawvels. Ini adalah kode verifikasi (OTP) Anda:\n\n*${otp}*\n\nJangan berikan kode ini kepada siapa pun ya. Selamat berbelanja kebutuhan anabul kesayangan! 🐾\n\n— Tim Pawvels`;

    if (!FONNTE_TOKEN) {
      console.error('FONNTE_TOKEN is missing!');
      return new Response(JSON.stringify({ error: 'Server misconfiguration' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    const response = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: {
        Authorization: FONNTE_TOKEN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        target: target,
        message: message,
      }),
    });

    const result = await response.json();

    if (result.status) {
      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      });
    } else {
      return new Response(JSON.stringify({ error: result.reason || 'Fonnte API Failure' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      });
    }
  } catch {
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
