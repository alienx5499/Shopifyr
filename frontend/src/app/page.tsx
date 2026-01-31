'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ProductCard } from '@/components/features/ProductCard';
import { productApi, cartApi } from '@/lib/api';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

export default function HomePage() {
  const router = useRouter();
  const { isLoggedIn, isLoading: authLoading } = useAuth();
  const { incrementCartCount } = useCart();
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [dealProduct, setDealProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('HomePage Auth Check:', { authLoading, isLoggedIn });
    if (!authLoading && !isLoggedIn) {
      router.replace('/login');
    }
  }, [authLoading, isLoggedIn, router]);

  useEffect(() => {
    if (isLoggedIn) {
      loadFeaturedProducts();
    }
  }, [isLoggedIn]);

  const loadFeaturedProducts = async () => {
    try {
      const response = await productApi.getAll({ page: 0, size: 12 });
      const products = response.content || [];
      setFeaturedProducts(products);

      // Auto-select a dynamic deal product (e.g., the 5th item or first available)
      if (products.length > 4) setDealProduct(products[4]);
      else if (products.length > 0) setDealProduct(products[0]);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  const handleOptimisticAddToCart = (productId: number) => {
    // Instant Feedback
    incrementCartCount();
    toast.success('Added to Cart', { id: `cart-${productId}`, duration: 2000 });

    // Background execution
    cartApi.addItem(productId, 1).catch(() => {
      toast.error('Failed to sync cart', { id: `cart-${productId}` });
    });
  };

  if (authLoading || !isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      {/* 01. HERO CAROUSEL */}
      <section className="relative h-[80vh] w-full overflow-hidden bg-neutral-900 text-white">
        <HeroSlider />
      </section>

      {/* 02. SPLIT LAYOUT: CATEGORIES & DEAL */}
      <section className="py-24 px-8 lg:px-16 max-w-[1800px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 h-full">

          {/* LEFT: 2x2 CATEGORY GRID */}
          <div>
            <div className="flex justify-between items-end mb-8">
              <h2 className="text-sm font-black uppercase tracking-tighter">Collections</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { name: 'Electronics', ref: 'SEC-01', image: '/assets/images/categories/electronics.png' },
                { name: 'Fashion', ref: 'SEC-02', image: '/assets/images/categories/fashion.png' },
                { name: 'Books', ref: 'SEC-03', image: '/assets/images/categories/books.png' },
                { name: 'Shoes', ref: 'SEC-04', image: '/assets/images/products/nike_air_max.png' }
              ].map((cat) => (
                <Link key={cat.name} href={`/products?category=${cat.name}`} className="group relative bg-white aspect-square overflow-hidden block rounded-sm">
                  <div className="absolute inset-0">
                    <img src={cat.image} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute inset-0 p-6 flex flex-col justify-end bg-gradient-to-t from-black/80 to-transparent">
                    <span className="text-[8px] font-black text-white/70 tracking-widest uppercase mb-1">{cat.ref}</span>
                    <div className="flex justify-between items-end">
                      <h3 className="text-lg font-black uppercase tracking-tighter text-white">{cat.name}</h3>
                      <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">&rarr;</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* RIGHT: DYNAMIC TODAY'S DEAL */}
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-end mb-8">
              <h2 className="text-sm font-black uppercase tracking-tighter">Limited Offer</h2>
            </div>

            <div className="relative flex-1 bg-[#F9F9F9] border border-neutral-100 overflow-hidden group min-h-[500px] rounded-sm shadow-sm">
              <div className="absolute inset-0 flex items-center justify-center">
                {dealProduct ? (
                  <img src={dealProduct.imageUrl} alt={dealProduct.name} className="w-full h-full object-contain p-20" />
                ) : (
                  <div className="animate-pulse bg-neutral-100 w-full h-full" />
                )}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent flex flex-col justify-end p-12">
                <span className="bg-black text-white text-[10px] font-black uppercase tracking-[0.3em] px-4 py-2 w-fit mb-4">Limited Archive Deal</span>
                <h3 className="text-4xl lg:text-5xl font-black uppercase text-black tracking-tighter mb-2 leading-none">
                  {dealProduct?.name || "Loading Deal..."}
                </h3>
                <p className="text-neutral-500 text-xs font-bold uppercase tracking-widest mb-8 max-w-sm">
                  Exclusive archival pricing secured for the next 24 hours. Verified premium grade.
                </p>
                <div className="flex items-center gap-8">
                  <div>
                    <span className="block text-sm text-neutral-400 line-through font-bold">${dealProduct ? (dealProduct.price / 0.6).toFixed(2) : "0.00"}</span>
                    <span className="block text-4xl text-black font-black tracking-tighter">${dealProduct?.price?.toFixed(2)}</span>
                  </div>
                  <button
                    disabled={!dealProduct}
                    onClick={() => handleOptimisticAddToCart(dealProduct.id)}
                    className="bg-black text-white px-10 py-5 text-[10px] font-black uppercase tracking-[0.4em] hover:bg-neutral-800 transition-all active:scale-95 shadow-xl disabled:opacity-50"
                  >
                    Claim Offer
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section >

      {/* 03. FEATURED INVENTORY */}
      < section className="py-24 px-8 lg:px-16 max-w-[1800px] mx-auto bg-neutral-50/50" >
        <div className="flex justify-between items-baseline mb-16">
          <h2 className="text-sm font-black uppercase tracking-tighter">Featured Inventory</h2>
        </div>

        {
          loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-8 gap-y-16">
              {[...Array(12)].map((_, i) => <div key={i} className="aspect-[3/4] bg-neutral-100 animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-8 gap-y-20">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={(id) => handleOptimisticAddToCart(id)}
                />
              ))}
            </div>
          )
        }
      </section >

      {/* 04. TECHNICAL SPECS FOOTER */}
      < footer className="py-16 px-8 lg:px-16 border-t border-neutral-100 bg-black text-white" >
        <div className="max-w-[1800px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 opacity-80">
          {[
            { label: 'Logistics', val: 'Global Tier 01' },
            { label: 'Security', val: '256-Bit SSL' },
            { label: 'Sourcing', val: 'Verified Authentic' },
            { label: 'Archive ID', val: 'REF-2026-X' }
          ].map((item, i) => (
            <div key={i} className="space-y-2">
              <span className="text-[8px] font-black uppercase tracking-[0.4em] text-neutral-500">{item.label}</span>
              <p className="text-[10px] font-bold uppercase tracking-widest">{item.val}</p>
            </div>
          ))}
        </div>
      </footer >
    </div >
  );
}

const HeroSlider = () => {
  const [current, setCurrent] = useState(0);
  const slides = [
    {
      id: 1,
      title: "Audio",
      subtitle: "High-Fidelity Engineering",
      img: "/assets/images/products/product_headphones_1768419474302.png",
      bg: "bg-neutral-900"
    },
    {
      id: 2,
      title: "Optics",
      subtitle: "Visual Precision",
      img: "/assets/images/products/product_laptop_1768419458778.png",
      bg: "bg-neutral-800"
    },
    {
      id: 3,
      title: "Chrono",
      subtitle: "Time Dilation",
      img: "/assets/images/products/product_watch_1768419490305.png",
      bg: "bg-stone-900"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-full">
      <AnimatePresence mode='wait'>
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className={`absolute inset-0 ${slides[current].bg}`}
        >
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-[20vw] font-black text-white/5 tracking-tighter select-none truncate">
              {slides[current].subtitle}
            </span>
          </div>

          <div className="relative z-10 h-full w-full max-w-[1800px] mx-auto px-8 lg:px-16 flex items-center">
            <div className="grid grid-cols-1 md:grid-cols-2 w-full items-center gap-12">
              <div className="space-y-6">
                <motion.span
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                  className="text-xs font-black text-emerald-500 uppercase tracking-[0.4em] block"
                >
                  New Archive Entry
                </motion.span>
                <motion.h2
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                  className="text-5xl lg:text-8xl font-black text-white uppercase tracking-tighter leading-[0.8]"
                >
                  {slides[current].title}
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                  className="text-white/60 font-bold uppercase tracking-widest text-sm max-w-md"
                >
                  {slides[current].subtitle}. Verified functionality for the modern pioneer.
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="relative aspect-square max-h-[60vh] hidden md:block"
              >
                <img src={slides[current].img} alt="" className="w-full h-full object-contain drop-shadow-2xl" />
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-12 left-8 lg:left-16 flex gap-2 z-20">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1 transition-all ${current === i ? 'w-12 bg-emerald-500' : 'w-4 bg-white/20'}`}
          />
        ))}
      </div>
    </div>
  );
};
