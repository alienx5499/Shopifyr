'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { productApi, cartApi } from '@/lib/api';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { ProductCard } from '@/components/features/ProductCard';
import { Spinner } from '@/components/ui/Spinner';

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

export default function SearchPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const query = searchParams.get('q') || '';

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (query) {
            searchProducts();
        }
    }, [query]);

    const searchProducts = async () => {
        try {
            setLoading(true);
            const response = await productApi.getAll({ page: 0, size: 50 });
            const allProducts = response.content || [];

            // Client-side search filtering
            const filtered = allProducts.filter((p: Product) =>
                p.name.toLowerCase().includes(query.toLowerCase()) ||
                p.description.toLowerCase().includes(query.toLowerCase()) ||
                p.categoryName.toLowerCase().includes(query.toLowerCase()) ||
                (p.brandName && p.brandName.toLowerCase().includes(query.toLowerCase()))
            );

            setProducts(filtered);
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async (productId: number) => {
        try {
            await cartApi.addItem(productId, 1);
            alert('Added to cart!');
        } catch (error: any) {
            if (error.response?.status === 401) {
                router.push('/login');
            } else {
                alert('Failed to add to cart');
            }
        }
    };

    return (
        <div className="min-h-screen bg-background py-8">
            <div className="container mx-auto">
                <Breadcrumbs items={[{ label: 'Search Results' }]} />

                <h1 className="text-4xl font-bold text-text mb-2">Search Results</h1>
                <p className="text-text-light mb-8">
                    Showing results for "<span className="font-semibold text-text">{query}</span>"
                </p>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Spinner size="lg" />
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-20">
                        <svg className="w-24 h-24 text-text-lighter mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <h2 className="text-2xl font-semibold text-text mb-2">No results found</h2>
                        <p className="text-text-light mb-6">Try searching with different keywords</p>
                    </div>
                ) : (
                    <>
                        <p className="text-text-light mb-6">
                            Found <span className="font-semibold text-text">{products.length}</span> products
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {products.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    onAddToCart={handleAddToCart}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
