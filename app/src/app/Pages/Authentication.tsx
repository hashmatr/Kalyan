'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AuthenticationProps {
    onAuthSuccess?: () => void;
}

interface FormData {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
}

interface FormErrors {
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
}

export default function Authentication({ onAuthSuccess }: AuthenticationProps) {
    const [mode, setMode] = useState<'signin' | 'signup'>('signin');
    const [mounted, setMounted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const [successMessage, setSuccessMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    useEffect(() => {
        setMounted(true);
    }, []);

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (mode === 'signup' && !formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (mode === 'signup') {
            if (!formData.confirmPassword) {
                newErrors.confirmPassword = 'Please confirm your password';
            } else if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = 'Passwords do not match';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name as keyof FormErrors]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);
        setErrors({});

        try {
            const endpoint = mode === 'signin' ? '/api/auth/login' : '/api/auth/register';
            const payload = mode === 'signin'
                ? { email: formData.email, password: formData.password }
                : { name: formData.name, email: formData.email, password: formData.password };

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                setErrors({ email: data.error || 'Something went wrong' });
                setIsLoading(false);
                return;
            }

            // Store user data in localStorage
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('token', data.token);

            setSuccessMessage(mode === 'signin' ? 'Welcome back! Redirecting...' : 'Account created! Redirecting...');
            setTimeout(() => {
                onAuthSuccess?.();
            }, 1500);
        } catch (error) {
            setErrors({ email: 'Network error. Please try again.' });
        }

        setIsLoading(false);
    };



    const switchMode = () => {
        setMode(prev => prev === 'signin' ? 'signup' : 'signin');
        setErrors({});
        setSuccessMessage('');
        setFormData({ name: '', email: '', password: '', confirmPassword: '' });
    };

    if (!mounted) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
                <div className="spinner-wheel" />
            </div>
        );
    }

    return (
        <>
            <style jsx global>{`
                /* Light Scrollbar */
                ::-webkit-scrollbar {
                    width: 10px;
                    height: 10px;
                }
                ::-webkit-scrollbar-track {
                    background: #f1f5f9;
                }
                ::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 5px;
                }
                ::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
                * {
                    scrollbar-width: thin;
                    scrollbar-color: #cbd5e1 #f1f5f9;
                }
                
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                .spinner-wheel {
                    width: 32px;
                    height: 32px;
                    border: 2px solid rgba(0,0,0,0.1);
                    border-top-color: #6366f1;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
            `}</style>

            <div style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'row',
                backgroundColor: '#f8fafc'
            }}>
                {/* Left Panel - Auth Form */}
                <div style={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'white',
                    padding: '40px 24px',
                    overflowY: 'auto'
                }} className="auth-left-panel">
                    <div style={{ width: '100%', maxWidth: 380 }}>

                        {/* Title */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                        >
                            <h1 style={{
                                fontSize: '2.25rem',
                                fontWeight: 700,
                                color: '#0f172a',
                                marginBottom: 48,
                                marginTop: 0
                            }}>
                                {mode === 'signin' ? 'Log in' : 'Sign up'}
                            </h1>
                        </motion.div>

                        {/* Success Message */}
                        <AnimatePresence>
                            {successMessage && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    style={{
                                        marginBottom: 32,
                                        padding: 16,
                                        borderRadius: 8,
                                        backgroundColor: '#ecfdf5',
                                        border: '1px solid #a7f3d0'
                                    }}
                                >
                                    <span style={{ color: '#047857', fontWeight: 500 }}>{successMessage}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Form */}
                        <motion.form
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            onSubmit={handleSubmit}
                        >
                            {/* Name Field (Sign Up only) */}
                            <AnimatePresence mode="wait">
                                {mode === 'signup' && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.3 }}
                                        style={{ marginBottom: 32 }}
                                    >
                                        <label style={{
                                            display: 'block',
                                            fontSize: 14,
                                            color: '#64748b',
                                            marginBottom: 12
                                        }}>
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            placeholder="Enter your name"
                                            style={{
                                                width: '100%',
                                                padding: '12px 0',
                                                backgroundColor: 'transparent',
                                                border: 'none',
                                                borderBottom: `2px solid ${errors.name ? '#f87171' : '#e2e8f0'}`,
                                                color: '#0f172a',
                                                fontSize: 16,
                                                outline: 'none'
                                            }}
                                        />
                                        {errors.name && (
                                            <p style={{ marginTop: 8, fontSize: 14, color: '#ef4444' }}>{errors.name}</p>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Email Field */}
                            <div style={{ marginBottom: 32 }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: 14,
                                    color: '#64748b',
                                    marginBottom: 12
                                }}>
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="email@example.com"
                                    style={{
                                        width: '100%',
                                        padding: '12px 0',
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        borderBottom: `2px solid ${errors.email ? '#f87171' : '#e2e8f0'}`,
                                        color: '#0f172a',
                                        fontSize: 16,
                                        outline: 'none'
                                    }}
                                />
                                {errors.email && (
                                    <p style={{ marginTop: 8, fontSize: 14, color: '#ef4444' }}>{errors.email}</p>
                                )}
                            </div>

                            {/* Password Field */}
                            <div style={{ marginBottom: 32 }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: 14,
                                    color: '#64748b',
                                    marginBottom: 12
                                }}>
                                    Password
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        placeholder="Enter your password"
                                        style={{
                                            width: '100%',
                                            padding: '12px 40px 12px 0',
                                            backgroundColor: 'transparent',
                                            border: 'none',
                                            borderBottom: `2px solid ${errors.password ? '#f87171' : '#e2e8f0'}`,
                                            color: '#0f172a',
                                            fontSize: 16,
                                            outline: 'none'
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{
                                            position: 'absolute',
                                            right: 0,
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            padding: 8,
                                            color: '#64748b'
                                        }}
                                    >
                                        {showPassword ? (
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                                <line x1="1" y1="1" x2="23" y2="23" />
                                            </svg>
                                        ) : (
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                <circle cx="12" cy="12" r="3" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p style={{ marginTop: 8, fontSize: 14, color: '#ef4444' }}>{errors.password}</p>
                                )}
                            </div>

                            {/* Confirm Password (Sign Up only) */}
                            <AnimatePresence mode="wait">
                                {mode === 'signup' && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.3 }}
                                        style={{ marginBottom: 32 }}
                                    >
                                        <label style={{
                                            display: 'block',
                                            fontSize: 14,
                                            color: '#64748b',
                                            marginBottom: 12
                                        }}>
                                            Confirm Password
                                        </label>
                                        <div style={{ position: 'relative' }}>
                                            <input
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                name="confirmPassword"
                                                value={formData.confirmPassword}
                                                onChange={handleInputChange}
                                                placeholder="Confirm your password"
                                                style={{
                                                    width: '100%',
                                                    padding: '12px 40px 12px 0',
                                                    backgroundColor: 'transparent',
                                                    border: 'none',
                                                    borderBottom: `2px solid ${errors.confirmPassword ? '#f87171' : '#e2e8f0'}`,
                                                    color: '#0f172a',
                                                    fontSize: 16,
                                                    outline: 'none'
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                style={{
                                                    position: 'absolute',
                                                    right: 0,
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    background: 'none',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    padding: 8,
                                                    color: '#64748b'
                                                }}
                                            >
                                                {showConfirmPassword ? (
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                                        <line x1="1" y1="1" x2="23" y2="23" />
                                                    </svg>
                                                ) : (
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                        <circle cx="12" cy="12" r="3" />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                        {errors.confirmPassword && (
                                            <p style={{ marginTop: 8, fontSize: 14, color: '#ef4444' }}>{errors.confirmPassword}</p>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                style={{
                                    width: '100%',
                                    padding: '16px',
                                    borderRadius: 10,
                                    backgroundColor: '#0f172a',
                                    color: 'white',
                                    fontWeight: 600,
                                    fontSize: 16,
                                    border: 'none',
                                    cursor: isLoading ? 'not-allowed' : 'pointer',
                                    opacity: isLoading ? 0.5 : 1,
                                    marginTop: 8
                                }}
                            >
                                {isLoading ? (
                                    <div className="spinner-wheel" style={{ width: 20, height: 20, margin: '0 auto' }} />
                                ) : (
                                    mode === 'signin' ? 'Login' : 'Create Account'
                                )}
                            </button>
                        </motion.form>

                        {/* Forgot Password (Sign In only) */}
                        {mode === 'signin' && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                                style={{ marginTop: 24 }}
                            >
                                <a
                                    href="/Pages/auth/forgot-password"
                                    style={{
                                        fontSize: 14,
                                        color: '#0f172a',
                                        textDecoration: 'underline',
                                    }}
                                >
                                    Forgot password?
                                </a>
                            </motion.div>
                        )}



                        {/* Switch Mode */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.45 }}
                            style={{ marginTop: 40 }}
                        >
                            <p style={{ color: '#64748b', margin: 0 }}>
                                {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}
                                {' '}
                                <button
                                    onClick={switchMode}
                                    type="button"
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#0f172a',
                                        fontWeight: 600,
                                        textDecoration: 'underline',
                                        cursor: 'pointer',
                                        padding: 0
                                    }}
                                >
                                    {mode === 'signin' ? 'Register here' : 'Login here'}
                                </button>
                            </p>
                        </motion.div>
                    </div>
                </div>

                {/* Right Panel - Image (Hidden on mobile) */}
                <div className="auth-right-panel" style={{
                    display: 'none',
                    width: '55%',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    {/* Background Image */}
                    <div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            backgroundImage: `url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop')`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat'
                        }}
                    />
                    {/* Gradient Overlay */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to right, rgba(15,23,42,0.8), rgba(15,23,42,0.5), rgba(15,23,42,0.3))'
                    }} />

                    {/* Centered Branding Text */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 48
                    }}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.5 }}
                            style={{ textAlign: 'center' }}
                        >
                            <h2 style={{
                                fontSize: '3rem',
                                fontWeight: 700,
                                color: 'white',
                                marginBottom: 20,
                                marginTop: 0,
                                textShadow: '0 2px 20px rgba(0,0,0,0.3)'
                            }}>
                                Transform Your Life
                            </h2>
                            <p style={{
                                fontSize: '1.25rem',
                                color: 'rgba(255,255,255,0.9)',
                                maxWidth: 450,
                                lineHeight: 1.75,
                                margin: '0 auto',
                                textShadow: '0 1px 10px rgba(0,0,0,0.3)'
                            }}>
                                Track your habits, build discipline, and unlock your full potential with Kalyan.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @media (min-width: 1024px) {
                    .auth-left-panel {
                        width: 45% !important;
                        padding: 60px 80px !important;
                    }
                    .auth-right-panel {
                        display: flex !important;
                    }
                }
            `}</style>
        </>
    );
}