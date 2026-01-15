'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export const Footer: React.FC = () => {
    const pathname = usePathname();
    const isAuthPage = pathname === '/login' || pathname === '/register';

    // Don't render footer on auth pages
    if (isAuthPage) return null;

    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        setSubscribed(true);
        setTimeout(() => {
            setSubscribed(false);
            setEmail('');
        }, 3000);
    };

    return (
        <footer className="bg-black text-white pt-24 font-sans">
            {/* Newsletter Section */}
            <div className="container mx-auto px-6 pb-20 border-b border-white/10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <div>
                        <h3 className="text-4xl font-extrabold mb-6 tracking-tight">Stay in the Loop</h3>
                        <p className="text-gray-400 text-lg max-w-lg leading-relaxed font-light">
                            Subscribe to receive exclusive drops, early access to sales, and curated style edits directly to your inbox.
                        </p>
                    </div>
                    <div>
                        <form onSubmit={handleSubscribe} className="flex gap-4 max-w-lg relative">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email address"
                                required
                                className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary focus:bg-white/10 transition-all backdrop-blur-sm"
                            />
                            <Button type="submit" size="lg" className="absolute right-2 top-2 bottom-2 px-8 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30">
                                Join
                            </Button>
                        </form>
                        {subscribed && <p className="text-green-400 mt-4 text-sm font-medium animate-pulse">✓ You're on the list!</p>}
                    </div>
                </div>
            </div>

            {/* Links Section */}
            <div className="container mx-auto px-6 py-24">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-12 gap-16 lg:gap-24">
                    <div className="col-span-2 lg:col-span-4 pr-8">
                        <div className="flex items-center space-x-3 mb-8">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-light rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                                <span className="text-white font-extrabold text-xl">S</span>
                            </div>
                            <span className="text-2xl font-bold tracking-tight">Shopifyr.</span>
                        </div>
                        <p className="text-gray-400 leading-relaxed mb-8 font-light">
                            Redefining the modern shopping experience. We curate premium products for those who appreciate quality, design, and exceptional service.
                        </p>
                        <div className="flex gap-4">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="w-10 h-10 rounded-full bg-white/5 hover:bg-primary border border-white/5 flex items-center justify-center transition-all cursor-pointer hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20 group">
                                    <div className="w-4 h-4 bg-gray-400 group-hover:bg-white rounded-sm transition-colors" />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="lg:col-span-2 lg:col-start-6">
                        <h4 className="font-bold text-lg mb-8 text-white">Shop</h4>
                        <ul className="space-y-5 text-gray-400 font-medium">
                            <li><Link href="/products" className="hover:text-primary transition-colors">All Products</Link></li>
                            <li><Link href="/products?sort=newest" className="hover:text-primary transition-colors">New Arrivals</Link></li>
                            <li><Link href="/products?sort=popular" className="hover:text-primary transition-colors">Best Sellers</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">Collections</Link></li>
                        </ul>
                    </div>

                    <div className="lg:col-span-2">
                        <h4 className="font-bold text-lg mb-8 text-white">Company</h4>
                        <ul className="space-y-5 text-gray-400 font-medium">
                            <li><Link href="#" className="hover:text-primary transition-colors">Our Story</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">Careers</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">Press</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">Sustainability</Link></li>
                        </ul>
                    </div>

                    <div className="lg:col-span-2">
                        <h4 className="font-bold text-lg mb-8 text-white">Support</h4>
                        <ul className="space-y-5 text-gray-400 font-medium">
                            <li><Link href="/orders" className="hover:text-primary transition-colors">Track Order</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">Returns</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">FAQ</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">Contact Us</Link></li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-white/5 bg-black/20 backdrop-blur-sm py-10">
                <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-gray-500 font-medium">
                    <p>&copy; 2024 Shopifyr Inc. All rights reserved.</p>
                    <div className="flex gap-10">
                        <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
                        <Link href="#" className="hover:text-white transition-colors">Cookie Settings</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};
