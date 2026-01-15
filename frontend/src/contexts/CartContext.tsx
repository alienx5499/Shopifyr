'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { cartApi } from '@/lib/api';

interface CartContextType {
    cartCount: number;
    updateCartCount: () => Promise<void>;
    incrementCartCount: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [cartCount, setCartCount] = useState(0);

    const updateCartCount = async () => {
        try {
            const cart = await cartApi.get();
            const count = cart.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;
            setCartCount(count);
        } catch (error) {
            setCartCount(0);
        }
    };

    const incrementCartCount = () => {
        setCartCount(prev => prev + 1);
    };

    useEffect(() => {
        updateCartCount();
    }, []);

    return (
        <CartContext.Provider value={{ cartCount, updateCartCount, incrementCartCount }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
