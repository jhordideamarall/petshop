import { notFound } from 'next/navigation';
import { DUMMY_PRODUCTS, DETAILED_PRODUCTS, toDetailedProduct } from '@/lib/dummy-products';
import { ProductDetailClient } from './_client';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const detailed = DETAILED_PRODUCTS.find((p) => p.slug === slug);
  const basic = DUMMY_PRODUCTS.find((p) => p.slug === slug);
  const product = detailed ?? (basic ? toDetailedProduct(basic) : undefined);

  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}

export function generateStaticParams() {
  return DUMMY_PRODUCTS.map((p) => ({ slug: p.slug }));
}
