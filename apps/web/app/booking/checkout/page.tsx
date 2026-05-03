'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { m } from 'framer-motion';
import { ArrowLeft, CalendarDays, Check, Clock3, PawPrint, ShieldCheck } from 'lucide-react';

type PetType = 'dog' | 'cat' | 'other';

interface BookingDraft {
  serviceId: string;
  dateId: string;
  timeId: string;
  petId: string;
  notes: string;
}

const SERVICE_INFO: Record<
  string,
  { name: string; price: number; accent: string; isHotel: boolean; duration: string }
> = {
  'grooming-basic': {
    name: 'Grooming Basic',
    price: 85000,
    accent: '#E07B39',
    isHotel: false,
    duration: '1 jam',
  },
  'grooming-full': {
    name: 'Grooming Full',
    price: 150000,
    accent: '#2D7D52',
    isHotel: false,
    duration: '2 jam',
  },
  'pet-hotel': {
    name: 'Pet Hotel',
    price: 120000,
    accent: '#6C5CE7',
    isHotel: true,
    duration: '24 jam',
  },
};

const PET_INFO: Record<string, { name: string; meta: string }> = {
  milo: { name: 'Milo', meta: 'Golden Retriever, 3 tahun' },
  luna: { name: 'Luna', meta: 'Persian Cat, 2 tahun' },
};

const PET_TYPE_LABELS: Record<PetType, string> = { dog: 'Anjing', cat: 'Kucing', other: 'Lainnya' };

function formatPrice(v: number) {
  return `Rp ${v.toLocaleString('id-ID')}`;
}

function formatDate(dateId: string) {
  if (!dateId) return '';
  const d = new Date(dateId + 'T00:00:00');
  return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' });
}

export default function BookingCheckoutPage() {
  const router = useRouter();
  const [draft, setDraft] = useState<BookingDraft | null>(null);
  const [petName, setPetName] = useState('');
  const [petType, setPetType] = useState<PetType>('dog');
  const [petWeight, setPetWeight] = useState('');
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;
    const raw = sessionStorage.getItem('bookingDraft');
    if (!raw) {
      router.replace('/booking');
      return;
    }
    setDraft(JSON.parse(raw) as BookingDraft);
  }, [router]);

  if (!draft) return null;

  const service = SERVICE_INFO[draft.serviceId] ?? SERVICE_INFO['grooming-full'];
  const isAddNew = draft.petId === 'add-new';
  const existingPet = !isAddNew ? (PET_INFO[draft.petId] ?? null) : null;

  const dpAmount = service.isHotel ? Math.round(service.price * 0.5) : 0;
  const totalDue = service.isHotel ? dpAmount : service.price;

  const canSubmit = !isAddNew || (petName.trim() !== '' && petWeight.trim() !== '');

  const handleSubmit = () => {
    if (!canSubmit) return;
    const d = new Date();
    const datePart = [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, '0'),
      String(d.getDate()).padStart(2, '0'),
    ].join('');
    const rand = Math.floor(1000 + Math.random() * 9000);
    const bookingNum = `BK-${datePart}-${rand}`;
    sessionStorage.setItem(
      'bookingSuccess',
      JSON.stringify({ bookingNum, ...draft, serviceName: service.name }),
    );
    sessionStorage.removeItem('bookingDraft');
    router.push('/booking/success');
  };

  return (
    <div className="mx-auto min-h-screen w-full max-w-[430px] bg-[#FDFCFB] pb-[120px]">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-stone-2 bg-[#FDFCFB]/90 px-[clamp(16px,5vw,20px)] pb-4 pt-[max(18px,env(safe-area-inset-top))] backdrop-blur-xl">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm font-semibold text-ink-3"
        >
          <ArrowLeft size={18} />
          Kembali
        </button>
        <h1 className="mt-3 font-heading text-[22px] font-extrabold text-ink">
          Konfirmasi Booking
        </h1>
        <p className="mt-0.5 text-sm font-medium text-ink-3">
          Periksa detail sebelum dikonfirmasi.
        </p>
      </header>

      <main className="px-[clamp(16px,5vw,20px)] py-5">
        {/* Service summary */}
        <div
          className="rounded-[22px] border p-4"
          style={{
            borderColor: service.accent + '44',
            boxShadow: `0 8px 24px ${service.accent}18`,
            background: '#FFFFFF',
          }}
        >
          <p className="font-heading text-[11px] font-bold uppercase tracking-[0.14em] text-ink-4">
            Layanan
          </p>
          <p className="mt-2 font-heading text-[20px] font-extrabold text-ink">{service.name}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-stone px-3 py-1.5 font-heading text-[12px] font-bold text-ink-3">
              <CalendarDays size={13} />
              {formatDate(draft.dateId)}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-stone px-3 py-1.5 font-heading text-[12px] font-bold text-ink-3">
              <Clock3 size={13} />
              {draft.timeId} WIB
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-stone px-3 py-1.5 font-heading text-[12px] font-bold text-ink-3">
              <PawPrint size={13} />
              {service.duration}
            </span>
          </div>
        </div>

        {/* Pet section */}
        <div className="mt-5">
          <h2 className="font-heading text-[17px] font-extrabold text-ink">
            {isAddNew ? 'Data Hewan' : 'Hewan'}
          </h2>

          {isAddNew ? (
            <m.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 flex flex-col gap-3"
            >
              <p className="text-sm text-ink-3">
                Isi info dasar hewanmu — lengkapi profil lengkap di menu Akun nanti.
              </p>

              <input
                type="text"
                placeholder="Nama hewan"
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
                className="h-14 w-full rounded-[18px] border border-stone-2 bg-white px-4 font-heading text-[16px] font-extrabold text-ink outline-none placeholder:font-sans placeholder:text-[14px] placeholder:font-normal placeholder:text-ink-4 focus:border-primary"
              />

              <div className="grid grid-cols-3 gap-2">
                {(Object.entries(PET_TYPE_LABELS) as [PetType, string][]).map(([type, label]) => {
                  const sel = petType === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setPetType(type)}
                      className="rounded-[16px] border py-3 text-center font-heading text-[13px] font-bold transition-colors"
                      style={{
                        borderColor: sel ? 'var(--color-orange)' : 'var(--color-stone-2)',
                        background: sel ? 'var(--color-orange)' : '#FFFFFF',
                        color: sel ? '#FFFFFF' : 'var(--color-ink)',
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              <div className="relative">
                <input
                  type="number"
                  placeholder="Berat"
                  value={petWeight}
                  onChange={(e) => setPetWeight(e.target.value)}
                  className="h-14 w-full rounded-[18px] border border-stone-2 bg-white px-4 pr-14 font-heading text-[16px] font-extrabold text-ink outline-none placeholder:font-sans placeholder:text-[14px] placeholder:font-normal placeholder:text-ink-4 focus:border-primary"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-heading text-[13px] font-bold text-ink-4">
                  kg
                </span>
              </div>
            </m.div>
          ) : (
            <div className="mt-3 flex items-center gap-3 rounded-[18px] border border-stone-2 bg-white px-4 py-3.5">
              <PawPrint size={20} className="shrink-0 text-primary" />
              <div>
                <p className="font-heading text-[15px] font-extrabold text-ink">
                  {existingPet?.name ?? draft.petId}
                </p>
                <p className="text-sm text-ink-3">{existingPet?.meta}</p>
              </div>
            </div>
          )}
        </div>

        {/* Notes */}
        {draft.notes && (
          <div className="mt-4 rounded-[18px] bg-stone px-4 py-3">
            <p className="font-heading text-[11px] font-bold uppercase tracking-[0.12em] text-ink-4">
              Catatan
            </p>
            <p className="mt-1 text-[14px] leading-5 text-ink-3">{draft.notes}</p>
          </div>
        )}

        {/* Price breakdown */}
        <div className="mt-5 rounded-[22px] border border-stone-2 bg-white p-4">
          <p className="font-heading text-[11px] font-bold uppercase tracking-[0.14em] text-ink-4">
            Ringkasan Biaya
          </p>
          <div className="mt-3 space-y-2.5">
            <div className="flex justify-between text-[14px] font-semibold text-ink-3">
              <span>{service.name}</span>
              <span>{formatPrice(service.price)}</span>
            </div>
            {service.isHotel && (
              <>
                <div className="flex justify-between text-[14px] font-semibold text-primary">
                  <span>DP 50% (sekarang)</span>
                  <span>{formatPrice(dpAmount)}</span>
                </div>
                <div className="flex justify-between text-[13px] font-semibold text-ink-4">
                  <span>Sisa (saat check-out)</span>
                  <span>{formatPrice(service.price - dpAmount)}</span>
                </div>
              </>
            )}
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-stone-2 pt-3">
            <span className="font-heading text-[14px] font-bold text-ink">
              {service.isHotel ? 'Bayar sekarang' : 'Total'}
            </span>
            <span className="font-heading text-[22px] font-extrabold text-primary">
              {formatPrice(totalDue)}
            </span>
          </div>
        </div>

        {/* Admin note */}
        <div className="mt-4 flex items-start gap-3 rounded-[18px] border border-[#BEE5CB] bg-[#F2FBF5] px-4 py-3">
          <ShieldCheck size={18} className="mt-0.5 shrink-0 text-success" />
          <p className="text-[13px] leading-5 font-semibold text-ink-3">
            Admin konfirmasi via <span className="font-bold text-ink">WhatsApp dalam 10 menit</span>{' '}
            setelah booking masuk.
          </p>
        </div>
      </main>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-1/2 z-50 w-full max-w-[430px] -translate-x-1/2 border-t border-stone-2 bg-[#FDFCFB]/95 px-[clamp(16px,5vw,20px)] py-4 pb-[max(16px,env(safe-area-inset-bottom))] backdrop-blur-xl">
        {isAddNew && !canSubmit && (
          <p className="mb-2 text-center text-[12px] font-semibold text-ink-4">
            Lengkapi nama dan berat hewan dulu
          </p>
        )}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-[18px] bg-primary font-heading text-[15px] font-extrabold text-white shadow-[0_8px_22px_rgba(224,123,57,0.28)] active:scale-[0.98] disabled:opacity-50"
        >
          <Check size={18} strokeWidth={2.5} />
          {service.isHotel ? 'Bayar DP & Konfirmasi' : 'Selesai & Konfirmasi'}
        </button>
      </div>
    </div>
  );
}
