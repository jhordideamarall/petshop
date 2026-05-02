'use client';
import { useState } from 'react';
import { TopBar } from '@/components/layout/top-bar';
import { m, AnimatePresence } from 'framer-motion';

const MapPin = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const STEPS = ['Alamat', 'Pengiriman', 'Pembayaran'];

export default function CheckoutPage() {
  const [step, setStep] = useState(1);

  return (
    <div className="flex min-h-screen flex-col bg-stone">
      <TopBar title="Checkout" />

      {/* Progress Stepper */}
      <div className="border-b border-stone-2 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          {STEPS.map((label, i) => (
            <div key={label} className="flex flex-1 items-center gap-2">
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold transition-colors ${
                  step > i + 1
                    ? 'bg-green-500 text-white'
                    : step === i + 1
                      ? 'bg-primary text-white'
                      : 'bg-stone-2 text-ink-4'
                }`}
              >
                {step > i + 1 ? '✓' : i + 1}
              </div>
              <span
                className={`font-heading text-[11px] font-bold tracking-tight ${
                  step === i + 1 ? 'text-primary' : 'text-ink-4'
                }`}
              >
                {label}
              </span>
              {i < STEPS.length - 1 && <div className="h-[1.5px] flex-1 bg-stone-2 mx-1" />}
            </div>
          ))}
        </div>
      </div>

      <main className="flex-1 p-4">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <m.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-4"
            >
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin />
                    <span className="t-label">Alamat Pengiriman</span>
                  </div>
                  <button className="text-[13px] font-bold text-primary">Ubah</button>
                </div>
                <div className="rounded-xl bg-stone p-4">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="t-label">Andi Pratama</span>
                    <span className="chip chip-orange text-[9px]">Utama</span>
                  </div>
                  <p className="t-small mb-2 text-ink-3">0812-3456-7890</p>
                  <p className="t-small text-ink-3 leading-relaxed">
                    Jl. Kemang Raya No. 45, Kemang, Jakarta Selatan, 12730
                  </p>
                </div>
              </div>
            </m.div>
          )}

          {step === 2 && (
            <m.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-3"
            >
              <h2 className="t-label px-1">Pilih Metode Pengiriman</h2>
              {['Instant (3 Jam)', 'Same-Day (6 Jam)', 'Reguler (1-2 Hari)'].map((ship) => (
                <div key={ship} className="radio-card">
                  <div className="flex-1">
                    <p className="t-label">{ship}</p>
                    <p className="t-micro mt-0.5">Estimasi tiba hari ini</p>
                  </div>
                  <span className="t-price-sm">Rp 15.000</span>
                  <div className="radio-dot ml-2" />
                </div>
              ))}
            </m.div>
          )}

          {step === 3 && (
            <m.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-3"
            >
              <h2 className="t-label px-1">Metode Pembayaran</h2>
              {['QRIS', 'Gopay', 'Virtual Account BCA'].map((pay) => (
                <div key={pay} className="radio-card">
                  <div className="flex-1 t-label">{pay}</div>
                  <div className="radio-dot" />
                </div>
              ))}

              <div className="mt-4 rounded-2xl bg-white p-5 shadow-sm">
                <h3 className="t-label mb-4">Ringkasan Pembayaran</h3>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-ink-3">Subtotal</span>
                  <span className="font-bold text-ink">Rp 415.000</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-ink-3">Ongkos Kirim</span>
                  <span className="font-bold text-ink">Rp 15.000</span>
                </div>
                <div className="divider my-4" />
                <div className="flex justify-between">
                  <span className="t-label">Total</span>
                  <span className="font-heading text-lg font-extrabold text-primary">
                    Rp 430.000
                  </span>
                </div>
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer sticky */}
      <div className="sticky bottom-0 rounded-t-3xl border-t border-stone-2 bg-white p-5 shadow-2xl">
        <button
          onClick={() =>
            step < 3 ? setStep(step + 1) : (window.location.href = '/checkout/success')
          }
          className="flex w-full items-center justify-center rounded-xl bg-primary py-4 font-heading text-sm font-bold text-white shadow-md active:scale-95 transition-transform"
        >
          {step < 3 ? 'Lanjutkan' : 'Bayar Sekarang'}
        </button>
        <div className="safe-bottom" />
      </div>
    </div>
  );
}
