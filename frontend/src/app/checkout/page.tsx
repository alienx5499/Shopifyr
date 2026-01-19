'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { cartApi, orderApi, userApi } from '@/lib/api';

/**
 * ULTRA-PREMIUM DESIGN SYSTEM - UPGRADED
 */

const Button = ({
    variant = 'primary',
    size = 'md',
    isLoading = false,
    children,
    className = '',
    disabled,
    ...props
}: any) => {
    const baseStyles = 'inline-flex items-center justify-center font-bold tracking-[0.15em] uppercase transition-all duration-700 disabled:opacity-20 disabled:cursor-not-allowed active:scale-[0.97] relative overflow-hidden group';
    const variants = {
        primary: 'bg-black text-white hover:bg-neutral-900 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4)] hover:shadow-[0_25px_70px_-10px_rgba(0,0,0,0.5)]',
        secondary: 'bg-neutral-100 text-black hover:bg-neutral-200',
        outline: 'bg-transparent border-[1.5px] border-black/15 text-black hover:border-black hover:bg-black hover:text-white'
    };
    const sizes = {
        sm: 'px-8 py-3.5 text-[10px]',
        md: 'px-12 py-6 text-[11px]',
        lg: 'px-16 py-7 text-xs'
    };

    return (
        <motion.button
            whileHover={{ y: -3, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className={`${baseStyles} ${variants[variant as keyof typeof variants]} ${sizes[size as keyof typeof sizes]} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            {isLoading ? (
                <div className="flex items-center gap-3">
                    <div className="w-4 h-4 border-[2.5px] border-white/20 border-t-white rounded-full animate-spin" />
                    <span className="animate-pulse">Processing</span>
                </div>
            ) : children}
        </motion.button>
    );
};

const LuxuryInput = ({ label, icon, ...props }: any) => (
    <div className="group relative w-full">
        <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400 mb-3 group-focus-within:text-black transition-colors duration-500">
            {label}
        </label>
        <div className="relative">
            {icon && (
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-black transition-colors">
                    {icon}
                </div>
            )}
            <input
                {...props}
                className={`w-full bg-white border-[1.5px] border-neutral-100 ${icon ? 'pl-12 pr-5' : 'px-6'} py-5 text-sm font-medium tracking-tight text-neutral-900 focus:outline-none focus:border-black focus:ring-4 focus:ring-black/5 transition-all duration-500 placeholder:text-neutral-300 placeholder:font-normal hover:border-neutral-200 shadow-sm hover:shadow-md focus:shadow-lg`}
            />
        </div>
    </div>
);

export default function CheckoutPage() {
    const router = useRouter();
    const [cart, setCart] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [placing, setPlacing] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '', phoneNumber: '',
        addressLine1: '', city: '', zipCode: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [cartData, userData] = await Promise.all([
                    cartApi.get(),
                    userApi.getMe().catch(() => null)
                ]);

                if (!cartData || !cartData.items || cartData.items.length === 0) {
                    router.push('/cart');
                    return;
                }
                setCart(cartData);

                if (userData) {
                    setFormData({
                        firstName: userData.firstName || '',
                        lastName: userData.lastName || '',
                        email: userData.email || '',
                        phoneNumber: userData.phoneNumber || '',
                        addressLine1: userData.addressLine1 || '',
                        city: userData.city || '',
                        zipCode: userData.zipCode || ''
                    });
                }
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        fetchData();
    }, [router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handlePlaceOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        setPlacing(true);
        try {
            const order = await orderApi.placeOrder();
            router.push(`/orders/${order.id}?new=true`);
        } catch (e) {
            console.error('Order Failed', e);
        } finally {
            setPlacing(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-gradient-to-br from-white via-neutral-50 to-white flex items-center justify-center">
            <div className="relative">
                <div className="w-16 h-16 border-[3px] border-neutral-100 border-t-black rounded-full animate-spin" />
                <div className="absolute inset-0 w-16 h-16 border-[3px] border-transparent border-b-black/20 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50 pt-24 pb-32 font-sans antialiased">
            <div className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-20">

                {/* Breadcrumbs */}
                <nav className="mb-12 flex items-center gap-4 text-[9px] font-bold uppercase tracking-[0.35em] text-neutral-300">
                    <motion.span
                        whileHover={{ x: -2 }}
                        className="cursor-pointer hover:text-black transition-all duration-300"
                        onClick={() => router.push('/cart')}
                    >
                        Shopping Bag
                    </motion.span>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="text-black">Checkout</span>
                </nav>

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-16"
                >
                    <div className="flex items-end gap-6">
                        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter leading-none text-black">
                            Checkout
                        </h1>
                        <div className="w-2 h-2 bg-black rounded-full mb-3 animate-pulse" />
                    </div>
                </motion.div>

                <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start max-w-[1400px]">

                    {/* Left Column: Form */}
                    <div className="lg:col-span-7 space-y-32">

                        {/* Shipping Section */}
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="relative bg-white p-8 lg:p-12 border-[1.5px] border-neutral-100 shadow-[0_10px_50px_-12px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_70px_-12px_rgba(0,0,0,0.12)] transition-all duration-700"
                        >
                            <div className="absolute top-0 left-0 w-1 h-24 bg-gradient-to-b from-black to-transparent" />

                            <div className="flex items-center gap-6 mb-10">
                                <div className="relative">
                                    <div className="text-xs font-black bg-black text-white w-12 h-12 flex items-center justify-center">
                                        01
                                    </div>
                                    <div className="absolute -inset-1 bg-black/10 -z-10 blur-sm" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-black uppercase tracking-[0.4em] text-neutral-900 mb-1">Shipping Information</h2>
                                    <p className="text-[9px] text-neutral-400 uppercase tracking-[0.2em] font-bold">Where should we deliver?</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
                                <LuxuryInput label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} required />
                                <LuxuryInput label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} required />
                                <LuxuryInput label="Email Address" type="email" name="email" value={formData.email} onChange={handleChange} required />
                                <LuxuryInput label="Phone Number" type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required />
                                <div className="md:col-span-2">
                                    <LuxuryInput label="Street Address" name="addressLine1" value={formData.addressLine1} onChange={handleChange} required />
                                </div>
                                <LuxuryInput label="City / Region" name="city" value={formData.city} onChange={handleChange} required />
                                <LuxuryInput label="Postal Code" name="zipCode" value={formData.zipCode} onChange={handleChange} required />
                            </div>
                        </motion.section>

                        {/* Payment Section */}
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="relative bg-white p-8 lg:p-12 border-[1.5px] border-neutral-100 shadow-[0_10px_50px_-12px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_70px_-12px_rgba(0,0,0,0.12)] transition-all duration-700"
                        >
                            <div className="absolute top-0 left-0 w-1 h-24 bg-gradient-to-b from-black to-transparent" />

                            <div className="flex items-center gap-6 mb-10">
                                <div className="relative">
                                    <div className="text-xs font-black bg-black text-white w-12 h-12 flex items-center justify-center">
                                        02
                                    </div>
                                    <div className="absolute -inset-1 bg-black/10 -z-10 blur-sm" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-black uppercase tracking-[0.4em] text-neutral-900 mb-1">Payment Details</h2>
                                    <p className="text-[9px] text-neutral-400 uppercase tracking-[0.2em] font-bold">Secure & Encrypted</p>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-neutral-50 to-white p-8 lg:p-10 border-[1.5px] border-neutral-100 space-y-8">
                                <LuxuryInput label="Card Number" placeholder="0000 0000 0000 0000" required />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <LuxuryInput label="Expiry Date" placeholder="MM/YY" required />
                                    <LuxuryInput label="CVV Security Code" placeholder="***" type="password" required />
                                </div>
                                <LuxuryInput label="Cardholder Full Name" required />

                                <div className="flex items-center gap-3 pt-4">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/10">
                                        <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.2em]">
                                        256-bit SSL Encryption Active
                                    </span>
                                </div>
                            </div>
                        </motion.section>
                    </div>

                    {/* Right Column: Sticky Summary */}
                    <div className="lg:col-span-5 lg:sticky lg:top-8">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white border-[1.5px] border-neutral-100 shadow-[0_30px_100px_-20px_rgba(0,0,0,0.12)] overflow-hidden"
                        >
                            {/* Header Bar */}
                            <div className="bg-black text-white px-10 py-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-[11px] font-black uppercase tracking-[0.4em]">
                                        Order Summary
                                    </h2>
                                    <div className="flex items-center gap-2 bg-white/10 px-4 py-2">
                                        <span className="text-[10px] font-black">{cart?.items.length}</span>
                                        <span className="text-[9px] font-bold uppercase tracking-wider opacity-70">Items</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-10 lg:p-14">
                                {/* Items List */}
                                <div className="space-y-8 mb-10 max-h-[420px] overflow-y-auto pr-2 luxury-scrollbar">
                                    {cart?.items.map((item: any, index: number) => (
                                        <motion.div
                                            key={item.id}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.4 + index * 0.1 }}
                                            className="flex gap-6 group relative"
                                        >
                                            <div className="relative w-20 h-24 bg-neutral-50 overflow-hidden flex-shrink-0 border-[1.5px] border-neutral-100 shadow-sm">
                                                {item.productImageUrl && (
                                                    <img
                                                        src={item.productImageUrl}
                                                        alt={item.productName}
                                                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                                                    />
                                                )}
                                                <div className="absolute top-2 right-2 bg-black text-white text-[8px] font-black px-2 py-1 uppercase tracking-wider">
                                                    x{item.quantity}
                                                </div>
                                            </div>
                                            <div className="flex-1 flex flex-col justify-between py-1">
                                                <div>
                                                    <p className="text-xs font-black text-neutral-900 uppercase tracking-tight leading-tight mb-2">{item.productName}</p>
                                                    <p className="text-[9px] text-neutral-400 uppercase font-bold tracking-widest">Qty: {item.quantity}</p>
                                                </div>
                                                <p className="text-sm font-black text-black">${(item.productPrice * item.quantity).toLocaleString()}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Pricing Breakdown */}
                                <div className="space-y-5 pt-10 border-t-[1.5px] border-neutral-100 mb-10">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-400">Subtotal</span>
                                        <span className="text-sm font-bold text-neutral-900">${cart?.totalAmount.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-400">Shipping</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-black text-emerald-600 uppercase tracking-wider">Free</span>
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-400">Tax</span>
                                        <span className="text-sm font-bold text-neutral-900">Calculated at checkout</span>
                                    </div>
                                </div>

                                {/* Total */}
                                <div className="mb-10 p-8 bg-gradient-to-br from-neutral-50 via-white to-neutral-50 border-[1.5px] border-neutral-100">
                                    <p className="text-[9px] font-black uppercase tracking-[0.5em] text-neutral-300 mb-3">Total Amount</p>
                                    <div className="flex items-baseline gap-3">
                                        <span className="text-6xl lg:text-7xl font-black tracking-tighter text-black">
                                            ${cart?.totalAmount.toLocaleString()}
                                        </span>
                                        <span className="text-xs font-black text-neutral-400 uppercase tracking-wider">USD</span>
                                    </div>
                                </div>

                                {/* CTA Button */}
                                <Button
                                    type="submit"
                                    isLoading={placing}
                                    variant="primary"
                                    className="w-full !py-5 !text-sm font-black !tracking-[0.2em] hover:!tracking-[0.25em] transition-all"
                                >
                                    <span className="flex items-center gap-3">
                                        Complete Purchase
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </span>
                                </Button>
                            </div>
                        </motion.div>

                        {/* Back Button */}
                        <motion.button
                            whileHover={{ x: -4 }}
                            onClick={() => router.push('/cart')}
                            type="button"
                            className="mt-10 flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.35em] text-neutral-400 hover:text-black transition-all duration-500 group"
                        >
                            <svg className="w-4 h-4 group-hover:-translate-x-2 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Cart
                        </motion.button>
                    </div>

                </form>
            </div>

            <style>{`
                .luxury-scrollbar::-webkit-scrollbar { 
                    width: 6px; 
                }
                .luxury-scrollbar::-webkit-scrollbar-track { 
                    background: #F5F5F5; 
                    border-radius: 10px;
                }
                .luxury-scrollbar::-webkit-scrollbar-thumb { 
                    background: linear-gradient(to bottom, #D4D4D4, #A3A3A3); 
                    border-radius: 10px;
                }
                .luxury-scrollbar::-webkit-scrollbar-thumb:hover { 
                    background: linear-gradient(to bottom, #A3A3A3, #737373); 
                }
            `}</style>
        </div>
    );
}
