'use client';

import { useRouter } from 'next/navigation';
import { m } from 'framer-motion';
import { ArrowLeft, MapPin, Plus } from 'lucide-react';

interface Address {
  id: string;
  label: string;
  recipient: string;
  phone: string;
  street: string;
  city: string;
  isDefault: boolean;
}

const DUMMY_ADDRESSES: Address[] = [
  {
    id: 'home',
    label: 'Rumah',
    recipient: 'Jhordi Deamarall',
    phone: '0812-3456-7890',
    street: 'Jl. Kemang Raya No. 12, RT 03/05',
    city: 'Jakarta Selatan, DKI Jakarta 12730',
    isDefault: true,
  },
  {
    id: 'office',
    label: 'Kantor',
    recipient: 'Jhordi D.',
    phone: '0812-3456-7890',
    street: 'Gedung Graha Pos Lt. 7, Jl. Lapangan Banteng 2',
    city: 'Jakarta Pusat, DKI Jakarta 10710',
    isDefault: false,
  },
];

export default function AddressesPage() {
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
        <div className="mt-3 flex items-center justify-between">
          <h1 className="font-heading text-[22px] font-extrabold text-ink">Alamat</h1>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white shadow-[0_4px_14px_rgba(224,123,57,0.35)] active:scale-95"
          >
            <Plus size={18} strokeWidth={2.5} />
          </button>
        </div>
      </header>

      <main className="px-5 py-5">
        {DUMMY_ADDRESSES.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <MapPin size={48} className="text-ink-4" />
            <p className="mt-4 font-heading text-[16px] font-extrabold text-ink">
              Belum ada alamat
            </p>
            <p className="mt-1 text-[13px] text-ink-3">Tambahkan alamat pengirimanmu.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {DUMMY_ADDRESSES.map((addr, i) => (
              <m.div
                key={addr.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="rounded-[20px] bg-white p-4 shadow-[0_2px_14px_rgba(0,0,0,0.05)]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-primary" />
                    <span className="font-heading text-[14px] font-extrabold text-ink">
                      {addr.label}
                    </span>
                  </div>
                  {addr.isDefault && (
                    <span className="rounded-full bg-[#FFF3E8] px-2.5 py-0.5 text-[11px] font-bold text-primary">
                      Utama
                    </span>
                  )}
                </div>
                <p className="mt-2 text-[14px] font-semibold text-ink">{addr.recipient}</p>
                <p className="text-[13px] font-medium text-ink-3">{addr.phone}</p>
                <p className="mt-1.5 text-[13px] leading-5 text-ink-3">
                  {addr.street}
                  <br />
                  {addr.city}
                </p>
                {!addr.isDefault && (
                  <button
                    type="button"
                    className="mt-3 rounded-[12px] border border-stone-2 px-3.5 py-1.5 text-[12px] font-bold text-ink-3 active:scale-[0.97]"
                    style={{ transition: 'transform 0.1s' }}
                  >
                    Jadikan Utama
                  </button>
                )}
              </m.div>
            ))}

            {/* Add new */}
            <m.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.18 }}
              type="button"
              className="flex items-center justify-center gap-2 rounded-[20px] border-2 border-dashed border-stone-2 py-4 font-heading text-[14px] font-bold text-ink-3 active:scale-[0.98]"
              style={{ transition: 'transform 0.1s' }}
            >
              <Plus size={16} />
              Tambah Alamat Baru
            </m.button>
          </div>
        )}
      </main>
    </div>
  );
}
