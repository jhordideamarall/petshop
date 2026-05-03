'use client';

import { useRouter } from 'next/navigation';
import { m } from 'framer-motion';
import { ArrowLeft, PawPrint, Plus } from 'lucide-react';

interface Pet {
  id: string;
  name: string;
  breed: string;
  age: string;
  type: 'dog' | 'cat';
  color: string;
}

const DUMMY_PETS: Pet[] = [
  {
    id: 'milo',
    name: 'Milo',
    breed: 'Golden Retriever',
    age: '3 tahun',
    type: 'dog',
    color: '#F4A261',
  },
  {
    id: 'luna',
    name: 'Luna',
    breed: 'Persian Cat',
    age: '2 tahun',
    type: 'cat',
    color: '#6C5CE7',
  },
];

const TYPE_EMOJI: Record<string, string> = { dog: '🐶', cat: '🐱' };

export default function PetsPage() {
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
          <h1 className="font-heading text-[22px] font-extrabold text-ink">Hewan Piaraan</h1>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white shadow-[0_4px_14px_rgba(224,123,57,0.35)] active:scale-95"
          >
            <Plus size={18} strokeWidth={2.5} />
          </button>
        </div>
      </header>

      <main className="px-5 py-5">
        {DUMMY_PETS.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <PawPrint size={48} className="text-ink-4" />
            <p className="mt-4 font-heading text-[16px] font-extrabold text-ink">Belum ada hewan</p>
            <p className="mt-1 text-[13px] text-ink-3">Tambahkan profil anabul kamu!</p>
            <button
              type="button"
              className="mt-5 flex items-center gap-2 rounded-[16px] bg-primary px-5 py-3 font-heading text-[14px] font-extrabold text-white shadow-[0_6px_18px_rgba(224,123,57,0.28)]"
            >
              <Plus size={16} strokeWidth={2.5} />
              Tambah Hewan
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {DUMMY_PETS.map((pet, i) => (
              <m.div
                key={pet.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="flex items-center gap-4 rounded-[20px] bg-white p-4 shadow-[0_2px_14px_rgba(0,0,0,0.05)] active:scale-[0.98]"
                style={{ transition: 'transform 0.1s' }}
              >
                <div
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] text-[26px]"
                  style={{ background: pet.color + '18' }}
                >
                  {TYPE_EMOJI[pet.type]}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-heading text-[17px] font-extrabold text-ink">{pet.name}</p>
                  <p className="text-[13px] font-medium text-ink-3">
                    {pet.breed} · {pet.age}
                  </p>
                </div>
                <div className="h-2 w-2 rounded-full" style={{ background: pet.color }} />
              </m.div>
            ))}

            {/* Add new */}
            <m.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              type="button"
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
