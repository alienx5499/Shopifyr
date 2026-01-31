'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { cartApi, isBackendUnavailable } from '@/lib/api';

interface CartContextType {
    cartCount: number;
    backendUnavailable: boolean;
    updateCartCount: () => Promise<void>;
    incrementCartCount: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [cartCount, setCartCount] = useState(0);
    const [backendUnavailable, setBackendUnavailable] = useState(false);

    const updateCartCount = async () => {
        // Skip cart fetch when not logged in (backend requires auth for /api/cart)
        if (typeof window !== 'undefined' && !localStorage.getItem('token')) {
            setCartCount(0);
            return;
        }
        try {
            const cart = await cartApi.get();
            setBackendUnavailable(false);
            const count = cart.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;
            setCartCount(count);
        } catch (error) {
            setCartCount(0);
            if (isBackendUnavailable(error)) {
                setBackendUnavailable(true);
            }
        }
    };

    const incrementCartCount = () => {
        setCartCount(prev => prev + 1);
    };

    useEffect(() => {
        updateCartCount();
    }, []);

    return (
        <CartContext.Provider value={{ cartCount, backendUnavailable, updateCartCount, incrementCartCount }}>
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
