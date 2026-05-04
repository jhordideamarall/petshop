'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { m } from 'framer-motion';
import { X, Loader2, Navigation, Check, ExternalLink, ShieldCheck, ArrowRight } from 'lucide-react';
import { getDetailedAddress } from '@petshop/core';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/components/providers/auth-provider';
import { useLocationStore } from '@/stores/location-store';
import { JumpingDots } from '@/components/shared/jumping-dots';

// Dynamically import the map component with SSR disabled
const AddressMap = dynamic(() => import('./address-map'), { 
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-stone">
      <Loader2 className="animate-spin text-primary" size={24} />
    </div>
  )
});

interface AddressSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddressSheet({ isOpen, onClose, onSuccess }: AddressSheetProps) {
  const { user } = useAuth();
  const globalLocation = useLocationStore();
  const [step, setStep] = useState<'map' | 'form' | 'otp'>('map');
  const [coords, setCoords] = useState<[number, number]>(
    globalLocation.coords || [-6.2088, 106.8456]
  );
  const [isLocating, setIsLocating] = useState(false);
  const [isLoadingDetails, setIsLoadingLoadingDetails] = useState(false);
  
  // Form State
  const [label] = useState('Rumah');
  const [recipient, setRecipient] = useState('');
  const [phone, setPhone] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [isDefault, setIsDefault] = useState(true);
  
  // OTP State
  const [otpToken, setOtpToken] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const supabase = createClient();

  const handleDetectLocation = () => {
    if ('geolocation' in navigator) {
      setIsLocating(true);
      
      // Check permission status first to provide better feedback
      if ('permissions' in navigator) {
        navigator.permissions.query({ name: 'geolocation' }).then((result) => {
          if (latestStatusRef.current === 'denied' || result.state === 'denied') {
            toast.error('Izin lokasi diblokir oleh browser. Klik ikon "Tune/Lock" di sebelah URL untuk mereset izin.', {
              duration: 5000
            });
            setIsLocating(false);
            return;
          }
        });
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords([position.coords.latitude, position.coords.longitude]);
          setIsLocating(false);
        },
        (error) => {
          setIsLocating(false);
          if (error.code === 1) { // PERMISSION_DENIED
            toast.error('Izin lokasi ditolak. Silakan aktifkan di pengaturan browser Anda.');
          } else {
            toast.error('Gagal mendeteksi lokasi. Pastikan GPS aktif.');
          }
        },
        { timeout: 8000, enableHighAccuracy: true }
      );
    } else {
      toast.error('Browser ini tidak mendukung deteksi lokasi (Membutuhkan HTTPS)');
    }
  };

  const latestStatusRef = useRef<string>('prompt');
  useEffect(() => {
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        latestStatusRef.current = result.state;
        result.onchange = () => {
          latestStatusRef.current = result.state;
        };
      });
    }
  }, []);

  const handleOpenInGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${coords[0]},${coords[1]}`;
    window.open(url, '_blank');
  };

  const handleConfirmLocation = async () => {
    setIsLoadingLoadingDetails(true);
    try {
      const details = await getDetailedAddress(coords[0], coords[1]);
      setFullAddress(details.fullAddress);
      setCity(details.city);
      setDistrict(details.district || '');
      setPostalCode(details.postcode || '');
      setStep('form');
    } catch (error) {
      toast.error('Gagal mengambil detail alamat');
    } finally {
      setIsLoadingLoadingDetails(false);
    }
  };

  const handleInitiateVerification = async () => {
    if (!recipient || !phone || !fullAddress) {
      toast.error('Mohon lengkapi data alamat');
      return;
    }

    const formattedPhone = phone.startsWith('0') ? `+62${phone.slice(1)}` : phone.startsWith('+') ? phone : `+62${phone}`;

    if (user) {
      await saveAddress(user.id);
      return;
    }

    setIsVerifying(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
        options: {
          data: {
            full_name: recipient,
          }
        }
      });

      if (error) throw error;

      toast.success('Kode OTP telah dikirim ke nomor HP kamu');
      setStep('otp');
    } catch (error: any) {
      toast.error(error.message || 'Gagal mengirim OTP');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifyAndSave = async () => {
    if (otpToken.length < 6) {
      toast.error('Masukkan 6 digit kode OTP');
      return;
    }

    // DEMO MODE BYPASS: Allows testing without real SMS
    if (otpToken === '123456') {
      toast.success('Demo: OTP Berhasil diverifikasi');
      // We need a real user for the address to link to. 
      // If we are in demo mode and not logged in, we'll try to get the user again
      const { data: { user: existingUser } } = await supabase.auth.getUser();
      if (existingUser) {
        await saveAddress(existingUser.id);
        return;
      }
      // If no real user, we still need to call verifyOtp to get one, 
      // but since this is demo, we'll just show an error if they aren't actually using a real phone flow.
    }

    const formattedPhone = phone.startsWith('0') ? `+62${phone.slice(1)}` : phone.startsWith('+') ? phone : `+62${phone}`;

    setIsSaving(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otpToken,
        type: 'sms',
      });

      if (error) throw error;
      if (!data.user) throw new Error('Verifikasi gagal');

      await saveAddress(data.user.id);
    } catch (error: any) {
      toast.error(error.message || 'Kode OTP salah atau kedaluwarsa');
      setIsSaving(false);
    }
  };

  const saveAddress = async (userId: string) => {
    setIsSaving(true);
    try {
      const { error } = await supabase.from('addresses').insert({
        user_id: userId,
        label,
        recipient_name: recipient,
        phone,
        full_address: fullAddress,
        city,
        district,
        postal_code: postalCode,
        latitude: coords[0],
        longitude: coords[1],
        is_default: isDefault,
      });

      if (error) throw error;

      toast.success('Alamat dan Akun berhasil disimpan');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Gagal menyimpan alamat');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/40 backdrop-blur-sm">
      <m.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-[430px] rounded-t-[32px] bg-white pb-10"
      >
        <div className="flex items-center justify-between p-6">
          <h2 className="font-heading text-[18px] font-extrabold text-ink text-left">
            {step === 'map' ? 'Pilih Titik Lokasi' : step === 'otp' ? 'Verifikasi Nomor HP' : 'Detail Alamat'}
          </h2>
          <button onClick={onClose} className="rounded-full bg-stone p-2 text-ink-3">
            <X size={20} />
          </button>
        </div>

        <div className="px-6">
          {step === 'map' ? (
            <div className="flex flex-col gap-6">
              <div className="relative h-[300px] w-full overflow-hidden rounded-2xl border border-stone-2 shadow-inner">
                <AddressMap coords={coords} onClick={(lat, lng) => setCoords([lat, lng])} />
                <button
                  onClick={handleOpenInGoogleMaps}
                  className="absolute bottom-4 right-4 z-[10] flex h-10 items-center gap-2 rounded-lg bg-white px-3 font-heading text-[12px] font-bold text-ink shadow-md active:scale-95 transition-transform"
                >
                  <ExternalLink size={14} />
                  Buka di Maps
                </button>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleDetectLocation}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-stone-3 font-heading text-[14px] font-bold text-ink transition-colors active:bg-stone"
                >
                  {isLocating ? <Loader2 className="animate-spin" size={18} /> : <Navigation size={18} />}
                  Gunakan Lokasi Saat Ini
                </button>
                <button
                  onClick={handleConfirmLocation}
                  disabled={isLoadingDetails}
                  className="flex h-14 w-full items-center justify-center rounded-2xl bg-primary font-heading text-[15px] font-extrabold text-white shadow-lg shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {isLoadingDetails ? <Loader2 className="animate-spin" size={20} /> : 'Konfirmasi Titik Lokasi'}
                </button>
              </div>
            </div>
          ) : step === 'form' ? (
            <div className="flex flex-col gap-4 overflow-y-auto max-h-[60vh] no-scrollbar text-left">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-[12px] font-bold text-ink-3">Nama Penerima</label>
                  <input
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="h-12 w-full rounded-xl border border-stone-3 px-4 font-sans text-sm outline-none focus:border-primary"
                    placeholder="Contoh: Andi"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[12px] font-bold text-ink-3">Nomor HP</label>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-12 w-full rounded-xl border border-stone-3 px-4 font-sans text-sm outline-none focus:border-primary"
                    placeholder="0812xxx"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[12px] font-bold text-ink-3">Alamat Lengkap</label>
                <textarea
                  value={fullAddress}
                  onChange={(e) => setFullAddress(e.target.value)}
                  className="w-full rounded-xl border border-stone-3 p-4 font-sans text-sm outline-none focus:border-primary"
                  rows={3}
                  placeholder="Nama jalan, nomor rumah, dll"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-[12px] font-bold text-ink-3">Kota</label>
                  <input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="h-12 w-full rounded-xl border border-stone-3 bg-stone px-4 font-sans text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[12px] font-bold text-ink-3">Kode Pos</label>
                  <input
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="h-12 w-full rounded-xl border border-stone-3 px-4 font-sans text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 py-2">
                <button
                  onClick={() => setIsDefault(!isDefault)}
                  className={`flex h-6 w-6 items-center justify-center rounded-md border-2 transition-colors ${isDefault ? 'border-primary bg-primary text-white' : 'border-stone-3'}`}
                >
                  {isDefault && <Check size={16} strokeWidth={3} />}
                </button>
                <span className="text-sm font-semibold text-ink">Jadikan Alamat Utama</span>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setStep('map')}
                  className="h-14 flex-1 rounded-2xl border border-stone-3 font-heading text-[15px] font-bold text-ink"
                >
                  Kembali
                </button>
                <button
                  onClick={handleInitiateVerification}
                  disabled={isVerifying || isSaving}
                  className="h-14 flex-[2] rounded-2xl bg-primary font-heading text-[15px] font-extrabold text-white shadow-lg shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-70"
                >
                  {isVerifying || isSaving ? <JumpingDots /> : user ? 'Simpan Alamat' : 'Simpan & Verifikasi'}
                </button>
              </div>
            </div>
          ) : (
            <m.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col gap-6 pb-4 text-left"
            >
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <ShieldCheck size={28} />
                </div>
                <p className="text-sm font-medium text-ink-3">
                  Masukkan 6 digit kode yang dikirim ke <br />
                  <span className="font-bold text-ink">{phone}</span>
                </p>
              </div>

              <div className="relative">
                <input
                  type="tel"
                  maxLength={6}
                  value={otpToken}
                  onChange={(e) => setOtpToken(e.target.value.replace(/[^0-9]/g, ''))}
                  className="h-16 w-full rounded-2xl border-2 border-stone-3 bg-stone/30 text-center font-heading text-[24px] font-bold tracking-[12px] text-ink outline-none focus:border-primary focus:bg-white"
                  placeholder="xxxxxx"
                  autoFocus
                  autoComplete="one-time-code"
                />
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleVerifyAndSave}
                  disabled={isSaving || otpToken.length < 6}
                  className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary font-heading text-[15px] font-extrabold text-white shadow-lg shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {isSaving ? <JumpingDots /> : (
                    <>
                      Verifikasi & Lanjutkan <ArrowRight size={18} />
                    </>
                  )}
                </button>
                <button
                  onClick={() => setStep('form')}
                  className="font-heading text-[13px] font-bold text-ink-4 hover:text-ink transition-colors"
                >
                  Ganti Nomor HP
                </button>
              </div>
            </m.div>
          )}
        </div>
      </m.div>
    </div>
  );
}
