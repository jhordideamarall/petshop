'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { m } from 'framer-motion';
import { ChevronLeft, User, Phone, Mail, Loader2, Camera } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import type { AuthError } from '@supabase/supabase-js';

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const next = searchParams.get('next') || '/';

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      toast.error('Nama dan Nomor HP wajib diisi');
      return;
    }

    setIsLoading(true);
    try {
      const formattedPhone = phone.startsWith('0')
        ? `+62${phone.slice(1)}`
        : phone.startsWith('+')
          ? phone
          : `+62${phone}`;

      // Since Supabase Auth usually uses Email/Password or OTP,
      // registration here will trigger the OTP flow to verify the phone.
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
        options: {
          data: {
            full_name: name,
            email: email || undefined,
          },
        },
      });

      if (error) throw error;

      toast.success('Kode verifikasi dikirim ke HP kamu');
      // Redirect to login to enter OTP, pass the next param
      router.push(`/login?phone=${formattedPhone}&next=${encodeURIComponent(next)}`);
    } catch (err) {
      const error = err as AuthError;
      toast.error(error.message || 'Gagal mendaftar');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[100dvh] flex-col bg-[#FDFCFB]">
      {/* Header */}
      <header className="flex h-16 items-center px-[clamp(16px,5vw,20px)] pt-[env(safe-area-inset-top)]">
        <button
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-black/5 active:scale-95 transition-transform"
        >
          <ChevronLeft size={22} className="text-ink" />
        </button>
      </header>

      <main className="flex flex-1 flex-col px-[clamp(24px,8vw,32px)] pt-8 pb-10">
        <div className="mb-10 text-center">
          <m.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mx-auto mb-6 relative flex h-24 w-24 items-center justify-center rounded-full bg-stone"
          >
            <User size={40} className="text-[#A09890]" />
            <button className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-md">
              <Camera size={16} />
            </button>
          </m.div>
          <h1 className="font-heading text-[26px] font-extrabold text-ink">Buat Profil</h1>
          <p className="mt-2 text-sm font-medium text-ink-3">
            Lengkapi data dirimu untuk mulai memesan.
          </p>
        </div>

        <form onSubmit={handleRegister} className="flex flex-col gap-5">
          <div className="space-y-1.5">
            <label className="ml-1 font-heading text-[13px] font-bold text-ink">Nama Lengkap</label>
            <div className="group relative flex items-center">
              <div className="absolute left-4 text-[#A09890] transition-colors group-focus-within:text-primary">
                <User size={18} />
              </div>
              <input
                type="text"
                placeholder="Masukkan nama lengkap"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-14 w-full rounded-2xl border border-stone-3 bg-white pl-12 pr-4 font-sans text-[15px] font-semibold text-ink outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="ml-1 font-heading text-[13px] font-bold text-ink">
              Nomor Handphone
            </label>
            <div className="group relative flex items-center">
              <div className="absolute left-4 text-[#A09890] transition-colors group-focus-within:text-primary">
                <Phone size={18} />
              </div>
              <input
                type="tel"
                placeholder="0812xxxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/[^0-9+]/g, ''))}
                className="h-14 w-full rounded-2xl border border-stone-3 bg-white pl-12 pr-4 font-sans text-[15px] font-semibold text-ink outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="ml-1 font-heading text-[13px] font-bold text-ink">
              Email (Opsional)
            </label>
            <div className="group relative flex items-center">
              <div className="absolute left-4 text-[#A09890] transition-colors group-focus-within:text-primary">
                <Mail size={18} />
              </div>
              <input
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-14 w-full rounded-2xl border border-stone-3 bg-white pl-12 pr-4 font-sans text-[15px] font-semibold text-ink outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !name || !phone}
            className="mt-4 flex h-14 w-full items-center justify-center rounded-2xl bg-primary font-heading text-[15px] font-extrabold text-white shadow-lg shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Daftar Sekarang'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm font-medium text-ink-3">
          Sudah punya akun?{' '}
          <Link
            href={`/login?next=${encodeURIComponent(next)}`}
            className="font-bold text-primary active:opacity-70"
          >
            Masuk di sini
          </Link>
        </p>
      </main>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      }
    >
      <RegisterContent />
    </Suspense>
  );
}
