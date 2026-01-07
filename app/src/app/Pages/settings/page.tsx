'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Lock, ArrowLeft, Save, Camera, Shield } from 'lucide-react';

interface UserData {
    id: string;
    name: string;
    email: string;
    avatar?: string;
}

export default function SettingsPage() {
    const [mounted, setMounted] = useState(false);
    const [user, setUser] = useState<UserData | null>(null);
    const [activeTab, setActiveTab] = useState('profile');
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
    });

    useEffect(() => {
        setMounted(true);

        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const userData = JSON.parse(storedUser);
                setUser(userData);
                setFormData(prev => ({
                    ...prev,
                    name: userData.name || '',
                    email: userData.email || '',
                }));
            } catch (e) {
                console.error('Failed to parse user data');
            }
        } else {
            window.location.href = '/Pages/auth';
        }

        // Check for hash in URL to set initial tab
        if (window.location.hash === '#profile') {
            setActiveTab('profile');
        } else if (window.location.hash === '#password') {
            setActiveTab('password');
        }
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage('');
        setSuccessMessage('');

        try {
            const updatedUser = {
                ...user,
                name: formData.name,
                email: formData.email,
            };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser as UserData);
            setSuccessMessage('Profile updated successfully!');
        } catch (error) {
            setErrorMessage('Failed to update profile. Please try again.');
        }

        setIsLoading(false);
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage('');
        setSuccessMessage('');

        if (formData.newPassword !== formData.confirmNewPassword) {
            setErrorMessage('New passwords do not match');
            setIsLoading(false);
            return;
        }

        if (formData.newPassword.length < 6) {
            setErrorMessage('Password must be at least 6 characters');
            setIsLoading(false);
            return;
        }

        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            setSuccessMessage('Password changed successfully!');
            setFormData(prev => ({
                ...prev,
                currentPassword: '',
                newPassword: '',
                confirmNewPassword: '',
            }));
        } catch (error) {
            setErrorMessage('Failed to change password. Please try again.');
        }

        setIsLoading(false);
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                setErrorMessage('Image must be less than 2MB');
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                const avatarUrl = event.target?.result as string;
                const updatedUser = { ...user, avatar: avatarUrl };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                setUser(updatedUser as UserData);
                setSuccessMessage('Profile picture updated!');
            };
            reader.readAsDataURL(file);
        }
    };



    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Light theme colors (always light)
    const theme = {
        bg: '#f8fafc',
        cardBg: 'white',
        text: '#0f172a',
        textMuted: '#64748b',
        border: '#e2e8f0',
        inputBg: '#f1f5f9',
        inputBorder: '#e2e8f0',
    };

    if (!mounted) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
                <div className="spinner-wheel" />
            </div>
        );
    }

    if (!user) {
        return null;
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

            <div style={{ minHeight: '100vh', backgroundColor: theme.bg, color: theme.text, transition: 'all 0.3s ease' }}>
                {/* Hidden file input */}
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handlePhotoUpload}
                    accept="image/*"
                    style={{ display: 'none' }}
                />

                {/* Header */}
                <header style={{
                    borderBottom: `1px solid ${theme.border}`,
                    padding: '16px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <button
                        onClick={() => window.location.href = '/Pages'}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            background: 'none',
                            border: 'none',
                            color: theme.textMuted,
                            cursor: 'pointer',
                            fontSize: 14
                        }}
                    >
                        <ArrowLeft size={20} />
                        Back to Dashboard
                    </button>

                </header>

                <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 8 }}>Settings</h1>
                        <p style={{ color: theme.textMuted, marginBottom: 40 }}>Manage your account settings and preferences</p>

                        {/* Tabs */}
                        <div style={{ display: 'flex', gap: 8, marginBottom: 32, borderBottom: `1px solid ${theme.border}`, paddingBottom: 16, flexWrap: 'wrap' }}>
                            {[
                                { id: 'profile', label: 'Profile', icon: User },
                                { id: 'password', label: 'Security', icon: Lock },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 8,
                                        padding: '10px 20px',
                                        borderRadius: 8,
                                        border: 'none',
                                        backgroundColor: activeTab === tab.id ? '#6366f1' : 'transparent',
                                        color: activeTab === tab.id ? 'white' : theme.textMuted,
                                        cursor: 'pointer',
                                        fontWeight: 500,
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    <tab.icon size={18} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Success/Error Messages */}
                        {successMessage && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{
                                    padding: 16,
                                    borderRadius: 8,
                                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                    border: '1px solid rgba(16, 185, 129, 0.3)',
                                    color: '#10b981',
                                    marginBottom: 24
                                }}
                            >
                                {successMessage}
                            </motion.div>
                        )}
                        {errorMessage && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{
                                    padding: 16,
                                    borderRadius: 8,
                                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                    color: '#ef4444',
                                    marginBottom: 24
                                }}
                            >
                                {errorMessage}
                            </motion.div>
                        )}

                        {/* Profile Tab */}
                        {activeTab === 'profile' && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                {/* Avatar Section */}
                                <div style={{
                                    backgroundColor: theme.cardBg,
                                    borderRadius: 16,
                                    padding: 32,
                                    marginBottom: 24,
                                    border: `1px solid ${theme.border}`
                                }}>
                                    <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 24 }}>Profile Picture</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                                        <div style={{
                                            width: 100,
                                            height: 100,
                                            borderRadius: '50%',
                                            backgroundColor: '#6366f1',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: 32,
                                            fontWeight: 600,
                                            color: 'white',
                                            overflow: 'hidden'
                                        }}>
                                            {user.avatar ? (
                                                <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                getInitials(user.name)
                                            )}
                                        </div>
                                        <div>
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 8,
                                                    padding: '12px 24px',
                                                    borderRadius: 8,
                                                    border: 'none',
                                                    backgroundColor: '#6366f1',
                                                    color: 'white',
                                                    cursor: 'pointer',
                                                    fontWeight: 500
                                                }}
                                            >
                                                <Camera size={18} />
                                                Change Photo
                                            </button>
                                            <p style={{ color: theme.textMuted, fontSize: 12, marginTop: 8 }}>
                                                JPG, PNG or GIF. Max 2MB.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Profile Form */}
                                <div style={{
                                    backgroundColor: theme.cardBg,
                                    borderRadius: 16,
                                    padding: 32,
                                    border: `1px solid ${theme.border}`
                                }}>
                                    <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 24 }}>Personal Information</h3>
                                    <form onSubmit={handleProfileUpdate}>
                                        <div style={{ marginBottom: 24 }}>
                                            <label style={{ display: 'block', fontSize: 14, color: theme.textMuted, marginBottom: 8 }}>
                                                Full Name
                                            </label>
                                            <div style={{ position: 'relative' }}>
                                                <User size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: theme.textMuted }} />
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleInputChange}
                                                    style={{
                                                        width: '100%',
                                                        padding: '14px 16px 14px 48px',
                                                        borderRadius: 10,
                                                        border: `1px solid ${theme.inputBorder}`,
                                                        backgroundColor: theme.inputBg,
                                                        color: theme.text,
                                                        fontSize: 16,
                                                        outline: 'none'
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <div style={{ marginBottom: 32 }}>
                                            <label style={{ display: 'block', fontSize: 14, color: theme.textMuted, marginBottom: 8 }}>
                                                Email Address
                                            </label>
                                            <div style={{ position: 'relative' }}>
                                                <Mail size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: theme.textMuted }} />
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    style={{
                                                        width: '100%',
                                                        padding: '14px 16px 14px 48px',
                                                        borderRadius: 10,
                                                        border: `1px solid ${theme.inputBorder}`,
                                                        backgroundColor: theme.inputBg,
                                                        color: theme.text,
                                                        fontSize: 16,
                                                        outline: 'none'
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: 8,
                                                width: '100%',
                                                padding: 16,
                                                borderRadius: 10,
                                                border: 'none',
                                                backgroundColor: '#6366f1',
                                                color: 'white',
                                                fontWeight: 600,
                                                fontSize: 16,
                                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                                opacity: isLoading ? 0.7 : 1
                                            }}
                                        >
                                            <Save size={18} />
                                            {isLoading ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </form>
                                </div>
                            </motion.div>
                        )}

                        {/* Password/Security Tab */}
                        {activeTab === 'password' && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div style={{
                                    backgroundColor: theme.cardBg,
                                    borderRadius: 16,
                                    padding: 32,
                                    border: `1px solid ${theme.border}`
                                }}>
                                    <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 24 }}>Change Password</h3>
                                    <form onSubmit={handlePasswordChange}>
                                        <div style={{ marginBottom: 24 }}>
                                            <label style={{ display: 'block', fontSize: 14, color: theme.textMuted, marginBottom: 8 }}>
                                                Current Password
                                            </label>
                                            <div style={{ position: 'relative' }}>
                                                <Lock size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: theme.textMuted }} />
                                                <input
                                                    type="password"
                                                    name="currentPassword"
                                                    value={formData.currentPassword}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter current password"
                                                    style={{
                                                        width: '100%',
                                                        padding: '14px 16px 14px 48px',
                                                        borderRadius: 10,
                                                        border: `1px solid ${theme.inputBorder}`,
                                                        backgroundColor: theme.inputBg,
                                                        color: theme.text,
                                                        fontSize: 16,
                                                        outline: 'none'
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <div style={{ marginBottom: 24 }}>
                                            <label style={{ display: 'block', fontSize: 14, color: theme.textMuted, marginBottom: 8 }}>
                                                New Password
                                            </label>
                                            <div style={{ position: 'relative' }}>
                                                <Lock size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: theme.textMuted }} />
                                                <input
                                                    type="password"
                                                    name="newPassword"
                                                    value={formData.newPassword}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter new password"
                                                    style={{
                                                        width: '100%',
                                                        padding: '14px 16px 14px 48px',
                                                        borderRadius: 10,
                                                        border: `1px solid ${theme.inputBorder}`,
                                                        backgroundColor: theme.inputBg,
                                                        color: theme.text,
                                                        fontSize: 16,
                                                        outline: 'none'
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <div style={{ marginBottom: 32 }}>
                                            <label style={{ display: 'block', fontSize: 14, color: theme.textMuted, marginBottom: 8 }}>
                                                Confirm New Password
                                            </label>
                                            <div style={{ position: 'relative' }}>
                                                <Lock size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: theme.textMuted }} />
                                                <input
                                                    type="password"
                                                    name="confirmNewPassword"
                                                    value={formData.confirmNewPassword}
                                                    onChange={handleInputChange}
                                                    placeholder="Confirm new password"
                                                    style={{
                                                        width: '100%',
                                                        padding: '14px 16px 14px 48px',
                                                        borderRadius: 10,
                                                        border: `1px solid ${theme.inputBorder}`,
                                                        backgroundColor: theme.inputBg,
                                                        color: theme.text,
                                                        fontSize: 16,
                                                        outline: 'none'
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: 8,
                                                width: '100%',
                                                padding: 16,
                                                borderRadius: 10,
                                                border: 'none',
                                                backgroundColor: '#6366f1',
                                                color: 'white',
                                                fontWeight: 600,
                                                fontSize: 16,
                                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                                opacity: isLoading ? 0.7 : 1
                                            }}
                                        >
                                            <Shield size={18} />
                                            {isLoading ? 'Updating...' : 'Update Password'}
                                        </button>
                                    </form>
                                </div>
                            </motion.div>
                        )}


                    </motion.div>
                </div>
            </div>
        </>
    );
}
