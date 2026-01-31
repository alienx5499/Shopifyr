'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { productApi, cartApi, watchlistApi } from '@/lib/api';
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
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProduct();
    }, [productId]);

    const loadProduct = async () => {
        try {
            setLoading(true);
            const productData = await productApi.getById(productId);
            setProduct(productData);
        } catch (error) {
            console.error('Failed to load product:', error);
            router.push('/products');
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = () => {
        if (!product) return;

        // Optimistic UI
        incrementCartCount();
        toast.success('Added to Cart', { id: 'detail-cart', duration: 2000 });

        // Background call
        cartApi.addItem(product.id, 1).catch((error: any) => {
            if (error.response?.status === 401) {
                toast.error('Please login to add items to cart', { id: 'detail-cart' });
                router.push('/login');
            } else {
                toast.error('Failed to add to cart', { id: 'detail-cart' });
            }
        });
    };

    const handleAddToWishlist = async () => {
        if (!product) return;
        try {
            await watchlistApi.addToWishlist(product.id);
            toast.success('Saved to wishlist', { duration: 2000 });
        } catch (error: any) {
            if (error.response?.status === 401) {
                toast.error('Please login to save items');
                router.push('/login');
            } else if (error.response?.status === 409) {
                toast.error('Item already in wishlist');
            } else {
                toast.error('Failed to save to wishlist');
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="w-10 h-10 border border-neutral-100 border-t-black rounded-full animate-spin" />
            </div>
        );
    }

    if (!product) {
        return null;
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">

                {/* Left: Fixed Image Gallery */}
                <div className="lg:col-span-7 h-[60vh] lg:h-screen lg:sticky lg:top-0 bg-[#F9F9F9] flex items-center justify-center p-20">
                    <motion.img
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        src={product.imageUrl}
                        alt={product.name}
                        className="max-h-full w-auto object-contain transition-all duration-1000"
                    />
                    {/* Floating Index */}
                    <div className="absolute bottom-10 left-10 text-[10px] font-black text-neutral-300 uppercase tracking-[0.5em] rotate-180 [writing-mode:vertical-lr]">
                        Visual Reference — 001/A
                    </div>
                </div>

                {/* Right: Technical Specifications & Purchase */}
                <div className="lg:col-span-5 p-10 lg:p-24 lg:pt-48 space-y-16">
                    <section>
                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.5em] block mb-4">Product Specification</span>
                        <h1 className="text-6xl lg:text-7xl font-black tracking-tighter uppercase mb-6 leading-none">{product.name}</h1>
                        <p className="text-4xl font-black tracking-tighter text-neutral-200">${product.price.toFixed(2)}</p>
                    </section>

                    <section className="space-y-6">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] border-b border-black pb-2">Description</h4>
                        <p className="text-sm leading-relaxed text-neutral-600 font-medium">
                            {product.description}
                        </p>
                    </section>

                    {/* Technical Specs Table */}
                    <section className="space-y-4">
                        <div className="flex justify-between py-3 border-b border-neutral-100 text-[10px] font-black uppercase tracking-widest text-neutral-400">
                            <span>Category</span>
                            <span className="text-black">{product.categoryName}</span>
                        </div>
                        {product.brandName && (
                            <div className="flex justify-between py-3 border-b border-neutral-100 text-[10px] font-black uppercase tracking-widest text-neutral-400">
                                <span>Brand</span>
                                <span className="text-black">{product.brandName}</span>
                            </div>
                        )}
                        <div className="flex justify-between py-3 border-b border-neutral-100 text-[10px] font-black uppercase tracking-widest text-neutral-400">
                            <span>Availability</span>
                            <span className={product.isActive ? "text-black" : "text-red-500"}>
                                {product.isActive ? "In Stock" : "Out of Stock"}
                            </span>
                        </div>
                    </section>

                    <div className="pt-10 space-y-4">
                        <button
                            onClick={handleAddToCart}
                            disabled={!product.isActive}
                            className={`w-full py-8 text-xs font-black uppercase tracking-[0.4em] transition-all ${product.isActive
                                ? "bg-black text-white hover:bg-neutral-800"
                                : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                                }`}
                        >
                            {product.isActive ? "Add to Collection" : "Unavailable"}
                        </button>
                        <button
                            onClick={handleAddToWishlist}
                            className="w-full bg-transparent border border-neutral-200 text-black py-8 text-xs font-black uppercase tracking-[0.4em] hover:border-black transition-all"
                        >
                            Save to Wishlist
                        </button>
                    </div>

                    <div className="pt-20 opacity-20">
                        <p className="text-[8px] font-black uppercase tracking-[0.3em] leading-loose">
                            Disclaimer: Every piece in the archive is subjected to rigorous quality securement. Shipping times may vary based on logistics tier.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}
