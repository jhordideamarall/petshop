'use client';
import { useState, useRef, type CSSProperties, type MouseEvent } from 'react';
import NextImage from 'next/image';
import { m, AnimatePresence } from 'framer-motion';
import { PriceTag } from './price-tag';
import { RatingStars } from './rating-stars';

export interface ProductCardData {
  id: string | number;
  name: string;
  slug: string;
  price: number;
  promoPrice?: number | null;
  imageColor?: string;
  imageLabel?: string;
  imageUrl?: string | null;
  rating?: number;
  reviewCount?: number;
  soldCount?: number;
  type?: 'normal' | 'frozen' | 'parcel';
  category?: string;
}

interface ProductCardProps {
  product: ProductCardData;
  onAddToCart?: (product: ProductCardData) => void;
  href?: string;
}

const PlusIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="white"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const CheckIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="white"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export function ProductCard({ product, onAddToCart, href }: ProductCardProps) {
  const [justAdded, setJustAdded] = useState(false);
  const discountPct = product.promoPrice
    ? Math.round((1 - product.promoPrice / product.price) * 100)
    : null;
  const bgColor = product.imageColor ?? '#D4C4A0';

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleAddToCart = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Always trigger the cart addition immediately (allows spamming)
    onAddToCart?.(product);

    // Visual feedback logic
    setJustAdded(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setJustAdded(false), 800);
  };

  return (
    <a
      href={href ?? `/products/${product.slug}`}
      style={{
        background: '#FDFCFB',
        borderRadius: 16,
        overflow: 'hidden',
        cursor: 'pointer',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        display: 'flex',
        flexDirection: 'column',
        textDecoration: 'none',
      }}
    >
      {/* Image area */}
      <div
        className="group relative"
        style={{
          aspectRatio: '1 / 1',
          overflow: 'hidden',
        }}
      >
        {product.imageUrl ? (
          <NextImage
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 50vw, 33vw"
          />
        ) : (
          <div
            style={{
              width: '70%',
              height: '70%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 10,
              background: bgColor + '60',
              opacity: 0.7,
              fontFamily: 'var(--font-heading)',
              fontSize: 10,
              fontWeight: 600,
              color: '#6B6460',
              textAlign: 'center',
              lineHeight: 1.3,
            }}
          >
            {product.imageLabel ?? product.name.slice(0, 8)}
          </div>
        )}

        {/* Discount badge */}
        {discountPct !== null && (
          <div style={{ position: 'absolute', top: 10, left: 10 }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '2px 6px',
                borderRadius: 6,
                background: '#E53935',
                color: '#fff',
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                fontSize: 10,
              }}
            >
              -{discountPct}%
            </span>
          </div>
        )}

        {/* Frozen badge */}
        {discountPct === null && product.type === 'frozen' && (
          <div style={{ position: 'absolute', top: 10, left: 10 }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '2px 6px',
                borderRadius: 6,
                background: '#EAE7E2',
                color: '#6B6460',
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                fontSize: 10,
              }}
            >
              Frozen
            </span>
          </div>
        )}

        {/* Add to cart button — animated bounce */}
        {onAddToCart && (
          <m.button
            onClick={handleAddToCart}
            whileTap={{ scale: 0.85 }}
            animate={{ scale: justAdded ? 1.12 : 1 }}
            transition={{
              scale: { type: 'spring', stiffness: 420, damping: 14 },
            }}
            style={{
              position: 'absolute',
              bottom: 10,
              right: 10,
              width: 32,
              height: 32,
              borderRadius: 10,
              backgroundColor: justAdded ? '#2D7D52' : '#E07B39',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: justAdded
                ? '0 2px 8px rgba(45,125,82,0.4)'
                : '0 2px 8px rgba(224,123,57,0.4)',
              transition: 'background-color 0.18s ease, box-shadow 0.18s ease',
            }}
          >
            <AnimatePresence mode="wait">
              {justAdded ? (
                <m.span
                  key="check"
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 90 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                  style={{ display: 'flex' }}
                >
                  <CheckIcon />
                </m.span>
              ) : (
                <m.span
                  key="plus"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                  style={{ display: 'flex' }}
                >
                  <PlusIcon />
                </m.span>
              )}
            </AnimatePresence>
          </m.button>
        )}
      </div>

      {/* Info */}
      <div
        style={{
          padding: '12px 12px 14px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        {product.rating !== undefined && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <RatingStars rating={product.rating} size={11} />
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 11,
                color: '#A09890',
              }}
            >
              {product.rating} · {(product.soldCount ?? 0).toLocaleString('id-ID')} terjual
            </span>
          </div>
        )}
        <div
          style={
            {
              fontFamily: 'var(--font-heading)',
              fontWeight: 600,
              fontSize: 13,
              color: '#1A1714',
              lineHeight: 1.4,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            } as CSSProperties
          }
        >
          {product.name}
        </div>
        <div style={{ marginTop: 'auto', paddingTop: 4 }}>
          <PriceTag price={product.price} promoPrice={product.promoPrice} />
        </div>
      </div>
    </a>
  );
}
