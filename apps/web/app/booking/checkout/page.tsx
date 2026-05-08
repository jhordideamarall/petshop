'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { m } from 'framer-motion';
import { ArrowLeft, CalendarDays, Check, Clock3, PawPrint, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import { createBooking, getServices } from '@/lib/services/booking-client';
import { addPet, getUserPets } from '@/lib/services/pet-client';
import type { Service } from '@/lib/services/booking-client';
import type { Pet } from '@/lib/services/pet-client';

type PetType = 'dog' | 'cat' | 'other';

interface BookingDraft {
  serviceId: string;
  dateId: string;
  dateEndId: string | null;
  nights: number | null;
  timeId: string | null;
  petId: string;
  notes: string;
}

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
  const { user } = useAuth();
  const [draft, setDraft] = useState<BookingDraft | null>(null);
  const [service, setService] = useState<Service | null>(null);
  const [existingPet, setExistingPet] = useState<Pet | null>(null);
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
    const parsed = JSON.parse(raw) as BookingDraft;
    setDraft(parsed);

    // Fetch service info
    getServices()
      .then((services: Service[]) => {
        const found = services.find((s: Service) => s.id === parsed.serviceId);
        if (found) setService(found);
      })
      .catch(console.error);

    // Fetch existing pet if not add-new
    if (parsed.petId !== 'add-new' && user) {
      getUserPets()
        .then((pets: Pet[]) => {
          const found = pets.find((p: Pet) => p.id === parsed.petId);
          if (found) setExistingPet(found);
        })
        .catch(console.error);
    }
  }, [router, user]);

  if (!draft || !service) return null;

  const isAddNew = draft.petId === 'add-new';

  const isHotel = service.type === 'hotel';
  const hotelNights = draft.nights ?? 1;
  const hotelTotal = isHotel ? Number(service.price) * hotelNights : 0;
  const dpAmount = isHotel ? Math.round(hotelTotal * (Number(service.dp_percentage) / 100)) : 0;
  const totalDue = isHotel ? dpAmount : Number(service.price);
  const serviceAccent = isHotel ? '#6C5CE7' : service.slug.includes('full') ? '#2D7D52' : '#E07B39';

  const canSubmit = !isAddNew || (petName.trim() !== '' && petWeight.trim() !== '');

  const handleSubmit = async () => {
    if (!canSubmit) return;

    if (!user) {
      router.push(`/login?next=/booking/checkout`);
      return;
    }

    try {
      // Jika tambah pet baru → simpan ke DB dulu
      let petId = draft.petId;
      if (isAddNew) {
        const newPet = await addPet({
          name: petName.trim(),
          type: petType as 'dog' | 'cat' | 'bird' | 'hamster' | 'rabbit' | 'fish' | 'other',
          weight_kg: petWeight ? Number(petWeight) : null,
        });
        petId = newPet.id;
      }

      const booking = await createBooking({
        pet_id: petId,
        service_id: draft.serviceId,
        date_start: draft.dateId,
        date_end: draft.dateEndId ?? null,
        time_slot: draft.timeId ? `${draft.timeId}:00` : null,
        total_amount: isHotel ? hotelTotal : totalDue,
        dp_amount: dpAmount,
        notes: draft.notes || null,
      });

      sessionStorage.setItem(
        'bookingSuccess',
        JSON.stringify({
          bookingNum: booking.booking_number,
          serviceName: service.name,
          dateId: draft.dateId,
          timeId: draft.timeId,
        }),
      );
      sessionStorage.removeItem('bookingDraft');
      router.push('/booking/success');
    } catch (err) {
      console.error('Booking failed:', err);
    }
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
            borderColor: serviceAccent + '44',
            boxShadow: `0 8px 24px ${serviceAccent}18`,
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
              {isHotel
                ? `${formatDate(draft.dateId)} → ${formatDate(draft.dateEndId ?? draft.dateId)}`
                : formatDate(draft.dateId)}
            </span>
            {!isHotel && draft.timeId && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-stone px-3 py-1.5 font-heading text-[12px] font-bold text-ink-3">
                <Clock3 size={13} />
                {draft.timeId} WIB
              </span>
            )}
            {isHotel && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#6C5CE7]/10 px-3 py-1.5 font-heading text-[12px] font-bold text-[#6C5CE7]">
                {hotelNights} hari
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-stone px-3 py-1.5 font-heading text-[12px] font-bold text-ink-3">
              <PawPrint size={13} />
              {service.duration_minutes ? `${service.duration_minutes} menit` : '24 jam'}
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
                <p className="text-sm text-ink-3">
                  {[
                    existingPet?.type,
                    existingPet?.breed,
                    existingPet?.birth_date
                      ? `${new Date().getFullYear() - new Date(existingPet.birth_date).getFullYear()} tahun`
                      : null,
                  ]
                    .filter(Boolean)
                    .join(', ')}
                </p>
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
              <span>
                {service.name}
                {isHotel ? ` × ${hotelNights} hari` : ''}
              </span>
              <span>{formatPrice(isHotel ? hotelTotal : Number(service.price))}</span>
            </div>
            {isHotel && (
              <>
                <div className="flex justify-between text-[14px] font-semibold text-primary">
                  <span>DP {service.dp_percentage}% (sekarang)</span>
                  <span>{formatPrice(dpAmount)}</span>
                </div>
                <div className="flex justify-between text-[13px] font-semibold text-ink-4">
                  <span>Sisa (saat check-out)</span>
                  <span>{formatPrice(hotelTotal - dpAmount)}</span>
                </div>
              </>
            )}
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-stone-2 pt-3">
            <span className="font-heading text-[14px] font-bold text-ink">
              {isHotel ? 'Bayar sekarang' : 'Total'}
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
          {isHotel ? 'Bayar DP & Konfirmasi' : 'Selesai & Konfirmasi'}
        </button>
      </div>
    </div>
  );
}
