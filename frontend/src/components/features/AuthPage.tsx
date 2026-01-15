'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { authApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';

interface AuthPageProps {
    initialView: 'login' | 'register';
}

// Modern Input with Icon & Underline Style (Easymail Replica)
const ModernInput = ({ label, icon, ...props }: any) => {
    const [focused, setFocused] = useState(false);
    const [hasValue, setHasValue] = useState(!!props.value);
    const [isValid, setIsValid] = useState(false);

    useEffect(() => {
        setHasValue(!!props.value);
        if (props.value && props.value.length > 3) setIsValid(true); // Simple mock validation
        else setIsValid(false);
    }, [props.value]);

    return (
        <div className="mb-14 relative">
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 ml-10">
                {label}
            </label>
            <div className="relative flex items-center">
                {/* Left Icon with Transition */}
                <div className={`absolute left-0 transition-colors duration-300 ${focused ? 'text-blue-600' : 'text-gray-400'}`}>
                    {icon}
                </div>

                {/* Input Field */}
                <input
                    {...props}
                    onFocus={(e) => {
                        setFocused(true);
                        props.onFocus && props.onFocus(e);
                    }}
                    onBlur={(e) => {
                        setFocused(false);
                        props.onBlur && props.onBlur(e);
                    }}
                    className={`
                        w-full pl-10 pr-8 py-5 bg-transparent text-gray-900 placeholder-gray-300 font-medium text-xl
                        border-b-2 focus:outline-none transition-all duration-300
                        ${focused ? 'border-blue-600' : 'border-gray-200'}
                    `}
                />

                {/* Validation Checkmark */}
                {isValid && (
                    <div className="absolute right-0 text-green-500 animate-in fade-in zoom-in duration-300">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                )}
            </div>
        </div>
    );
};

export const AuthPage: React.FC<AuthPageProps> = ({ initialView }) => {
    const router = useRouter();
    const { login } = useAuth();
    const [view, setView] = useState<'login' | 'register'>(initialView);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);

    // Form Data
    const [loginData, setLoginData] = useState({ usernameOrEmail: '', password: '' });
    const [registerData, setRegisterData] = useState({
        username: '', email: '', password: '', firstName: '', lastName: '',
        phoneNumber: '', addressLine1: '', addressLine2: '', city: '', state: '', zipCode: '', country: 'United States'
    });

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await authApi.login(loginData);
            login(data.accessToken, data.user);
            toast.success('Welcome back!');
            router.push('/');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await authApi.register(registerData);
            setStep(3); // Success Step
            setTimeout(() => {
                authApi.login({ usernameOrEmail: registerData.username, password: registerData.password })
                    .then(data => {
                        login(data.accessToken, data.user);
                        router.push('/');
                    })
                    .catch(() => { setView('login'); setStep(1); });
            }, 2500);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Registration failed');
            setLoading(false);
        }
    };

    const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRegisterData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const toggleView = (newView: 'login' | 'register') => {
        setView(newView);
        setStep(1);
        window.history.pushState({}, '', newView === 'login' ? '/login' : '/register');
    };

    // Icons
    const Icons = {
        User: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
        Mail: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
        Lock: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
        Home: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
        Map: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
        Phone: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
    };

    return (
        <div className="min-h-screen w-full flex bg-white font-sans overflow-hidden">

            {/* LEFT SIDE: Form Area */}
            <div className="w-full lg:w-1/2 p-8 lg:p-20 relative flex flex-col items-center justify-center h-screen overflow-y-auto">

                {/* Top Section: Logo & Toggle */}
                <div className="absolute top-8 left-8 lg:top-12 lg:left-12">
                    <span className="text-2xl font-extrabold text-blue-900 tracking-tighter">Shopifyr.</span>
                </div>

                <div className="absolute top-8 right-8 lg:top-12 lg:right-12 flex items-center gap-2 text-sm z-20">
                    <span className="text-gray-400 font-medium hidden sm:inline">
                        {view === 'login' ? "Not a member?" : "Already a member?"}
                    </span>
                    <button
                        onClick={() => toggleView(view === 'login' ? 'register' : 'login')}
                        className="font-bold text-blue-600 hover:text-blue-700 transition-colors"
                    >
                        {view === 'login' ? "Sign up now" : "Sign in"}
                    </button>
                </div>

                <div className="max-w-lg w-full mx-auto">
                    <motion.div
                        key={view}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">
                            {view === 'login' ? 'Welcome Back!' : 'Create Account'}
                        </h1>
                        <p className="text-gray-400 mb-32 font-medium">
                            {view === 'login' ? 'Please login to access your account.' : 'Join us and start shopping premium.'}
                        </p>

                        <AnimatePresence mode="wait">
                            {view === 'login' ? (
                                <form onSubmit={handleLoginSubmit}>
                                    <ModernInput label="Username or Email" icon={Icons.User} name="usernameOrEmail" value={loginData.usernameOrEmail} onChange={(e: any) => setLoginData(prev => ({ ...prev, usernameOrEmail: e.target.value }))} required />
                                    <ModernInput label="Password" icon={Icons.Lock} type="password" name="password" value={loginData.password} onChange={(e: any) => setLoginData(prev => ({ ...prev, password: e.target.value }))} required />

                                    <div className="flex justify-end mb-8">
                                        <a href="#" className="text-sm font-bold text-gray-400 hover:text-blue-600 transition-colors">Forgot Password?</a>
                                    </div>

                                    <Button type="submit" disabled={loading} className="w-full h-14 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white rounded-full font-bold text-lg shadow-lg hover:shadow-blue-600/30 transition-all flex items-center justify-center gap-3 group">
                                        {loading ? 'Logging in...' : 'Sign In'}
                                        {!loading && (
                                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                            </svg>
                                        )}
                                    </Button>
                                </form>
                            ) : (
                                <form onSubmit={handleRegisterSubmit}>
                                    {/* Wizard Header */}
                                    {step < 3 && (
                                        <div className="flex items-center gap-2 mb-10">
                                            <div className={`h-1 flex-1 rounded-full ${step >= 1 ? 'bg-gradient-to-r from-blue-600 to-blue-800' : 'bg-gray-100'}`} />
                                            <div className={`h-1 flex-1 rounded-full ${step >= 2 ? 'bg-gradient-to-r from-blue-600 to-blue-800' : 'bg-gray-100'}`} />
                                        </div>
                                    )}

                                    {step === 1 && (
                                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                            {/* Single Column Layout for Better Spacing */}
                                            <ModernInput label="First Name" icon={Icons.User} name="firstName" value={registerData.firstName} onChange={handleRegisterChange} required />
                                            <ModernInput label="Last Name" icon={Icons.User} name="lastName" value={registerData.lastName} onChange={handleRegisterChange} required />
                                            <ModernInput label="Username" icon={Icons.User} name="username" value={registerData.username} onChange={handleRegisterChange} required />
                                            <ModernInput label="Email Address" icon={Icons.Mail} type="email" name="email" value={registerData.email} onChange={handleRegisterChange} required />
                                            <ModernInput label="Password" icon={Icons.Lock} type="password" name="password" value={registerData.password} onChange={handleRegisterChange} required />

                                            <Button type="button" onClick={() => setStep(2)} className="w-full h-14 mt-6 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white rounded-full font-bold text-lg shadow-lg hover:shadow-blue-600/30 transition-all flex items-center justify-center gap-3 group">
                                                Next Step
                                                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                                </svg>
                                            </Button>
                                        </motion.div>
                                    )}

                                    {step === 2 && (
                                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                            <ModernInput label="Street Address" icon={Icons.Home} name="addressLine1" value={registerData.addressLine1} onChange={handleRegisterChange} required />

                                            <ModernInput label="City" icon={Icons.Map} name="city" value={registerData.city} onChange={handleRegisterChange} required />
                                            <ModernInput label="State" icon={Icons.Map} name="state" value={registerData.state} onChange={handleRegisterChange} required />

                                            <ModernInput label="Zip Code" icon={Icons.Map} name="zipCode" value={registerData.zipCode} onChange={handleRegisterChange} required />
                                            <ModernInput label="Phone" icon={Icons.Phone} name="phoneNumber" value={registerData.phoneNumber} onChange={handleRegisterChange} required />


                                            <div className="flex gap-4 mt-8">
                                                <button type="button" onClick={() => setStep(1)} className="px-8 font-bold text-gray-400 hover:text-gray-900 transition-colors">Back</button>
                                                <Button type="submit" disabled={loading} className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white rounded-full font-bold text-lg shadow-lg hover:shadow-blue-600/30 transition-all flex items-center justify-center gap-3">
                                                    {loading ? 'Creating...' : 'Create Account'}
                                                </Button>
                                            </div>
                                        </motion.div>
                                    )}

                                    {step === 3 && (
                                        <div className="flex flex-col items-center justify-center py-10">
                                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
                                                <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <h3 className="text-2xl font-bold text-gray-900">Success!</h3>
                                            <p className="text-gray-500 mt-2">Redirecting to home...</p>
                                        </div>
                                    )}
                                </form>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            </div>

            {/* RIGHT SIDE: Blue Section (Clean Gradient) */}
            <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 relative overflow-hidden flex-col items-center justify-center h-screen">

                {/* Wavy Background Overlay */}
                <svg className="absolute inset-0 w-full h-full opacity-20 text-white" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path d="M0 50 Q 50 100 100 50 T 200 50" stroke="currentColor" strokeWidth="0.5" fill="none" />
                    <path d="M0 30 Q 50 80 100 30 T 200 30" stroke="currentColor" strokeWidth="0.5" fill="none" />
                    <path d="M0 70 Q 50 120 100 70 T 200 70" stroke="currentColor" strokeWidth="0.5" fill="none" />
                </svg>

                {/* Abstract Shapes for Depth */}
                <div className="absolute top-[-20%] left-[-20%] w-[800px] h-[800px] bg-blue-400 rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-pulse" />
                <div className="absolute bottom-[-20%] right-[-20%] w-[800px] h-[800px] bg-purple-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-pulse animation-delay-2000" />

                {/* Logo/Branding in Blue Section */}
                <div className="relative z-10 text-center px-12">
                    <h2 className="text-4xl font-extrabold text-white mb-6 tracking-tight">
                        The Future of Shopping.
                    </h2>
                    <p className="text-blue-100 text-lg leading-relaxed max-w-sm mx-auto font-light">
                        Join our premium marketplace for exclusive drops, instant delivery, and verified quality.
                    </p>
                </div>
            </div>

        </div>
    );
};
