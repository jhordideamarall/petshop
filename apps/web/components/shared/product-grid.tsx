import { ProductCard, type ProductCardData } from './product-card';

interface ProductGridProps {
  products: ProductCardData[];
  onAddToCart?: (product: ProductCardData) => void;
  cols?: 2 | 3 | 4;
}

export function ProductGrid({ products, onAddToCart }: ProductGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 px-4 pb-4 lg:grid-cols-4 lg:gap-5 lg:px-0">
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
          priority={index < 4}
        />
      ))}
    </div>
  );
}
