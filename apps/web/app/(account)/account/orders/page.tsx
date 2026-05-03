'use client';

import { useRouter } from 'next/navigation';
import { m } from 'framer-motion';
import { ArrowLeft, Package } from 'lucide-react';

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

interface Order {
  id: string;
  date: string;
  items: string;
  total: number;
  status: OrderStatus;
}

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'Menunggu Pembayaran',
  processing: 'Diproses',
  shipped: 'Dikirim',
  delivered: 'Selesai',
  cancelled: 'Dibatalkan',
};

const STATUS_COLOR: Record<OrderStatus, { bg: string; text: string }> = {
  pending: { bg: '#FFF3E8', text: '#E07B39' },
  processing: { bg: '#EEF2FF', text: '#6C5CE7' },
  shipped: { bg: '#EAF6FF', text: '#0288D1' },
  delivered: { bg: '#F0FBF4', text: '#2D7D52' },
  cancelled: { bg: '#FFF0F0', text: '#E53935' },
};

const DUMMY_ORDERS: Order[] = [
  {
    id: 'ORD-20260428-3812',
    date: '28 Apr 2026',
    items: 'Royal Canin Medium Adult · Snack Grain Free',
    total: 320000,
    status: 'delivered',
  },
  {
    id: 'ORD-20260415-7204',
    date: '15 Apr 2026',
    items: 'Tali Kekang Kulit Premium',
    total: 185000,
    status: 'delivered',
  },
  {
    id: 'ORD-20260502-1056',
    date: '2 Mei 2026',
    items: 'Vitamin C Kucing · Tempat Minum Otomatis',
    total: 275000,
    status: 'shipped',
  },
  {
    id: 'ORD-20260503-4491',
    date: '3 Mei 2026',
    items: 'Dry Food Grain Free 5kg',
    total: 430000,
    status: 'processing',
  },
];

function formatPrice(v: number) {
  return `Rp ${v.toLocaleString('id-ID')}`;
}

export default function OrdersPage() {
  const router = useRouter();

  return (
    <div className="bg-[#FDFCFB]">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-stone-2 bg-[#FDFCFB]/90 px-5 pb-4 pt-[max(18px,env(safe-area-inset-top))] backdrop-blur-xl">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm font-semibold text-ink-3"
        >
          <ArrowLeft size={18} />
          Kembali
        </button>
        <h1 className="mt-3 font-heading text-[22px] font-extrabold text-ink">Pesanan Saya</h1>
      </header>

      <main className="px-5 py-5">
        {DUMMY_ORDERS.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <Package size={48} className="text-ink-4" />
            <p className="mt-4 font-heading text-[16px] font-extrabold text-ink">
              Belum ada pesanan
            </p>
            <p className="mt-1 text-[13px] text-ink-3">Yuk mulai belanja produk favoritmu!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {DUMMY_ORDERS.map((order, i) => {
              const st = STATUS_COLOR[order.status];
              return (
                <m.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="rounded-[20px] bg-white p-4 shadow-[0_2px_14px_rgba(0,0,0,0.05)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-heading text-[13px] font-bold text-ink-3">{order.id}</p>
                    <span
                      className="shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold"
                      style={{ background: st.bg, color: st.text }}
                    >
                      {STATUS_LABEL[order.status]}
                    </span>
                  </div>
                  <p className="mt-2 text-[14px] font-semibold leading-5 text-ink">{order.items}</p>
                  <div className="mt-3 flex items-center justify-between border-t border-stone-2 pt-3">
                    <p className="text-[12px] font-medium text-ink-4">{order.date}</p>
                    <p className="font-heading text-[15px] font-extrabold text-primary">
                      {formatPrice(order.total)}
                    </p>
                  </div>
                </m.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
