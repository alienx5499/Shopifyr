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
    brandName?: string;
    isActive: boolean;
}

interface ProductCardProps {
    product: Product;
    onAddToCart?: (productId: number) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        if (onAddToCart) {
            onAddToCart(product.id);
        }
    };

    return (
        <Link href={`/products/${product.id}`}>
            <div className="bg-white rounded-lg border border-gray-200 hover:border-orange-300 hover:shadow-xl transition-all duration-300 overflow-hidden group h-full flex flex-col">
                {/* Image - Compact */}
                <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                    {product.imageUrl ? (
                        <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                            <svg className="w-16 h-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                        </div>
                    )}
                    {!product.isActive && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">Out of Stock</span>
                        </div>
                    )}
                </div>

                {/* Content - Compact */}
                <div className="p-3 flex-1 flex flex-col">
                    {/* Name */}
                    <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-orange-600 transition-colors">
                        {product.name}
                    </h3>

                    {/* Price */}
                    <div className="mt-auto">
                        <span className="text-lg font-bold text-gray-900">
                            ${product.price.toFixed(2)}
                        </span>
                    </div>

                    {/* Add to Cart Button - Compact */}
                    {product.isActive && onAddToCart && (
                        <button
                            onClick={handleAddToCart}
                            className="mt-2 w-full py-2 bg-orange-500 text-white text-xs font-bold rounded-md hover:bg-orange-600 active:scale-95 transition-all shadow-sm hover:shadow-md"
                        >
                            Add to Cart
                        </button>
                    )}
                </div>
            </div>
        </Link>
    );
};
