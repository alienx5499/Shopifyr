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
            const timer2 = setTimeout(() => setCelebrationStep(2), 4500); // Info after 4.5s
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
        <div className="min-h-screen bg-white font-sans text-black relative">
            {/* SUCCESS OVERLAY */}
            <AnimatePresence>
                {showCelebration && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center p-10"
                    >
                        <div className="text-center space-y-8">
                            <motion.div
                                key={celebrationStep}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.5 }}
                                className="flex flex-col items-center gap-4"
                            >
                                {celebrationStep === 0 && (
                                    <>
                                        <div className="w-20 h-20 rounded-full border-4 border-amber-500 border-t-transparent animate-spin mb-4" />
                                        <h1 className="text-4xl font-black uppercase tracking-tighter">Order Placed</h1>
                                        <p className="text-xs font-bold text-neutral-400 uppercase tracking-[0.3em] animate-pulse">Processing Request...</p>
                                    </>
                                )}
                                {celebrationStep === 1 && (
                                    <>
                                        <div className="w-20 h-20 rounded-full bg-black text-white flex items-center justify-center mb-4">
                                            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <h1 className="text-4xl font-black uppercase tracking-tighter">Order Accepted</h1>
                                        <p className="text-xs font-bold text-neutral-400 uppercase tracking-[0.3em]">Payment Secured</p>
                                    </>
                                )}
                                {celebrationStep === 2 && (
                                    <>
                                        <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">Delivery Scheduled</h1>

                                        <div className="flex items-center justify-center gap-3 bg-neutral-50 px-8 py-4 rounded-full border border-neutral-100">
                                            <p className="text-xs font-black text-neutral-600 uppercase tracking-widest">
                                                Order will be delivered by {order.estimatedDeliveryDate ? new Date(order.estimatedDeliveryDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : 'Date Pending'}
                                            </p>
                                            <div className="group/info relative cursor-help">
                                                <div className="w-4 h-4 rounded-full bg-black text-white text-[10px] font-bold flex items-center justify-center">i</div>
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 bg-black text-white text-[10px] p-3 rounded font-medium hidden group-hover/info:block z-10 text-center leading-relaxed shadow-xl">
                                                    We are calculating days as 1 minute for this demo simulation.
                                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black"></div>
                                                </div>
                                            </div>
                                        </div>

                                        <motion.button
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.5 }}
                                            onClick={() => setShowCelebration(false)}
                                            className="mt-12 bg-black text-white px-12 py-5 text-[10px] font-black uppercase tracking-[0.3em] hover:scale-105 transition-transform"
                                        >
                                            View Digital Receipt
                                        </motion.button>
                                    </>
                                )}
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                {/* LEFT COLUMN: FIXED ARCHIVE HEADER */}
                <div className="lg:col-span-6 h-[50vh] lg:h-screen lg:sticky lg:top-0 bg-[#F9F9F9] border-r border-neutral-100 flex flex-col justify-between p-10 lg:p-20">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.6em] mb-8 block">
                            Order Manifest / {order.id}
                        </span>
                        <h1 className="text-7xl lg:text-[9rem] font-black tracking-tighter leading-[0.75] mb-10">
                            VOL.<br />
                            <span className="text-neutral-200">#{order.id}</span>
                        </h1>
                        <div className="inline-block px-4 py-2 border border-black text-[10px] font-black uppercase tracking-[0.3em]">
                            STATUS: {order.status}
                        </div>
                    </motion.div>

                    <div className="space-y-4">
                        <div className="text-[10px] font-black text-neutral-300 uppercase tracking-[0.4em] rotate-180 [writing-mode:vertical-lr] absolute bottom-10 left-10">
                            SECURE ARCHIVE — 2026
                        </div>
                        <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-400">
                            Authenticated on {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                    </div>
                </div>

                {/* RIGHT COLUMN: SCROLLABLE ITEMS & DATA */}
                <div className="lg:col-span-6 p-10 lg:p-24 space-y-24">

                    {/* Itemized List */}
                    <section>
                        <h2 className="text-[10px] font-black uppercase tracking-[0.4em] border-b border-black pb-4 mb-12">
                            Itemized Collection ({order.items.length})
                        </h2>
                        <div className="space-y-16">
                            {order.items.map((item) => (
                                <div key={item.id} className="group flex gap-10 items-start">
                                    <div className="w-24 h-32 bg-[#F5F5F5] overflow-hidden flex-shrink-0">
                                        <img
                                            src={item.productImageUrl}
                                            alt=""
                                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                                        />
                                    </div>
                                    <div className="flex-1 border-b border-neutral-100 pb-8">
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="text-xl font-black uppercase tracking-tight leading-none">
                                                {item.productName}
                                            </h3>
                                            <span className="text-sm font-black tracking-tighter">
                                                ${item.subtotal.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex gap-10 text-[9px] font-black uppercase tracking-widest text-neutral-400">
                                            <span>Quantity: {item.quantity}</span>
                                            <span>Unit: ${item.unitPrice.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Financial Summary */}
                    <section className="space-y-8">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.4em] border-b border-black pb-4 mb-8">
                            Authorization Total
                        </h2>
                        <div className="space-y-4">
                            <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-neutral-400">
                                <span>Collection Subtotal</span>
                                <span className="text-black">${order.totalAmount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-neutral-400">
                                <span>Logistics / Shipping</span>
                                <span className="text-emerald-600 italic">Complimentary</span>
                            </div>
                            <div className="flex justify-between items-end pt-8 border-t border-neutral-100">
                                <span className="text-[10px] font-black uppercase tracking-[0.5em]">Grand Total (USD)</span>
                                <span className="text-6xl font-black tracking-tighter leading-none">
                                    ${order.totalAmount.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </section>

                    {/* Actions */}
                    <footer className="pt-12 space-y-4">
                        <button
                            onClick={() => router.push('/products')}
                            className="w-full bg-black text-white py-8 text-[10px] font-black uppercase tracking-[0.4em] hover:bg-neutral-800 transition-all"
                        >
                            Return to Catalog
                        </button>
                        <button
                            onClick={() => router.push('/profile?tab=orders')}
                            className="w-full bg-transparent border border-neutral-200 text-black py-8 text-[10px] font-black uppercase tracking-[0.4em] hover:border-black transition-all"
                        >
                            Back to Profile Archive
                        </button>
                    </footer>

                    <div className="pt-20 opacity-20">
                        <p className="text-[8px] font-black uppercase tracking-[0.3em] leading-relaxed">
                            Logistics ID: {order.orderNumber || `ORD-REF-${order.id}`}<br />
                            This document serves as a digital receipt for your collection securement.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
