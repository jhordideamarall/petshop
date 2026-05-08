'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, m, useScroll, useSpring, useTransform } from 'framer-motion';
import { CalendarDays, Check, ChevronRight, Clock3, MapPin, PawPrint } from 'lucide-react';
import { BottomNav } from '@/components/layout/bottom-nav';
import { useAuth } from '@/components/providers/auth-provider';
import { getServices, getAvailableSlots } from '@/lib/services/booking-client';
import { getUserPets } from '@/lib/services/pet-client';
import type { Service, AvailableSlot } from '@/lib/services/booking-client';
import type { Pet } from '@/lib/services/pet-client';

const DATE_RANGE_DAYS = 14;

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
    const shortLabel = i === 0 ? 'Hari' : i === 1 ? 'Bsk' : (DAY_SHORT[d.getDay()] ?? '');
    const dayNum = d.toLocaleDateString('id-ID', { day: 'numeric' });
    const monthShort = d.toLocaleDateString('id-ID', { month: 'short' });
    const id = d.toISOString().split('T')[0];
    return { id, shortLabel, dayNum, monthShort };
  });
}

// Accent warna per service type
function getServiceAccent(service: Service): string {
  if (service.type === 'hotel') return '#6C5CE7';
  if (service.slug.includes('full')) return '#2D7D52';
  return '#E07B39';
}

function getServiceUnit(service: Service): string {
  if (service.type === 'hotel') return 'per hari';
  if (service.duration_minutes) return `${service.duration_minutes} menit`;
  return '';
}

const dateOptions = generateDates(DATE_RANGE_DAYS);

const formatPrice = (value: number) => `Rp ${value.toLocaleString('id-ID')}`;

const ADD_NEW_PET_ID = 'add-new';

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

  const { user } = useAuth();

  // Real data state
  const [services, setServices] = useState<Service[]>([]);
  const [userPets, setUserPets] = useState<Pet[]>([]);
  const [timeSlots, setTimeSlots] = useState<AvailableSlot[]>([]);

  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedDateId, setSelectedDateId] = useState(dateOptions[1]?.id ?? dateOptions[0].id);
  const [checkoutDateId, setCheckoutDateId] = useState(
    dateOptions[2]?.id ?? dateOptions[1]?.id ?? dateOptions[0].id,
  );
  const [selectedTimeId, setSelectedTimeId] = useState<string | null>(null);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  // Fetch services on mount
  useEffect(() => {
    getServices().then(setServices).catch(console.error);
  }, []);

  // Fetch user pets when logged in
  useEffect(() => {
    if (user) {
      getUserPets().then(setUserPets).catch(console.error);
    } else {
      setUserPets([]);
    }
  }, [user]);

  // Fetch slots when date or service changes
  const selectedService = services.find((s) => s.id === selectedServiceId) ?? null;
  useEffect(() => {
    if (!selectedDateId || !selectedService) return;
    const type = selectedService.type as 'grooming' | 'hotel';
    getAvailableSlots(selectedDateId, type)
      .then((slots: AvailableSlot[]) => {
        setTimeSlots(slots);
        setSelectedTimeId(slots[0]?.timeSlot ?? null);
      })
      .catch(console.error);
  }, [selectedDateId, selectedService?.id]);

  const selectedDate = dateOptions.find((d) => d.id === selectedDateId) ?? dateOptions[1];
  const selectedPetName = userPets.find((p) => p.id === selectedPetId)?.name ?? null;

  const isHotel = selectedService?.type === 'hotel';
  const hotelNights = useMemo(() => {
    if (!isHotel) return 1;
    const start = new Date(selectedDateId);
    const end = new Date(checkoutDateId);
    const diff = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  }, [isHotel, selectedDateId, checkoutDateId]);
  const hotelTotal = isHotel ? Number(selectedService?.price ?? 0) * hotelNights : 0;
  const dpAmount =
    isHotel && selectedService
      ? Math.round(hotelTotal * (Number(selectedService.dp_percentage) / 100))
      : 0;
  const totalDue = isHotel ? dpAmount : Number(selectedService?.price ?? 0);
  const canConfirm = selectedServiceId !== null && selectedPetId !== null;

  const activeStep = useMemo(() => {
    if (selectedPetId !== null) return 3;
    if (selectedServiceId !== null) return 2;
    return 0;
  }, [selectedPetId, selectedServiceId]);

  const goToCheckout = () => {
    if (!canConfirm) return;
    sessionStorage.setItem(
      'bookingDraft',
      JSON.stringify({
        serviceId: selectedServiceId,
        dateId: selectedDateId,
        dateEndId: isHotel ? checkoutDateId : null,
        nights: isHotel ? hotelNights : null,
        timeId: isHotel ? null : selectedTimeId,
        petId: selectedPetId,
        notes: notes.trim(),
      }),
    );
    router.push('/booking/checkout');
  };

  const updateTime = (value: string) => {
    const slot = timeSlots.find((item) => item.timeSlot === value);
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
            <span className="chip chip-orange">Jakarta</span>
          </div>

          <div className="flex flex-col gap-3">
            {services.map((service) => {
              const selected = service.id === selectedServiceId;
              const accent = getServiceAccent(service);
              const badge = service.requires_dp ? `DP ${service.dp_percentage}%` : null;
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
                    borderColor: selected ? accent : 'var(--color-stone-2)',
                    boxShadow: selected
                      ? `0 10px 28px ${accent}22`
                      : '0 2px 8px rgba(26,23,20,0.04)',
                  }}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-heading text-[15px] font-extrabold text-ink">
                        {service.name}
                      </h3>
                      {badge && (
                        <span className="rounded-full bg-stone-2 px-2 py-0.5 font-heading text-[10px] font-bold text-ink-3">
                          {badge}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 line-clamp-2 text-[13px] leading-5 text-ink-3">
                      {service.description}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="font-heading text-[15px] font-extrabold text-primary">
                        {formatPrice(Number(service.price))}
                      </span>
                      <span className="text-xs font-semibold text-ink-4">
                        {getServiceUnit(service)}
                      </span>
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
            <p className="mt-0.5 text-sm text-ink-3">
              {isHotel
                ? 'Pilih tanggal check-in dan check-out.'
                : 'Pilih hari dan jam yang paling nyaman.'}
            </p>
          </div>

          {/* Check-in / Date label */}
          {isHotel && (
            <p className="mb-2 font-heading text-[13px] font-bold text-ink-3">Check-in</p>
          )}

          {/* Date scroll */}
          <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {dateOptions.map((date) => {
              const selected = date.id === selectedDateId;
              return (
                <m.button
                  key={date.id}
                  type="button"
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    setSelectedDateId(date.id);
                    // Auto-push checkout jika check-in >= checkout
                    if (isHotel && date.id >= checkoutDateId) {
                      const nextIdx = dateOptions.findIndex((d) => d.id === date.id) + 1;
                      if (nextIdx < dateOptions.length) setCheckoutDateId(dateOptions[nextIdx].id);
                    }
                  }}
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

          {/* Check-out date scroll — hotel only */}
          {isHotel && (
            <m.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4"
            >
              <div className="mb-2 flex items-center justify-between">
                <p className="font-heading text-[13px] font-bold text-ink-3">Check-out</p>
                <span className="rounded-full bg-[#6C5CE7]/10 px-2.5 py-1 font-heading text-[12px] font-bold text-[#6C5CE7]">
                  {hotelNights} hari
                </span>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {dateOptions
                  .filter((d) => d.id > selectedDateId)
                  .map((date) => {
                    const selected = date.id === checkoutDateId;
                    return (
                      <m.button
                        key={date.id}
                        type="button"
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setCheckoutDateId(date.id)}
                        className="flex w-[58px] shrink-0 flex-col items-center rounded-[18px] border py-3 text-center"
                        style={{
                          borderColor: selected ? '#6C5CE7' : 'var(--color-stone-2)',
                          background: selected ? '#6C5CE7' : '#FFFFFF',
                          boxShadow: selected
                            ? '0 6px 18px rgba(108,92,231,0.30)'
                            : '0 1px 4px rgba(26,23,20,0.04)',
                        }}
                      >
                        <span
                          className="font-heading text-[10px] font-bold leading-none"
                          style={{
                            color: selected ? 'rgba(255,255,255,0.78)' : 'var(--color-ink-4)',
                          }}
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
                          style={{
                            color: selected ? 'rgba(255,255,255,0.78)' : 'var(--color-ink-4)',
                          }}
                        >
                          {date.monthShort}
                        </span>
                      </m.button>
                    );
                  })}
              </div>
            </m.div>
          )}

          {/* Time scroll — grooming only */}
          {!isHotel && (
            <div className="mt-4 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {timeSlots.map((slot) => {
                const selected = slot.timeSlot === selectedTimeId;
                return (
                  <m.button
                    key={slot.timeSlot}
                    type="button"
                    disabled={!slot.available}
                    whileTap={slot.available ? { scale: 0.9 } : {}}
                    onClick={() => updateTime(slot.timeSlot)}
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
                      {slot.timeSlot}
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
          )}
        </section>

        {/* 3. Pet */}
        <section className="mt-7">
          <div className="mb-3">
            <h2 className="font-heading text-[17px] font-extrabold text-ink">3. Pilih pet</h2>
            <p className="mt-0.5 text-sm text-ink-3">Pilih hewan yang akan datang ke layanan.</p>
          </div>

          <div className="flex flex-col gap-3">
            {userPets.map((pet) => {
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
                    <p className="mt-0.5 text-sm text-ink-3">
                      {[
                        pet.type,
                        pet.breed,
                        pet.birth_date
                          ? `${new Date().getFullYear() - new Date(pet.birth_date).getFullYear()} tahun`
                          : null,
                      ]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                  </div>
                  <RadioMark selected={selected} />
                </m.button>
              );
            })}
            {/* Tambah Pet — selalu tampil */}
            {(() => {
              const selected = selectedPetId === ADD_NEW_PET_ID;
              return (
                <m.button
                  type="button"
                  whileTap={{ scale: 0.985 }}
                  onClick={() =>
                    setSelectedPetId((prev) => (prev === ADD_NEW_PET_ID ? null : ADD_NEW_PET_ID))
                  }
                  className="flex min-h-[76px] items-center gap-3 rounded-[20px] border bg-white px-4 text-left"
                  style={{
                    borderColor: selected ? 'var(--color-orange)' : 'var(--color-stone-2)',
                    background: selected ? 'var(--color-orange-light)' : '#FFFFFF',
                  }}
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-heading text-[15px] font-extrabold text-ink">Tambah Pet</p>
                    <p className="mt-0.5 text-sm text-ink-3">Lengkapi nanti saat checkout</p>
                  </div>
                  <RadioMark selected={selected} />
                </m.button>
              );
            })()}
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
                    {selectedService?.name}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold text-ink-4">
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays size={13} />
                      {isHotel
                        ? `${selectedDate.dayNum} ${selectedDate.monthShort} → ${dateOptions.find((d) => d.id === checkoutDateId)?.dayNum ?? ''} ${dateOptions.find((d) => d.id === checkoutDateId)?.monthShort ?? ''}`
                        : `${selectedDate.dayNum} ${selectedDate.monthShort}`}
                    </span>
                    {isHotel && (
                      <span className="inline-flex items-center gap-1 text-[#6C5CE7]">
                        {hotelNights} hari
                      </span>
                    )}
                    {!isHotel && (
                      <span className="inline-flex items-center gap-1">
                        <Clock3 size={13} /> {selectedTimeId}
                      </span>
                    )}
                    {selectedPetId && selectedPetId !== ADD_NEW_PET_ID && selectedPetName && (
                      <span className="inline-flex items-center gap-1">
                        <PawPrint size={13} /> {selectedPetName}
                      </span>
                    )}
                    {selectedPetId === ADD_NEW_PET_ID && (
                      <span className="inline-flex items-center gap-1">
                        <PawPrint size={13} /> Pet baru
                      </span>
                    )}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  {isHotel && (
                    <p className="text-[11px] font-bold text-ink-4">
                      DP {selectedService?.dp_percentage}%
                    </p>
                  )}
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
