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
        <div className="group block w-full cursor-pointer h-full flex flex-col">
            <Link href={`/products/${product.id}`} className="flex flex-col h-full">
                <div className="relative aspect-[4/5] bg-[#FDFDFD] border border-neutral-50 overflow-hidden mb-4 transition-colors group-hover:bg-neutral-50">
                    {product.imageUrl ? (
                        <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-contain p-8 transition-all duration-1000 group-hover:scale-105"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-neutral-300 font-bold uppercase tracking-widest">
                            No Visual Data
                        </div>
                    )}

                    {/* Minimalist Floating Add */}
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            onAddToCart?.(product.id);
                        }}
                        className="absolute bottom-4 right-4 bg-black text-white w-10 h-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 shadow-lg z-20"
                        title="Add to Cart"
                    >
                        <span className="text-xl font-light mb-0.5">+</span>
                    </button>
                </div>

                <div className="space-y-2 flex-grow">
                    <div className="flex justify-between items-start gap-4">
                        <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest leading-none mt-0.5">{product.categoryName || 'ARCHIVE'}</span>
                        <span className="text-sm font-black tracking-tighter leading-none">${product.price.toLocaleString()}</span>
                    </div>
                    <h3 className="text-xs font-bold uppercase tracking-wide text-black line-clamp-2 min-h-[2.5em] group-hover:text-neutral-500 transition-colors">
                        {product.name}
                    </h3>
                </div>
            </Link>
        </div>
    );
};
