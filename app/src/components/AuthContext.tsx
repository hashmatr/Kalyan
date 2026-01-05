'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
    User,
    AuthTokens,
    getStoredUser,
    getTokens,
    validateSession,
    logout as authLogout,
    login as authLogin,
    register as authRegister,
    loginWithGoogle as authLoginWithGoogle,
    LoginData,
    RegisterData
} from '@/lib/auth';

interface AuthContextType {
    user: User | null;
    tokens: AuthTokens | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (data: LoginData) => Promise<{ success: boolean; error?: string }>;
    register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
    loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [tokens, setTokens] = useState<AuthTokens | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for existing session on mount
        const { user: storedUser, isValid } = validateSession();
        if (isValid && storedUser) {
            setUser(storedUser);
            setTokens(getTokens());
        }
        setIsLoading(false);
    }, []);

    const login = useCallback(async (data: LoginData) => {
        setIsLoading(true);
        try {
            const result = await authLogin(data);
            if ('error' in result) {
                setIsLoading(false);
                return { success: false, error: result.error };
            }
            setUser(result.user);
            setTokens(result.tokens);
            setIsLoading(false);
            return { success: true };
        } catch (error) {
            setIsLoading(false);
            return { success: false, error: 'An unexpected error occurred' };
        }
    }, []);

    const register = useCallback(async (data: RegisterData) => {
        setIsLoading(true);
        try {
            const result = await authRegister(data);
            if ('error' in result) {
                setIsLoading(false);
                return { success: false, error: result.error };
            }
            setUser(result.user);
            setTokens(result.tokens);
            setIsLoading(false);
            return { success: true };
        } catch (error) {
            setIsLoading(false);
            return { success: false, error: 'An unexpected error occurred' };
        }
    }, []);

    const loginWithGoogle = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await authLoginWithGoogle();
            setUser(result.user);
            setTokens(result.tokens);
            setIsLoading(false);
            return { success: true };
        } catch (error) {
            setIsLoading(false);
            return { success: false, error: 'Google sign-in failed' };
        }
    }, []);

    const logout = useCallback(() => {
        authLogout();
        setUser(null);
        setTokens(null);
    }, []);

    const value: AuthContextType = {
        user,
        tokens,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        loginWithGoogle,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
