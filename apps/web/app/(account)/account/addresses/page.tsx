'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { m, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MapPin, Plus, Trash2, Loader2, Pencil, X, Check, Star } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getUserAddresses,
  setDefaultAddress,
  deleteAddress,
  updateAddress,
  type Address,
} from '@/lib/services/address-client';
import { AddressSheet } from '@/components/checkout/address-sheet';
import { toast } from 'sonner';

interface EditForm {
  label: string;
  recipient_name: string;
  phone: string;
  full_address: string;
  city: string;
  district: string;
  postal_code: string;
  is_default: boolean;
}

const LABELS = ['Rumah', 'Kantor', 'Kos', 'Lainnya'];

export default function AddressesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
    onError: () => toast.error('Gagal mengubah alamat utama'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, fields }: { id: string; fields: Partial<EditForm> }) =>
      updateAddress(id, fields),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast.success('Alamat berhasil diperbarui');
      setEditingAddress(null);
      setEditForm(null);
    },
    onError: () => toast.error('Gagal memperbarui alamat'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast.success('Alamat berhasil dihapus');
      setDeletingId(null);
    },
    onError: () => toast.error('Gagal menghapus alamat'),
  });

  const openEdit = (addr: Address) => {
    setEditingAddress(addr);
    setEditForm({
      label: addr.label || 'Rumah',
      recipient_name: addr.recipient_name || '',
      phone: addr.phone || '',
      full_address: addr.full_address || '',
      city: addr.city || '',
      district: addr.district || '',
      postal_code: addr.postal_code || '',
      is_default: addr.is_default || false,
    });
  };

  const closeEdit = () => {
    setEditingAddress(null);
    setEditForm(null);
  };

  const handleSaveEdit = () => {
    if (!editingAddress || !editForm) return;
    if (!editForm.recipient_name.trim()) {
      toast.error('Nama penerima wajib diisi');
      return;
    }
    updateMutation.mutate({ id: editingAddress.id, fields: editForm });
  };

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

      {/* Edit Modal */}
      <AnimatePresence>
        {editingAddress && editForm && (
          <>
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeEdit}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            />
            <m.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 60 }}
              transition={{ type: 'spring', damping: 24, stiffness: 280 }}
              className="fixed bottom-0 left-1/2 z-50 w-full max-w-[430px] -translate-x-1/2 rounded-t-[28px] bg-white pt-5 shadow-2xl"
            >
              {/* Header */}
              <div className="mb-4 flex items-center justify-between px-5">
                <h2 className="font-heading text-[18px] font-extrabold text-ink">Edit Alamat</h2>
                <button type="button" onClick={closeEdit} className="text-ink-3">
                  <X size={22} />
                </button>
              </div>

              {/* Scroll content */}
              <div
                className="overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                style={{ maxHeight: '65dvh' }}
              >
                <div className="flex flex-col gap-3 px-5 pb-3">
                  {/* Label chips */}
                  <div>
                    <label className="mb-1.5 block text-[12px] font-bold text-ink-3">Label</label>
                    <div className="flex gap-2">
                      {LABELS.map((l) => (
                        <button
                          key={l}
                          type="button"
                          onClick={() => setEditForm({ ...editForm, label: l })}
                          className={`rounded-[12px] px-3.5 py-2 text-[13px] font-bold transition-all ${
                            editForm.label === l
                              ? 'bg-primary text-white shadow-[0_3px_10px_rgba(224,123,57,0.25)]'
                              : 'bg-stone text-ink-3'
                          }`}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-[12px] font-bold text-ink-3">
                      Nama Penerima *
                    </label>
                    <input
                      type="text"
                      value={editForm.recipient_name}
                      onChange={(e) => setEditForm({ ...editForm, recipient_name: e.target.value })}
                      className="h-12 w-full rounded-[14px] border border-stone-2 bg-stone/30 px-4 text-[14px] font-semibold text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-[12px] font-bold text-ink-3">No. HP</label>
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="h-12 w-full rounded-[14px] border border-stone-2 bg-stone/30 px-4 text-[14px] font-semibold text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-[12px] font-bold text-ink-3">
                      Alamat Lengkap
                    </label>
                    <textarea
                      value={editForm.full_address}
                      onChange={(e) => setEditForm({ ...editForm, full_address: e.target.value })}
                      rows={2}
                      className="w-full rounded-[14px] border border-stone-2 bg-stone/30 px-4 py-3 text-[14px] font-semibold text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-[12px] font-bold text-ink-3">Kota</label>
                      <input
                        type="text"
                        value={editForm.city}
                        onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                        className="h-12 w-full rounded-[14px] border border-stone-2 bg-stone/30 px-4 text-[13px] font-semibold text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[12px] font-bold text-ink-3">
                        Kode Pos
                      </label>
                      <input
                        type="text"
                        value={editForm.postal_code}
                        onChange={(e) => setEditForm({ ...editForm, postal_code: e.target.value })}
                        className="h-12 w-full rounded-[14px] border border-stone-2 bg-stone/30 px-4 text-[13px] font-semibold text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                      />
                    </div>
                  </div>

                  {/* Set as default toggle */}
                  <button
                    type="button"
                    onClick={() => setEditForm({ ...editForm, is_default: !editForm.is_default })}
                    className={`flex items-center gap-3 rounded-[16px] border px-4 py-3.5 transition-all ${
                      editForm.is_default
                        ? 'border-primary/30 bg-[#FFF3E8]'
                        : 'border-stone-2 bg-stone/20'
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${
                        editForm.is_default ? 'bg-primary text-white' : 'bg-stone text-ink-4'
                      }`}
                    >
                      <Star size={15} fill={editForm.is_default ? 'white' : 'none'} />
                    </div>
                    <div className="text-left">
                      <p className="font-heading text-[14px] font-bold text-ink">
                        Jadikan Alamat Utama
                      </p>
                      <p className="text-[12px] font-medium text-ink-3">
                        {editForm.is_default
                          ? 'Ini akan jadi alamat utama'
                          : 'Aktifkan sebagai alamat utama'}
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Submit button — di atas bottom nav */}
              <div className="px-5 pb-[calc(88px+env(safe-area-inset-bottom)+8px)] pt-3 border-t border-stone-2 bg-white">
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={updateMutation.isPending}
                  className="flex h-13 w-full items-center justify-center gap-2 rounded-[16px] bg-primary font-heading text-[15px] font-extrabold text-white shadow-[0_6px_18px_rgba(224,123,57,0.28)] disabled:opacity-50 active:scale-[0.98]"
                  style={{ transition: 'transform 0.1s' }}
                >
                  {updateMutation.isPending ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <>
                      <Check size={16} strokeWidth={2.5} />
                      Simpan Perubahan
                    </>
                  )}
                </button>
              </div>
            </m.div>
          </>
        )}
      </AnimatePresence>

      {/* Confirm delete */}
      <AnimatePresence>
        {deletingId && (
          <>
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeletingId(null)}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            />
            <m.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed left-1/2 top-1/2 z-50 w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-[24px] bg-white p-6 shadow-2xl"
            >
              <p className="font-heading text-[17px] font-extrabold text-ink">Hapus alamat ini?</p>
              <p className="mt-1 text-[13px] text-ink-3">Tindakan ini tidak dapat dibatalkan.</p>
              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={() => setDeletingId(null)}
                  className="flex-1 rounded-[14px] border border-stone-2 py-3 font-heading text-[14px] font-bold text-ink-3"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => deleteMutation.mutate(deletingId)}
                  disabled={deleteMutation.isPending}
                  className="flex-1 rounded-[14px] bg-red-500 py-3 font-heading text-[14px] font-bold text-white disabled:opacity-50"
                >
                  {deleteMutation.isPending ? (
                    <Loader2 className="animate-spin mx-auto" size={16} />
                  ) : (
                    'Hapus'
                  )}
                </button>
              </div>
            </m.div>
          </>
        )}
      </AnimatePresence>

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

      <main className="px-5 py-5 pb-32">
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
            <button
              type="button"
              onClick={() => setIsSheetOpen(true)}
              className="mt-5 flex items-center gap-2 rounded-[16px] bg-primary px-5 py-3 font-heading text-[14px] font-extrabold text-white shadow-[0_6px_18px_rgba(224,123,57,0.28)]"
            >
              <Plus size={16} strokeWidth={2.5} />
              Tambah Alamat
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {addresses.map((addr: Address, i: number) => (
              <m.div
                key={addr.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className={`rounded-[20px] bg-white p-4 shadow-[0_2px_14px_rgba(0,0,0,0.05)] border ${
                  addr.is_default ? 'border-primary/30' : 'border-stone-2'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="mt-0.5 shrink-0 text-primary" />
                    <span className="font-heading text-[14px] font-extrabold text-ink">
                      {addr.label || 'Rumah'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {addr.is_default && (
                      <span className="flex items-center gap-1 rounded-full bg-[#FFF3E8] px-2.5 py-0.5 text-[11px] font-bold text-primary">
                        <Star size={9} fill="#E07B39" strokeWidth={0} />
                        Utama
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => openEdit(addr)}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-stone text-ink-3 active:scale-90 transition-transform"
                    >
                      <Pencil size={13} />
                    </button>
                    {!addr.is_default && (
                      <button
                        type="button"
                        onClick={() => setDeletingId(addr.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-red-100 bg-red-50 text-red-400 active:scale-90 transition-transform"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>

                <p className="mt-2 text-[14px] font-semibold text-ink">{addr.recipient_name}</p>
                <p className="text-[13px] font-medium text-ink-3">{addr.phone}</p>
                <p className="mt-1.5 text-[13px] leading-5 text-ink-3">
                  {addr.full_address}
                  {addr.district || addr.city ? (
                    <>
                      <br />
                      {[addr.district, addr.city, addr.postal_code].filter(Boolean).join(', ')}
                    </>
                  ) : null}
                </p>

                {!addr.is_default && (
                  <button
                    type="button"
                    onClick={() => setDefaultMutation.mutate(addr.id)}
                    disabled={setDefaultMutation.isPending}
                    className="mt-3.5 flex w-full items-center justify-center gap-1.5 rounded-[12px] border border-stone-2 bg-stone/30 py-2.5 font-heading text-[12px] font-bold text-ink-3 active:scale-[0.97] transition-transform disabled:opacity-50"
                  >
                    <Star size={12} />
                    Jadikan Alamat Utama
                  </button>
                )}
              </m.div>
            ))}

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
