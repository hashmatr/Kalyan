'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Mail, Lock, KeyRound, CheckCircle, Loader2 } from 'lucide-react';

type Step = 'email' | 'otp' | 'password' | 'success';

export default function ForgotPasswordPage() {
    const [step, setStep] = useState<Step>('email');
    const [mounted, setMounted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [resetToken, setResetToken] = useState('');

    const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Failed to send OTP');
                setIsLoading(false);
                return;
            }

            setStep('otp');
        } catch (err) {
            setError('Network error. Please try again.');
        }
        setIsLoading(false);
    };

    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return; // Only allow digits

        const newOtp = [...otp];
        newOtp[index] = value.slice(-1); // Only take last digit
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            otpInputRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        // Handle backspace
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpInputRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        if (/^\d+$/.test(pastedData)) {
            const newOtp = pastedData.split('').concat(Array(6 - pastedData.length).fill(''));
            setOtp(newOtp.slice(0, 6));
            otpInputRefs.current[Math.min(pastedData.length, 5)]?.focus();
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        const otpString = otp.join('');

        if (otpString.length !== 6) {
            setError('Please enter the complete 6-digit OTP');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp: otpString }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Invalid OTP');
                setIsLoading(false);
                return;
            }

            setResetToken(data.resetToken);
            setStep('password');
        } catch (err) {
            setError('Network error. Please try again.');
        }
        setIsLoading(false);
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, newPassword, resetToken }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Failed to reset password');
                setIsLoading(false);
                return;
            }

            setStep('success');
        } catch (err) {
            setError('Network error. Please try again.');
        }
        setIsLoading(false);
    };

    if (!mounted) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f8fafc'
            }}>
                <div className="spinner" />
            </div>
        );
    }

    return (
        <>
            <style jsx global>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                .spinner {
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
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f8fafc',
                padding: 20,
            }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        width: '100%',
                        maxWidth: 420,
                        backgroundColor: 'white',
                        borderRadius: 24,
                        padding: 40,
                        boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                    }}
                >
                    {/* Back button */}
                    {step !== 'success' && (
                        <a
                            href="/Pages/auth"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                color: '#64748b',
                                fontSize: 14,
                                textDecoration: 'none',
                                marginBottom: 32,
                            }}
                        >
                            <ArrowLeft size={18} />
                            Back to login
                        </a>
                    )}

                    <AnimatePresence mode="wait">
                        {/* Step 1: Enter Email */}
                        {step === 'email' && (
                            <motion.div
                                key="email"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                                    <div style={{
                                        width: 64,
                                        height: 64,
                                        borderRadius: 16,
                                        backgroundColor: '#eff6ff',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: 16,
                                    }}>
                                        <Mail size={28} color="#3b82f6" />
                                    </div>
                                    <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>
                                        Forgot Password?
                                    </h1>
                                    <p style={{ color: '#64748b', margin: 0 }}>
                                        Enter your email and we'll send you an OTP
                                    </p>
                                </div>

                                <form onSubmit={handleSendOtp}>
                                    <div style={{ marginBottom: 24 }}>
                                        <label style={{ display: 'block', fontSize: 14, color: '#64748b', marginBottom: 8 }}>
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="name@example.com"
                                            required
                                            style={{
                                                width: '100%',
                                                padding: '14px 16px',
                                                borderRadius: 12,
                                                border: '1px solid #e2e8f0',
                                                fontSize: 16,
                                                outline: 'none',
                                            }}
                                        />
                                    </div>

                                    {error && (
                                        <p style={{ color: '#ef4444', fontSize: 14, marginBottom: 16 }}>{error}</p>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        style={{
                                            width: '100%',
                                            padding: 16,
                                            borderRadius: 12,
                                            border: 'none',
                                            backgroundColor: '#6366f1',
                                            color: 'white',
                                            fontWeight: 600,
                                            fontSize: 16,
                                            cursor: isLoading ? 'not-allowed' : 'pointer',
                                            opacity: isLoading ? 0.7 : 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: 8,
                                        }}
                                    >
                                        {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Mail size={20} />}
                                        {isLoading ? 'Sending...' : 'Send OTP'}
                                    </button>
                                </form>
                            </motion.div>
                        )}

                        {/* Step 2: Enter OTP */}
                        {step === 'otp' && (
                            <motion.div
                                key="otp"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                                    <div style={{
                                        width: 64,
                                        height: 64,
                                        borderRadius: 16,
                                        backgroundColor: '#f0fdf4',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: 16,
                                    }}>
                                        <KeyRound size={28} color="#22c55e" />
                                    </div>
                                    <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>
                                        Enter OTP
                                    </h1>
                                    <p style={{ color: '#64748b', margin: 0 }}>
                                        We sent a 6-digit code to<br />
                                        <strong style={{ color: '#0f172a' }}>{email}</strong>
                                    </p>
                                </div>

                                <form onSubmit={handleVerifyOtp}>
                                    <div style={{
                                        display: 'flex',
                                        gap: 10,
                                        justifyContent: 'center',
                                        marginBottom: 24,
                                    }}>
                                        {otp.map((digit, idx) => (
                                            <input
                                                key={idx}
                                                ref={(el) => { otpInputRefs.current[idx] = el; }}
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={1}
                                                value={digit}
                                                onChange={(e) => handleOtpChange(idx, e.target.value)}
                                                onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                                                onPaste={handleOtpPaste}
                                                style={{
                                                    width: 50,
                                                    height: 56,
                                                    textAlign: 'center',
                                                    fontSize: 24,
                                                    fontWeight: 600,
                                                    borderRadius: 12,
                                                    border: '2px solid #e2e8f0',
                                                    outline: 'none',
                                                    transition: 'border-color 0.2s',
                                                }}
                                                onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                                                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                            />
                                        ))}
                                    </div>

                                    {error && (
                                        <p style={{ color: '#ef4444', fontSize: 14, marginBottom: 16, textAlign: 'center' }}>{error}</p>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        style={{
                                            width: '100%',
                                            padding: 16,
                                            borderRadius: 12,
                                            border: 'none',
                                            backgroundColor: '#6366f1',
                                            color: 'white',
                                            fontWeight: 600,
                                            fontSize: 16,
                                            cursor: isLoading ? 'not-allowed' : 'pointer',
                                            opacity: isLoading ? 0.7 : 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: 8,
                                        }}
                                    >
                                        {isLoading ? <Loader2 size={20} className="animate-spin" /> : null}
                                        {isLoading ? 'Verifying...' : 'Verify OTP'}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => { setStep('email'); setOtp(['', '', '', '', '', '']); setError(''); }}
                                        style={{
                                            width: '100%',
                                            padding: 12,
                                            marginTop: 12,
                                            borderRadius: 12,
                                            border: 'none',
                                            backgroundColor: 'transparent',
                                            color: '#64748b',
                                            fontWeight: 500,
                                            fontSize: 14,
                                            cursor: 'pointer',
                                        }}
                                    >
                                        Didn't receive code? Resend
                                    </button>
                                </form>
                            </motion.div>
                        )}

                        {/* Step 3: New Password */}
                        {step === 'password' && (
                            <motion.div
                                key="password"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                                    <div style={{
                                        width: 64,
                                        height: 64,
                                        borderRadius: 16,
                                        backgroundColor: '#fef3c7',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: 16,
                                    }}>
                                        <Lock size={28} color="#d97706" />
                                    </div>
                                    <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>
                                        Set New Password
                                    </h1>
                                    <p style={{ color: '#64748b', margin: 0 }}>
                                        Create a strong password for your account
                                    </p>
                                </div>

                                <form onSubmit={handleResetPassword}>
                                    <div style={{ marginBottom: 20 }}>
                                        <label style={{ display: 'block', fontSize: 14, color: '#64748b', marginBottom: 8 }}>
                                            New Password
                                        </label>
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Minimum 6 characters"
                                            required
                                            style={{
                                                width: '100%',
                                                padding: '14px 16px',
                                                borderRadius: 12,
                                                border: '1px solid #e2e8f0',
                                                fontSize: 16,
                                                outline: 'none',
                                            }}
                                        />
                                    </div>

                                    <div style={{ marginBottom: 24 }}>
                                        <label style={{ display: 'block', fontSize: 14, color: '#64748b', marginBottom: 8 }}>
                                            Confirm Password
                                        </label>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Re-enter your password"
                                            required
                                            style={{
                                                width: '100%',
                                                padding: '14px 16px',
                                                borderRadius: 12,
                                                border: '1px solid #e2e8f0',
                                                fontSize: 16,
                                                outline: 'none',
                                            }}
                                        />
                                    </div>

                                    {error && (
                                        <p style={{ color: '#ef4444', fontSize: 14, marginBottom: 16 }}>{error}</p>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        style={{
                                            width: '100%',
                                            padding: 16,
                                            borderRadius: 12,
                                            border: 'none',
                                            backgroundColor: '#6366f1',
                                            color: 'white',
                                            fontWeight: 600,
                                            fontSize: 16,
                                            cursor: isLoading ? 'not-allowed' : 'pointer',
                                            opacity: isLoading ? 0.7 : 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: 8,
                                        }}
                                    >
                                        {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Lock size={20} />}
                                        {isLoading ? 'Resetting...' : 'Reset Password'}
                                    </button>
                                </form>
                            </motion.div>
                        )}

                        {/* Step 4: Success */}
                        {step === 'success' && (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                            >
                                <div style={{ textAlign: 'center' }}>
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', duration: 0.5 }}
                                        style={{
                                            width: 80,
                                            height: 80,
                                            borderRadius: '50%',
                                            backgroundColor: '#f0fdf4',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginBottom: 24,
                                        }}
                                    >
                                        <CheckCircle size={40} color="#22c55e" />
                                    </motion.div>
                                    <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>
                                        Password Reset! 🎉
                                    </h1>
                                    <p style={{ color: '#64748b', margin: '0 0 32px' }}>
                                        Your password has been successfully reset.
                                        You can now log in with your new password.
                                    </p>
                                    <a
                                        href="/Pages/auth"
                                        style={{
                                            display: 'inline-block',
                                            padding: '16px 32px',
                                            borderRadius: 12,
                                            backgroundColor: '#6366f1',
                                            color: 'white',
                                            fontWeight: 600,
                                            fontSize: 16,
                                            textDecoration: 'none',
                                        }}
                                    >
                                        Back to Login
                                    </a>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </>
    );
}
