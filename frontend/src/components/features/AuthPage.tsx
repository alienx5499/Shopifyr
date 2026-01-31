'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { authApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Progress } from "@/components/ui/progress";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/Card";

interface AuthPageProps {
    initialView: 'login' | 'register';
}

/* ---------------- Auth Page ---------------- */

export const AuthPage: React.FC<AuthPageProps> = ({ initialView }) => {
    const router = useRouter();
    const { login } = useAuth();
    const [view, setView] = useState(initialView);
    const [loading, setLoading] = useState(false);

    // Login Data
    const [loginData, setLoginData] = useState({
        usernameOrEmail: '',
        password: '',
    });

    // Register Data
    const [registerData, setRegisterData] = useState({
        username: '', email: '', password: '', firstName: '', lastName: '',
        phoneNumber: '', addressLine1: '', addressLine2: '', city: '', state: '', zipCode: '', country: 'United States'
    });
    const [step, setStep] = useState(1);
    const [progressValue, setProgressValue] = useState(33);
    const [showSuccess, setShowSuccess] = useState(false);
    const [successText, setSuccessText] = useState("");

    useEffect(() => {
        if (step === 1) setProgressValue(33);
        if (step === 2) setProgressValue(66);
        if (step === 3) setProgressValue(100);
    }, [step]);




    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await authApi.login(loginData);
            login(data.accessToken, data.user);
            setSuccessText("Welcome back.");
            setShowSuccess(true);
            setTimeout(() => {
                router.push('/');
            }, 2500);
        } catch {
            toast.error('Login failed');
            setLoading(false);
        }
    };

    const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRegisterData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleRegisterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await authApi.register(registerData);
            setSuccessText("Welcome to Shopifyr.");
            setShowSuccess(true);

            // Login silently in background while animation plays
            try {
                const data = await authApi.login({ usernameOrEmail: registerData.username, password: registerData.password });
                login(data.accessToken, data.user);
            } catch (err) {
                console.error("Auto-login failed:", err);
            }

            setTimeout(() => {
                router.push('/');
            }, 2500);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Registration failed');
            setLoading(false);
        }
    };

    const handleNextStep = () => {
        // Validation for Step 1
        if (!registerData.firstName) {
            toast.error("Please enter your full name.");
            return;
        }
        if (!registerData.username) {
            toast.error("Please choose a username.");
            return;
        }
        if (!registerData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerData.email)) {
            toast.error("Please enter a valid email address.");
            return;
        }
        if (!registerData.password || registerData.password.length < 6) {
            toast.error("Password must be at least 6 characters.");
            return;
        }
        setStep(2);
    };

    // Styling for permanent borders + Rounded + Centered Text
    const inputClasses = "h-14 w-10/12 text-lg border-2 border-gray-200 focus:border-black transition-colors placeholder:text-gray-400 rounded-full text-center bg-white";

    return (
        // Changed bg-white to bg-white as base
        <div className="min-h-screen flex bg-white overflow-hidden">

            {/* LEFT PANEL */}
            <div className="relative w-full lg:w-1/2 flex items-center justify-center px-8 lg:px-20 overflow-y-auto">

                <div className="absolute top-8 left-8 lg:top-12 lg:left-12">
                    <span className="text-xl font-extrabold text-black tracking-tighter">Shopifyr.</span>
                </div>

                {/* Top Toggle — WHITE SCREEN ONLY */}
                <div className="absolute top-8 right-8 text-xs flex gap-3 z-20">
                    <span className="text-gray-400">
                        {view === 'login' ? "New here?" : "Already a member?"}
                    </span>
                    <button
                        onClick={() => setView(view === 'login' ? 'register' : 'login')}
                        className="font-bold text-black border-b border-black"
                    >
                        {view === 'login' ? "Create Account" : "Sign In"}
                    </button>
                </div>

                {/* Reduced width to max-w-md for requested narrow "straight line" look */}
                <div className="max-w-lg w-full my-12 lg:my-0">

                    <motion.div
                        key={view}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <AnimatePresence mode="wait">
                            {view === 'login' ? (
                                // Login Card
                                <Card className="w-full border-none shadow-none bg-gray-100 p-16 rounded-3xl">
                                    <CardHeader className="p-0 pb-20 items-center text-center">
                                        <CardTitle className="text-5xl font-extrabold text-black tracking-tight">
                                            Welcome Back.
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-0 flex justify-center w-full">
                                        <form onSubmit={handleLoginSubmit} className="w-full">
                                            <div className="flex flex-col gap-6 w-full items-center">
                                                <input
                                                    placeholder="Username or Email"
                                                    value={loginData.usernameOrEmail}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                        setLoginData({ ...loginData, usernameOrEmail: e.target.value })
                                                    }
                                                    className={inputClasses}
                                                />
                                                <input
                                                    type="password"
                                                    placeholder="Password"
                                                    value={loginData.password}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                        setLoginData({ ...loginData, password: e.target.value })
                                                    }
                                                    className={inputClasses}
                                                />
                                            </div>
                                            <div className="h-10" />
                                            <CardFooter className="p-0 flex-col gap-2 w-full items-center">
                                                <Button
                                                    type="submit"
                                                    disabled={loading}
                                                    className="w-10/12 h-14 bg-black text-white rounded-lg tracking-widest"
                                                >
                                                    {loading ? 'Processing...' : 'Sign In'}
                                                </Button>
                                            </CardFooter>
                                        </form>
                                    </CardContent>
                                </Card>
                            ) : (
                                // Register Card
                                <Card className="w-full border-none shadow-none bg-gray-100 p-16 rounded-3xl">
                                    <CardHeader className="p-0 pb-12 items-center text-center">
                                        <CardTitle className="text-5xl font-extrabold text-black tracking-tight">
                                            Create Account.
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-0 flex justify-center w-full">
                                        <form onSubmit={(e) => {
                                            e.preventDefault();
                                            // Split Name Logic
                                            if (step === 3) return; // Should not happen
                                            handleRegisterSubmit(e);
                                        }} className="w-full">

                                            {step === 1 && (
                                                <div className="flex flex-col gap-6 w-full items-center">
                                                    {/* Single Full Name Input */}
                                                    <input
                                                        placeholder="Full Name"
                                                        name="fullName"
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            const parts = val.trim().split(' ');
                                                            const first = parts[0] || '';
                                                            const last = parts.slice(1).join(' ') || '';
                                                            setRegisterData(prev => ({ ...prev, firstName: first, lastName: last }));
                                                        }}
                                                        defaultValue={`${registerData.firstName} ${registerData.lastName}`.trim()}
                                                        required
                                                        className={inputClasses}
                                                    />

                                                    <input placeholder="Username" name="username" value={registerData.username} onChange={handleRegisterChange} required className={inputClasses} />
                                                    <input type="email" placeholder="Email Address" name="email" value={registerData.email} onChange={handleRegisterChange} required className={inputClasses} />
                                                    <input type="password" placeholder="Password" name="password" value={registerData.password} onChange={handleRegisterChange} required className={inputClasses} />

                                                    <Button type="button" onClick={handleNextStep} className="w-10/12 h-14 bg-black text-white rounded-full tracking-widest text-lg font-bold mt-2 mx-auto block">
                                                        Next Step
                                                    </Button>
                                                </div>
                                            )}

                                            {step === 2 && (
                                                <div className="flex flex-col gap-6 w-full items-center">
                                                    {/* Strict Single Column Stack - No Grids */}
                                                    <input placeholder="Street Address" name="addressLine1" value={registerData.addressLine1} onChange={handleRegisterChange} required className={inputClasses} />
                                                    <input placeholder="City" name="city" value={registerData.city} onChange={handleRegisterChange} required className={inputClasses} />
                                                    <input placeholder="State" name="state" value={registerData.state} onChange={handleRegisterChange} required className={inputClasses} />
                                                    <input placeholder="Zip Code" name="zipCode" value={registerData.zipCode} onChange={handleRegisterChange} required className={inputClasses} />
                                                    <input placeholder="Phone" name="phoneNumber" value={registerData.phoneNumber} onChange={handleRegisterChange} required className={inputClasses} />

                                                    <div className="h-4" />
                                                    <CardFooter className="p-0 flex items-center justify-between gap-4 w-10/12">
                                                        <button type="button" onClick={() => setStep(1)} className="font-bold text-gray-400 hover:text-black transition-colors px-0 flex items-center gap-2">
                                                            <span>←</span> Back
                                                        </button>
                                                        <Button type="submit" disabled={loading} className="flex-1 h-14 bg-black text-white rounded-lg tracking-widest">
                                                            {loading ? 'Creating...' : 'Create Account'}
                                                        </Button>
                                                    </CardFooter>
                                                </div>
                                            )}
                                        </form>
                                    </CardContent>
                                </Card>
                            )}
                        </AnimatePresence>
                    </motion.div>

                </div>
            </div>

            {/* FULL SCREEN SUCCESS OVERLAY */}
            <AnimatePresence>
                {showSuccess && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black text-white"
                    >
                        {/* Premium Gradient Background */}
                        <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neutral-800 via-black to-black opacity-80" />

                        {/* Content */}
                        <div className="relative z-10 flex flex-col items-center">
                            <motion.div
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                className="bg-white rounded-full w-24 h-24 flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(255,255,255,0.2)]"
                            >
                                <svg className="w-10 h-10 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                                    <motion.path
                                        d="M20 6L9 17l-5-5"
                                        initial={{ pathLength: 0 }}
                                        animate={{ pathLength: 1 }}
                                        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                                    />
                                </svg>
                            </motion.div>
                            <motion.h2
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="text-7xl font-black tracking-tighter mb-6 text-center text-white drop-shadow-2xl"
                            >
                                {successText}
                            </motion.h2>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* RIGHT PANEL — PREMIUM BLACK */}
            <div className="hidden lg:flex w-1/2 relative bg-black overflow-hidden">

                {/* Static dark base */}
                <div className="absolute inset-0 bg-black" />

                {/* Soft radial highlight behind text */}
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            'radial-gradient(circle at center, rgba(255,255,255,0.18), transparent 60%)',
                    }}
                />

                {/* Very slow ambient motion (outside focus) */}
                <motion.div
                    className="absolute inset-0 opacity-30"
                    animate={{ opacity: [0.25, 0.35, 0.25] }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
                />

                {/* Noise */}
                <div
                    className="absolute inset-0 opacity-[0.06] mix-blend-overlay pointer-events-none"
                    style={{
                        backgroundImage:
                            'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 200 200\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'3\'/%3E%3C/filter%3E%3Crect width=\'100%\' height=\'100%\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
                    }}
                />

                {/* CENTERED CONTENT */}
                <div className="relative z-10 flex items-center justify-center w-full px-24 text-center">

                    <div className="max-w-lg">

                        {/* Accent */}
                        <div className="mx-auto w-14 h-[2px] bg-white mb-8 opacity-70" />

                        <h2 className="text-6xl font-black text-white leading-tight mb-6">
                            The Future of <br /> Luxury Shopping.
                        </h2>

                        <p className="text-neutral-300 text-lg leading-relaxed">
                            Exclusive drops, instant delivery, and verified quality.
                            <br />
                            <span className="text-neutral-400">
                                Join the new standard.
                            </span>
                        </p>

                    </div>
                </div>
            </div>
        </div >
    );
};
