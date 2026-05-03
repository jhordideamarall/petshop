'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, m } from 'framer-motion';
import {
  Bath,
  Bed,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  MapPin,
  PawPrint,
  Scissors,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { BottomNav } from '@/components/layout/bottom-nav';

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
  bg: string;
  icon: typeof Scissors;
  badge?: string;
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
    bg: '#FFF3EA',
    icon: Scissors,
  },
  {
    id: 'grooming-full',
    name: 'Grooming Full',
    description: 'Basic grooming, styling, cukur, treatment bulu',
    price: 150000,
    unit: '90-120 menit',
    duration: '2 jam',
    accent: '#2D7D52',
    bg: '#EAF5EE',
    icon: Sparkles,
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
    bg: '#EFEDFF',
    icon: Bed,
    badge: 'DP 50%',
  },
];

const dateOptions = [
  { id: 'today', label: 'Hari ini', date: '3 Mei', hint: '4 slot' },
  { id: 'tomorrow', label: 'Besok', date: '4 Mei', hint: '7 slot' },
  { id: 'next', label: 'Selasa', date: '5 Mei', hint: '5 slot' },
  { id: 'weekend', label: 'Sabtu', date: '9 Mei', hint: 'Ramai' },
];

const timeSlots = [
  { id: '09:00', label: '09:00', available: true },
  { id: '10:30', label: '10:30', available: true },
  { id: '12:00', label: '12:00', available: false },
  { id: '13:30', label: '13:30', available: true },
  { id: '15:00', label: '15:00', available: true },
  { id: '16:30', label: '16:30', available: false },
];

const pets = [
  { id: 'milo' as const, name: 'Milo', meta: 'Golden Retriever, 3 tahun', type: 'Dog' },
  { id: 'luna' as const, name: 'Luna', meta: 'Persian Cat, 2 tahun', type: 'Cat' },
  { id: 'add-new' as const, name: 'Tambah Pet', meta: 'Lengkapi nanti saat checkout', type: 'New' },
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
    <div className="mt-4 grid grid-cols-4 gap-2 px-5">
      {steps.map((step, index) => {
        const active = index + 1 <= current;

        return (
          <div key={step} className="min-w-0">
            <div
              className="h-1.5 rounded-full"
              style={{
                background: active ? 'var(--color-orange)' : 'var(--color-stone-2)',
              }}
            />
            <p
              className="mt-2 truncate font-heading text-[10px] font-bold"
              style={{ color: active ? 'var(--color-orange)' : 'var(--color-ink-4)' }}
            >
              {step}
            </p>
          </div>
        );
      })}
    </div>
  );
}

export default function BookingPage() {
  const [selectedServiceId, setSelectedServiceId] = useState<ServiceId>('grooming-full');
  const [selectedDateId, setSelectedDateId] = useState('tomorrow');
  const [selectedTimeId, setSelectedTimeId] = useState('10:30');
  const [selectedPetId, setSelectedPetId] = useState<PetId>('milo');
  const [notes, setNotes] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const selectedService =
    services.find((service) => service.id === selectedServiceId) ?? services[1];
  const selectedDate = dateOptions.find((date) => date.id === selectedDateId) ?? dateOptions[1];
  const selectedPet = pets.find((pet) => pet.id === selectedPetId) ?? pets[0];
  const isHotel = selectedService.id === 'pet-hotel';
  const dpAmount = isHotel ? Math.round(selectedService.price * 0.5) : 0;
  const totalDue = isHotel ? dpAmount : selectedService.price;

  const activeStep = useMemo(() => {
    if (confirmed) return 4;
    if (selectedPetId) return 3;
    if (selectedDateId && selectedTimeId) return 2;
    return 1;
  }, [confirmed, selectedDateId, selectedPetId, selectedTimeId]);

  const confirmBooking = () => {
    setConfirmed(true);
  };

  return (
    <div className="mx-auto min-h-screen w-full max-w-[430px] bg-[#FDFCFB] pb-[330px]">
      <header className="sticky top-0 z-40 border-b border-stone-2 bg-[#FDFCFB]/95 px-5 pb-4 pt-[max(18px,env(safe-area-inset-top))] backdrop-blur-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-heading text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
              Booking Layanan
            </p>
            <h1 className="mt-1 font-heading text-[26px] font-extrabold leading-tight text-ink">
              Grooming & Hotel
            </h1>
            <p className="mt-1 text-sm font-medium text-ink-3">
              Pilih layanan, jadwal, dan pet dalam satu flow.
            </p>
          </div>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-primary text-white shadow-[0_8px_22px_rgba(224,123,57,0.24)]">
            <Bath size={23} strokeWidth={2.4} />
          </div>
        </div>

        <StepHeader current={activeStep} />
      </header>

      <main className="px-5 py-5">
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
              const Icon = service.icon;
              const selected = service.id === selectedServiceId;

              return (
                <m.button
                  key={service.id}
                  type="button"
                  whileTap={{ scale: 0.985 }}
                  onClick={() => {
                    setSelectedServiceId(service.id);
                    setConfirmed(false);
                  }}
                  className="flex min-h-[104px] w-full items-center gap-3 rounded-[22px] border bg-white p-3.5 text-left shadow-sm transition-colors"
                  style={{
                    borderColor: selected ? service.accent : 'var(--color-stone-2)',
                    boxShadow: selected
                      ? `0 10px 28px ${service.accent}22`
                      : '0 2px 8px rgba(26,23,20,0.04)',
                  }}
                >
                  <div
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px]"
                    style={{ background: service.bg, color: service.accent }}
                  >
                    <Icon size={24} strokeWidth={2.2} />
                  </div>

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

        <section className="mt-7">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="font-heading text-[17px] font-extrabold text-ink">2. Pilih jadwal</h2>
              <p className="mt-0.5 text-sm text-ink-3">
                Slot yang habis otomatis nonaktif nanti dari database.
              </p>
            </div>
            <Clock3 size={20} className="text-primary" />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {dateOptions.map((date) => {
              const selected = date.id === selectedDateId;

              return (
                <button
                  key={date.id}
                  type="button"
                  onClick={() => {
                    setSelectedDateId(date.id);
                    setConfirmed(false);
                  }}
                  className="min-w-[92px] rounded-[18px] border px-3 py-3 text-left"
                  style={{
                    borderColor: selected ? 'var(--color-orange)' : 'var(--color-stone-2)',
                    background: selected ? 'var(--color-orange-light)' : '#FFFFFF',
                  }}
                >
                  <p className="font-heading text-[13px] font-extrabold text-ink">{date.label}</p>
                  <p className="mt-0.5 font-heading text-[16px] font-extrabold text-primary">
                    {date.date}
                  </p>
                  <p className="mt-1 text-[11px] font-semibold text-ink-4">{date.hint}</p>
                </button>
              );
            })}
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            {timeSlots.map((slot) => {
              const selected = slot.id === selectedTimeId;

              return (
                <button
                  key={slot.id}
                  type="button"
                  disabled={!slot.available}
                  onClick={() => {
                    setSelectedTimeId(slot.id);
                    setConfirmed(false);
                  }}
                  className={`slot-pill ${slot.available ? '' : 'disabled'}`}
                  style={{
                    borderColor: selected ? 'var(--color-orange)' : undefined,
                    background: selected ? 'var(--color-orange)' : undefined,
                    color: selected ? '#FFFFFF' : undefined,
                  }}
                >
                  {slot.label}
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-7">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="font-heading text-[17px] font-extrabold text-ink">3. Pilih pet</h2>
              <p className="mt-0.5 text-sm text-ink-3">
                Pet profile akan dipakai untuk rekomendasi dan booking.
              </p>
            </div>
            <PawPrint size={21} className="text-primary" />
          </div>

          <div className="flex flex-col gap-3">
            {pets.map((pet) => {
              const selected = pet.id === selectedPetId;

              return (
                <m.button
                  key={pet.id}
                  type="button"
                  whileTap={{ scale: 0.985 }}
                  onClick={() => {
                    setSelectedPetId(pet.id);
                    setConfirmed(false);
                  }}
                  className="flex min-h-[76px] items-center gap-3 rounded-[20px] border bg-white px-4 text-left"
                  style={{
                    borderColor: selected ? 'var(--color-orange)' : 'var(--color-stone-2)',
                    background: selected ? 'var(--color-orange-light)' : '#FFFFFF',
                  }}
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-stone text-primary">
                    <PawPrint size={22} />
                  </div>
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
            onChange={(event) => {
              setNotes(event.target.value);
              setConfirmed(false);
            }}
            placeholder="Contoh: kulit sensitif, takut hair dryer, minta update foto..."
            className="mt-3 min-h-[104px] w-full resize-none rounded-[20px] border border-stone-2 bg-white px-4 py-3 text-[15px] leading-6 text-ink outline-none placeholder:text-ink-4 focus:border-primary"
          />
        </section>

        <AnimatePresence>
          {confirmed && (
            <m.section
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-6 rounded-[24px] border border-[#BEE5CB] bg-[#F2FBF5] p-4"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] bg-success text-white">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h2 className="font-heading text-[16px] font-extrabold text-ink">
                    Booking draft siap
                  </h2>
                  <p className="mt-1 text-sm leading-5 text-ink-3">
                    Nanti step ini akan membuat booking order, mengunci slot, dan mengirim
                    notifikasi WhatsApp.
                  </p>
                </div>
              </div>
            </m.section>
          )}
        </AnimatePresence>
      </main>

      <aside className="fixed bottom-[88px] left-1/2 z-50 w-full max-w-[430px] -translate-x-1/2 px-5">
        <div className="rounded-[24px] border border-stone-2 bg-white p-4 shadow-[0_16px_42px_rgba(26,23,20,0.12)]">
          <div className="mb-3 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="font-heading text-[15px] font-extrabold text-ink">
                {selectedService.name}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold text-ink-4">
                <span className="inline-flex items-center gap-1">
                  <CalendarDays size={13} /> {selectedDate.date}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock3 size={13} /> {selectedTimeId}
                </span>
                <span className="inline-flex items-center gap-1">
                  <PawPrint size={13} /> {selectedPet.name}
                </span>
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
            <span>Cabang Jakarta Selatan - konfirmasi admin maksimal 10 menit.</span>
          </div>

          <button
            type="button"
            onClick={confirmBooking}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-[18px] bg-primary font-heading text-[15px] font-extrabold text-white shadow-[0_8px_22px_rgba(224,123,57,0.28)] active:scale-[0.98]"
          >
            {confirmed ? 'Booking Terkonfirmasi' : 'Konfirmasi Booking'}
            <ChevronRight size={18} strokeWidth={2.5} />
          </button>
        </div>
      </aside>

      <BottomNav />
    </div>
  );
}
