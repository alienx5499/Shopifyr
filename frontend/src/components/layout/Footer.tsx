'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const Footer: React.FC = () => {
    const pathname = usePathname();
    const isAuthPage = pathname === '/login' || pathname === '/register';

    if (isAuthPage) return null;

    const [email, setEmail] = useState('');

    return (
        <footer className="bg-black text-white pt-32 pb-12 overflow-hidden relative">
            {/* Background Texture/Text */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-[0.03]">
                <span className="text-[20vw] font-black leading-none whitespace-nowrap select-none">
                    SHOPIFYR GLOBAL
                </span>
            </div>

            <div className="container mx-auto px-10 lg:px-24 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 mb-32 border-b border-neutral-800 pb-20">
                    {/* Brand Column */}
                    <div className="lg:col-span-5 space-y-12">
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-500 block mb-6">Directory</span>
                            <h2 className="text-5xl lg:text-7xl font-black tracking-tighter uppercase leading-[0.8]">
                                Global<br />Systems.
                            </h2>
                        </div>
                        <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 max-w-sm leading-loose">
                            Curating the finest digital and physical artifacts for the modern operator.
                            Strict quality control. Verified authenticity.
                        </p>

                        <form className="max-w-md pt-8">
                            <label className="text-[9px] font-black uppercase tracking-[0.3em] text-neutral-600 mb-4 block">Newsletter Protocol</label>
                            <div className="flex border-b border-neutral-800 focus-within:border-white transition-colors">
                                <input
                                    type="email"
                                    placeholder="ENTER EMAIL ID"
                                    className="bg-transparent w-full py-4 text-xs font-bold uppercase tracking-widest focus:outline-none placeholder:text-neutral-700"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                <button className="text-[10px] font-black uppercase tracking-[0.2em] hover:text-neutral-400">
                                    Submit
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Links Grid */}
                    <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-12">
                        {[
                            {
                                title: "Index",
                                links: [
                                    { label: "All Products", href: "/products" },
                                    { label: "New Arrivals", href: "/products?sort=newest" },
                                    { label: "Collections", href: "/products" },
                                    { label: "Lookbook", href: "#" }
                                ]
                            },
                            {
                                title: "Support",
                                links: [
                                    { label: "Track Order", href: "/orders" },
                                    { label: "Shipping Policy", href: "#" },
                                    { label: "Returns", href: "#" },
                                    { label: "FAQ Archive", href: "#" }
                                ]
                            },
                            {
                                title: "Legal",
                                links: [
                                    { label: "Terms of Service", href: "#" },
                                    { label: "Privacy Policy", href: "#" },
                                    { label: "Cookie Data", href: "#" },
                                    { label: "Accessibility", href: "#" }
                                ]
                            }
                        ].map((section, idx) => (
                            <div key={idx}>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-500 mb-8">{section.title}</h3>
                                <ul className="space-y-4">
                                    {section.links.map((link, lIdx) => (
                                        <li key={lIdx}>
                                            <Link
                                                href={link.href}
                                                className="text-xs font-bold uppercase tracking-widest hover:text-neutral-400 transition-colors block"
                                            >
                                                {link.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="flex flex-col md:flex-row justify-between items-end gap-8 text-[9px] font-black uppercase tracking-[0.2em] text-neutral-600">
                    <div className="flex gap-4">
                        <span>© 2026 Shopifyr System Inc.</span>
                        <span>All Rights Reserved</span>
                    </div>
                    <div className="flex gap-8">
                        <span>San Francisco</span>
                        <span>Tokyo</span>
                        <span>London</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};
