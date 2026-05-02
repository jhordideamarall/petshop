'use client';
import Link from 'next/link';
import { TopBar } from '@/components/layout/top-bar';

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
  </svg>
);

const MOCK_CART = [
  { id: 1, name: 'Royal Canin Indoor 2kg', price: 285000, qty: 1, color: '#F8BBD0', label: 'RC' },
  { id: 2, name: 'Pasir Kucing Wangi 5L', price: 65000, qty: 2, color: '#C8E6C9', label: 'PK' },
];

export default function CartPage() {
  return (
    <div className="flex min-h-screen flex-col bg-stone">
      <TopBar title="Keranjang" />

      <div className="flex-1 p-4">
        <div className="flex flex-col gap-3">
          {MOCK_CART.map((item) => (
            <div key={item.id} className="flex gap-4 rounded-2xl bg-white p-4 shadow-sm">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-xl font-heading text-xs font-bold"
                style={{ background: item.color + '40', color: item.color }}
              >
                {item.label}
              </div>
              <div className="flex flex-1 flex-col justify-between py-0.5">
                <div>
                  <h3 className="font-heading text-sm font-bold text-ink line-clamp-1">
                    {item.name}
                  </h3>
                  <p className="t-price-sm mt-1">Rp {item.price.toLocaleString('id-ID')}</p>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="qty-stepper">
                    <button className="qty-btn">−</button>
                    <span className="qty-val">{item.qty}</span>
                    <button className="qty-btn">+</button>
                  </div>
                  <button className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-4 hover:bg-danger-bg hover:text-danger transition-colors">
                    <TrashIcon />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state placeholder for empty cart */}
        {MOCK_CART.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="t-label text-ink-4">Keranjangmu masih kosong</p>
          </div>
        )}
      </div>

      {/* Summary sticky bottom */}
      <div className="sticky bottom-0 rounded-t-3xl border-t border-stone-2 bg-white p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <span className="t-label">Total Pembayaran</span>
          <span className="font-heading text-lg font-extrabold text-primary">Rp 415.000</span>
        </div>
        <Link
          href="/checkout"
          className="flex w-full items-center justify-center rounded-xl bg-primary py-4 font-heading text-sm font-bold text-white shadow-md active:scale-95 transition-transform"
        >
          Checkout
        </Link>
        <div className="safe-bottom" />
      </div>
    </div>
  );
}
