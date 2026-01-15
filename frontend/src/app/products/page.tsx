'use client';

import { useEffect, useState } from 'react';
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

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { incrementCartCount } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [categoryFilter, setCategoryFilter] = useState<number | null>(null);
  const [brandFilter, setBrandFilter] = useState<number | null>(null);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    // Check for category from URL
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      // Find category ID by name
      const cat = categories.find(c => c.name === categoryParam);
      if (cat) {
        setCategoryFilter(cat.id);
        // Force reload with new category
        loadDataWithParams({ categoryId: cat.id });
      }
    } else {
      loadData();
    }
  }, [searchParams, categories]); // Re-run when URL or categories change

  useEffect(() => {
    if (categories.length > 0 && !searchParams.get('category')) {
      loadData();
    }
  }, [categoryFilter, brandFilter, minPrice, maxPrice, sortBy]);

  const loadDataWithParams = async (params: any) => {
    try {
      setLoading(true);
      const productsRes = await productApi.getAll({
        page: 0,
        size: 100,
        categoryId: params.categoryId || categoryFilter || undefined,
        brandId: brandFilter || undefined,
        minPrice: minPrice ? parseFloat(minPrice) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      });

      // ... rest of processing
      let productsList = productsRes.content || [];
      if (sortBy === 'price-asc') {
        productsList.sort((a: Product, b: Product) => a.price - b.price);
      } else if (sortBy === 'price-desc') {
        productsList.sort((a: Product, b: Product) => b.price - a.price);
      } else if (sortBy === 'name') {
        productsList.sort((a: Product, b: Product) => a.name.localeCompare(b.name));
      }
      setProducts(productsList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const [categoriesRes, brandsRes] = await Promise.all([
        categoryApi.getAll(),
        brandApi.getAll(),
      ]);
      setCategories(categoriesRes);
      setBrands(brandsRes);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const productsRes = await productApi.getAll({
        page: 0,
        size: 100,
        categoryId: categoryFilter || undefined,
        brandId: brandFilter || undefined,
        minPrice: minPrice ? parseFloat(minPrice) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      });

      let productsList = productsRes.content || [];

      // Client-side sorting
      if (sortBy === 'price-asc') {
        productsList.sort((a: Product, b: Product) => a.price - b.price);
      } else if (sortBy === 'price-desc') {
        productsList.sort((a: Product, b: Product) => b.price - a.price);
      } else if (sortBy === 'name') {
        productsList.sort((a: Product, b: Product) => a.name.localeCompare(b.name));
      }

      setProducts(productsList);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId: number, productName: string) => {
    try {
      await cartApi.addItem(productId, 1);
      incrementCartCount();
      toast.success(`${productName} added to cart!`);
    } catch (err: any) {
      if (err.response?.status === 401) {
        toast.error('Please login to add items to cart');
        router.push('/login');
      } else {
        toast.error('Failed to add to cart');
      }
    }
  };

  const clearFilters = () => {
    setCategoryFilter(null);
    setBrandFilter(null);
    setMinPrice('');
    setMaxPrice('');
    setSortBy('name');
  };

  const activeFiltersCount = [categoryFilter, brandFilter, minPrice, maxPrice].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Compact Filter Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-24 z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* Filters */}
            <div className="flex items-center gap-3 flex-wrap flex-1">
              {/* Category */}
              <select
                value={categoryFilter || ''}
                onChange={(e) => setCategoryFilter(e.target.value ? parseInt(e.target.value) : null)}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              {/* Brand */}
              <select
                value={brandFilter || ''}
                onChange={(e) => setBrandFilter(e.target.value ? parseInt(e.target.value) : null)}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">All Brands</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>

              {/* Price Range */}
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="Min Price"
                className="w-24 px-3 py-1.5 text-sm border border-gray-300 rounded hover:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <span className="text-gray-400">-</span>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Max Price"
                className="w-24 px-3 py-1.5 text-sm border border-gray-300 rounded hover:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />

              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-orange-600 hover:text-orange-700 font-semibold"
                >
                  Clear ({activeFiltersCount})
                </button>
              )}
            </div>

            {/* Sort and Results */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {loading ? 'Loading...' : `${products.length} results`}
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="name">Name (A-Z)</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid - 6 COLUMNS */}
      <div className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="grid-6-cols">
            {[...Array(18)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-lg mb-2" />
                <div className="h-4 bg-gray-200 rounded mb-2" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your filters</p>
            <button
              onClick={clearFilters}
              className="px-6 py-2 bg-orange-500 text-white font-semibold rounded hover:bg-orange-600"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid-6-cols">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={(id) => handleAddToCart(id, product.name)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
