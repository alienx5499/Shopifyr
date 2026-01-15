'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { cartApi } from '@/lib/api';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/contexts/CartContext';

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

export default function CartPage() {
  const router = useRouter();
  const { updateCartCount } = useCart();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const cartData = await cartApi.get();
      setCart(cartData);
      await updateCartCount();
    } catch (error: any) {
      if (error.response?.status === 401) {
        router.push('/login');
      } else {
        toast.error('Failed to load cart');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (itemId: number, newQuantity: number, productName: string) => {
    if (newQuantity < 1) return;
    try {
      await cartApi.updateItem(itemId, newQuantity);
      await loadCart();
      toast.success(`Updated ${productName} quantity`);
    } catch (error) {
      toast.error('Failed to update quantity');
    }
  };

  const handleRemoveItem = async (itemId: number, productName: string) => {
    try {
      await cartApi.removeItem(itemId);
      await loadCart();
      toast.success(`Removed ${productName} from cart`);
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const handleClearCart = async () => {
    try {
      await cartApi.clear();
      await loadCart();
      toast.success('Cart cleared');
    } catch (error) {
      toast.error('Failed to clear cart');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-8">
        <div className="container mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4" />
            <div className="h-64 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  const isEmpty = !cart || !cart.items || cart.items.length === 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="container mx-auto">
        <Breadcrumbs items={[{ label: 'Shopping Cart' }]} />

        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold text-gray-900 mb-8"
        >
          Shopping Cart
        </motion.h1>

        {isEmpty ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-16 h-16 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8 text-lg">Add some products to get started!</p>
            <Button onClick={() => router.push('/products')} size="lg">
              Continue Shopping
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold text-gray-900">
                  {cart.items.length} {cart.items.length === 1 ? 'Item' : 'Items'}
                </h2>
                <div className="flex gap-4">
                  <button
                    onClick={handleClearCart}
                    className="text-sm text-red-600 hover:text-red-700 transition-colors font-medium flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Clear Cart
                  </button>
                  <Button
                    size="sm"
                    onClick={() => router.push('/checkout')}
                    className="md:hidden"
                  >
                    Checkout
                  </Button>
                </div>
              </div>

              {cart.items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow p-6 flex gap-6"
                >
                  {/* Product Image */}
                  <Link href={`/products/${item.productId}`} className="flex-shrink-0">
                    <div className="w-32 h-32 bg-gray-100 rounded-xl overflow-hidden group">
                      {item.productImageUrl ? (
                        <img
                          src={item.productImageUrl}
                          alt={item.productName}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-50">
                          <svg className="w-12 h-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Product Info */}
                  <div className="flex-1 flex flex-col">
                    <Link href={`/products/${item.productId}`}>
                      <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors mb-2">
                        {item.productName}
                      </h3>
                    </Link>
                    <p className="text-2xl font-bold text-blue-600 mb-4">
                      ${item.productPrice.toFixed(2)}
                    </p>

                    <div className="mt-auto flex items-center justify-between">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1, item.productName)}
                          className="w-10 h-10 rounded-lg border-2 border-gray-200 hover:border-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center font-semibold text-gray-700"
                        >
                          −
                        </motion.button>
                        <span className="text-lg font-semibold w-12 text-center">{item.quantity}</span>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1, item.productName)}
                          className="w-10 h-10 rounded-lg border-2 border-gray-200 hover:border-sky-500 hover:bg-sky-50 transition-all flex items-center justify-center font-semibold text-gray-700"
                        >
                          +
                        </motion.button>
                      </div>

                      {/* Remove Button */}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleRemoveItem(item.id, item.productName)}
                        className="text-red-600 hover:text-red-700 transition-colors flex items-center gap-2 font-medium"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Remove
                      </motion.button>
                    </div>
                  </div>

                  {/* Item Total */}
                  <div className="flex-shrink-0 text-right">
                    <p className="text-sm text-gray-600 mb-1">Subtotal</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${(item.productPrice * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl shadow-lg p-6 sticky top-24"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-semibold text-gray-900">${(cart.totalAmount || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="font-semibold text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax</span>
                    <span className="font-semibold text-gray-900">$0.00</span>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 mb-6">
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span className="text-blue-600 font-bold">
                      ${(cart.totalAmount || 0).toFixed(2)}
                    </span>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => router.push('/checkout')}
                  className="w-full mb-4"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Proceed to Checkout
                </Button>

                <Button
                  variant="outline"
                  size="md"
                  onClick={() => router.push('/products')}
                  className="w-full"
                >
                  Continue Shopping
                </Button>

                {/* Features */}
                <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                  {[
                    { icon: '🔒', text: 'Secure checkout' },
                    { icon: '🚚', text: 'Free shipping over $50' },
                    { icon: '↩️', text: '30-day returns' }
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-3 text-sm text-gray-600">
                      <span className="text-lg">{feature.icon}</span>
                      <span>{feature.text}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Sticky Checkout Bar - High Z-index to ensure visibility */}
      {!isEmpty && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 md:hidden shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-[100]">
          <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Total</span>
              <span className="text-lg font-bold text-gray-900">${(cart.totalAmount || 0).toFixed(2)}</span>
            </div>
            <Button onClick={() => router.push('/checkout')} size="lg" className="flex-1 shadow-lg bg-orange-600 hover:bg-orange-700">
              Checkout
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
