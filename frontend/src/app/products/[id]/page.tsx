'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { productApi, cartApi } from '@/lib/api';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { LoadingScreen } from '@/components/ui/Spinner';
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

export default function ProductDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { incrementCartCount } = useCart();
    const productId = parseInt(params.id as string);

    const [product, setProduct] = useState<Product | null>(null);
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProduct();
    }, [productId]);

    const loadProduct = async () => {
        try {
            setLoading(true);
            const productData = await productApi.getById(productId);
            setProduct(productData);

            // Load related products from same category
            const relatedData = await productApi.getAll({ page: 0, size: 4 });
            setRelatedProducts((relatedData.content || []).filter((p: Product) => p.id !== productId).slice(0, 4));
        } catch (error) {
            console.error('Failed to load product:', error);
            router.push('/products');
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async () => {
        if (!product) return;
        try {
            await cartApi.addItem(product.id, quantity);
            incrementCartCount();
            toast.success(`Added ${quantity} ${product.name} to cart!`);
        } catch (error: any) {
            if (error.response?.status === 401) {
                toast.error('Please login to add items to cart');
                router.push('/login');
            } else {
                toast.error('Failed to add to cart');
            }
        }
    };

    if (loading) {
        return <LoadingScreen message="Loading product..." />;
    }

    if (!product) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-6">
                <Breadcrumbs
                    items={[
                        { label: 'Products', href: '/products' },
                        { label: product.categoryName, href: `/products?category=${product.categoryName}` },
                        { label: product.name }
                    ]}
                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white rounded-xl shadow-sm p-6 mb-12">
                    {/* Product Image */}
                    <div>
                        <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden sticky top-24">
                            {product.imageUrl ? (
                                <img
                                    src={product.imageUrl}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <svg className="w-32 h-32 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="flex flex-col">
                        {/* Badges */}
                        <div className="flex items-center gap-2 mb-4 flex-wrap">
                            <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
                                {product.categoryName}
                            </span>
                            {product.brandName && (
                                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
                                    {product.brandName}
                                </span>
                            )}
                            {product.isActive ? (
                                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                    In Stock
                                </span>
                            ) : (
                                <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                                    Out of Stock
                                </span>
                            )}
                        </div>

                        {/* Product Name */}
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>

                        {/* Price */}
                        <div className="mb-6">
                            <span className="text-4xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
                        </div>

                        {/* Quantity Selector */}
                        {product.isActive && (
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-900 mb-3">
                                    Quantity
                                </label>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-10 h-10 rounded-lg border-2 border-gray-300 hover:border-orange-500 transition-colors flex items-center justify-center text-lg font-semibold text-gray-700 hover:text-orange-500"
                                    >
                                        −
                                    </button>
                                    <span className="text-xl font-semibold w-12 text-center text-gray-900">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="w-10 h-10 rounded-lg border-2 border-gray-300 hover:border-orange-500 transition-colors flex items-center justify-center text-lg font-semibold text-gray-700 hover:text-orange-500"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3 mb-8">
                            {product.isActive ? (
                                <>
                                    <button
                                        onClick={handleAddToCart}
                                        className="flex-1 py-3 px-6 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        Add to Cart
                                    </button>
                                    <button
                                        onClick={() => router.push('/cart')}
                                        className="px-6 py-3 border-2 border-orange-500 text-orange-500 font-bold rounded-lg hover:bg-orange-50 transition-colors"
                                    >
                                        Buy Now
                                    </button>
                                </>
                            ) : (
                                <button
                                    disabled
                                    className="flex-1 py-3 px-6 bg-gray-200 text-gray-500 font-bold rounded-lg cursor-not-allowed"
                                >
                                    Out of Stock
                                </button>
                            )}
                        </div>

                        {/* Product Detail Tabs */}
                        <div className="mb-8">
                            <div className="border-b border-gray-200">
                                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                                    {['Description', 'Specifications', 'Reviews'].map((tab) => (
                                        <button
                                            key={tab}
                                            className="border-b-2 border-orange-500 py-4 px-1 text-sm font-medium text-orange-600"
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </nav>
                            </div>
                            <div className="py-4">
                                <p className="text-gray-600 leading-relaxed">{product.description}</p>
                                <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-semibold mb-2">Key Features</h4>
                                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                        <li>Premium quality materials</li>
                                        <li>1 year manufacturer warranty</li>
                                        <li>Certified authentic</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Features */}
                        <div className="border-t border-gray-200 pt-6 space-y-3">
                            <div className="flex items-center gap-3 text-gray-600">
                                <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-sm">Free shipping on orders over $50</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-600">
                                <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                </svg>
                                <span className="text-sm">30-day return policy</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-600">
                                <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                <span className="text-sm">100% authentic products</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">You May Also Like</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {relatedProducts.map((relatedProduct) => (
                                <ProductCard
                                    key={relatedProduct.id}
                                    product={relatedProduct}
                                    onAddToCart={(id) => {
                                        cartApi.addItem(id, 1).then(() => {
                                            incrementCartCount();
                                            toast.success('Added to cart!');
                                        }).catch(() => {
                                            toast.error('Failed to add to cart');
                                        });
                                    }}
                                />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
