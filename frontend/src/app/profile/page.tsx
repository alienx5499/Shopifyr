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
            toast.success('Added to Cart', { duration: 2000 });
        } catch (err: any) {
            toast.error('Failed to add item');
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="w-10 h-10 border border-neutral-100 border-t-black rounded-full animate-spin" />
        </div>
    );

    const displayName = userProfile?.firstName || userProfile?.username || 'Member';

    const tabs = [
        { id: 'orders', label: 'Your Orders', count: orders.length },
        { id: 'watchlist', label: 'Wishlist', count: watchlist.length },
        { id: 'settings', label: 'Settings', count: null }
    ];

    return (
        <div className="min-h-screen bg-white font-sans text-black pb-40 pt-24">

            <div className="max-w-[1600px] mx-auto px-6 lg:px-24">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-32 items-start relative">

                    {/* Left Column: Fixed Navigation & Identity */}
                    <div className="lg:col-span-3 lg:sticky lg:top-4 space-y-12 border-r border-neutral-100 pr-10 h-[calc(100vh-2rem)] flex flex-col overflow-y-auto hide-scrollbar">
                        <div className="space-y-12">
                            {/* Identity Header */}
                            <div className="space-y-6">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400">Account</span>
                                <h1 className="text-4xl lg:text-6xl font-black tracking-tighter leading-[0.9] break-words">
                                    {displayName}.
                                </h1>
                            </div>

                            {/* Nav */}
                            <div className="flex flex-col gap-3">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as any)}
                                        className={`w-full text-left px-5 py-4 transition-all duration-300 border ${activeTab === tab.id
                                            ? 'bg-black text-white border-black shadow-none translate-x-0'
                                            : 'bg-white text-neutral-400 border-transparent hover:border-neutral-200 hover:text-black'
                                            }`}
                                    >
                                        <span className="text-xs font-black uppercase tracking-[0.2em]">
                                            {tab.label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={logout}
                            className="px-5 py-4 text-xs font-bold uppercase tracking-[0.2em] text-red-500 hover:text-red-600 border border-transparent hover:border-neutral-200 transition-all text-left w-full mt-auto"
                        >
                            Log Out
                        </button>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-9 min-h-[50vh] pt-8">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                transition={{ duration: 0.3 }}
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
    if (!orders || orders.length === 0) return (
        <div className="py-32 text-center border border-dashed border-neutral-200">
            <p className="text-neutral-300 font-bold uppercase tracking-widest mb-4">No Recent Orders</p>
            <button onClick={() => router.push('/products')} className="text-xs font-black uppercase tracking-[0.3em] border-b border-black">
                Start Shopping
            </button>
        </div>
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {orders.map((order, index) => {
                const userOrderNumber = orders.length - index;
                const effectiveStatus = (order.status === 'DELIVERED') ? 'DELIVERED' : 'PENDING';

                return (
                    <div key={order.id} className="bg-neutral-50 p-8 flex flex-col justify-between h-full min-h-[500px]">
                        <div>
                            {/* Header */}
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 block mb-2">
                                        Order 0{userOrderNumber}
                                    </span>
                                    <h3 className="text-4xl font-black tracking-tighter leading-none text-black">
                                        #{order.id}
                                    </h3>
                                </div>
                                {order.status === 'DELIVERED' ? (
                                    <span className="px-3 py-1 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest">
                                        Delivered
                                    </span>
                                ) : order.status === 'SHIPPED' ? (
                                    <span className="px-3 py-1 bg-black text-white text-[9px] font-black uppercase tracking-widest">
                                        Confirmed
                                    </span>
                                ) : (
                                    <span className="px-3 py-1 bg-white border border-neutral-200 text-[9px] font-black uppercase tracking-widest text-neutral-500">
                                        Processing
                                    </span>
                                )}
                            </div>

                            {/* Image Showcase */}
                            <div className="bg-white w-full aspect-square flex items-center justify-center p-8 mb-8 shadow-sm">
                                {order.items[0] && (
                                    <img
                                        src={order.items[0].productImageUrl}
                                        className="w-full h-full object-contain mix-blend-multiply"
                                        alt=""
                                    />
                                )}
                            </div>

                            {/* Info */}
                            <div className="space-y-1 text-center">
                                <p className="text-sm font-black uppercase truncate">{order.items[0]?.productName}</p>
                                <p className="text-[10px] uppercase tracking-widest text-neutral-500">
                                    {order.items.length} Item{order.items.length > 1 ? 's' : ''} • ${Number(order.totalAmount).toLocaleString()}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => router.push(`/orders/${order.id}`)}
                            className="bg-white border border-neutral-200 w-full py-4 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-black hover:text-white transition-colors mt-8"
                        >
                            View Details
                        </button>
                    </div>
                );
            })}
        </div>
    );
}

function WatchlistView({ watchlist, onAddToCart, router }: { watchlist: any[], onAddToCart: (id: number) => void, router: any }) {
    if (!watchlist || watchlist.length === 0) return (
        <div className="py-32 text-center border border-dashed border-neutral-200">
            <p className="text-neutral-300 font-bold uppercase tracking-widest mb-4">No Saved Items</p>
            <button onClick={() => router.push('/products')} className="text-xs font-black uppercase tracking-[0.3em] border-b border-black">
                Browse Collection
            </button>
        </div>
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
            {watchlist.map((item) => (
                <div key={item.id} className="group cursor-pointer" onClick={() => router.push(`/products/${item.product.id}`)}>
                    <div className="aspect-[4/5] bg-neutral-50 overflow-hidden mb-6 relative">
                        {item.product.imageUrl ? (
                            <img
                                src={item.product.imageUrl}
                                alt={item.product.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-neutral-100">
                                <span className="text-neutral-300 text-xs">NO IMG</span>
                            </div>
                        )}

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />

                        <button
                            onClick={(e) => { e.stopPropagation(); onAddToCart(item.product.id); }}
                            className="absolute bottom-6 right-6 w-14 h-14 bg-white text-black flex items-center justify-center opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 hover:bg-black hover:text-white shadow-xl"
                            title="Add to Cart"
                        >
                            <span className="text-xl font-light">+</span>
                        </button>
                    </div>
                    <div>
                        <div className="flex justify-between items-start mb-2">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">{item.product.categoryName || 'Product'}</p>
                            <p className="text-sm font-bold text-neutral-900">${item.product.price.toLocaleString()}</p>
                        </div>
                        <h3 className="text-xl font-black uppercase tracking-tight text-black line-clamp-2 leading-none group-hover:underline decoration-2 underline-offset-4">
                            {item.product.name}
                        </h3>
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
            toast.success('Settings saved', { duration: 2000 });
        } catch (error) {
            toast.error('Failed to update settings');
        } finally {
            setLoading(false);
        }
    };

    const Input = ({ label, name, ...props }: any) => (
        <div className="space-y-3">
            <label className="text-[11px] font-black uppercase tracking-[0.2em] text-neutral-400 block">
                {label}
            </label>
            <input
                name={name}
                value={formData[name as keyof typeof formData]}
                onChange={handleChange}
                className="w-full bg-neutral-50 border border-neutral-100 px-6 py-4 text-sm font-bold text-black focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all placeholder-neutral-300"
                {...props}
            />
        </div>
    );

    return (
        <div className="max-w-4xl">
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-16">
                    {/* section 1 */}
                    <section className="bg-white">
                        <div className="flex items-center gap-4 mb-10 border-b border-neutral-100 pb-6">
                            <span className="w-2 h-2 bg-black rounded-full" />
                            <h3 className="text-xl font-black uppercase tracking-tight">Identification</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Input label="First Name" name="firstName" placeholder="e.g. John" />
                            <Input label="Last Name" name="lastName" placeholder="e.g. Doe" />
                            <div className="md:col-span-2">
                                <Input label="Mobile Contact" name="phoneNumber" type="tel" placeholder="+1 (555) 000-0000" />
                            </div>
                        </div>
                    </section>

                    {/* section 2 */}
                    <section className="bg-white">
                        <div className="flex items-center gap-4 mb-10 border-b border-neutral-100 pb-6">
                            <span className="w-2 h-2 bg-black rounded-full" />
                            <h3 className="text-xl font-black uppercase tracking-tight">Logistics</h3>
                        </div>
                        <div className="space-y-8">
                            <Input label="Street Address" name="addressLine1" placeholder="123 Fashion Blvd" />
                            <Input label="Unit / Suite" name="addressLine2" placeholder="Apt 4B" />
                            <div className="grid grid-cols-2 gap-8">
                                <Input label="City" name="city" placeholder="New York" />
                                <Input label="Region" name="state" placeholder="NY" />
                            </div>
                            <div className="grid grid-cols-2 gap-8">
                                <Input label="Postal Code" name="zipCode" placeholder="10001" />
                                <Input label="Country" name="country" placeholder="United States" />
                            </div>
                        </div>
                    </section>

                    <div className="pt-8 border-t border-neutral-100 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-black text-white px-12 py-5 text-xs font-black uppercase tracking-[0.25em] hover:bg-neutral-800 disabled:opacity-50 transition-all shadow-lg hover:-translate-y-1"
                        >
                            {loading ? 'Processing...' : 'Save Changes'}
                        </button>
                    </div>
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
