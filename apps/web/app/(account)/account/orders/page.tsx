'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { m } from 'framer-motion';
import { ArrowLeft, Package, Loader2 } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getUserOrders } from '@/lib/services/order-client';
import { toast } from 'sonner';

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

  const { mutate: handlePay, isPending: isPaying } = useMutation({
    mutationFn: async (orderId: string) => {
      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menyiapkan pembayaran');
      return data.invoice_url;
    },
    onSuccess: (url) => {
      if (url) {
        window.location.href = url;
      }
    },
    onError: (err: Error) => {
      toast.error(err.message);
    }
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
                  className="group relative rounded-[24px] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-stone-2 active:scale-[0.99] transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex flex-col">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-ink-4">
                        {new Intl.DateTimeFormat('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        }).format(new Date(order.created_at || new Date()))}
                      </p>
                      <p className="mt-0.5 font-heading text-[13px] font-extrabold text-ink">
                        {order.order_number}
                      </p>
                    </div>
                    <span
                      className="shrink-0 rounded-full px-3 py-1 text-[11px] font-extrabold"
                      style={{ background: st.bg, color: st.text }}
                    >
                      {STATUS_LABEL[order.status]}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-stone-2 border border-stone-2">
                      {order.order_items?.[0]?.products?.product_images?.[0]?.url ? (
                        <Image
                          src={order.order_items[0].products.product_images[0].url}
                          alt={order.order_items[0].products.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-ink-4">
                          <Package size={24} />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-heading text-[15px] font-extrabold leading-tight text-ink line-clamp-1">
                        {itemsSummary || 'Produk Pawvels'}
                      </p>
                      <p className="mt-1 text-[11px] font-bold text-ink-4">
                        Total Pesanan
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-heading text-[15px] font-extrabold text-primary whitespace-nowrap">
                        {formatPrice(order.total)}
                      </p>
                    </div>
                  </div>

                  {order.status === 'pending' && (
                    <button 
                      onClick={() => handlePay(order.id)}
                      disabled={isPaying}
                      className="mt-5 w-full rounded-[14px] bg-primary py-2.5 text-[13px] font-extrabold text-white shadow-md active:scale-95 transition-all disabled:opacity-50"
                    >
                      {isPaying ? <Loader2 className="mx-auto animate-spin" size={18} /> : 'Bayar Sekarang'}
                    </button>
                  )}

                  {order.status === 'shipped' && (
                    <button className="mt-5 w-full rounded-[14px] bg-stone-2 py-2.5 text-[13px] font-extrabold text-ink hover:bg-stone-3 transition-colors">
                      Lacak Pengiriman
                    </button>
                  )}
                </m.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
