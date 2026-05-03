import { notFound } from 'next/navigation';
import { getProductBySlug, getProductStaticParams } from '@/lib/dummy-products';
import { ProductDetailClient } from './_client';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}

export function generateStaticParams() {
  return getProductStaticParams();
}
