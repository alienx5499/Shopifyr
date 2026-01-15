'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';

export const ProfessionalNavbar: React.FC = () => {
    const router = useRouter();
    const pathname = usePathname();
    const [searchQuery, setSearchQuery] = useState('');
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const { user, isLoggedIn, logout } = useAuth();
    const { cartCount } = useCart();
    const profileRef = useRef<HTMLDivElement>(null);

    const isAuthPage = pathname === '/login' || pathname === '/register';

    useEffect(() => {
        setMounted(true);

        const handleClickOutside = (event: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
            setSearchQuery('');
        }
    };

    const handleLogout = () => {
        logout();
        setIsProfileOpen(false);
    };

    if (!mounted) return null;

    // NO NAVBAR FOR AUTH PAGES (Handled by AuthPage component)
    if (isAuthPage) return null;

    // FULL NAVBAR FOR STORE
    return (
        <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 sticky top-0 z-50 shadow-lg">
            {/* Top Bar - Delivery Info */}
            <div className="bg-slate-950 border-b border-slate-800">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-8 text-xs">
                        <div className="flex items-center space-x-4 text-gray-400">
                            <span className="flex items-center">
                                <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Deliver to: New York 10001
                            </span>
                        </div>
                        <div className="flex items-center space-x-4 text-gray-400">
                            <span>Free shipping on orders over $50</span>
                            <span>|</span>
                            <span>24/7 Customer Support</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Navbar */}
            <div className="bg-slate-900">
                <div className="container mx-auto px-4">
                    <div className="flex items-center gap-6 h-20">
                        {/* Logo */}
                        <Link href="/" className="flex items-center space-x-3 flex-shrink-0">
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 via-orange-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-orange-500/50 transition-shadow">
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                            </div>
                            <div className="hidden sm:block">
                                <span className="text-white font-bold text-xl tracking-tight block leading-none">Shopifyr</span>
                                <span className="text-orange-400 text-[10px] font-bold tracking-widest uppercase">Premium Store</span>
                            </div>
                        </Link>

                        {/* Search Bar - Wide & Centered */}
                        <form onSubmit={handleSearch} className="flex-1 max-w-2xl hidden md:block mx-auto">
                            <div className="relative group">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search for premium products..."
                                    className="w-full h-11 pl-4 pr-12 text-sm bg-slate-800 text-white placeholder-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-slate-700 transition-all border border-slate-700 group-hover:border-slate-600"
                                />
                                <button type="submit" className="absolute right-0 top-0 h-11 w-11 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </button>
                            </div>
                        </form>

                        {/* Actions */}
                        <div className="flex items-center gap-6 flex-shrink-0">
                            {isLoggedIn ? (
                                <>
                                    {/* Cart */}
                                    <Link href="/cart" className="relative group">
                                        <div className="flex flex-col items-center">
                                            <div className="relative p-1">
                                                <svg className="w-6 h-6 text-gray-300 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                                </svg>
                                                {cartCount > 0 && (
                                                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-slate-900">
                                                        {cartCount}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-[10px] text-gray-400 mt-1 font-medium group-hover:text-white transition-colors">Cart</span>
                                        </div>
                                    </Link>

                                    {/* Profile */}
                                    <div className="relative" ref={profileRef}>
                                        <button
                                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                                            className="group flex flex-col items-center focus:outline-none"
                                        >
                                            <div className="p-1">
                                                <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-gray-300 group-hover:bg-slate-600 group-hover:text-white transition-colors">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                </div>
                                            </div>
                                            <span className="text-[10px] text-gray-400 mt-1 font-medium group-hover:text-white transition-colors">Account</span>
                                        </button>

                                        <AnimatePresence>
                                            {isProfileOpen && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="absolute right-0 mt-4 w-60 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden ring-1 ring-black/5"
                                                >
                                                    <div className="px-4 py-3 border-b border-gray-100">
                                                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">My Account</p>
                                                    </div>
                                                    <Link href="/profile" className="flex items-center px-4 py-3 hover:bg-orange-50 text-gray-700 text-sm font-medium transition-colors group" onClick={() => setIsProfileOpen(false)}>
                                                        <span className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center mr-3 group-hover:bg-orange-200 transition-colors">
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                            </svg>
                                                        </span>
                                                        Profile Settings
                                                    </Link>
                                                    <Link href="/orders" className="flex items-center px-4 py-3 hover:bg-orange-50 text-gray-700 text-sm font-medium transition-colors group" onClick={() => setIsProfileOpen(false)}>
                                                        <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mr-3 group-hover:bg-blue-200 transition-colors">
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                                            </svg>
                                                        </span>
                                                        Orders & Returns
                                                    </Link>
                                                    <button onClick={handleLogout} className="w-full text-left px-4 py-3 hover:bg-red-50 text-red-600 text-sm font-medium border-t border-gray-100 transition-colors flex items-center group">
                                                        <span className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center mr-3 group-hover:bg-red-200 transition-colors">
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                            </svg>
                                                        </span>
                                                        Sign Out
                                                    </button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </>
                            ) : (
                                <div className="flex items-center space-x-4">
                                    <Link href="/login" className="text-gray-300 hover:text-white text-sm font-semibold transition-colors">Sign In</Link>
                                    <Link href="/register" className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-pink-600 text-white text-sm font-bold rounded-xl hover:shadow-lg hover:shadow-orange-500/30 transition-all transform hover:-translate-y-0.5">
                                        Get Started
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Category Bar - Sleek & Dark */}
            <nav className="bg-slate-800/50 backdrop-blur-sm border-t border-slate-700/50">
                <div className="container mx-auto px-4">
                    <div className="flex items-center space-x-8 h-12 overflow-x-auto scrollbar-hide">
                        <Link href="/products" className="text-white hover:text-orange-400 font-bold text-sm whitespace-nowrap flex items-center transition-colors">
                            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                            All Departments
                        </Link>
                        {['Electronics', 'Fashion', 'Books', 'Home', 'Sports', 'Beauty'].map((category) => (
                            <Link
                                key={category}
                                href={`/products?category=${category}`}
                                className="text-gray-400 hover:text-white text-sm font-medium whitespace-nowrap transition-colors relative group"
                            >
                                {category}
                                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 transition-all group-hover:w-full opacity-0 group-hover:opacity-100" />
                            </Link>
                        ))}
                        <Link href="/deals" className="text-orange-400 hover:text-orange-300 text-sm font-bold whitespace-nowrap transition-colors ml-auto flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Today's Deals
                        </Link>
                    </div>
                </div>
            </nav>
        </header>
    );
};
