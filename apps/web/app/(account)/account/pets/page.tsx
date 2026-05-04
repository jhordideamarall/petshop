'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { m, AnimatePresence } from 'framer-motion';
import { ArrowLeft, PawPrint, Plus, Loader2, Pencil, Trash2, X, Check } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserPets, addPet, updatePet, deletePet } from '@/lib/services/pet-client';
import { toast } from 'sonner';
import type { Pet } from '@/lib/services/pet-client';

const TYPE_EMOJI: Record<string, string> = {
  dog: '🐶',
  cat: '🐱',
  bird: '🐦',
  rabbit: '🐰',
  other: '🐾',
};
const PET_TYPES = [
  { value: 'dog', label: 'Anjing', emoji: '🐶' },
  { value: 'cat', label: 'Kucing', emoji: '🐱' },
  { value: 'bird', label: 'Burung', emoji: '🐦' },
  { value: 'rabbit', label: 'Kelinci', emoji: '🐰' },
  { value: 'other', label: 'Lainnya', emoji: '🐾' },
];

interface PetForm {
  name: string;
  type: string;
  breed: string;
  birth_date: string;
  weight_kg: string;
  notes: string;
}

const EMPTY_FORM: PetForm = {
  name: '',
  type: 'dog',
  breed: '',
  birth_date: '',
  weight_kg: '',
  notes: '',
};

export default function PetsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [form, setForm] = useState<PetForm>(EMPTY_FORM);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: pets = [], isLoading } = useQuery({
    queryKey: ['pets'],
    queryFn: getUserPets,
  });

  const addMutation = useMutation({
    mutationFn: (data: PetForm) =>
      addPet({
        name: data.name,
        type: data.type as Pet['type'],
        breed: data.breed || null,
        birth_date: data.birth_date || null,
        weight_kg: data.weight_kg ? parseFloat(data.weight_kg) : null,
        notes: data.notes || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets'] });
      toast.success('Hewan berhasil ditambahkan');
      closeModal();
    },
    onError: () => toast.error('Gagal menambahkan hewan'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: PetForm }) =>
      updatePet(id, {
        name: data.name,
        type: data.type as Pet['type'],
        breed: data.breed || null,
        birth_date: data.birth_date || null,
        weight_kg: data.weight_kg ? parseFloat(data.weight_kg) : null,
        notes: data.notes || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets'] });
      toast.success('Data hewan berhasil diperbarui');
      closeModal();
    },
    onError: () => toast.error('Gagal memperbarui data hewan'),
  });

  const deleteMutation = useMutation({
    mutationFn: deletePet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets'] });
      toast.success('Hewan berhasil dihapus');
      setDeletingId(null);
    },
    onError: () => toast.error('Gagal menghapus hewan'),
  });

  const openAdd = () => {
    setEditingPet(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (pet: Pet) => {
    setEditingPet(pet);
    setForm({
      name: pet.name,
      type: pet.type,
      breed: pet.breed || '',
      birth_date: pet.birth_date || '',
      weight_kg: pet.weight_kg?.toString() || '',
      notes: pet.notes || '',
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingPet(null);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = () => {
    if (!form.name.trim()) {
      toast.error('Nama hewan wajib diisi');
      return;
    }
    if (editingPet) {
      updateMutation.mutate({ id: editingPet.id, data: form });
    } else {
      addMutation.mutate(form);
    }
  };

  const isPending = addMutation.isPending || updateMutation.isPending;

  return (
    <div className="bg-[#FDFCFB]">
      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <>
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            />
            <m.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 60 }}
              transition={{ type: 'spring', damping: 24, stiffness: 280 }}
              className="fixed bottom-0 left-1/2 z-50 w-full max-w-[430px] -translate-x-1/2 rounded-t-[28px] bg-white pt-5 shadow-2xl"
            >
              {/* Header - tidak ikut scroll */}
              <div className="mb-4 flex items-center justify-between px-5">
                <h2 className="font-heading text-[18px] font-extrabold text-ink">
                  {editingPet ? 'Edit Hewan' : 'Tambah Hewan'}
                </h2>
                <button type="button" onClick={closeModal} className="text-ink-3">
                  <X size={22} />
                </button>
              </div>

              {/* Konten scroll */}
              <div
                className="overflow-y-auto pb-[max(100px,calc(88px+env(safe-area-inset-bottom)))]"
                style={{ maxHeight: '70dvh' }}
              >
                {/* Type selector - full bleed scroll agar tidak terpotong */}
                <div className="mb-4 -mx-0 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {PET_TYPES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setForm({ ...form, type: t.value })}
                      className={`flex shrink-0 flex-col items-center gap-1 rounded-[16px] px-3.5 py-2.5 text-[12px] font-bold transition-all ${
                        form.type === t.value
                          ? 'bg-primary text-white shadow-[0_4px_12px_rgba(224,123,57,0.3)]'
                          : 'bg-stone text-ink-3'
                      }`}
                    >
                      <span className="text-[20px]">{t.emoji}</span>
                      {t.label}
                    </button>
                  ))}
                </div>

                <div className="flex flex-col gap-3 px-5">
                  <div>
                    <label className="mb-1 block text-[12px] font-bold text-ink-3">Nama *</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Nama anabul"
                      className="h-12 w-full rounded-[14px] border border-stone-2 bg-stone/30 px-4 text-[14px] font-semibold text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[12px] font-bold text-ink-3">Ras</label>
                    <input
                      type="text"
                      value={form.breed}
                      onChange={(e) => setForm({ ...form, breed: e.target.value })}
                      placeholder="Misal: Golden Retriever"
                      className="h-12 w-full rounded-[14px] border border-stone-2 bg-stone/30 px-4 text-[14px] font-semibold text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-[12px] font-bold text-ink-3">
                        Tanggal Lahir
                      </label>
                      <input
                        type="date"
                        value={form.birth_date}
                        onChange={(e) => setForm({ ...form, birth_date: e.target.value })}
                        className="h-12 w-full rounded-[14px] border border-stone-2 bg-stone/30 px-4 text-[13px] font-semibold text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[12px] font-bold text-ink-3">
                        Berat (kg)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={form.weight_kg}
                        onChange={(e) => setForm({ ...form, weight_kg: e.target.value })}
                        placeholder="0.0"
                        className="h-12 w-full rounded-[14px] border border-stone-2 bg-stone/30 px-4 text-[14px] font-semibold text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-[12px] font-bold text-ink-3">Catatan</label>
                    <textarea
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      placeholder="Alergi, kondisi khusus, dll."
                      rows={2}
                      className="w-full rounded-[14px] border border-stone-2 bg-stone/30 px-4 py-3 text-[14px] font-semibold text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 resize-none"
                    />
                  </div>
                </div>
              </div>
              {/* end scroll */}

              {/* Tombol submit — di atas bottom nav (nav tingginya ~88px) */}
              <div className="px-5 pb-[calc(88px+env(safe-area-inset-bottom)+8px)] pt-3 border-t border-stone-2 bg-white">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isPending}
                  className="flex h-13 w-full items-center justify-center gap-2 rounded-[16px] bg-primary font-heading text-[15px] font-extrabold text-white shadow-[0_6px_18px_rgba(224,123,57,0.28)] disabled:opacity-50 active:scale-[0.98]"
                  style={{ transition: 'transform 0.1s' }}
                >
                  {isPending ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <>
                      <Check size={16} strokeWidth={2.5} />
                      {editingPet ? 'Simpan Perubahan' : 'Tambah Hewan'}
                    </>
                  )}
                </button>
              </div>
            </m.div>
          </>
        )}
      </AnimatePresence>

      {/* Confirm delete overlay */}
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
              <p className="font-heading text-[17px] font-extrabold text-ink">Hapus hewan ini?</p>
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
          <h1 className="font-heading text-[22px] font-extrabold text-ink">Hewan Piaraan</h1>
          <button
            type="button"
            onClick={openAdd}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white shadow-[0_4px_14px_rgba(224,123,57,0.35)] active:scale-95 transition-transform"
          >
            <Plus size={18} strokeWidth={2.5} />
          </button>
        </div>
      </header>

      <main className="px-5 py-5">
        {isLoading ? (
          <div className="flex h-[40dvh] items-center justify-center">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : pets.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <PawPrint size={48} className="text-ink-4" />
            <p className="mt-4 font-heading text-[16px] font-extrabold text-ink">Belum ada hewan</p>
            <p className="mt-1 text-[13px] text-ink-3">Tambahkan profil anabul kamu!</p>
            <button
              type="button"
              onClick={openAdd}
              className="mt-5 flex items-center gap-2 rounded-[16px] bg-primary px-5 py-3 font-heading text-[14px] font-extrabold text-white shadow-[0_6px_18px_rgba(224,123,57,0.28)]"
            >
              <Plus size={16} strokeWidth={2.5} />
              Tambah Hewan
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {pets.map((pet: Pet, i: number) => (
              <m.div
                key={pet.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="flex items-center gap-4 rounded-[20px] bg-white p-4 shadow-[0_2px_14px_rgba(0,0,0,0.05)]"
              >
                <div
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] text-[26px]"
                  style={{ background: 'rgba(224, 123, 57, 0.1)' }}
                >
                  {TYPE_EMOJI[pet.type] || '🐾'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-heading text-[17px] font-extrabold text-ink">{pet.name}</p>
                  <p className="text-[13px] font-medium text-ink-3">
                    {pet.breed || 'Campuran'} ·{' '}
                    {pet.birth_date
                      ? `${new Date().getFullYear() - new Date(pet.birth_date).getFullYear()} tahun`
                      : 'Umur tidak diketahui'}
                    {pet.weight_kg ? ` · ${pet.weight_kg} kg` : ''}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEdit(pet)}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-stone text-ink-3 active:scale-90 transition-transform"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingId(pet.id)}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-red-100 bg-red-50 text-red-400 active:scale-90 transition-transform"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </m.div>
            ))}

            <m.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              type="button"
              onClick={openAdd}
              className="flex items-center justify-center gap-2 rounded-[20px] border-2 border-dashed border-stone-2 py-4 font-heading text-[14px] font-bold text-ink-3 active:scale-[0.98]"
              style={{ transition: 'transform 0.1s' }}
            >
              <Plus size={16} />
              Tambah Hewan Baru
            </m.button>
          </div>
        )}
      </main>
    </div>
  );
}
