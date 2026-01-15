'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { orderApi } from '@/lib/api';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { LoadingScreen } from '@/components/ui/Spinner';

interface OrderItem {
    id: number;
    productId: number;
    productName: string;
    productImageUrl?: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
}

interface Order {
    id: number;
    orderNumber: string;
    status: string;
    totalAmount: number;
    createdAt: string;
    items: OrderItem[];
    shippingAddress?: string;
    paymentMethod?: string;
}

export default function OrderDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const orderId = params?.id as string;

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (orderId) {
            loadOrder();
        }
    }, [orderId]);

    const loadOrder = async () => {
        try {
            const orderData = await orderApi.getById(parseInt(orderId));
            setOrder(orderData);
        } catch (error: any) {
            if (error.response?.status === 401) {
                router.push('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingScreen message="Loading order details..." />;
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="container mx-auto text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Order not found</h1>
                    <Link href="/orders" className="text-blue-600 hover:text-blue-700">
                        Back to Orders
                    </Link>
                </div>
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status.toUpperCase()) {
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'PROCESSING':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'SHIPPED':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'DELIVERED':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'CANCELLED':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
            <div className="container mx-auto max-w-5xl">
                <Breadcrumbs items={[
                    { label: 'Orders', href: '/orders' },
                    { label: `Order #${order.orderNumber}` }
                ]} />

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                                Order #{order.orderNumber}
                            </h1>
                            <p className="text-gray-600">
                                Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                        </div>
                        <div className={`inline-flex items-center px-4 py-2 rounded-full border-2 font-semibold ${getStatusColor(order.status)}`}>
                            {order.status}
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Order Items */}
                    <div className="lg:col-span-2 space-y-4">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white rounded-2xl shadow-md p-6"
                        >
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Items</h2>

                            <div className="space-y-4">
                                {order.items.map((item, index) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="flex gap-4 p-4 rounded-xl border border-gray-200 hover:border-blue-300 transition-colors"
                                    >
                                        {/* Product Image */}
                                        <Link href={`/products/${item.productId}`} className="flex-shrink-0">
                                            <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                                                {item.productImageUrl ? (
                                                    <img
                                                        src={item.productImageUrl}
                                                        alt={item.productName}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-50">
                                                        <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                        </Link>

                                        {/* Product Info */}
                                        <div className="flex-1">
                                            <Link href={`/products/${item.productId}`}>
                                                <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors mb-1">
                                                    {item.productName}
                                                </h3>
                                            </Link>
                                            <p className="text-sm text-gray-600 mb-2">Quantity: {item.quantity}</p>
                                            <p className="text-lg font-bold text-blue-600">
                                                ${item.unitPrice.toFixed(2)} each
                                            </p>
                                        </div>

                                        {/* Item Total */}
                                        <div className="text-right">
                                            <p className="text-sm text-gray-600 mb-1">Subtotal</p>
                                            <p className="text-xl font-bold text-gray-900">
                                                ${item.subtotal.toFixed(2)}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Order Summary & Info */}
                    <div className="lg:col-span-1 space-y-4">
                        {/* Order Summary */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white rounded-2xl shadow-md p-6"
                        >
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

                            <div className="space-y-3 mb-4">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span className="font-semibold text-gray-900">${order.totalAmount.toFixed(2)}</span>
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

                            <div className="border-t border-gray-200 pt-4">
                                <div className="flex justify-between text-xl font-bold">
                                    <span>Total</span>
                                    <span className="text-blue-600">${order.totalAmount.toFixed(2)}</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Order Status Timeline */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white rounded-2xl shadow-md p-6"
                        >
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Status</h2>

                            <div className="space-y-4">
                                {[
                                    { status: 'PENDING', label: 'Order Placed', icon: '📦' },
                                    { status: 'PROCESSING', label: 'Processing', icon: '⚙️' },
                                    { status: 'SHIPPED', label: 'Shipped', icon: '🚚' },
                                    { status: 'DELIVERED', label: 'Delivered', icon: '✅' }
                                ].map((step, index) => {
                                    const statusOrder = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
                                    const currentIndex = statusOrder.indexOf(order.status.toUpperCase());
                                    const stepIndex = statusOrder.indexOf(step.status);
                                    const isCompleted = stepIndex <= currentIndex;
                                    const isCurrent = stepIndex === currentIndex;

                                    return (
                                        <div key={step.status} className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${isCompleted
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-200 text-gray-400'
                                                }`}>
                                                {step.icon}
                                            </div>
                                            <div className="flex-1">
                                                <p className={`font-semibold ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                                                    {step.label}
                                                </p>
                                                {isCurrent && (
                                                    <p className="text-xs text-blue-600 font-medium">Current Status</p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>

                        {/* Actions */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="space-y-3"
                        >
                            <Link href="/orders" className="block">
                                <button className="w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-lg transition-colors">
                                    Back to Orders
                                </button>
                            </Link>
                            <Link href="/products" className="block">
                                <button className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
                                    Continue Shopping
                                </button>
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
