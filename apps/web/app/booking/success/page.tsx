'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { m } from 'framer-motion';
import { CalendarDays, Check, Clock3, Home } from 'lucide-react';

interface SuccessData {
  bookingNum: string;
  serviceName: string;
  dateId: string;
  timeId: string;
}

function formatDate(dateId: string) {
  if (!dateId) return '';
  const d = new Date(dateId + 'T00:00:00');
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function BookingSuccessPage() {
  const router = useRouter();
  const [data, setData] = useState<SuccessData | null>(null);
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;
    const raw = sessionStorage.getItem('bookingSuccess');
    if (!raw) {
      router.replace('/booking');
      return;
    }
    setData(JSON.parse(raw) as SuccessData);
    sessionStorage.removeItem('bookingSuccess');
  }, [router]);

  if (!data) return null;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col items-center justify-center bg-[#FDFCFB] px-5 pb-[env(safe-area-inset-bottom)]">
      <m.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 280, damping: 18, delay: 0.05 }}
        className="flex h-24 w-24 items-center justify-center rounded-full bg-success"
      >
        <Check size={44} strokeWidth={2.5} color="#FFFFFF" />
      </m.div>

      <m.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-6 text-center"
      >
        <h1 className="font-heading text-[26px] font-extrabold text-ink">Booking Masuk!</h1>
        <p className="mt-2 text-[15px] leading-6 text-ink-3">
          Admin akan menghubungi via WhatsApp untuk konfirmasi jadwal.
        </p>
      </m.div>

      <m.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6 w-full rounded-[22px] border border-stone-2 bg-white p-4"
      >
        <div className="text-center">
          <p className="font-heading text-[11px] font-bold uppercase tracking-[0.14em] text-ink-4">
            Nomor Booking
          </p>
          <p className="mt-1 font-heading text-[24px] font-extrabold text-primary">
            {data.bookingNum}
          </p>
        </div>

        <div className="mt-4 space-y-2.5 border-t border-stone-2 pt-4 text-[14px] font-semibold text-ink-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-ink">Layanan</span>
            <span>{data.serviceName}</span>
          </div>
          {data.dateId && (
            <div className="flex items-center gap-2">
              <CalendarDays size={14} className="shrink-0 text-primary" />
              <span>{formatDate(data.dateId)}</span>
            </div>
          )}
          {data.timeId && (
            <div className="flex items-center gap-2">
              <Clock3 size={14} className="shrink-0 text-primary" />
              <span>{data.timeId} WIB</span>
            </div>
          )}
        </div>
      </m.div>

      <m.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-4 text-center text-[13px] leading-5 text-ink-4"
      >
        Screenshot nomor booking untuk referensi kamu.
      </m.p>

      <m.button
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        type="button"
        onClick={() => router.push('/')}
        className="mt-8 flex h-14 w-full items-center justify-center gap-2 rounded-[18px] bg-primary font-heading text-[15px] font-extrabold text-white shadow-[0_8px_22px_rgba(224,123,57,0.28)] active:scale-[0.98]"
      >
        <Home size={18} />
        Kembali ke Beranda
      </m.button>
    </div>
  );
}
