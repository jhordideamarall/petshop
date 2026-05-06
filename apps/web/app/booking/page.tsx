'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, m, useScroll, useSpring, useTransform } from 'framer-motion';
import { CalendarDays, Check, ChevronRight, Clock3, MapPin, PawPrint } from 'lucide-react';
import { BottomNav } from '@/components/layout/bottom-nav';
import { useLocationStore } from '@/stores/location-store';

type ServiceId = 'grooming-basic' | 'grooming-full' | 'pet-hotel';
type PetId = 'milo' | 'luna' | 'add-new';

interface BookingService {
  id: ServiceId;
  name: string;
  description: string;
  price: number;
  unit: string;
  duration: string;
  accent: string;
  badge?: string;
}

// Admin-configurable — nanti di-fetch dari backend Phase 7
const BOOKING_CONFIG = {
  dateRangeDays: 14,
  openHour: 9,
  closeHour: 20,
  slotIntervalMinutes: 90,
} as const;

const DAY_SHORT: Record<number, string> = {
  0: 'Min',
  1: 'Sen',
  2: 'Sel',
  3: 'Rab',
  4: 'Kam',
  5: 'Jum',
  6: 'Sab',
};

function generateDates(rangeDays: number) {
  return Array.from({ length: rangeDays }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    // Max 4 chars → semua chip lebar konsisten
    const shortLabel = i === 0 ? 'Hari' : i === 1 ? 'Bsk' : (DAY_SHORT[d.getDay()] ?? '');
    const dayNum = d.toLocaleDateString('id-ID', { day: 'numeric' });
    const monthShort = d.toLocaleDateString('id-ID', { month: 'short' });
    const id = d.toISOString().split('T')[0];
    return { id, shortLabel, dayNum, monthShort };
  });
}

function generateTimeSlots(openHour: number, closeHour: number, intervalMinutes: number) {
  const slots: { id: string; label: string; available: boolean }[] = [];
  let current = openHour * 60;
  while (current < closeHour * 60) {
    const h = Math.floor(current / 60)
      .toString()
      .padStart(2, '0');
    const mn = (current % 60).toString().padStart(2, '0');
    const id = `${h}:${mn}`;
    slots.push({ id, label: id, available: true });
    current += intervalMinutes;
  }
  return slots;
}

const services: BookingService[] = [
  {
    id: 'grooming-basic',
    name: 'Grooming Basic',
    description: 'Mandi, blow dry, gunting kuku, bersih telinga',
    price: 85000,
    unit: '60 menit',
    duration: '1 jam',
    accent: '#E07B39',
  },
  {
    id: 'grooming-full',
    name: 'Grooming Full',
    description: 'Basic grooming, styling, cukur, treatment bulu',
    price: 150000,
    unit: '90-120 menit',
    duration: '2 jam',
    accent: '#2D7D52',
    badge: 'Best Value',
  },
  {
    id: 'pet-hotel',
    name: 'Pet Hotel',
    description: 'Penitipan per hari dengan makan dan update foto',
    price: 120000,
    unit: 'per hari',
    duration: '24 jam',
    accent: '#6C5CE7',
    badge: 'DP 50%',
  },
];

const dateOptions = generateDates(BOOKING_CONFIG.dateRangeDays);
const timeSlots = generateTimeSlots(
  BOOKING_CONFIG.openHour,
  BOOKING_CONFIG.closeHour,
  BOOKING_CONFIG.slotIntervalMinutes,
);

const pets = [
  { id: 'milo' as const, name: 'Milo', meta: 'Golden Retriever, 3 tahun' },
  { id: 'luna' as const, name: 'Luna', meta: 'Persian Cat, 2 tahun' },
  { id: 'add-new' as const, name: 'Tambah Pet', meta: 'Lengkapi nanti saat checkout' },
];

const formatPrice = (value: number) => `Rp ${value.toLocaleString('id-ID')}`;

function RadioMark({ selected }: { selected: boolean }) {
  return (
    <span
      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2"
      style={{
        borderColor: selected ? 'var(--color-orange)' : 'var(--color-stone-3)',
        background: selected ? 'var(--color-orange)' : '#FFFFFF',
      }}
    >
      {selected && <Check size={14} strokeWidth={3} color="#FFFFFF" />}
    </span>
  );
}

function StepHeader({ current }: { current: number }) {
  const steps = ['Layanan', 'Jadwal', 'Pet', 'Konfirmasi'];
  return (
    <div className="mt-4 grid grid-cols-4 gap-2">
      {steps.map((step, index) => {
        const active = index + 1 <= current;
        return (
          <div key={step} className="min-w-0">
            <div
              className="relative h-1.5 overflow-hidden rounded-full bg-stone-2"
              style={{ transform: 'translateZ(0)' }}
            >
              <m.div
                initial={false}
                animate={{ width: active ? '100%' : '0%' }}
                transition={{ type: 'spring', stiffness: 210, damping: 28, mass: 0.65 }}
                className="h-full rounded-full bg-primary"
              />
            </div>
            <m.p
              initial={false}
              animate={{
                color: active ? 'var(--color-orange)' : 'var(--color-ink-4)',
                opacity: active ? 1 : 0.74,
              }}
              transition={{ duration: 0.18 }}
              className="mt-2 truncate font-heading text-[10px] font-bold"
            >
              {step}
            </m.p>
          </div>
        );
      })}
    </div>
  );
}

export default function BookingPage() {
  const router = useRouter();
  const { scrollY } = useScroll();
  const smoothY = useSpring(scrollY, { stiffness: 180, damping: 24, restDelta: 0.001, mass: 0.9 });
  const headerPaddingBottom = useTransform(smoothY, [0, 130], [16, 10]);
  const titleSize = useTransform(smoothY, [0, 130], [26, 19]);
  const titleLineHeight = useTransform(smoothY, [0, 130], [1.12, 1.05]);
  const subtitleOpacity = useTransform(smoothY, [0, 80], [1, 0]);
  const subtitleHeight = useTransform(smoothY, [0, 100], [21, 0]);
  const headerShadow = useTransform(
    smoothY,
    [0, 120],
    ['0 0 0 rgba(26,23,20,0)', '0 10px 28px rgba(26,23,20,0.08)'],
  );

  const [selectedServiceId, setSelectedServiceId] = useState<ServiceId | null>(null);
  const [selectedDateId, setSelectedDateId] = useState(dateOptions[1].id);
  const [selectedTimeId, setSelectedTimeId] = useState('10:30');
  const [selectedPetId, setSelectedPetId] = useState<PetId | null>(null);
  const [notes, setNotes] = useState('');
  const locationName = useLocationStore((s) => s.locationName);

  const selectedService = services.find((s) => s.id === selectedServiceId) ?? services[0];
  const selectedDate = dateOptions.find((d) => d.id === selectedDateId) ?? dateOptions[1];
  const selectedPet = pets.find((p) => p.id === selectedPetId) ?? pets[0];
  const isHotel = selectedService.id === 'pet-hotel';
  const dpAmount = isHotel ? Math.round(selectedService.price * 0.5) : 0;
  const totalDue = isHotel ? dpAmount : selectedService.price;
  const canConfirm = selectedServiceId !== null && selectedPetId !== null;

  // Step hanya advance dari pilihan eksplisit user — date/time selalu punya default
  const activeStep = useMemo(() => {
    if (selectedPetId !== null) return 3;
    if (selectedServiceId !== null) return 2;
    return 0;
  }, [selectedPetId, selectedServiceId]);

  const goToCheckout = () => {
    if (!canConfirm) return;
    // Simpan di sessionStorage untuk checkout page baca — hindari URL query string panjang
    sessionStorage.setItem(
      'bookingDraft',
      JSON.stringify({
        serviceId: selectedServiceId,
        dateId: selectedDateId,
        timeId: selectedTimeId,
        petId: selectedPetId,
        notes: notes.trim(),
      }),
    );
    router.push('/booking/checkout');
  };

  const updateTime = (value: string) => {
    const slot = timeSlots.find((item) => item.id === value);
    if (!slot?.available) return;
    setSelectedTimeId(value);
  };

  return (
    <div className="mx-auto min-h-screen w-full max-w-[430px] bg-[#FDFCFB] pb-[330px]">
      <m.header
        className="sticky top-0 z-40 border-b border-stone-2 bg-[#FDFCFB]/90 px-[clamp(16px,5vw,20px)] pt-[max(18px,env(safe-area-inset-top))] backdrop-blur-xl"
        style={{ paddingBottom: headerPaddingBottom, boxShadow: headerShadow }}
      >
        <div>
          <m.h1
            className="font-heading font-extrabold text-ink"
            style={{ fontSize: titleSize, lineHeight: titleLineHeight }}
          >
            Grooming & Hotel
          </m.h1>
          <m.p
            className="mt-1 overflow-hidden text-sm font-medium text-ink-3"
            style={{ opacity: subtitleOpacity, height: subtitleHeight }}
          >
            Pilih layanan, jadwal, dan pet dalam satu flow.
          </m.p>
        </div>
        <StepHeader current={activeStep} />
      </m.header>

      <main className="px-[clamp(16px,5vw,20px)] py-5">
        {/* 1. Layanan */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="font-heading text-[17px] font-extrabold text-ink">1. Pilih layanan</h2>
              <p className="mt-0.5 text-sm text-ink-3">Harga sudah termasuk basic check.</p>
            </div>
            <span className="chip chip-orange">{locationName}</span>
          </div>

          <div className="flex flex-col gap-3">
            {services.map((service) => {
              const selected = service.id === selectedServiceId;
              return (
                <m.button
                  key={service.id}
                  type="button"
                  whileTap={{ scale: 0.985 }}
                  onClick={() =>
                    setSelectedServiceId((prev) => (prev === service.id ? null : service.id))
                  }
                  className="flex min-h-[104px] w-full items-center gap-3 rounded-[22px] border bg-white px-4 py-4 text-left shadow-sm transition-colors"
                  style={{
                    borderColor: selected ? service.accent : 'var(--color-stone-2)',
                    boxShadow: selected
                      ? `0 10px 28px ${service.accent}22`
                      : '0 2px 8px rgba(26,23,20,0.04)',
                  }}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-heading text-[15px] font-extrabold text-ink">
                        {service.name}
                      </h3>
                      {service.badge && (
                        <span className="rounded-full bg-stone-2 px-2 py-0.5 font-heading text-[10px] font-bold text-ink-3">
                          {service.badge}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 line-clamp-2 text-[13px] leading-5 text-ink-3">
                      {service.description}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="font-heading text-[15px] font-extrabold text-primary">
                        {formatPrice(service.price)}
                      </span>
                      <span className="text-xs font-semibold text-ink-4">{service.unit}</span>
                    </div>
                  </div>
                  <RadioMark selected={selected} />
                </m.button>
              );
            })}
          </div>
        </section>

        {/* 2. Jadwal */}
        <section className="mt-7">
          <div className="mb-4">
            <h2 className="font-heading text-[17px] font-extrabold text-ink">2. Pilih jadwal</h2>
            <p className="mt-0.5 text-sm text-ink-3">Pilih hari dan jam yang paling nyaman.</p>
          </div>

          {/* Date scroll — no label, konsisten w-[58px] */}
          <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {dateOptions.map((date) => {
              const selected = date.id === selectedDateId;
              return (
                <m.button
                  key={date.id}
                  type="button"
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedDateId(date.id)}
                  className="flex w-[58px] shrink-0 flex-col items-center rounded-[18px] border py-3 text-center"
                  style={{
                    borderColor: selected ? 'var(--color-orange)' : 'var(--color-stone-2)',
                    background: selected ? 'var(--color-orange)' : '#FFFFFF',
                    boxShadow: selected
                      ? '0 6px 18px rgba(224,123,57,0.30)'
                      : '0 1px 4px rgba(26,23,20,0.04)',
                  }}
                >
                  <span
                    className="font-heading text-[10px] font-bold leading-none"
                    style={{ color: selected ? 'rgba(255,255,255,0.78)' : 'var(--color-ink-4)' }}
                  >
                    {date.shortLabel}
                  </span>
                  <span
                    className="mt-1.5 font-heading text-[20px] font-extrabold leading-none"
                    style={{ color: selected ? '#FFFFFF' : 'var(--color-ink)' }}
                  >
                    {date.dayNum}
                  </span>
                  <span
                    className="mt-1 font-heading text-[10px] font-semibold leading-none"
                    style={{ color: selected ? 'rgba(255,255,255,0.78)' : 'var(--color-ink-4)' }}
                  >
                    {date.monthShort}
                  </span>
                </m.button>
              );
            })}
          </div>

          {/* Time scroll — no label */}
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {timeSlots.map((slot) => {
              const selected = slot.id === selectedTimeId;
              return (
                <m.button
                  key={slot.id}
                  type="button"
                  disabled={!slot.available}
                  whileTap={slot.available ? { scale: 0.9 } : {}}
                  onClick={() => updateTime(slot.id)}
                  className="shrink-0 rounded-[16px] border px-4 py-3 text-center"
                  style={{
                    borderColor: selected ? 'var(--color-orange)' : 'var(--color-stone-2)',
                    background: selected ? 'var(--color-orange)' : '#FFFFFF',
                    opacity: slot.available ? 1 : 0.35,
                    boxShadow: selected
                      ? '0 6px 18px rgba(224,123,57,0.30)'
                      : '0 1px 4px rgba(26,23,20,0.04)',
                  }}
                >
                  <span
                    className="font-heading text-[16px] font-extrabold leading-none"
                    style={{ color: selected ? '#FFFFFF' : 'var(--color-ink)' }}
                  >
                    {slot.label}
                  </span>
                  {!slot.available && (
                    <span className="mt-1 block font-heading text-[9px] font-bold text-ink-4">
                      penuh
                    </span>
                  )}
                </m.button>
              );
            })}
          </div>
        </section>

        {/* 3. Pet */}
        <section className="mt-7">
          <div className="mb-3">
            <h2 className="font-heading text-[17px] font-extrabold text-ink">3. Pilih pet</h2>
            <p className="mt-0.5 text-sm text-ink-3">Pilih hewan yang akan datang ke layanan.</p>
          </div>

          <div className="flex flex-col gap-3">
            {pets.map((pet) => {
              const selected = pet.id === selectedPetId;
              return (
                <m.button
                  key={pet.id}
                  type="button"
                  whileTap={{ scale: 0.985 }}
                  onClick={() => setSelectedPetId((prev) => (prev === pet.id ? null : pet.id))}
                  className="flex min-h-[76px] items-center gap-3 rounded-[20px] border bg-white px-4 text-left"
                  style={{
                    borderColor: selected ? 'var(--color-orange)' : 'var(--color-stone-2)',
                    background: selected ? 'var(--color-orange-light)' : '#FFFFFF',
                  }}
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-heading text-[15px] font-extrabold text-ink">{pet.name}</p>
                    <p className="mt-0.5 text-sm text-ink-3">{pet.meta}</p>
                  </div>
                  <RadioMark selected={selected} />
                </m.button>
              );
            })}
          </div>
        </section>

        {/* 4. Catatan */}
        <section className="mt-7">
          <label
            htmlFor="booking-notes"
            className="font-heading text-[17px] font-extrabold text-ink"
          >
            Catatan tambahan
          </label>
          <textarea
            id="booking-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Contoh: kulit sensitif, takut hair dryer, minta update foto..."
            className="mt-3 min-h-[104px] w-full resize-none rounded-[20px] border border-stone-2 bg-white px-4 py-3 text-[15px] leading-6 text-ink outline-none placeholder:text-ink-4 focus:border-primary"
          />
        </section>
      </main>

      {/* Floating summary — muncul saat service dipilih */}
      <AnimatePresence>
        {selectedServiceId !== null && (
          <m.aside
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ type: 'spring', stiffness: 240, damping: 26 }}
            className="fixed bottom-[88px] left-1/2 z-50 w-full max-w-[430px] -translate-x-1/2 px-[clamp(16px,5vw,20px)]"
          >
            <div className="rounded-[24px] border border-stone-2 bg-white p-4 shadow-[0_16px_42px_rgba(26,23,20,0.12)]">
              <div className="mb-3 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-heading text-[15px] font-extrabold text-ink">
                    {selectedService.name}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold text-ink-4">
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays size={13} />
                      {selectedDate.dayNum} {selectedDate.monthShort}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock3 size={13} /> {selectedTimeId}
                    </span>
                    {selectedPetId && (
                      <span className="inline-flex items-center gap-1">
                        <PawPrint size={13} /> {selectedPet.name}
                      </span>
                    )}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  {isHotel && <p className="text-[11px] font-bold text-ink-4">DP 50%</p>}
                  <p className="font-heading text-[18px] font-extrabold text-primary">
                    {formatPrice(totalDue)}
                  </p>
                </div>
              </div>

              <div className="mb-3 flex items-center gap-2 rounded-[16px] bg-stone px-3 py-2 text-xs font-semibold text-ink-3">
                <MapPin size={15} className="text-primary" />
                <span>Cabang Jakarta Selatan · konfirmasi admin maks. 10 menit</span>
              </div>

              <button
                type="button"
                onClick={goToCheckout}
                disabled={!canConfirm}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-[18px] bg-primary font-heading text-[15px] font-extrabold text-white shadow-[0_8px_22px_rgba(224,123,57,0.28)] active:scale-[0.98] disabled:opacity-50"
              >
                {canConfirm ? 'Lanjut ke Konfirmasi' : 'Pilih Pet dulu'}
                <ChevronRight size={18} strokeWidth={2.5} />
              </button>
            </div>
          </m.aside>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}
