'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { orderApi } from '@/lib/api';

interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

interface Order {
  id: number;
  userId: number;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  createdAt: string;
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const ordersData = await orderApi.getUserOrders();
      setOrders(ordersData);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
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
          <h1 className="text-2xl font-bold text-black">Shopifyr - Orders</h1>
          <div className="flex gap-4">
            <button
              onClick={() => router.push('/products')}
              className="border border-black bg-white px-4 py-2 text-black hover:bg-black hover:text-white"
            >
              Products
            </button>
            <button
              onClick={() => router.push('/cart')}
              className="border border-black bg-white px-4 py-2 text-black hover:bg-black hover:text-white"
            >
              Cart
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
        {orders.length === 0 ? (
          <div className="text-center">
            <p className="mb-4 text-black">No orders yet</p>
            <button
              onClick={() => router.push('/products')}
              className="border border-black bg-black px-4 py-2 text-white hover:bg-gray-800"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="border border-black p-4">
                <div className="mb-2 flex justify-between">
                  <h3 className="text-lg font-bold text-black">Order #{order.id}</h3>
                  <span className="text-black">Status: {order.status}</span>
                </div>
                <p className="mb-2 text-sm text-black">
                  Date: {new Date(order.createdAt).toLocaleDateString()}
                </p>
                <div className="mb-2 space-y-1">
                  {order.items.map((item) => (
                    <div key={item.id} className="text-sm text-black">
                      {item.productName} x{item.quantity} - ${item.subtotal.toFixed(2)}
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex justify-end">
                  <span className="text-lg font-bold text-black">
                    Total: ${order.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
