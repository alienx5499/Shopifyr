'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { productApi, categoryApi, brandApi, cartApi, fileApi } from '@/lib/api';

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
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<number | null>(null);
  const [brandFilter, setBrandFilter] = useState<number | null>(null);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [categoryFilter, brandFilter, minPrice, maxPrice]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes, brandsRes] = await Promise.all([
        productApi.getAll({
          page: 0,
          size: 50,
          categoryId: categoryFilter || undefined,
          brandId: brandFilter || undefined,
          minPrice: minPrice ? parseFloat(minPrice) : undefined,
          maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
        }),
        categoryApi.getAll(),
        brandApi.getAll(),
      ]);
      setProducts(productsRes.content || []);
      setCategories(categoriesRes);
      setBrands(brandsRes);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId: number) => {
    try {
      await cartApi.addItem(productId, 1);
      alert('Added to cart!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add to cart');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { url } = await fileApi.uploadImage(file);
      setUploadedUrl(url);
      alert('Image uploaded. Use this URL as imageUrl when creating/updating products: ' + url);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-8">
        <p className="text-black">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-black p-4">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-black">Shopifyr</h1>
          <div className="flex gap-4">
            <button
              onClick={() => router.push('/cart')}
              className="border border-black bg-white px-4 py-2 text-black hover:bg-black hover:text-white"
            >
              Cart
            </button>
            <button
              onClick={handleLogout}
              className="border border-black bg-black px-4 py-2 text-white hover:bg-gray-800"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-8">
        <div className="mb-6 border border-black p-4">
          <h2 className="mb-2 text-xl font-bold text-black">Upload Product Image (Demo)</h2>
          <p className="mb-2 text-sm text-black">
            Upload an image to the backend. The returned URL can be used as <code>imageUrl</code> in the admin/product APIs.
          </p>
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="text-black"
            />
            {uploading && <span className="text-sm text-black">Uploading...</span>}
          </div>
          {uploadedUrl && (
            <div className="mt-3 flex items-center gap-4">
              <div className="text-xs text-black break-all">
                URL: <span>{uploadedUrl}</span>
              </div>
              <img
                src={`http://localhost:8080${uploadedUrl}`}
                alt="Uploaded"
                className="h-16 w-16 border border-black object-cover"
              />
            </div>
          )}
        </div>
        <div className="mb-6 border border-black p-4">
          <h2 className="mb-4 text-xl font-bold text-black">Filters</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div>
              <label className="block text-sm font-medium text-black mb-1">Category</label>
              <select
                value={categoryFilter || ''}
                onChange={(e) => setCategoryFilter(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full border border-black p-2 text-black"
              >
                <option value="">All</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1">Brand</label>
              <select
                value={brandFilter || ''}
                onChange={(e) => setBrandFilter(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full border border-black p-2 text-black"
              >
                <option value="">All</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1">Min Price</label>
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="0"
                className="w-full border border-black p-2 text-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1">Max Price</label>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="10000"
                className="w-full border border-black p-2 text-black"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {products.length === 0 ? (
            <p className="col-span-full text-center text-black">No products found</p>
          ) : (
            products.map((product) => (
              <div key={product.id} className="border border-black p-4">
                <h3 className="text-lg font-bold text-black mb-2">{product.name}</h3>
                <p className="text-sm text-black mb-2">{product.description}</p>
                <p className="text-lg font-bold text-black mb-2">${product.price.toFixed(2)}</p>
                <p className="text-xs text-black mb-4">
                  {product.categoryName} {product.brandName && `• ${product.brandName}`}
                </p>
                {product.isActive ? (
                  <button
                    onClick={() => handleAddToCart(product.id)}
                    className="w-full border border-black bg-black px-4 py-2 text-white hover:bg-gray-800"
                  >
                    Add to Cart
                  </button>
                ) : (
                  <button disabled className="w-full border border-gray-400 bg-gray-200 px-4 py-2 text-gray-500">
                    Out of Stock
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
