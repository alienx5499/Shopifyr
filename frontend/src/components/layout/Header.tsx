'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';

export const ProfessionalNavbar: React.FC = () => {
    const router = useRouter();
    const pathname = usePathname();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchCategory, setSearchCategory] = useState('all');
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const { user, isLoggedIn, logout } = useAuth();
    const { cartCount } = useCart();
    const profileRef = useRef<HTMLDivElement>(null);
    const categoryRef = useRef<HTMLDivElement>(null);

    const isAuthPage = pathname === '/login' || pathname === '/register';

    useEffect(() => {
        setMounted(true);
        const handleClickOutside = (event: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
            if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
                setIsCategoryOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const queryParams = new URLSearchParams();
        if (searchQuery.trim()) queryParams.set('search', searchQuery.trim());
        if (searchCategory !== 'all') queryParams.set('category', searchCategory);

        if (queryParams.toString()) {
            router.push(`/products?${queryParams.toString()}`);
            setSearchQuery('');
        }
    };

    if (!mounted) return null;
    if (isAuthPage) return null;

    return (
        <header className="sticky top-0 left-0 right-0 z-50 transition-all duration-300 glass-panel mb-0">
            <div className="container mx-auto px-6 lg:px-12">
                <div className="flex items-center justify-between h-20 gap-12">
                    {/* Logo - Minimalist */}
                    <Link href="/" className="flex items-center space-x-2 flex-shrink-0 group">
                        <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white shadow-soft group-hover:scale-105 transition-transform duration-500">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>
                        <span className="text-xl font-bold text-black tracking-tight group-hover:opacity-70 transition-opacity">Shopifyr.</span>
                    </Link>

                    {/* Search Bar - Floating Pill */}
                    <form onSubmit={handleSearch} className="flex-1 max-w-xl hidden md:flex items-center relative group">
                        <div className="relative w-full flex items-center transition-transform duration-300 group-focus-within:scale-[1.02]">
                            <div className="relative" ref={categoryRef}>
                                <button
                                    type="button"
                                    onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                                    className="bg-transparent border-none text-xs font-bold uppercase tracking-wider text-gray-500 focus:ring-0 cursor-pointer py-3 pl-2 pr-2 h-11 rounded-l-full hover:text-black transition-colors text-center w-auto flex items-center justify-center gap-1 min-w-[60px]"
                                >
                                    {searchCategory === 'all' ? 'All' : searchCategory}
                                </button>
                                {isCategoryOpen && (
                                    <div className="absolute top-full left-0 mt-2 w-32 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden py-1 z-50 animate-in fade-in zoom-in-95 duration-200">
                                        {['all', 'Electronics', 'Fashion', 'Books', 'Shoes'].map((cat) => (
                                            <button
                                                key={cat}
                                                type="button"
                                                onClick={() => {
                                                    setSearchCategory(cat);
                                                    setIsCategoryOpen(false);

                                                    if (cat === 'all' && !searchQuery.trim()) {
                                                        router.push('/');
                                                        return;
                                                    }

                                                    const params = new URLSearchParams();
                                                    if (searchQuery.trim()) params.set('search', searchQuery.trim());
                                                    if (cat !== 'all') params.set('category', cat);
                                                    router.push(`/products?${params.toString()}`);
                                                }}
                                                className={`w-full text-left px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors hover:bg-gray-50 ${searchCategory === cat ? 'text-black bg-gray-50' : 'text-gray-500'
                                                    }`}
                                            >
                                                {cat === 'all' ? 'All' : cat}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="h-6 w-px bg-gray-200 mx-2 flex-shrink-0"></div>
                            <div className="text-gray-400 flex-shrink-0">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search products..."
                                className="flex-1 w-full h-11 bg-transparent border-none text-sm font-medium text-black placeholder-gray-400 focus:ring-0"
                            />
                        </div>
                        <div className="absolute inset-0 -z-10 bg-[#F5F5F7] rounded-full shadow-inner"></div>
                    </form>

                    {/* Right Actions - Minimalist Icons */}
                    <div className="flex items-center gap-8 flex-shrink-0">
                        <Link href="/profile" className="group flex items-center gap-2">
                            <div className="flex flex-col items-end">
                                <span className="text-xs font-bold text-black uppercase tracking-wider group-hover:opacity-60 transition-opacity">Account</span>
                            </div>
                        </Link>

                        <Link href="/cart" className="group relative">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-black uppercase tracking-wider group-hover:opacity-60 transition-opacity">Cart</span>
                                <span className={`flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold transition-all duration-300 ${cartCount > 0 ? 'bg-black text-white scale-100' : 'bg-gray-100 text-gray-400 scale-90'}`}>
                                    {cartCount}
                                </span>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </header >
    );
};
