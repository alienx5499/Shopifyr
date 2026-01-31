'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
    username: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    isLoggedIn: boolean;
    isLoading: boolean;
    login: (token: string, userData?: User) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check for token on mount
        const token = localStorage.getItem('token');
        console.log('AuthContext: Initializing...', { token });
        if (token && token !== 'undefined' && token !== 'null') {
            setIsLoggedIn(true);
            // Optionally decode token to get user info or fetch from API
            const savedUser = localStorage.getItem('user');
            if (savedUser && savedUser !== 'undefined' && savedUser !== 'null') {
                try {
                    setUser(JSON.parse(savedUser));
                } catch (e) {
                    console.error('Failed to parse user', e);
                    localStorage.removeItem('user');
                }
            }
        } else {
            // Ensure clean state if token is invalid/missing
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
        setIsLoading(false);
    }, []);

    const login = (token: string, userData?: User) => {
        localStorage.setItem('token', token);
        setIsLoggedIn(true);
        if (userData) {
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsLoggedIn(false);
        setUser(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, isLoggedIn, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
