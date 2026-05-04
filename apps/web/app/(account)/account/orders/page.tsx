'use client';

import { useRouter } from 'next/navigation';
import { m } from 'framer-motion';
import { ArrowLeft, Package, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getUserOrders } from '@/lib/services/order-client';

const STATUS_LABEL: Record<string, string> = {
  pending: 'Menunggu Pembayaran',
  paid: 'Sudah Dibayar',
  processing: 'Diproses',
  shipped: 'Dikirim',
  delivered: 'Selesai',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
  expired: 'Kedaluwarsa',
  returned: 'Dikembalikan',
  refunded: 'Dikembalikan',
};

const STATUS_COLOR: Record<string, { bg: string; text: string }> = {
  pending: { bg: '#FFF3E8', text: '#E07B39' },
  paid: { bg: '#F0FBF4', text: '#2D7D52' },
  processing: { bg: '#EEF2FF', text: '#6C5CE7' },
  shipped: { bg: '#EAF6FF', text: '#0288D1' },
  delivered: { bg: '#F0FBF4', text: '#2D7D52' },
  completed: { bg: '#F0FBF4', text: '#2D7D52' },
  cancelled: { bg: '#FFF0F0', text: '#E53935' },
  expired: { bg: '#FFF0F0', text: '#E53935' },
  returned: { bg: '#F5F5F5', text: '#616161' },
};

function formatPrice(v: number) {
  return `Rp ${v.toLocaleString('id-ID')}`;
}

export default function OrdersPage() {
  const router = useRouter();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: getUserOrders,
  });

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
        {isLoading ? (
          <div className="flex h-[40dvh] items-center justify-center">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <Package size={48} className="text-ink-4" />
            <p className="mt-4 font-heading text-[16px] font-extrabold text-ink">
              Belum ada pesanan
            </p>
            <p className="mt-1 text-[13px] text-ink-3">Ayo belanja dan kumpulkan poin!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {orders.map((order, i) => {
              const st = STATUS_COLOR[order.status] || STATUS_COLOR.pending;
              const itemsSummary = order.order_items
                .map((item: { products?: { name: string } }) => item.products?.name)
                .filter(Boolean)
                .join(' · ');

              return (
                <m.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="rounded-[20px] bg-white p-4 shadow-[0_2px_14px_rgba(0,0,0,0.05)] active:scale-[0.99]"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-heading text-[13px] font-bold text-ink-3">
                      {order.order_number}
                    </p>
                    <span
                      className="shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold"
                      style={{ background: st.bg, color: st.text }}
                    >
                      {STATUS_LABEL[order.status]}
                    </span>
                  </div>
                  <p className="mt-2 text-[14px] font-semibold leading-5 text-ink">
                    {itemsSummary || 'Produk tidak dikenal'}
                  </p>
                  <div className="mt-3 flex items-center justify-between border-t border-stone-2 pt-3">
                    <p className="text-[12px] font-medium text-ink-4">
                      {new Intl.DateTimeFormat('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      }).format(new Date(order.created_at || new Date()))}
                    </p>
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
