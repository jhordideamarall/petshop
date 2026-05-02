import type { CSSProperties } from 'react';
import Link from 'next/link';
import { BestOffersGrid } from '@/components/home/best-offers';

const CATEGORIES = ['Makanan', 'Aksesoris', 'Obat & Vitamin', 'Kandang', 'Grooming', 'Frozen'];

const ScissorsIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#E07B39"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="6" cy="6" r="3" />
    <circle cx="6" cy="18" r="3" />
    <line x1="20" y1="4" x2="8.12" y2="15.88" />
    <line x1="14.47" y1="14.48" x2="20" y2="20" />
    <line x1="8.12" y1="8.12" x2="12" y2="12" />
  </svg>
);

const ChevronRight = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 18l6-6-6-6" />
  </svg>
);

const FEATURES = [
  { label: 'Pengiriman sama hari', sub: 'Order sebelum 14:00' },
  { label: 'Produk original', sub: 'Bergaransi resmi' },
  { label: 'Poin loyalty', sub: 'Setiap pembelian' },
] as const;

export default function HomePage() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: '#F5F3F0',
        minHeight: '100%',
        paddingBottom: 20,
      }}
    >
      {/* Hero Banner */}
      <div
        style={{
          margin: '12px 16px 0',
          borderRadius: 24,
          background: 'linear-gradient(135deg, #1A1714 0%, #3D2F1E 100%)',
          padding: '28px 24px',
          position: 'relative',
          overflow: 'hidden',
          minHeight: 148,
        }}
      >
        <div
          style={{
            position: 'absolute',
            right: -12,
            top: -12,
            width: 140,
            height: 140,
            borderRadius: '50%',
            background: '#E07B39',
            opacity: 0.12,
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: 20,
            bottom: -20,
            width: 90,
            height: 90,
            borderRadius: '50%',
            background: '#E07B39',
            opacity: 0.08,
            pointerEvents: 'none',
          }}
        />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '4px 10px',
              borderRadius: 9999,
              background: 'rgba(224,123,57,0.2)',
              color: '#F5A46A',
              fontFamily: 'var(--font-heading)',
              fontWeight: 600,
              fontSize: 11,
              letterSpacing: '0.2px',
              marginBottom: 10,
            }}
          >
            Flash Sale · Hari Ini
          </span>
          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              fontSize: 26,
              color: 'white',
              lineHeight: 1.15,
              letterSpacing: '-0.5px',
              marginBottom: 6,
            }}
          >
            Diskon
            <br />
            hingga 50%
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 13,
              color: 'rgba(255,255,255,0.55)',
              marginBottom: 16,
            }}
          >
            Makanan &amp; aksesoris premium
          </p>
          <Link
            href="/products"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '9px 18px',
              borderRadius: 9999,
              background: '#E07B39',
              color: 'white',
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: 13,
              textDecoration: 'none',
              border: 'none',
            }}
          >
            Belanja sekarang
          </Link>
        </div>
      </div>

      {/* Feature strip */}
      <div
        style={{
          margin: '12px 16px 0',
          background: '#FDFCFB',
          borderRadius: 16,
          display: 'grid',
          gridTemplateColumns: '1fr 1px 1fr 1px 1fr',
        }}
      >
        {FEATURES.map((feat, i) => (
          <div key={feat.label} style={{ display: 'contents' }}>
            <div style={{ padding: '14px 12px', textAlign: 'center' }}>
              <div
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 700,
                  fontSize: 12,
                  color: '#1A1714',
                  marginBottom: 2,
                }}
              >
                {feat.label}
              </div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: '#6B6460' }}>
                {feat.sub}
              </div>
            </div>
            {i < 2 && <div style={{ background: '#EAE7E2', width: 1 }} />}
          </div>
        ))}
      </div>

      {/* Kategori */}
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 20px 12px',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: 16,
              color: '#1A1714',
            }}
          >
            Kategori
          </span>
          <Link
            href="/products"
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 600,
              fontSize: 13,
              color: '#E07B39',
              textDecoration: 'none',
            }}
          >
            Lihat semua
          </Link>
        </div>
        <div
          style={
            {
              display: 'flex',
              gap: 8,
              paddingLeft: 16,
              paddingRight: 16,
              paddingBottom: 4,
              overflowX: 'auto',
              scrollbarWidth: 'none',
              WebkitOverflowScrolling: 'touch',
            } as CSSProperties
          }
        >
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              href={`/products?category=${cat
                .toLowerCase()
                .replace(/\s+&\s+/g, '-')
                .replace(/\s+/g, '-')}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '8px 16px',
                borderRadius: 9999,
                border: '1.5px solid #D8D4CE',
                background: '#FDFCFB',
                color: '#1A1714',
                fontFamily: 'var(--font-heading)',
                fontWeight: 600,
                fontSize: 13,
                whiteSpace: 'nowrap',
                textDecoration: 'none',
                flexShrink: 0,
              }}
            >
              {cat}
            </Link>
          ))}
        </div>
      </div>

      {/* Grooming & Pet Hotel Banner */}
      <div
        style={{
          margin: '16px 16px 0',
          background: '#FDFCFB',
          borderRadius: 16,
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: '#FDF0E7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <ScissorsIcon />
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: 14,
              color: '#1A1714',
              marginBottom: 2,
            }}
          >
            Grooming &amp; Pet Hotel
          </div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: '#6B6460' }}>
            Booking jadwal sekarang, slot terbatas
          </div>
        </div>
        <Link
          href="/booking"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: '8px 14px',
            borderRadius: 9999,
            border: '1.5px solid #D8D4CE',
            background: '#FDFCFB',
            color: '#1A1714',
            fontFamily: 'var(--font-heading)',
            fontWeight: 600,
            fontSize: 13,
            textDecoration: 'none',
            flexShrink: 0,
          }}
        >
          Booking <ChevronRight />
        </Link>
      </div>

      {/* Penawaran Terbaik */}
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 20px 12px',
          }}
        >
          <div>
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                fontSize: 16,
                color: '#1A1714',
              }}
            >
              Penawaran Terbaik
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: '#6B6460' }}>
                Berakhir dalam
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 700,
                  fontSize: 13,
                  color: '#E07B39',
                }}
              >
                02:14:38
              </span>
            </div>
          </div>
          <Link
            href="/products?sale=true"
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 600,
              fontSize: 13,
              color: '#E07B39',
              textDecoration: 'none',
            }}
          >
            Semua
          </Link>
        </div>

        <BestOffersGrid />
      </div>
    </div>
  );
}
