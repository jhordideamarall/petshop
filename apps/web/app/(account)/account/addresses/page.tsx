'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { m } from 'framer-motion';
import { ArrowLeft, MapPin, Plus, Trash2, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserAddresses, setDefaultAddress, deleteAddress } from '@/lib/services/address-client';
import { AddressSheet } from '@/components/checkout/address-sheet';
import { toast } from 'sonner';

export default function AddressesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const { data: addresses = [], isLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: getUserAddresses,
  });

  const setDefaultMutation = useMutation({
    mutationFn: setDefaultAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast.success('Alamat utama berhasil diubah');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal mengubah alamat utama');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast.success('Alamat berhasil dihapus');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal menghapus alamat');
    },
  });

  return (
    <div className="bg-[#FDFCFB] min-h-screen">
      <AddressSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['addresses'] });
          setIsSheetOpen(false);
        }}
      />

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
            onClick={() => setIsSheetOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white shadow-[0_4px_14px_rgba(224,123,57,0.35)] active:scale-95 transition-transform"
          >
            <Plus size={18} strokeWidth={2.5} />
          </button>
        </div>
      </header>

      <main className="px-5 py-5 pb-safe">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : addresses.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <MapPin size={48} className="text-ink-4" />
            <p className="mt-4 font-heading text-[16px] font-extrabold text-ink">
              Belum ada alamat
            </p>
            <p className="mt-1 text-[13px] text-ink-3">Tambahkan alamat pengirimanmu.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {addresses.map(
              (
                addr: any,
                i: number, // eslint-disable-line @typescript-eslint/no-explicit-any
              ) => (
                <m.div
                  key={addr.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="rounded-[20px] bg-white p-4 shadow-[0_2px_14px_rgba(0,0,0,0.05)] border border-stone-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-primary" />
                      <span className="font-heading text-[14px] font-extrabold text-ink">
                        {addr.label || 'Rumah'}
                      </span>
                    </div>
                    {addr.is_default && (
                      <span className="rounded-full bg-[#FFF3E8] px-2.5 py-0.5 text-[11px] font-bold text-primary">
                        Utama
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-[14px] font-semibold text-ink">{addr.recipient_name}</p>
                  <p className="text-[13px] font-medium text-ink-3">{addr.phone}</p>
                  <p className="mt-1.5 text-[13px] leading-5 text-ink-3">
                    {addr.full_address}
                    <br />
                    {addr.district}, {addr.city} {addr.postal_code}
                  </p>

                  <div className="mt-4 flex gap-2">
                    {!addr.is_default && (
                      <button
                        type="button"
                        onClick={() => setDefaultMutation.mutate(addr.id)}
                        disabled={setDefaultMutation.isPending}
                        className="flex-1 rounded-[12px] border border-stone-2 bg-stone/30 px-3.5 py-2 text-[12px] font-bold text-ink active:scale-[0.97] transition-transform disabled:opacity-50"
                      >
                        Jadikan Utama
                      </button>
                    )}
                    {!addr.is_default && (
                      <button
                        type="button"
                        onClick={() => deleteMutation.mutate(addr.id)}
                        disabled={deleteMutation.isPending}
                        className="flex items-center justify-center rounded-[12px] border border-red-100 bg-red-50/50 px-3 text-red-500 active:scale-[0.97] transition-transform disabled:opacity-50"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </m.div>
              ),
            )}

            {/* Add new */}
            <m.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.18 }}
              onClick={() => setIsSheetOpen(true)}
              type="button"
              className="mt-2 flex items-center justify-center gap-2 rounded-[20px] border-2 border-dashed border-stone-2 py-4 font-heading text-[14px] font-bold text-ink-3 hover:bg-stone/50 active:scale-[0.98] transition-all"
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
