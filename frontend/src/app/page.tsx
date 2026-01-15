'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { ProductCard } from '@/components/features/ProductCard';
import { productApi, cartApi } from '@/lib/api';
import { useCart } from '@/contexts/CartContext';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  categoryName: string;
  brandName?: string;
  isActive: boolean;
}

const heroSlides = [
  {
    image: '/assets/images/banners/electronics.png',
    title: 'Latest Electronics',
    subtitle: 'Up to 50% Off on Premium Gadgets',
    link: '/products?category=Electronics',
    bg: 'from-slate-900 to-slate-800'
  },
  {
    image: '/assets/images/banners/fashion.png',
    title: 'Trending Fashion',
    subtitle: 'New Arrivals - Fresh Styles',
    link: '/products?category=Fashion',
    bg: 'from-slate-800 to-gray-900'
  }
];

export default function HomePage() {
  const router = useRouter();
  const { incrementCartCount } = useCart();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    loadFeaturedProducts();

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const loadFeaturedProducts = async () => {
    try {
      const response = await productApi.getAll({ page: 0, size: 18 });
      setFeaturedProducts(response.content || []);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId: number, productName: string) => {
    try {
      await cartApi.addItem(productId, 1);
      incrementCartCount();
      toast.success(`${productName} added to cart!`);
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error('Please login to add items to cart');
        router.push('/login');
      } else {
        toast.error('Failed to add to cart');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HERO BANNER - Prominent */}
      <section className="relative h-[500px] overflow-hidden">
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${currentSlide === index ? 'opacity-100' : 'opacity-0'
              }`}
          >
            {/* Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-r ${slide.bg}`} />

            {/* Image Overlay */}
            <div className="absolute inset-0 opacity-40">
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover mix-blend-overlay"
              />
            </div>

            {/* Content */}
            <div className="absolute inset-0 flex items-center">
              <div className="container mx-auto px-4">
                <div className="max-w-3xl">
                  <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: currentSlide === index ? 1 : 0, y: currentSlide === index ? 0 : 30 }}
                    transition={{ duration: 0.8, ease: "circOut" }}
                    className="text-6xl md:text-7xl font-bold mb-6 text-white tracking-tight leading-tight"
                  >
                    {slide.title}
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: currentSlide === index ? 1 : 0, y: currentSlide === index ? 0 : 30 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "circOut" }}
                    className="text-2xl md:text-3xl mb-10 text-gray-200 font-light"
                  >
                    {slide.subtitle}
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: currentSlide === index ? 1 : 0, y: currentSlide === index ? 0 : 30 }}
                    transition={{ duration: 0.8, delay: 0.4, ease: "circOut" }}
                  >
                    <Link href={slide.link}>
                      <button className="px-10 py-4 bg-orange-500 text-white font-bold text-lg rounded-xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/30 transform hover:-translate-y-1">
                        Shop Now
                      </button>
                    </Link>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Slide Indicators */}
        <div className="absolute bottom-10 left-12 z-30 flex space-x-3">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all duration-500 ${currentSlide === index ? 'bg-orange-500 w-16' : 'bg-white/30 w-10 hover:bg-white/50'
                }`}
            />
          ))}
        </div>
      </section>

      {/* Shop by Category - COMPACT */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Shop by Category</h2>
            <Link href="/products" className="text-orange-600 hover:text-orange-700 font-medium text-sm">View all categories →</Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {[
              { name: 'Electronics', image: '/assets/images/categories/electronics.png', link: '/products?category=Electronics' },
              { name: 'Fashion', image: '/assets/images/categories/fashion.png', link: '/products?category=Fashion' },
              { name: 'Books', image: '/assets/images/categories/books.png', link: '/products?category=Books' },
              { name: 'Home & Kitchen', image: '/assets/images/products/product_headphones_1768419474302.png', link: '/products?category=Home' },
              { name: 'Sports', image: '/assets/images/products/nike_air_max.png', link: '/products?category=Sports' },
              { name: 'Beauty', image: 'https://images.unsplash.com/photo-1596462502278-27bfdd403348?w=500&q=80', link: '/products?category=Beauty' },
              { name: 'Toys & Games', image: '/assets/images/products/ipad_air.png', link: '/products?category=Toys' },
              { name: 'Health & Wellness', image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500&q=80', link: '/products?category=Health' },
              { name: 'Pet Supplies', image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=500&q=80', link: '/products?category=Pets' },
              { name: 'Office Supplies', image: '/assets/images/products/dell_xps_13.png', link: '/products?category=Office' },
              { name: 'Jewelry', image: '/assets/images/products/product_watch_1768419490305.png', link: '/products?category=Jewelry' }
            ].map((category) => (
              <Link key={category.name} href={category.link}>
                <div className="group bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all overflow-hidden cursor-pointer">
                  <div className="relative h-24 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-2 text-center">
                    <h3 className="text-xs font-semibold text-gray-900">{category.name}</h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Today's Deals - COMPACT */}
      <section className="py-6 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Today's Deals</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { title: 'Electronics Sale', subtitle: 'Up to 50% off', image: '/assets/images/products/product_laptop_1768419458778.png', link: '/products?category=Electronics' },
              { title: 'Fashion Trends', subtitle: 'New arrivals', image: '/assets/images/products/product_sneakers_1768419507142.png', link: '/products?category=Fashion' },
              { title: 'Book Bonanza', subtitle: 'Best sellers', image: '/assets/images/categories/books.png', link: '/products?category=Books' },
              { title: 'Home Essentials', subtitle: 'Must-haves', image: '/assets/images/products/product_headphones_1768419474302.png', link: '/products?category=Home' }
            ].map((deal, index) => (
              <Link key={index} href={deal.link}>
                <div className="group bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all overflow-hidden">
                  <div className="relative h-32 overflow-hidden bg-gradient-to-br from-orange-50 to-pink-50">
                    <img
                      src={deal.image}
                      alt={deal.title}
                      className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-bold text-gray-900 mb-1">{deal.title}</h3>
                    <p className="text-xs text-orange-600">{deal.subtitle}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products - 6 COLUMNS */}
      <section className="py-6 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Featured Products</h2>
            <Link href="/products" className="text-orange-500 hover:text-orange-600 font-semibold text-sm flex items-center">
              View All
              <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {loading ? (
            <div className="grid-6-cols">
              {[...Array(18)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square bg-gray-200 rounded-lg mb-2" />
                  <div className="h-4 bg-gray-200 rounded mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid-6-cols">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={(id) => handleAddToCart(id, product.name)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features - COMPACT */}
      <section className="py-4 bg-gray-100 border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { icon: '🚚', title: 'Free Shipping', desc: 'Orders $50+' },
              { icon: '✓', title: 'Authentic', desc: '100% Genuine' },
              { icon: '↩', title: 'Easy Returns', desc: '30 days' },
              { icon: '🔒', title: 'Secure', desc: 'Safe payment' }
            ].map((feature, index) => (
              <div key={index} className="p-3">
                <div className="text-2xl mb-1">{feature.icon}</div>
                <h3 className="text-xs font-bold text-gray-900">{feature.title}</h3>
                <p className="text-xs text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
