'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import { subscribeToPush } from '@/lib/push';
import { AuthContextType, DecodedToken, User } from '@/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};

const getInitialAuthState = (): {
    user: User | null;
    token: string | null;
} => {
    if (typeof window === 'undefined') {
        return { user: null, token: null };
    }

    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (!storedToken || !storedUser) {
        return { user: null, token: null };
    }

    try {
        const decoded = jwtDecode<DecodedToken>(storedToken);

        if (decoded.exp * 1000 <= Date.now()) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            return { user: null, token: null };
        }

        return {
            token: storedToken,
            user: JSON.parse(storedUser),
        };
    } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return { user: null, token: null };
    }
};

export function AuthProvider({ children }: { children: ReactNode }) {
    const [{ user, token }, setAuth] = useState(getInitialAuthState);

    const logout = () => {
        setAuth({ user: null, token: null });
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    const login = (newToken: string, userData: User) => {
        const decoded = jwtDecode<DecodedToken>(newToken);
        const expiryMs = decoded.exp * 1000 - Date.now();

        setAuth({ token: newToken, user: userData });

        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData));

        setTimeout(logout, expiryMs);
    };

    useEffect(() => {
        if (!token) return;

        const decoded = jwtDecode<DecodedToken>(token);
        const timeoutId = setTimeout(logout, decoded.exp * 1000 - Date.now());

        return () => clearTimeout(timeoutId);
    }, [token]);

    useEffect(() => {
        if (!token || !user) return;

        const timer = setTimeout(() => {
            subscribeToPush(token).catch(console.error);
        }, 1000);

        return () => clearTimeout(timer);
    }, [token, user]);

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                login,
                logout,
                isAuthenticated: !!token,
                loading: false,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
