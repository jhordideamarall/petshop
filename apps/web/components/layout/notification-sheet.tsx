'use client';
import { m, AnimatePresence } from 'framer-motion';
import { X, BellOff, LogIn } from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import Link from 'next/link';

interface Notification {
  id: string;
  title: string;
  desc: string;
  time: string;
  type: 'order' | 'promo' | 'info';
  read: boolean;
}

const DUMMY_NOTIFS: Notification[] = [
  {
    id: '1',
    title: 'Pesanan Dikirim!',
    desc: 'Royal Canin Adult 2kg kamu sedang dalam perjalanan bersama kurir Biteship.',
    time: '2 jam yang lalu',
    type: 'order',
    read: false,
  },
  {
    id: '2',
    title: 'Promo Flash Sale!',
    desc: 'Diskon hingga 50% untuk semua mainan kucing hari ini saja.',
    time: '5 jam yang lalu',
    type: 'promo',
    read: false,
  },
  {
    id: '3',
    title: 'Booking Grooming Berhasil',
    desc: 'Slot grooming untuk si Meong pada 07 Mei jam 10:00 sudah dikonfirmasi.',
    time: 'Kemarin',
    type: 'order',
    read: true,
  },
];

interface NotificationSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationSheet({ isOpen, onClose }: NotificationSheetProps) {
  const { user } = useAuth();
  const isGuest = !user;

  // Guests only see promos
  const displayNotifs = isGuest ? DUMMY_NOTIFS.filter((n) => n.type === 'promo') : DUMMY_NOTIFS;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[150] bg-black/40 backdrop-blur-sm"
          />

          {/* Sheet */}
          <m.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{
              type: 'spring',
              damping: 25,
              stiffness: 280,
              mass: 1,
            }}
            className="fixed right-0 top-0 z-[210] h-full bg-[#FDFCFB]/95 backdrop-blur-xl shadow-[-20px_0_80px_rgba(32,22,14,0.15)] border-l border-white/50"
            style={{
              width: 'calc(min(440px, 100%))',
              paddingTop: 'calc(100px + env(safe-area-inset-top))', // Clears the floating nav (24px + 54px + buffer)
              paddingBottom: 'env(safe-area-inset-bottom)',
            }}
          >
            {/* Header - Repositioned inside the sheet content area */}
            <div className="absolute top-0 left-0 right-0 pt-[env(safe-area-inset-top)]">
              <div className="flex items-center justify-between border-b border-stone-2/50 px-6 py-6 h-[100px]">
                <div>
                  <h2 className="font-heading text-lg font-extrabold text-ink leading-tight">
                    {isGuest ? 'Halo, Paw Parents!' : 'Notifikasi'}
                  </h2>
                  <p className="font-sans text-[12px] font-medium text-ink-3">
                    {isGuest
                      ? 'Masuk buat liat update anabulmu'
                      : 'Info terbaru buat kamu & anabul'}
                  </p>
                </div>
                <m.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-stone-2/40 text-ink-3 hover:bg-stone-2/60 hover:text-ink transition-all"
                >
                  <X size={22} strokeWidth={2.5} />
                </m.button>
              </div>
            </div>

            {/* List - Adjusted to handle the absolute header */}
            <div className="h-full overflow-y-auto pb-32 no-scrollbar px-2">
              <div className="pt-2">
                {isGuest && (
                  <m.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 300, delay: 0.1 }}
                    className="mx-4 mt-2 mb-6 overflow-hidden rounded-2xl border border-[#FF8235]/30 bg-gradient-to-br from-[#FF8235]/10 to-[#FF8235]/5 p-5 shadow-sm"
                  >
                    <h4 className="font-heading text-sm font-bold text-ink">Pantau Pesananmu</h4>
                    <p className="mt-1 font-sans text-xs leading-relaxed text-ink-3">
                      Login sekarang untuk melihat status grooming, pesanan makanan, dan info
                      loyalty point.
                    </p>
                    <Link href="/login" onClick={onClose}>
                      <m.button
                        whileHover={{ y: -2, boxShadow: '0 8px 20px rgba(255,130,53,0.3)' }}
                        whileTap={{ scale: 0.96 }}
                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF8235] py-3 font-heading text-xs font-bold text-white transition-all shadow-lg shadow-[#FF8235]/20"
                      >
                        <LogIn size={14} strokeWidth={3} /> MASUK SEKARANG
                      </m.button>
                    </Link>
                  </m.div>
                )}

                {displayNotifs.length > 0 ? (
                  <div className="space-y-1">
                    {displayNotifs.map((notif, index) => (
                      <m.div
                        key={notif.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          type: 'spring',
                          damping: 25,
                          stiffness: 300,
                          delay: (isGuest ? 0.2 : 0.1) + index * 0.06,
                        }}
                        className={`group relative flex gap-4 mx-2 rounded-2xl px-4 py-5 transition-all ${
                          !notif.read
                            ? 'bg-[#FF8235]/5 border border-[#FF8235]/10'
                            : 'hover:bg-stone-2/30'
                        }`}
                      >
                        <div
                          className={`w-1.5 h-1.5 flex-shrink-0 rounded-full mt-2 ${
                            notif.type === 'order'
                              ? 'bg-[#2D7D52]'
                              : notif.type === 'promo'
                                ? 'bg-[#FF8235]'
                                : 'bg-[#A09890]'
                          } ${!notif.read ? 'ring-4 ring-primary/20' : ''}`}
                        />

                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <h3
                              className={`font-heading text-[14px] font-bold leading-tight ${
                                !notif.read ? 'text-ink' : 'text-ink-2'
                              }`}
                            >
                              {notif.title}
                            </h3>
                            <span className="flex-shrink-0 font-sans text-[10px] font-bold text-ink-4 uppercase tracking-tight">
                              {notif.time}
                            </span>
                          </div>
                          <p className="mt-1.5 font-sans text-[13px] leading-relaxed text-ink-3 group-hover:text-ink transition-colors">
                            {notif.desc}
                          </p>
                        </div>

                        {!notif.read && (
                          <div className="absolute right-4 top-5 h-2 w-2 rounded-full bg-primary" />
                        )}
                      </m.div>
                    ))}
                  </div>
                ) : (
                  <div className="flex h-[50vh] flex-col items-center justify-center px-10 text-center">
                    <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-[32px] bg-stone-2/30 text-ink-4">
                      <BellOff size={40} strokeWidth={1.5} />
                    </div>
                    <h3 className="font-heading text-lg font-bold text-ink">Belum ada kabar</h3>
                    <p className="mt-2 font-sans text-sm text-ink-3 leading-relaxed">
                      Tenang aja, semua info pesanan & promo bakal muncul di sini kok!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </m.div>
        </>
      )}
    </AnimatePresence>
  );
}
