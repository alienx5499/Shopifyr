'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { cartApi, orderApi } from '@/lib/api';

interface CartItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

interface Cart {
  id: number;
  userId: number;
  items: CartItem[];
  totalAmount: number;
}

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const cartData = await cartApi.get();
      setCart(cartData);
    } catch (err) {
      console.error('Failed to load cart:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (itemId: number, quantity: number) => {
    if (quantity <= 0) {
      await handleRemoveItem(itemId);
      return;
    }
    try {
      const updatedCart = await cartApi.updateItem(itemId, quantity);
      setCart(updatedCart);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update cart');
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    try {
      const updatedCart = await cartApi.removeItem(itemId);
      setCart(updatedCart);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to remove item');
    }
  };

  const handlePlaceOrder = async () => {
    if (!cart || cart.items.length === 0) {
      alert('Cart is empty');
      return;
    }

    if (!confirm('Place order?')) return;

    try {
      setPlacingOrder(true);
      const order = await orderApi.placeOrder();
      alert(`Order placed! Order ID: ${order.id}`);
      router.push('/orders');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacingOrder(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-8">
        <p className="text-black">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-black p-4">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-black">Shopifyr - Cart</h1>
          <div className="flex gap-4">
            <button
              onClick={() => router.push('/products')}
              className="border border-black bg-white px-4 py-2 text-black hover:bg-black hover:text-white"
            >
              Products
            </button>
            <button
              onClick={handleLogout}
              className="border border-black bg-black px-4 py-2 text-white hover:bg-gray-800"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-8">
        {!cart || cart.items.length === 0 ? (
          <div className="text-center">
            <p className="mb-4 text-black">Your cart is empty</p>
            <button
              onClick={() => router.push('/products')}
              className="border border-black bg-black px-4 py-2 text-white hover:bg-gray-800"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="mb-4 text-xl font-bold text-black">Cart Items</h2>
              <div className="space-y-4">
                {cart.items.map((item) => (
                  <div key={item.id} className="border border-black p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold text-black">{item.productName}</h3>
                        <p className="text-sm text-black">${item.unitPrice.toFixed(2)} each</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            className="border border-black bg-white px-2 py-1 text-black hover:bg-black hover:text-white"
                          >
                            -
                          </button>
                          <span className="text-black">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            className="border border-black bg-white px-2 py-1 text-black hover:bg-black hover:text-white"
                          >
                            +
                          </button>
                        </div>
                        <span className="font-bold text-black">${item.subtotal.toFixed(2)}</span>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="border border-black bg-black px-3 py-1 text-white hover:bg-gray-800"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-black p-4">
              <div className="mb-4 flex justify-between">
                <span className="text-xl font-bold text-black">Total:</span>
                <span className="text-xl font-bold text-black">${cart.totalAmount.toFixed(2)}</span>
              </div>
              <button
                onClick={handlePlaceOrder}
                disabled={placingOrder}
                className="w-full border border-black bg-black px-4 py-3 text-white hover:bg-gray-800 disabled:bg-gray-400"
              >
                {placingOrder ? 'Placing Order...' : 'Place Order'}
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
