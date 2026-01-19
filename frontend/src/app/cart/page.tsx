'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cartApi } from '@/lib/api';
import { useCart } from '@/contexts/CartContext';
import toast from 'react-hot-toast';

/**
 * PREMIUM DESIGN SYSTEM - UTILITIES
 * Consolidated Luxury Button and layout
 */

export const Button = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  className = '',
  disabled,
  ...props
}: any) => {
  const baseStyles = 'inline-flex items-center justify-center font-bold tracking-tight uppercase transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95';

  const variants = {
    primary: 'bg-black text-white hover:bg-neutral-800 shadow-xl shadow-black/10',
    secondary: 'bg-neutral-100 text-black hover:bg-neutral-200',
    outline: 'bg-transparent border-[0.5px] border-black/10 text-black hover:border-black',
    ghost: 'bg-transparent text-black hover:bg-black/5'
  };

  const sizes = {
    sm: 'px-6 py-2.5 text-[10px]',
    md: 'px-10 py-4 text-xs',
    lg: 'px-14 py-5 text-sm'
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant as keyof typeof variants]} ${sizes[size as keyof typeof sizes]} rounded-none ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <span>Processing</span>
        </div>
      ) : children}
    </button>
  );
};

interface CartItem {
  id: number;
  productId: number;
  productName: string;
  productPrice: number;
  productImageUrl?: string;
  quantity: number;
}

interface Cart {
  id: number;
  items: CartItem[];
  totalAmount: number;
}

// MAIN COMPONENT
export default function CartPage() {
  const router = useRouter();
  const { updateCartCount } = useCart();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);

  const loadCart = async () => {
    try {
      const cartData = await cartApi.get();
      setCart(cartData);
      await updateCartCount();
    } catch (error: any) {
      if (error.response?.status === 401) {
        router.push('/login');
      } else {
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const handleUpdateQuantity = async (itemId: number, newQuantity: number, productName: string) => {
    if (newQuantity < 1) return;
    try {
      // Optimistic update for UI responsiveness
      if (cart) {
        const updatedItems = cart.items.map((item) =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        );
        // Recalculate total roughly (server will maintain truth)
        const newTotal = updatedItems.reduce((acc, item) => acc + (item.productPrice * item.quantity), 0);
        setCart({ ...cart, items: updatedItems, totalAmount: newTotal });
      }

      await cartApi.updateItem(itemId, newQuantity);
      await loadCart(); // Re-sync with server
    } catch (error) {
      toast.error('Failed to update quantity');
      await loadCart(); // Revert on error
    }
  };

  const handleRemoveItem = async (itemId: number, productName: string) => {
    try {
      if (cart) {
        const updatedItems = cart.items.filter((item) => item.id !== itemId);
        const newTotal = updatedItems.reduce((acc, item) => acc + (item.productPrice * item.quantity), 0);
        setCart({ ...cart, items: updatedItems, totalAmount: newTotal });
      }

      await cartApi.removeItem(itemId);
      await loadCart();
      toast.success('Item removed');
    } catch (error) {
      toast.error('Failed to remove item');
      await loadCart();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-neutral-200 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  const isEmpty = !cart || !cart.items || cart.items.length === 0;

  return (
    <div className="min-h-screen bg-[#F9F9FB] pt-32 pb-40 font-sans selection:bg-black selection:text-white">
      <div className="container mx-auto px-6 lg:px-20">
        {isEmpty ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-40 text-center"
          >
            <div className="text-[120px] leading-none font-black text-neutral-100 select-none uppercase tracking-tighter mb-4">
              Void
            </div>
            <h1 className="text-2xl font-bold text-neutral-900 mb-6 tracking-tight">Your collection is empty.</h1>
            <p className="text-neutral-400 mb-12 max-w-sm font-medium leading-relaxed">
              Discover pieces designed for modern living. Your next essential is waiting in our latest collection.
            </p>
            <Button onClick={() => router.push('/products')} size="lg">
              Start Exploring
            </Button>
          </motion.div>
        ) : (
          <div className="max-w-[1400px] mx-auto">
            <div className="flex flex-col gap-32">

              {/* Items List - Full Width */}
              <div className="w-full">
                <div className="space-y-12">
                  <AnimatePresence mode="popLayout">
                    {cart.items.map((item, index) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05, duration: 0.5 }}
                        className="flex flex-col md:flex-row gap-12 pb-12 border-b border-black/10 last:border-0 items-start group"
                      >
                        {/* Product Image */}
                        <div className="w-48 aspect-[3/4] bg-[#F5F5F7] flex-shrink-0 overflow-hidden relative group cursor-pointer">
                          {item.productImageUrl ? (
                            <img
                              src={item.productImageUrl}
                              alt={item.productName}
                              className="w-full h-full object-cover mix-blend-multiply grayscale group-hover:grayscale-0 transition-all duration-700"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-neutral-300 text-[10px] uppercase font-bold tracking-widest">
                              No Image
                            </div>
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 w-full pt-2">
                          <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
                            <div>
                              <h3 className="text-3xl font-black tracking-tighter text-black uppercase leading-none mb-2">
                                {item.productName}
                              </h3>
                              <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.3em]">
                                Ref. {item.productId.toString().padStart(8, '0')}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-black tracking-tight mb-1">
                                ${item.productPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-8">
                            {/* Quantity */}
                            <div className="flex items-center border border-black/10 h-10 w-fit bg-white">
                              <button
                                onClick={() => handleUpdateQuantity(item.id, item.quantity - 1, item.productName)}
                                className="w-12 h-full flex items-center justify-center hover:bg-neutral-100 transition-colors text-xl font-light"
                              >
                                &minus;
                              </button>
                              <span className="w-10 text-center text-xs font-bold border-x border-black/5 h-full flex items-center justify-center">{item.quantity}</span>
                              <button
                                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1, item.productName)}
                                className="w-12 h-full flex items-center justify-center hover:bg-neutral-100 transition-colors text-xl font-light"
                              >
                                &#43;
                              </button>
                            </div>

                            {/* Actions */}
                            <button
                              onClick={() => handleRemoveItem(item.id, item.productName)}
                              className="text-[10px] font-black uppercase tracking-[0.25em] text-neutral-400 hover:text-red-600 transition-colors border-b border-transparent hover:border-red-600 pb-1"
                            >
                              Remove Item
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              {/* Order Summary Section - Massive Bottom Layout */}
              <div className="w-full border-t border-black pt-20">
                <div className="flex flex-col gap-16">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
                    <div className="space-y-4">
                      <h2 className="text-5xl lg:text-7xl font-black tracking-tighter text-black uppercase leading-none">Order<br />Summary</h2>
                      <p className="text-neutral-400 text-xs font-bold uppercase tracking-widest max-w-sm pt-4">
                        Shipping costs and additional taxes will be calculated at step two of checkout based on your location.
                      </p>
                    </div>

                    <div className="flex flex-col gap-8 w-full">
                      <div className="flex justify-between items-baseline border-b border-black/10 pb-4">
                        <span className="text-xs font-bold uppercase tracking-[0.3em] text-neutral-400">Subtotal</span>
                        <span className="text-xl font-bold text-black font-mono tracking-tight">${cart.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between items-baseline border-b border-black/10 pb-4">
                        <span className="text-xs font-bold uppercase tracking-[0.3em] text-neutral-400">Shipping</span>
                        <span className="text-xl font-bold text-emerald-600 font-mono tracking-tight">FREE</span>
                      </div>
                      <div className="flex justify-between items-end pt-4">
                        <span className="text-sm font-black uppercase tracking-[0.3em] text-black">Total Due</span>
                        <span className="text-6xl lg:text-8xl font-black tracking-tighter text-black leading-none">
                          ${cart.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 0 })}<span className="text-2xl align-top text-neutral-400 font-bold">.00</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-6 pt-12">
                    <Button
                      onClick={() => router.push('/checkout')}
                      className="w-full py-10 text-xl lg:text-2xl !bg-black !text-white !rounded-none hover:!bg-neutral-800 !shadow-none tracking-[0.4em] uppercase transition-all duration-500"
                      size="lg"
                    >
                      Secure Checkout
                    </Button>
                    <button
                      onClick={() => router.push('/products')}
                      className="w-full py-4 text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400 hover:text-black transition-colors block text-center"
                    >
                      Continue Shopping
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )
        }
      </div >
    </div >
  );
}
