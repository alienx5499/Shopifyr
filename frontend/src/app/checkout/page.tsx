'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { cartApi, orderApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingScreen } from '@/components/ui/Spinner';

export default function CheckoutPage() {
    const router = useRouter();
    const [cart, setCart] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [placing, setPlacing] = useState(false);

    useEffect(() => {
        loadCart();
    }, []);

    const loadCart = async () => {
        try {
            const cartData = await cartApi.get();
            if (!cartData || cartData.items.length === 0) {
                router.push('/cart');
                return;
            }
            setCart(cartData);
        } catch (error: any) {
            if (error.response?.status === 401) {
                router.push('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const handlePlaceOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        setPlacing(true);
        try {
            const order = await orderApi.placeOrder();
            toast.success(`Order placed successfully! Order ID: ${order.id}`);
            router.push('/orders');
        } catch (error) {
            toast.error('Failed to place order');
        } finally {
            setPlacing(false);
        }
    };

    if (loading) {
        return <LoadingScreen message="Loading checkout..." />;
    }

    if (!cart) {
        return null;
    }

    return (
        <div className="min-h-screen bg-background py-8">
            <div className="container mx-auto max-w-4xl">
                <Breadcrumbs items={[{ label: 'Cart', href: '/cart' }, { label: 'Checkout' }]} />

                <h1 className="text-4xl font-bold text-text mb-8">Checkout</h1>

                <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Checkout Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Shipping Information */}
                        <div className="card">
                            <h2 className="text-2xl font-bold text-text mb-6">Shipping Information</h2>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <Input label="First Name" required />
                                    <Input label="Last Name" required />
                                </div>
                                <Input label="Email" type="email" required />
                                <Input label="Phone" type="tel" required />
                                <Input label="Address" required />
                                <div className="grid grid-cols-2 gap-4">
                                    <Input label="City" required />
                                    <Input label="Postal Code" required />
                                </div>
                            </div>
                        </div>

                        {/* Payment Information */}
                        <div className="card">
                            <h2 className="text-2xl font-bold text-text mb-6">Payment Information</h2>
                            <div className="space-y-4">
                                <Input label="Card Number" placeholder="1234 5678 9012 3456" required />
                                <div className="grid grid-cols-2 gap-4">
                                    <Input label="Expiry Date" placeholder="MM/YY" required />
                                    <Input label="CVV" placeholder="123" required />
                                </div>
                                <Input label="Cardholder Name" required />
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="card sticky top-24">
                            <h2 className="text-2xl font-bold text-text mb-6">Order Summary</h2>

                            {/* Items */}
                            <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                                {cart.items.map((item: any) => (
                                    <div key={item.id} className="flex gap-3">
                                        <div className="w-16 h-16 bg-background rounded-lg flex-shrink-0">
                                            {item.productImageUrl ? (
                                                <img src={item.productImageUrl} alt={item.productName} className="w-full h-full object-cover rounded-lg" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg">
                                                    <svg className="w-6 h-6 text-text-lighter" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-text truncate">{item.productName}</p>
                                            <p className="text-xs text-text-light">Qty: {item.quantity}</p>
                                            <p className="text-sm font-semibold text-primary">${(item.productPrice * item.quantity).toFixed(2)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Totals */}
                            <div className="space-y-3 mb-6 border-t border-border pt-4">
                                <div className="flex justify-between text-text-light">
                                    <span>Subtotal</span>
                                    <span className="font-semibold text-text">${cart.totalAmount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-text-light">
                                    <span>Shipping</span>
                                    <span className="font-semibold text-success">Free</span>
                                </div>
                                <div className="flex justify-between text-xl font-bold border-t border-border pt-3">
                                    <span>Total</span>
                                    <span className="text-primary">${cart.totalAmount.toFixed(2)}</span>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                variant="primary"
                                size="lg"
                                isLoading={placing}
                                className="w-full"
                            >
                                Place Order
                            </Button>

                            <p className="text-xs text-text-light text-center mt-4">
                                By placing your order, you agree to our terms and conditions.
                            </p>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
