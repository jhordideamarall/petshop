'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Check, ChevronLeft, MapPin, Package, WalletCards } from 'lucide-react';
import { m, AnimatePresence } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { useCartStore, type CartItem } from '@/stores/cart-store';
import { useAuth } from '@/components/providers/auth-provider';
import { useQuery } from '@tanstack/react-query';
import { getUserAddresses, type Address } from '@/lib/services/address-client';
import { Loader2, Plus } from 'lucide-react';
import dynamic from 'next/dynamic';

const AddressSheet = dynamic(
  () => import('@/components/checkout/address-sheet').then((mod) => mod.AddressSheet),
  { ssr: false },
);

const fmt = (n: number) => n.toLocaleString('id-ID');

const steps = ['Alamat', 'Pengiriman', 'Bayar'];

const shippingOptions = [
  { id: 'jne', name: 'JNE Reguler', eta: 'Estimasi 2-4 hari', price: 15000 },
  { id: 'jnt', name: 'JNT Express', eta: 'Estimasi 1-3 hari', price: 12000 },
  {
    id: 'same-day',
    name: 'Same Day Delivery',
    eta: 'Estimasi < 3 jam (sebelum 14:00)',
    price: 28000,
  },
];

const paymentOptions = [
  { id: 'gopay', name: 'GoPay', type: 'E-Wallet' },
  { id: 'ovo', name: 'OVO', type: 'E-Wallet' },
  { id: 'dana', name: 'DANA', type: 'E-Wallet' },
  { id: 'qris', name: 'QRIS', type: 'QRIS' },
  { id: 'bca', name: 'Virtual Account BCA', type: 'Transfer Bank' },
];

function Thumb({ item, size = 52 }: { item: CartItem; size?: number }) {
  const label = item.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();

  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-[12px] bg-stone font-heading text-[10px] font-extrabold text-ink-4"
      style={{ width: size, height: size }}
    >
      {item.imageUrl ? (
        <Image
          src={item.imageUrl}
          alt={item.name}
          fill
          sizes={`${size}px`}
          className="object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">{label || 'PV'}</div>
      )}
    </div>
  );
}

function RadioMark({ selected }: { selected: boolean }) {
  return (
    <span
      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2"
      style={{
        borderColor: selected ? 'var(--color-orange)' : 'var(--color-stone-3)',
      }}
    >
      {selected && <span className="h-3 w-3 rounded-full bg-primary" />}
    </span>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [step, setStep] = useState(1);
  const [shippingId, setShippingId] = useState('jnt');
  const [paymentId, setPaymentId] = useState('gopay');
  const [submitting, setSubmitting] = useState(false);
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);

  const { user } = useAuth();

  const {
    data: addresses = [],
    isLoading: isLoadingAddresses,
    refetch: refetchAddresses,
  } = useQuery({
    queryKey: ['addresses', user?.id],
    queryFn: getUserAddresses,
    enabled: !!user,
  });

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [guestAddress, setGuestAddress] = useState<Partial<Address> | null>(null);
  const [isAddressSheetOpen, setIsAddressSheetOpen] = useState(false);

  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const def = addresses.find((a: any) => a.is_default) || addresses[0]; // eslint-disable-line @typescript-eslint/no-explicit-any
      setSelectedAddressId(def.id);
    }
  }, [addresses, selectedAddressId]);

  const activeAddress = guestAddress || addresses.find((a: Address) => a.id === selectedAddressId);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const subtotal = useMemo(
    () => items.reduce((total, item) => total + item.price * item.quantity, 0),
    [items],
  );
  const count = useMemo(() => items.reduce((total, item) => total + item.quantity, 0), [items]);
  const selectedShipping =
    shippingOptions.find((option) => option.id === shippingId) ?? shippingOptions[0];
  const shippingPrice = step >= 2 ? selectedShipping.price : 0;
  const total = subtotal + shippingPrice;
  const hasItems = hydrated && (items.length > 0 || submitting);

  const goBack = () => {
    if (step > 1) {
      setStep((current) => current - 1);
      return;
    }
    router.back();
  };

  const continueFlow = () => {
    if (!activeAddress && step === 1) {
      setIsAddressSheetOpen(true);
      return;
    }

    if (step < 3) {
      setStep((current) => current + 1);
      return;
    }

    setSubmitting(true);
    clearCart();
    router.push('/checkout/success');
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col bg-stone">
      <AddressSheet
        isOpen={isAddressSheetOpen}
        onClose={() => setIsAddressSheetOpen(false)}
        onSuccess={(addr) => {
          setGuestAddress(addr);
          if (user) {
            refetchAddresses().then((res) => {
              const realAddr = res.data?.find((a: Address) => a.full_address === addr.full_address);
              if (realAddr) setSelectedAddressId(realAddr.id);
            });
          }
          setIsAddressSheetOpen(false);
        }}
      />
      <header className="sticky top-0 z-50 border-b border-stone-2 bg-white">
        <div className="flex h-16 items-center px-[clamp(16px,5vw,20px)]">
          <button
            onClick={goBack}
            className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-stone text-ink active:scale-95 transition-transform"
            aria-label="Kembali"
          >
            <ChevronLeft size={22} strokeWidth={2.5} />
          </button>
          <h1 className="ml-3 font-heading text-[19px] font-extrabold text-ink">Checkout</h1>
        </div>

        {hasItems && (
          <div className="px-[clamp(18px,6vw,24px)] py-5">
            <div className="grid grid-cols-[32px_1fr_32px_1fr_32px] items-start gap-2">
              {steps.map((label, index) => {
                const number = index + 1;
                const complete = step > number;
                const active = step === number;

                return (
                  <div key={label} className="contents">
                    <div className="flex flex-col items-center gap-2">
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-full font-heading text-[13px] font-extrabold"
                        style={{
                          background: complete
                            ? 'var(--color-success)'
                            : active
                              ? 'var(--color-orange)'
                              : 'var(--color-stone-2)',
                          color: complete || active ? '#FFFFFF' : 'var(--color-ink-4)',
                        }}
                      >
                        {complete ? <Check size={16} strokeWidth={3} /> : number}
                      </div>
                      <span
                        className="font-heading text-[11px] font-extrabold"
                        style={{
                          color: active
                            ? 'var(--color-orange)'
                            : complete
                              ? 'var(--color-success)'
                              : 'var(--color-ink-4)',
                        }}
                      >
                        {label}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className="mt-4 h-[2px]"
                        style={{
                          background:
                            step > number ? 'var(--color-success)' : 'var(--color-stone-2)',
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 overflow-y-auto px-[clamp(16px,5vw,20px)] py-5 pb-32">
        {!hasItems ? (
          <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
            <p className="font-heading text-[17px] font-extrabold text-ink">
              Belum ada item checkout
            </p>
            <button
              onClick={() => router.push('/products')}
              className="mt-5 rounded-[14px] bg-primary px-[clamp(16px,5vw,20px)] py-3 font-heading text-sm font-bold text-white"
            >
              Pilih Produk
            </button>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {step === 1 && (
              <m.div
                key="address"
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -18 }}
                transition={{ duration: 0.18 }}
                className="flex flex-col gap-3"
              >
                <section className="rounded-[18px] bg-white p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-heading text-[14px] font-extrabold text-ink">
                      <MapPin size={18} className="text-primary" />
                      <span>Alamat Pengiriman</span>
                    </div>
                    {addresses.length > 0 && (
                      <button
                        onClick={() => setIsAddressSheetOpen(true)}
                        className="font-heading text-[13px] font-extrabold text-primary"
                      >
                        Ubah
                      </button>
                    )}
                  </div>

                  {isLoadingAddresses ? (
                    <div className="flex h-24 items-center justify-center rounded-[14px] bg-stone">
                      <Loader2 className="animate-spin text-primary" size={24} />
                    </div>
                  ) : activeAddress ? (
                    <div className="rounded-[14px] bg-stone p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <p className="font-heading text-[14px] font-extrabold text-ink">
                          {activeAddress.recipient_name}
                        </p>
                        {activeAddress.is_default && (
                          <span
                            className="rounded-full px-3 py-1 font-heading text-[10px] font-extrabold text-primary"
                            style={{ background: 'var(--color-orange-light)' }}
                          >
                            Utama
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-ink-3">{activeAddress.phone}</p>
                      <p className="mt-2 text-sm font-medium leading-relaxed text-ink-3">
                        {activeAddress.full_address}
                        <br />
                        {activeAddress.city}, {activeAddress.postal_code}
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsAddressSheetOpen(true)}
                      className="flex w-full flex-col items-center justify-center gap-2 rounded-[18px] border-2 border-dashed border-stone-3 p-8 transition-colors active:bg-stone"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone text-primary">
                        <Plus size={20} />
                      </div>
                      <span className="font-heading text-[14px] font-extrabold text-ink-3">
                        Tambah Alamat Baru
                      </span>
                    </button>
                  )}
                </section>

                <section className="rounded-[18px] bg-white p-4">
                  <div className="mb-4 flex items-center gap-2 font-heading text-[14px] font-extrabold text-ink">
                    <Package size={18} />
                    <span>Pesanan ({count} item)</span>
                  </div>
                  <div className="flex flex-col gap-3">
                    {items.map((item) => (
                      <div
                        key={`${item.id}-${item.variantId ?? 'base'}`}
                        className="flex items-center gap-3"
                      >
                        <Thumb item={item} />
                        <div className="min-w-0">
                          <p className="line-clamp-1 font-heading text-[13px] font-extrabold text-ink">
                            {item.name}
                          </p>
                          <p className="mt-1 text-sm font-medium text-ink-3">
                            x{item.quantity} · Rp {fmt(item.price)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </m.div>
            )}

            {step === 2 && (
              <m.div
                key="shipping"
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -18 }}
                transition={{ duration: 0.18 }}
              >
                <h2 className="mb-4 font-heading text-[15px] font-extrabold text-ink">
                  Pilih Metode Pengiriman
                </h2>
                <div className="flex flex-col gap-3">
                  {shippingOptions.map((option) => {
                    const selected = option.id === shippingId;
                    return (
                      <button
                        key={option.id}
                        onClick={() => setShippingId(option.id)}
                        className="flex min-h-[76px] items-center gap-3 rounded-[14px] border bg-white px-4 text-left"
                        style={{
                          borderColor: selected ? 'var(--color-orange)' : 'var(--color-stone-3)',
                          background: selected ? 'var(--color-orange-light)' : '#FFFFFF',
                        }}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-heading text-[14px] font-extrabold text-ink">
                            {option.name}
                          </p>
                          <p className="mt-1 text-sm font-medium text-ink-3">{option.eta}</p>
                        </div>
                        <p className="font-heading text-[15px] font-extrabold text-primary">
                          Rp {fmt(option.price)}
                        </p>
                        <RadioMark selected={selected} />
                      </button>
                    );
                  })}
                </div>
              </m.div>
            )}

            {step === 3 && (
              <m.div
                key="payment"
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -18 }}
                transition={{ duration: 0.18 }}
              >
                <h2 className="mb-4 font-heading text-[15px] font-extrabold text-ink">
                  Metode Pembayaran
                </h2>
                <div className="flex flex-col gap-3">
                  {paymentOptions.map((option) => {
                    const selected = option.id === paymentId;
                    return (
                      <button
                        key={option.id}
                        onClick={() => setPaymentId(option.id)}
                        className="flex min-h-[72px] items-center gap-3 rounded-[14px] border bg-white px-4 text-left"
                        style={{
                          borderColor: selected ? 'var(--color-orange)' : 'var(--color-stone-3)',
                          background: selected ? 'var(--color-orange-light)' : '#FFFFFF',
                        }}
                      >
                        <WalletCards
                          size={20}
                          className={selected ? 'text-primary' : 'text-ink-4'}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-heading text-[14px] font-extrabold text-ink">
                            {option.name}
                          </p>
                          <p className="mt-1 text-sm font-medium text-ink-3">{option.type}</p>
                        </div>
                        <RadioMark selected={selected} />
                      </button>
                    );
                  })}
                </div>

                <section className="mt-4 rounded-[18px] bg-white p-4">
                  <h3 className="mb-4 font-heading text-[14px] font-extrabold text-ink">
                    Ringkasan
                  </h3>
                  <div className="flex justify-between text-sm text-ink-3">
                    <span>Subtotal</span>
                    <span className="font-heading font-extrabold text-ink">Rp {fmt(subtotal)}</span>
                  </div>
                  <div className="mt-4 flex justify-between text-sm text-ink-3">
                    <span>Ongkir</span>
                    <span className="font-heading font-extrabold text-ink">
                      Rp {fmt(selectedShipping.price)}
                    </span>
                  </div>
                  <div className="my-4 h-px bg-stone-2" />
                  <div className="flex justify-between">
                    <span className="font-heading text-[14px] font-extrabold text-ink">Total</span>
                    <span className="font-heading text-[18px] font-extrabold text-primary">
                      Rp {fmt(total)}
                    </span>
                  </div>
                </section>
              </m.div>
            )}
          </AnimatePresence>
        )}
      </main>

      {hasItems && (
        <div className="fixed bottom-0 left-1/2 z-50 w-full max-w-[430px] -translate-x-1/2 border-t border-stone-2 bg-white px-[clamp(16px,5vw,20px)] py-4">
          <button
            onClick={continueFlow}
            disabled={submitting || (step === 1 && !activeAddress)}
            className="flex h-14 w-full items-center justify-center rounded-[18px] bg-primary font-heading text-[15px] font-extrabold text-white shadow-md active:scale-[0.98] transition-transform disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="animate-spin" size={20} />
            ) : step < 3 ? (
              'Lanjutkan'
            ) : (
              `Bayar Rp ${fmt(total)}`
            )}
          </button>
          <div className="safe-bottom" />
        </div>
      )}
    </div>
  );
}
