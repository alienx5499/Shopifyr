'use client';

import React from 'react';
import Link from 'next/link';

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    imageUrl?: string;
    categoryName: string;
    isActive: boolean;
}

interface ProductCardProps {
    product: Product;
    onAddToCart?: (productId: number) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
    return (
        <div className="group w-full flex flex-col bg-white">
            <Link href={`/products/${product.id}`} className="flex flex-col flex-1">
                {/* Image Container with Massive Padding */}
                <div className="relative aspect-[4/5] bg-[#F9F9F9] overflow-hidden mb-6 border border-neutral-50">
                    {product.imageUrl ? (
                        <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-contain p-10"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-neutral-300 font-black uppercase tracking-[0.3em]">
                            Archived View
                        </div>
                    )}
                </div>

                {/* Metadata Integration */}
                <div className="flex flex-col flex-1 px-1">
                    <div className="flex justify-between items-baseline mb-3">
                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">
                            {product.categoryName || 'Standard'}
                        </span>
                        <span className="text-lg font-black tracking-tighter text-black">
                            ${product.price.toLocaleString()}
                        </span>
                    </div>

                    <h3 className="text-sm font-bold uppercase tracking-tight text-black line-clamp-1 mb-6">
                        {product.name}
                    </h3>
                </div>
            </Link>

            {/* Permanent High-Contrast Add to Cart */}
            <div className="px-1 mt-auto">
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        onAddToCart?.(product.id);
                    }}
                    className="w-full bg-black text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-neutral-800 transition-all active:scale-95 shadow-sm"
                >
                    Add to Cart
                </button>
            </div>
        </div>
    );
};
