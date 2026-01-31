'use client';

import { useEffect, useState, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { userApi, orderApi, watchlistApi } from '@/lib/api';
import toast from 'react-hot-toast';

export const dynamic = 'force-dynamic';

type Tab = 'profile' | 'orders' | 'wishlist';

/* ---------------- PROFILE PAGE ---------------- */

function ProfileContent() {
    const { logout } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>('profile');
    const [userProfile, setUserProfile] = useState<any>(null);
    const [orders, setOrders] = useState<any[]>([]);
    const [watchlist, setWatchlist] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            userApi.getMe(),
            orderApi.getUserOrders(),
            watchlistApi.getMyWishlist(),
        ])
            .then(([profile, ordersData, watchlistData]) => {
                setUserProfile(profile);
                setOrders(ordersData);
                setWatchlist(watchlistData);
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-10 h-10 border border-neutral-200 border-t-black rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white pt-24 pb-56 flex justify-center">
            <div className="w-full max-w-[1600px] flex gap-12 px-8">
                {/* SIDEBAR */}
                <aside className="w-[18%] min-w-[220px] border-r border-neutral-100 pr-12 pt-32 h-fit sticky top-24">
                    <nav className="space-y-4">
                        <SidebarButton label="Profile" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
                        <SidebarButton label="My Orders" active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} />
                        <SidebarButton label="Wishlist" active={activeTab === 'wishlist'} onClick={() => setActiveTab('wishlist')} />

                        <button
                            onClick={logout}
                            className="mt-12 ml-4 text-xs font-bold uppercase tracking-[0.2em] text-red-600 hover:text-red-700 transition-colors"
                        >
                            Logout — End Session
                        </button>
                    </nav>
                </aside>

                {/* MAIN */}
                <main className="flex-1 flex flex-col items-center pt-8">
                    <div className="w-full max-w-5xl">
                        {activeTab === 'profile' && (
                            <SettingsView userProfile={userProfile} onUpdate={setUserProfile} />
                        )}
                        {activeTab === 'orders' && <OrdersView orders={orders} />}
                        {activeTab === 'wishlist' && <WishlistView watchlist={watchlist} />}
                    </div>
                </main>
            </div>
        </div>
    );
}

/* ---------------- SIDEBAR BUTTON ---------------- */

function SidebarButton({ label, active, onClick }: any) {
    return (
        <button
            onClick={onClick}
            className={`w-full py-4 rounded-xl text-sm font-bold uppercase tracking-widest transition ${active ? 'bg-black text-white' : 'text-neutral-500 hover:bg-neutral-50'
                }`}
        >
            {label}
        </button>
    );
}

/* ---------------- INPUT ---------------- */

const FormInput = ({ label, ...props }: any) => (
    <div className="w-full flex justify-center">
        <div className="w-[320px]">
            <label className="block mb-2 text-xs font-bold uppercase tracking-widest text-neutral-500 text-center">
                {label}
            </label>
            <input
                {...props}
                className="w-full px-5 py-3 bg-white border border-neutral-200 rounded-full text-sm font-semibold text-center focus:ring-2 focus:ring-black outline-none"
            />
        </div>
    </div>
);

/* ---------------- SETTINGS ---------------- */

function SettingsView({ userProfile, onUpdate }: any) {
    const [formData, setFormData] = useState({ ...userProfile });
    const [saving, setSaving] = useState(false);

    const handleChange = (e: any) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const updated = await userApi.updateProfile(formData);
            onUpdate(updated);
            toast.success('Profile updated');
        } catch {
            toast.error('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    return (
        <form className="pt-12" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* PERSONAL INFO */}
                <div className="bg-neutral-50 border border-neutral-200 rounded-[3rem] py-10 px-6">
                    <div className="flex flex-col items-center gap-8">
                        <h2 className="text-3xl font-black">Personal Information</h2>
                        <FormInput label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} />
                        <FormInput label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} />
                        <FormInput label="Username" name="username" value={formData.username} onChange={handleChange} />
                        <FormInput label="Phone Number" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} />
                    </div>
                </div>

                {/* ADDRESS */}
                <div className="bg-neutral-50 border border-neutral-200 rounded-[3rem] py-10 px-6">
                    <div className="flex flex-col items-center gap-8">
                        <h3 className="text-3xl font-black">Shipping Address</h3>
                        <FormInput label="Street Address" name="addressLine1" value={formData.addressLine1} onChange={handleChange} />
                        <FormInput label="Apartment / Suite" name="addressLine2" value={formData.addressLine2} onChange={handleChange} />
                        <FormInput label="City" name="city" value={formData.city} onChange={handleChange} />
                        <FormInput label="Postal Code" name="zipCode" value={formData.zipCode} onChange={handleChange} />
                    </div>
                </div>
            </div>

            <div className="flex justify-center pt-20 pb-32">
                <button
                    type="submit"
                    disabled={saving}
                    className="bg-black text-white px-16 py-4 rounded-full text-sm font-black uppercase tracking-widest disabled:opacity-50"
                >
                    {saving ? 'Saving…' : 'Save Changes'}
                </button>
            </div>
        </form>
    );
}

/* ---------------- ORDERS ---------------- */

function OrdersView({ orders }: { orders: any[] }) {
    if (!orders.length) {
        return (
            <div className="pt-32 text-center text-neutral-400">
                No orders found yet.
            </div>
        );
    }

    return (
        <div className="pt-16">
            <header className="text-center mb-12">
                <h2 className="text-3xl font-black">My Orders</h2>
                <p className="text-neutral-400 uppercase tracking-widest text-xs mt-2">
                    Order History
                </p>
            </header>

            <div className="space-y-8 max-w-4xl mx-auto">
                {orders.map(order => {
                    const item = order.items?.[0];
                    return (
                        <div
                            key={order.id}
                            className="bg-neutral-50 border border-neutral-200 rounded-[2rem] p-8 flex flex-col md:flex-row gap-8"
                        >
                            <div className="w-32 h-32 bg-white rounded-xl overflow-hidden border">
                                <img
                                    src={item?.productImageUrl || item?.imageUrl}
                                    alt={item?.productName}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            <div className="flex-1">
                                <div className="flex gap-3 mb-2">
                                    <span className="text-xs font-bold uppercase text-neutral-400">
                                        Order #{order.id}
                                    </span>
                                    <span className={`text-xs font-bold uppercase ${order.status === 'DELIVERED'
                                        ? 'text-green-600'
                                        : 'text-orange-600'
                                        }`}>
                                        {order.status}
                                    </span>
                                </div>

                                <h3 className="text-lg font-black uppercase">
                                    {item?.productName}
                                </h3>

                                <p className="text-xs text-neutral-400 uppercase tracking-widest">
                                    {new Date(order.createdAt).toLocaleDateString()}
                                </p>
                            </div>

                            <div className="text-right">
                                <p className="text-2xl font-black mb-4">
                                    ${order.totalAmount?.toFixed(2)}
                                </p>
                                <a
                                    href={`/orders/${order.id}`}
                                    className="inline-block bg-black text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest"
                                >
                                    View Full Receipt
                                </a>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

/* ---------------- WISHLIST ---------------- */

function WishlistView({ watchlist }: { watchlist: any[] }) {
    if (!watchlist.length) {
        return (
            <div className="pt-32 text-center text-neutral-400">
                Your wishlist is empty.
            </div>
        );
    }

    return (
        <div className="pt-16">
            <header className="text-center mb-12">
                <h2 className="text-3xl font-black">Wishlist</h2>
                <p className="text-neutral-400 uppercase tracking-widest text-xs mt-2">
                    Saved for later
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {watchlist.map(item => {
                    const product = item.product || item;
                    return (
                        <div
                            key={item.id}
                            className="bg-white border border-neutral-200 rounded-[2rem] p-6"
                        >
                            <div className="aspect-square bg-neutral-50 rounded-xl overflow-hidden mb-6">
                                <img
                                    src={product.imageUrl}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            <div className="flex justify-between">
                                <div>
                                    <h3 className="font-black uppercase">
                                        {product.name}
                                    </h3>
                                    {product.categoryName && (
                                        <p className="text-[10px] text-neutral-400 uppercase tracking-widest">
                                            {product.categoryName}
                                        </p>
                                    )}
                                </div>

                                <div className="text-right">
                                    <p className="font-black text-xl mb-3">
                                        ${product.price}
                                    </p>
                                    <button
                                        onClick={() => toast('Add to cart not wired yet')}
                                        className="bg-black text-white px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest"
                                    >
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
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