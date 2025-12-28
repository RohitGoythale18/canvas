'use client';

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from 'react';
import { jwtDecode } from 'jwt-decode';
import { subscribeToPush } from '@/lib/push';

interface User {
    id: string;
    name: string;
    email: string;
}

interface DecodedToken {
    exp: number;
    userId: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, user: User) => void;
    logout: () => void;
    isAuthenticated: boolean;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    // 🔑 Restore auth on refresh
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            try {
                const decoded = jwtDecode<DecodedToken>(storedToken);

                if (decoded.exp * 1000 < Date.now()) {
                    logout();
                } else {
                    const parsedUser = JSON.parse(storedUser);

                    setToken(storedToken);
                    setUser(parsedUser);
                    setTimeout(logout, decoded.exp * 1000 - Date.now());
                }
            } catch {
                logout();
            }
        }
        setLoading(false);
    }, []);

    const login = (newToken: string, userData: User) => {
        const decoded = jwtDecode<DecodedToken>(newToken);
        const expiryMs = decoded.exp * 1000 - Date.now();

        setToken(newToken);
        setUser(userData);

        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData));

        setTimeout(logout, expiryMs);
    };

    useEffect(() => {
        if (token) {
            subscribeToPush(token);
        }
    }, [token]);

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                login,
                logout,
                isAuthenticated: !!token,
                loading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
