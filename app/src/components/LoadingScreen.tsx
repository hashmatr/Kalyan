'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';

interface LoadingScreenProps {
    onComplete?: () => void;
    minDuration?: number;
}

export function LoadingScreen({ onComplete, minDuration = 1500 }: LoadingScreenProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Animate progress
        const tl = gsap.timeline({
            onComplete: () => {
                setTimeout(() => {
                    setIsLoading(false);
                    onComplete?.();
                }, 200);
            }
        });

        tl.to({ value: 0 }, {
            value: 100,
            duration: minDuration / 1000,
            ease: 'power2.inOut',
            onUpdate: function () {
                setProgress(Math.round(this.targets()[0].value));
            }
        });

        // Animate logo
        gsap.fromTo('.loading-logo',
            { scale: 0.8, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' }
        );

        gsap.to('.loading-logo', {
            y: -5,
            duration: 0.8,
            repeat: -1,
            yoyo: true,
            ease: 'power1.inOut',
        });

        // Animate dots
        gsap.to('.loading-dot', {
            y: -8,
            duration: 0.4,
            stagger: 0.1,
            repeat: -1,
            yoyo: true,
            ease: 'power1.inOut',
        });

        return () => {
            tl.kill();
        };
    }, [minDuration, onComplete]);

    return (
        <AnimatePresence>
            {isLoading && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 1.02 }}
                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 9999,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
                    }}
                >
                    {/* Background Pattern */}
                    <div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            opacity: 0.5,
                            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(99, 102, 241, 0.05) 0%, transparent 50%),
                                              radial-gradient(circle at 75% 75%, rgba(168, 85, 247, 0.05) 0%, transparent 50%)`,
                        }}
                    />

                    {/* Logo */}
                    <div
                        className="loading-logo"
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 16,
                        }}
                    >
                        <div
                            style={{
                                width: 80,
                                height: 80,
                                borderRadius: 20,
                                background: 'linear-gradient(135deg, #f97316 0%, #ef4444 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 20px 40px rgba(249, 115, 22, 0.3)',
                            }}
                        >
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z" />
                            </svg>
                        </div>

                        <h1
                            style={{
                                fontSize: 32,
                                fontWeight: 800,
                                background: 'linear-gradient(135deg, #dc2626 0%, #ea580c 50%, #ca8a04 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                letterSpacing: '0.1em',
                            }}
                        >
                            KALYAN
                        </h1>
                    </div>

                    {/* Loading Dots */}
                    <div
                        style={{
                            display: 'flex',
                            gap: 8,
                            marginTop: 40,
                        }}
                    >
                        {[0, 1, 2].map((i) => (
                            <div
                                key={i}
                                className="loading-dot"
                                style={{
                                    width: 10,
                                    height: 10,
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                }}
                            />
                        ))}
                    </div>

                    {/* Progress Bar */}
                    <div
                        style={{
                            position: 'absolute',
                            bottom: 60,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: 200,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 12,
                        }}
                    >
                        <div
                            style={{
                                width: '100%',
                                height: 4,
                                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                                borderRadius: 2,
                                overflow: 'hidden',
                            }}
                        >
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ ease: 'linear' }}
                                style={{
                                    height: '100%',
                                    background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
                                    borderRadius: 2,
                                }}
                            />
                        </div>
                        <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>
                            Loading{progress > 0 ? ` ${progress}%` : '...'}
                        </span>
                    </div>

                    {/* Tagline */}
                    <p
                        style={{
                            position: 'absolute',
                            bottom: 24,
                            fontSize: 13,
                            color: '#94a3b8',
                        }}
                    >
                        Build habits. Transform life.
                    </p>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// Hook to show loading screen
export function useLoadingScreen(duration = 1500) {
    const [showLoading, setShowLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowLoading(false);
        }, duration);

        return () => clearTimeout(timer);
    }, [duration]);

    return showLoading;
}
