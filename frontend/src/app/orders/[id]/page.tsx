'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { orderApi } from '@/lib/api';
import toast from 'react-hot-toast';

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
    estimatedDeliveryDate?: string;
}

export default function OrderDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const orderId = params?.id as string;
    const searchParams = useSearchParams();
    const isNewOrder = searchParams.get('new') === 'true';
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [showCelebration, setShowCelebration] = useState(isNewOrder);
    const [celebrationStep, setCelebrationStep] = useState(0); // 0: Placed, 1: Accepted, 2: Delivery Info

    useEffect(() => {
        if (showCelebration) {
            const timer1 = setTimeout(() => setCelebrationStep(1), 2000); // Accepted after 2s
            const timer2 = setTimeout(() => {
                router.push('/profile?tab=orders');
            }, 4000); // Redirect after 4s (2s of Accepted state)
            return () => { clearTimeout(timer1); clearTimeout(timer2); };
        }
    }, [showCelebration]);

    useEffect(() => {
        if (orderId) loadOrder();
    }, [orderId]);

    const loadOrder = async () => {
        try {
            const orderData = await orderApi.getById(parseInt(orderId));
            setOrder(orderData);
        } catch (error: any) {
            if (error.response?.status === 401) {
                router.push('/login');
            } else {
                toast.error('Failed to load archive data');
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="w-10 h-10 border border-neutral-100 border-t-black rounded-full animate-spin" />
        </div>
    );

    if (!order) return null;

    return (
        <div className="min-h-screen bg-[#FDFDFD] font-sans text-black relative pb-40">
            {/* SUCCESS OVERLAY */}
            <AnimatePresence>
                {showCelebration && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, transition: { duration: 0.8 } }}
                        className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center p-10 overflow-hidden"
                    >
                        {/* Background Pulse - Darker on Light */}
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1.5, opacity: 0.05 }}
                            transition={{ repeat: Infinity, duration: 3, ease: "easeOut" }}
                            className="absolute w-[800px] h-[800px] bg-black rounded-full"
                        />

                        <div className="relative z-10 text-center">
                            <motion.div
                                initial={{ y: 60, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            >
                                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.6em] mb-4 block">
                                    Secure Transaction Verified
                                </span>
                                <h1 className="text-6xl md:text-[120px] font-black text-black uppercase tracking-tighter leading-[0.85] mb-8">
                                    Order<br />Secured
                                </h1>
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: "100%" }}
                                    transition={{ delay: 0.5, duration: 1.5, ease: "easeInOut" }}
                                    className="h-1 bg-neutral-100 relative"
                                >
                                    <motion.div
                                        animate={{ x: ["0%", "100%"] }}
                                        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                                        className="absolute top-0 left-0 h-full w-1/3 bg-black shadow-[0_0_15px_rgba(0,0,0,0.1)]"
                                    />
                                </motion.div>
                                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.4em] mt-12">
                                    Archived to Manifest • Redirecting
                                </p>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* HEADER / NAV */}
            <div className="pt-40 px-6 lg:px-20 max-w-7xl mx-auto mb-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col lg:flex-row justify-between items-end gap-10 border-b border-black pb-10"
                >
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-400">
                                Order Manifest
                            </span>
                            <div className="h-px flex-1 bg-neutral-200 w-20"></div>
                        </div>
                        <h1 className="text-6xl lg:text-8xl font-black tracking-tighter uppercase leading-none">
                            Order #{order.id}
                        </h1>
                        <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">
                            Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                    </div>

                    <div className="flex flex-col items-end gap-4">
                        <div className={`px-6 py-3 border-2 text-xs font-black uppercase tracking-[0.3em] ${order.status === 'DELIVERED' ? 'border-emerald-500 bg-emerald-50 text-emerald-600' :
                            order.status === 'SHIPPED' ? 'border-black bg-black text-white' :
                                'border-amber-500 text-amber-600'
                            }`}>
                            Status: {order.status === 'SHIPPED' ? 'Confirmed' : order.status}
                        </div>
                    </div>
                </motion.div>
            </div>

            <div className="max-w-7xl mx-auto px-6 lg:px-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">

                    {/* LEFT COLUMN: ITEMS */}
                    <div className="lg:col-span-8 space-y-16">
                        <h2 className="text-sm font-black uppercase tracking-[0.3em] border-b border-neutral-100 pb-4">
                            Itemized Collection ({order.items.length})
                        </h2>

                        <div className="space-y-12">
                            {order.items.map((item) => (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    key={item.id}
                                    className="group flex flex-col md:flex-row gap-8 items-start"
                                >
                                    <div className="w-full md:w-48 aspect-square bg-[#F5F5F5] overflow-hidden relative">
                                        <img
                                            src={item.productImageUrl}
                                            alt=""
                                            className="w-full h-full object-cover transition-all duration-700 hover:scale-105"
                                        />
                                    </div>
                                    <div className="flex-1 w-full pt-2">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-2xl font-black uppercase tracking-tight leading-none">
                                                {item.productName}
                                            </h3>
                                            <span className="text-lg font-bold tracking-tight">
                                                ${item.subtotal.toLocaleString()}
                                            </span>
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-6">
                                            ID: PRD-{item.productId} • Qty: {item.quantity}
                                        </p>
                                        <div className="h-px w-full bg-neutral-100"></div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: SUMMARY & DETAILS */}
                    <div className="lg:col-span-4 space-y-12">

                        {/* SUMMARY CARD */}
                        <div className="bg-neutral-50 p-10 space-y-8">
                            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-neutral-400 pb-4 border-b border-neutral-200">
                                Financials
                            </h2>
                            <div className="space-y-4">
                                <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-neutral-500">
                                    <span>Subtotal</span>
                                    <span>${order.totalAmount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-neutral-500">
                                    <span>Shipping</span>
                                    <span className="text-emerald-600">Complimentary</span>
                                </div>
                                <div className="flex justify-between items-end pt-8 border-t border-neutral-200">
                                    <span className="text-xs font-black uppercase tracking-widest">Total Paid</span>
                                    <span className="text-3xl font-black tracking-tighter">
                                        ${order.totalAmount.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* DETAILS */}
                        <div className="space-y-12">
                            <div className="space-y-4">
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] pb-2 border-b border-black">
                                    Shipping To
                                </h3>
                                <div className="text-sm font-medium leading-relaxed text-neutral-600">
                                    <p className="uppercase font-bold text-black mb-1">Standard Delivery</p>
                                    <p>{order.shippingAddress || "123 Fashion Ave, Design District"}</p>
                                    <p className="text-neutral-400 text-xs mt-2">Expected: {order.estimatedDeliveryDate ? new Date(order.estimatedDeliveryDate).toLocaleDateString() : "Pending Calculation"}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] pb-2 border-b border-black">
                                    Payment Method
                                </h3>
                                <div className="text-sm font-medium leading-relaxed text-neutral-600">
                                    <p className="uppercase font-bold text-black mb-1">Secure Transaction</p>
                                    <p>Ended with •••• 4242</p>
                                </div>
                            </div>
                        </div>

                        {/* ACTIONS */}
                        <div className="pt-10 space-y-4">
                            <button
                                onClick={() => router.push('/profile?tab=orders')}
                                className="w-full bg-black text-white py-6 text-xs font-black uppercase tracking-[0.3em] hover:bg-neutral-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
                            >
                                Return to Archive
                            </button>
                            <button
                                onClick={() => router.push('/products')}
                                className="w-full bg-white border border-neutral-200 text-black py-6 text-xs font-black uppercase tracking-[0.3em] hover:border-black transition-all"
                            >
                                Continue Shopping
                            </button>
                        </div>

                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 lg:px-20 pt-20 mt-20 border-t border-neutral-100 flex justify-between items-end opacity-40">
                <div className="text-[9px] font-bold uppercase tracking-[0.3em]">
                    Start Simulation
                    <br />
                    Secure Checkout
                </div>
                <div className="text-[9px] font-bold uppercase tracking-[0.3em] text-right">
                    Verified Purchase
                    <br />
                    {order.orderNumber || `Ref: ${order.id}`}
                </div>
            </div>

        </div>
    );
}
