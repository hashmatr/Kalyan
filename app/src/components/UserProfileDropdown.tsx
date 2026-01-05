'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, Settings, ChevronDown } from 'lucide-react';

interface UserData {
    id: string;
    name: string;
    email: string;
    avatar?: string;
}

interface UserProfileDropdownProps {
    onLogout?: () => void;
}

export default function UserProfileDropdown({ onLogout }: UserProfileDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState<UserData | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Load user from localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error('Failed to parse user data');
            }
        }
    }, []);

    useEffect(() => {
        // Close dropdown when clicking outside
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
        setIsOpen(false);
        onLogout?.();
        window.location.href = '/Pages/auth';
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    if (!user) {
        return (
            <a
                href="/Pages/auth"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 16px',
                    borderRadius: 8,
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    color: 'white',
                    textDecoration: 'none',
                    fontSize: 14,
                    fontWeight: 500,
                    border: '1px solid rgba(255,255,255,0.2)',
                    transition: 'all 0.2s ease'
                }}
            >
                <User size={18} />
                Sign In
            </a>
        );
    }

    return (
        <div ref={dropdownRef} style={{ position: 'relative' }}>
            {/* Profile Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '6px 12px',
                    borderRadius: 50,
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                }}
            >
                {/* Avatar Circle */}
                <div
                    style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        backgroundColor: '#6366f1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: 14,
                        fontWeight: 600,
                        overflow: 'hidden'
                    }}
                >
                    {user.avatar ? (
                        <img
                            src={user.avatar}
                            alt={user.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    ) : (
                        getInitials(user.name)
                    )}
                </div>
                <span style={{
                    color: 'white',
                    fontSize: 14,
                    fontWeight: 500,
                    maxWidth: 120,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                }}>
                    {user.name.split(' ')[0]}
                </span>
                <ChevronDown
                    size={16}
                    color="rgba(255,255,255,0.7)"
                    style={{
                        transition: 'transform 0.2s ease',
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                    }}
                />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        style={{
                            position: 'absolute',
                            top: 'calc(100% + 8px)',
                            right: 0,
                            width: 240,
                            backgroundColor: '#1e293b',
                            borderRadius: 12,
                            boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            overflow: 'hidden',
                            zIndex: 1000
                        }}
                    >
                        {/* User Info */}
                        <div style={{
                            padding: 16,
                            borderBottom: '1px solid rgba(255,255,255,0.1)'
                        }}>
                            <p style={{
                                color: 'white',
                                fontWeight: 600,
                                fontSize: 14,
                                margin: 0,
                                marginBottom: 4
                            }}>
                                {user.name}
                            </p>
                            <p style={{
                                color: 'rgba(255,255,255,0.6)',
                                fontSize: 13,
                                margin: 0,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}>
                                {user.email}
                            </p>
                        </div>

                        {/* Menu Items */}
                        <div style={{ padding: 8 }}>
                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    window.location.href = '/Pages/settings#profile';
                                }}
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 12,
                                    padding: '10px 12px',
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    borderRadius: 8,
                                    color: 'rgba(255,255,255,0.8)',
                                    fontSize: 14,
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                            >
                                <User size={18} />
                                Edit Profile
                            </button>

                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    window.location.href = '/Pages/settings#appearance';
                                }}
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 12,
                                    padding: '10px 12px',
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    borderRadius: 8,
                                    color: 'rgba(255,255,255,0.8)',
                                    fontSize: 14,
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                            >
                                <Settings size={18} />
                                Settings
                            </button>

                            <button
                                onClick={handleLogout}
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 12,
                                    padding: '10px 12px',
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    borderRadius: 8,
                                    color: '#f87171',
                                    fontSize: 14,
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = 'rgba(248,113,113,0.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                            >
                                <LogOut size={18} />
                                Log out
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
