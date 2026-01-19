'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { orderApi, userApi, watchlistApi, cartApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { useCart } from '@/contexts/CartContext';

export const dynamic = 'force-dynamic';

function ProfileContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { logout } = useAuth();
    const { incrementCartCount } = useCart();

    const [orders, setOrders] = useState<any[]>([]);
    const [watchlist, setWatchlist] = useState<any[]>([]);
    const [userProfile, setUserProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'orders' | 'settings' | 'watchlist'>('orders');

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab === 'saved' || tab === 'watchlist') setActiveTab('watchlist');
        else if (tab === 'settings') setActiveTab('settings');
        loadData();
    }, [searchParams]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (activeTab === 'orders') {
            interval = setInterval(async () => {
                const ordersData = await orderApi.getUserOrders();
                setOrders(ordersData);
            }, 5000);
        }
        return () => clearInterval(interval);
    }, [activeTab]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [profileData, ordersData, watchlistData] = await Promise.allSettled([
                userApi.getMe(),
                orderApi.getUserOrders(),
                watchlistApi.getMyWishlist()
            ]);

            if (profileData.status === 'fulfilled') setUserProfile(profileData.value);
            if (ordersData.status === 'fulfilled') setOrders(ordersData.value);
            if (watchlistData.status === 'fulfilled') setWatchlist(watchlistData.value);
        } catch (err) {
            console.error('Failed to load data', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCartFromWishlist = async (productId: number) => {
        try {
            await cartApi.addItem(productId, 1);
            incrementCartCount();
            toast.success('Successfully added to cart');
        } catch (err: any) {
            toast.error('Failed to add item');
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-neutral-100 border-t-black rounded-full animate-spin" />
        </div>
    );

    const displayName = userProfile?.firstName || userProfile?.username || 'Member';




    return (
        <div className="min-h-screen bg-[#FDFDFD] font-sans text-black pb-40">
            {/* Massive Editorial Header */}
            <div className="pt-40 pb-32 px-10 lg:px-24">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-[1400px] mx-auto border-b border-black pb-16 flex flex-col lg:flex-row justify-between items-end gap-10"
                >
                    <div className="space-y-4">
                        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-neutral-400">Account Registry</span>
                        <h1 className="text-8xl lg:text-[11rem] font-black tracking-tighter leading-[0.75]">
                            {displayName}.
                        </h1>
                    </div>
                    <div className="flex gap-20">
                        <div className="flex flex-col items-end">
                            <span className="text-6xl font-black tracking-tighter">{orders.length}</span>
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-neutral-400">Total Orders</span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-6xl font-black tracking-tighter">{watchlist.length}</span>
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-neutral-400">Wishlist Items</span>
                        </div>
                    </div>
                </motion.div>
            </div>

            <div className="max-w-[1400px] mx-auto px-10 lg:px-24">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-start">

                    {/* Simplified Navigation */}
                    <div className="lg:col-span-3 lg:sticky lg:top-10 space-y-2">
                        {['orders', 'watchlist', 'settings'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`w-full text-left py-5 text-[11px] font-black uppercase tracking-[0.4em] transition-all border-b ${activeTab === tab ? 'text-black border-black' : 'text-neutral-300 border-transparent hover:text-neutral-500'
                                    }`}
                            >
                                {tab === 'watchlist' ? 'Wishlist' : tab}
                            </button>
                        ))}
                        <button onClick={logout} className="w-full text-left py-10 text-[10px] font-black uppercase tracking-[0.4em] text-neutral-400 hover:text-red-500 transition-colors">
                            Logout — End Session
                        </button>
                    </div>

                    {/* Main View Area */}
                    <div className="lg:col-span-9">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.5, ease: "anticipate" }}
                            >
                                {activeTab === 'orders' && <OrdersView orders={orders} router={router} />}
                                {activeTab === 'watchlist' && <WatchlistView watchlist={watchlist} onAddToCart={handleAddToCartFromWishlist} router={router} />}
                                {activeTab === 'settings' && <SettingsView userProfile={userProfile} onUpdate={setUserProfile} />}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}

function OrdersView({ orders, router }: { orders: any[], router: any }) {
    if (orders.length === 0) return <div className="py-20 text-neutral-300 font-bold uppercase tracking-widest">No order history found.</div>;

    return (
        <div className="space-y-32">
            {orders.map((order, index) => {
                const userOrderNumber = orders.length - index;
                const isConfirmed = order.status === 'CONFIRMED' || order.status === 'DELIVERED';
                const isDelivered = order.status === 'DELIVERED';

                return (
                    <div key={order.id} className="group relative">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
                            <div className="space-y-2">
                                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.4em]">Ref No. 000{order.id}</span>
                                <h3 className="text-4xl lg:text-5xl font-black tracking-tighter uppercase">Order #{userOrderNumber}</h3>
                                <div className="flex flex-col gap-1">
                                    <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest italic">
                                        Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                    </p>
                                    {isConfirmed && order.estimatedDeliveryDate && !isDelivered && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex items-center gap-2"
                                        >
                                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                                                Order will be delivered by {new Date(order.estimatedDeliveryDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                            </p>
                                            <div className="group/info relative">
                                                <button className="w-3.5 h-3.5 rounded-full border border-neutral-300 text-[8px] font-bold text-neutral-400 flex items-center justify-center hover:bg-black hover:text-white hover:border-black transition-colors">
                                                    i
                                                </button>
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-black text-white text-[9px] p-2 rounded hidden group-hover/info:block z-10 text-center leading-relaxed">
                                                    We are calculating days as 1 minute for this demo simulation.
                                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black"></div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                    {isDelivered && (
                                        <motion.p
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-[10px] font-black text-black uppercase tracking-widest"
                                        >
                                            Delivered successfully
                                        </motion.p>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <motion.span
                                    key={order.status}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className={`text-[10px] font-black uppercase tracking-[0.3em] mb-4 ${order.status === 'PENDING' ? 'text-amber-500' :
                                            order.status === 'DELIVERED' ? 'text-black' : 'text-emerald-500'
                                        }`}
                                >
                                    {order.status === 'PENDING' && (
                                        <span className="flex items-center gap-2">
                                            Order Placed <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                        </span>
                                    )}
                                    {order.status === 'CONFIRMED' && (
                                        <span className="flex items-center gap-2">
                                            Order Accepted <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                        </span>
                                    )}
                                    {order.status === 'DELIVERED' && "Delivered"}
                                    {['PENDING', 'CONFIRMED', 'DELIVERED'].includes(order.status) ? '' : `Status / ${order.status}`}
                                </motion.span>
                                <span className="text-4xl font-black tracking-tight">${Number(order.totalAmount).toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 lg:grid-cols-6 gap-4 border-y border-neutral-100 py-10">
                            {order.items.map((item: any, idx: number) => (
                                <div key={idx} className="aspect-[3/4] bg-neutral-50 overflow-hidden">
                                    {item.productImageUrl ? (
                                        <img
                                            src={item.productImageUrl}
                                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000"
                                            alt=""
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-neutral-100">
                                            <span className="text-neutral-300 text-xs">IMG</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 flex justify-between items-center">
                            <div className="text-[9px] font-bold text-neutral-400 uppercase tracking-[0.3em]">
                                {order.items.length} Products Included
                            </div>
                            <button
                                onClick={() => router.push(`/orders/${order.id}`)}
                                className="bg-black text-white px-10 py-4 text-[10px] font-black uppercase tracking-[0.4em] hover:bg-neutral-800 transition-all cursor-pointer"
                            >
                                Review Order
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function WatchlistView({ watchlist, onAddToCart, router }: { watchlist: any[], onAddToCart: (id: number) => void, router: any }) {
    if (!watchlist || watchlist.length === 0) return <div className="py-20 text-neutral-300 font-bold uppercase tracking-widest">Your wishlist is empty.</div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {watchlist.map((item) => (
                <div key={item.id} className="group cursor-pointer" onClick={() => router.push(`/products/${item.product.id}`)}>
                    <div className="aspect-[3/4] bg-neutral-50 overflow-hidden mb-6 relative">
                        {item.product.imageUrl ? (
                            <img
                                src={item.product.imageUrl}
                                alt={item.product.name}
                                className="w-full h-full object-cover grayscale opacity-90 group-hover:grayscale-0 group-hover:opacity-100 hover:scale-105 transition-all duration-700"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-neutral-100">
                                <span className="text-neutral-300 text-xs">NO IMG</span>
                            </div>
                        )}
                        <button
                            onClick={(e) => { e.stopPropagation(); onAddToCart(item.product.id); }}
                            className="absolute bottom-0 right-0 w-12 h-12 bg-black text-white flex items-center justify-center translate-y-full group-hover:translate-y-0 transition-transform duration-300 hover:bg-neutral-800"
                            title="Add to Cart"
                        >
                            <span className="text-lg">+</span>
                        </button>
                    </div>
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-2">{item.product.categoryName || 'Product'}</p>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-black mb-2 line-clamp-1">{item.product.name}</h3>
                        <p className="text-sm font-medium text-neutral-500">${item.product.price.toLocaleString()}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

function SettingsView({ userProfile, onUpdate }: { userProfile: any, onUpdate: (data: any) => void }) {
    const [formData, setFormData] = useState({
        firstName: userProfile?.firstName || '',
        lastName: userProfile?.lastName || '',
        phoneNumber: userProfile?.phoneNumber || '',
        addressLine1: userProfile?.addressLine1 || '',
        addressLine2: userProfile?.addressLine2 || '',
        city: userProfile?.city || '',
        state: userProfile?.state || '',
        zipCode: userProfile?.zipCode || '',
        country: userProfile?.country || ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const updatedUser = await userApi.updateProfile(formData);
            onUpdate(updatedUser);
            toast.success('Settings saved');
        } catch (error) {
            toast.error('Failed to update settings');
        } finally {
            setLoading(false);
        }
    };

    const Input = ({ label, name, ...props }: any) => (
        <div className="space-y-3">
            <label className="text-[9px] font-black uppercase tracking-[0.3em] text-neutral-400">{label}</label>
            <input
                name={name}
                value={formData[name as keyof typeof formData]}
                onChange={handleChange}
                className="w-full bg-neutral-50 border-b border-black/10 px-4 py-4 text-sm font-bold placeholder:font-normal placeholder:text-neutral-300 focus:outline-none focus:border-black focus:bg-white transition-all rounded-none"
                {...props}
            />
        </div>
    );

    return (
        <div className="max-w-xl">
            <form onSubmit={handleSubmit} className="space-y-16">
                <section>
                    <h3 className="text-xl font-black uppercase tracking-tight mb-10 pb-4 border-b border-black">Personal Info</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Input label="First Name" name="firstName" />
                        <Input label="Last Name" name="lastName" />
                        <div className="md:col-span-2">
                            <Input label="Phone Number" name="phoneNumber" type="tel" />
                        </div>
                    </div>
                </section>

                <section>
                    <h3 className="text-xl font-black uppercase tracking-tight mb-10 pb-4 border-b border-black">Shipping Details</h3>
                    <div className="space-y-8">
                        <Input label="Street Address" name="addressLine1" />
                        <Input label="Apartment / Unit" name="addressLine2" />
                        <div className="grid grid-cols-2 gap-8">
                            <Input label="City" name="city" />
                            <Input label="Region / State" name="state" />
                        </div>
                        <div className="grid grid-cols-2 gap-8">
                            <Input label="Postal Code" name="zipCode" />
                            <Input label="Country" name="country" />
                        </div>
                    </div>
                </section>

                <div className="flex justify-start pt-12">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-black text-white px-12 py-5 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-neutral-800 disabled:opacity-50 transition-all w-full md:w-auto"
                    >
                        {loading ? 'Processing...' : 'Save Preferences'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default function ProfilePage() {
    return (
        <Suspense fallback={null}>
            <ProfileContent />
        </Suspense>
    );
}
