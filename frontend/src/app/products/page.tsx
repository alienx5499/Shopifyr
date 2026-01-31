'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { productApi, categoryApi, brandApi, cartApi } from '@/lib/api';
import { ProductCard } from '@/components/features/ProductCard';
import toast from 'react-hot-toast';
import { useCart } from '@/contexts/CartContext';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  categoryName: string;
  brandName?: string;
  isActive: boolean;
}

export const dynamic = 'force-dynamic';

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { incrementCartCount } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [searchParams]);

  const loadData = async () => {
    try {
      setLoading(true);
      const categoryParam = searchParams.get('category');

      const productsRes = await productApi.getAll({
        page: 0,
        size: 100,
      });

      let productsList = productsRes.content || [];

      if (categoryParam) {
        productsList = productsList.filter((p: Product) =>
          p.categoryName?.toLowerCase() === categoryParam.toLowerCase()
        );
      }

      setProducts(productsList);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (productId: number, productName: string) => {
    // Optimistic Feedback
    incrementCartCount();
    toast.success('Added to Cart', { id: `cart-${productId}`, duration: 2000 });

    // Background call
    cartApi.addItem(productId, 1).catch((err: any) => {
      if (err.response?.status === 401 || err.response?.status === 403) {
        toast.error('Please login to add items to cart', { id: `cart-${productId}` });
        router.push('/login');
      } else {
        toast.error(`Failed to add product`, { id: `cart-${productId}` });
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Products Grid - Minimalist Header */}
      <div className="container mx-auto px-6 lg:px-12 pt-12">
        <header className="mb-12">
          <h1 className="text-4xl font-black tracking-tighter text-black uppercase">
            {searchParams.get('category') || 'All Collection'}
          </h1>
          <p className="text-xs font-bold text-neutral-400 uppercase tracking-[0.3em] mt-2">
            {products.length} Items Available
          </p>
        </header>

        {/* Products Grid - Compact Layout */}
        <div className="py-8">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="animate-pulse space-y-3">
                  <div className="aspect-[3/4] bg-gray-200 rounded-xl" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="min-h-[50vh] flex flex-col items-center justify-center text-center">
              <h3 className="text-2xl font-bold mb-3">No products found</h3>
              <p className="text-gray-500 mb-6 text-sm">Try exploring other collections.</p>
              <button
                onClick={() => router.push('/products')}
                className="px-6 py-2 bg-black text-white rounded-full text-sm font-bold hover:bg-gray-800 transition-colors"
              >
                View All Collection
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {products.map((product) => (
                <div key={product.id} className="col-span-1">
                  <ProductCard
                    product={product}
                    onAddToCart={(id) => handleAddToCart(id, product.name)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
