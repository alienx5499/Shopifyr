'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { orderApi } from '@/lib/api';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LoadingScreen } from '@/components/ui/Spinner';

export default function ProfilePage() {
    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            const ordersData = await orderApi.getUserOrders();
            setOrders(ordersData);
        } catch (error: any) {
            if (error.response?.status === 401) {
                router.push('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, 'primary' | 'success' | 'warning' | 'error'> = {
            PENDING: 'warning',
            PROCESSING: 'primary',
            SHIPPED: 'primary',
            DELIVERED: 'success',
            CANCELLED: 'error'
        };
        return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
    };

    if (loading) {
        return <LoadingScreen message="Loading profile..." />;
    }

    return (
        <div className="min-h-screen bg-background py-8">
            <div className="container mx-auto max-w-4xl">
                <Breadcrumbs items={[{ label: 'My Profile' }]} />

                <h1 className="text-4xl font-bold text-text mb-8">My Profile</h1>

                {/* Profile Info */}
                <div className="card mb-8">
                    <h2 className="text-2xl font-bold text-text mb-6">Account Information</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm text-text-light">Email</label>
                            <p className="text-lg text-text font-medium">user@example.com</p>
                        </div>
                        <div>
                            <label className="text-sm text-text-light">Username</label>
                            <p className="text-lg text-text font-medium">customer</p>
                        </div>
                    </div>
                </div>

                {/* Order History */}
                <div className="card">
                    <h2 className="text-2xl font-bold text-text mb-6">Order History</h2>

                    {orders.length === 0 ? (
                        <div className="text-center py-12">
                            <svg className="w-20 h-20 text-text-lighter mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <p className="text-text-light mb-4">No orders yet</p>
                            <Button onClick={() => router.push('/products')}>
                                Start Shopping
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orders.map((order) => (
                                <div key={order.id} className="border border-border rounded-lg p-6 hover:border-primary transition-colors">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <p className="text-sm text-text-light">Order #{order.id}</p>
                                            <p className="text-lg font-semibold text-text">
                                                ${order.totalAmount.toFixed(2)}
                                            </p>
                                        </div>
                                        {getStatusBadge(order.status)}
                                    </div>

                                    <div className="space-y-2">
                                        {order.items.map((item: any, idx: number) => (
                                            <div key={idx} className="flex justify-between text-sm">
                                                <span className="text-text-light">{item.productName} × {item.quantity}</span>
                                                <span className="text-text font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
                                        <span className="text-sm text-text-light">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => router.push(`/orders`)}
                                        >
                                            View Details
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
