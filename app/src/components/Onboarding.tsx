'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronRight,
    ChevronLeft,
    Target,
    Calendar,
    Trophy,
    Bell,
    CheckCircle,
    Sparkles,
    X
} from 'lucide-react';

interface OnboardingProps {
    onComplete: () => void;
}

const steps = [
    {
        icon: Sparkles,
        title: 'Welcome to Kalyan! 🎉',
        description: 'Your personal habit tracker designed to help you build discipline and transform your life.',
        image: '/onboarding/welcome.svg',
        color: '#6366f1',
    },
    {
        icon: Target,
        title: 'Track Your Habits',
        description: 'Create custom habits or choose from our curated list. Track your daily progress and build streaks!',
        tips: [
            'Start with 3-5 key habits',
            'Be specific about what you want to achieve',
            'Set reminders to stay consistent',
        ],
        color: '#8b5cf6',
    },
    {
        icon: Calendar,
        title: 'Calendar View',
        description: 'Navigate through days to see your history. Green means success, red means room for improvement.',
        tips: [
            'Click any date to view that day\'s habits',
            'Colors show your completion rate',
            'Track patterns over time',
        ],
        color: '#06b6d4',
    },
    {
        icon: Trophy,
        title: 'Earn Rewards',
        description: 'Stay consistent and unlock achievements! From Bronze to Legendary, every milestone counts.',
        tips: [
            '7 days = Bronze Medal',
            '30 days = Silver Medal',
            '100 days = Gold Medal',
            'Keep going for more!',
        ],
        color: '#f59e0b',
    },
    {
        icon: Bell,
        title: 'Stay Reminded',
        description: 'Never miss a habit! Enable notifications to get timely reminders for your daily routines.',
        tips: [
            'Set custom reminder times',
            'Get streak alerts',
            'Morning/Evening summaries',
        ],
        color: '#10b981',
    },
    {
        icon: CheckCircle,
        title: 'You\'re Ready!',
        description: 'Start your journey today. Remember: consistency beats perfection. Small steps lead to big changes!',
        tips: [
            'Complete at least one habit daily',
            'Don\'t break the chain!',
            'Celebrate small wins',
        ],
        color: '#22c55e',
    },
];

export function Onboarding({ onComplete }: OnboardingProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [direction, setDirection] = useState(1);

    const step = steps[currentStep];
    const Icon = step.icon;
    const isLastStep = currentStep === steps.length - 1;
    const isFirstStep = currentStep === 0;

    const handleNext = () => {
        if (isLastStep) {
            onComplete();
        } else {
            setDirection(1);
            setCurrentStep((prev) => prev + 1);
        }
    };

    const handlePrev = () => {
        if (!isFirstStep) {
            setDirection(-1);
            setCurrentStep((prev) => prev - 1);
        }
    };

    const handleSkip = () => {
        onComplete();
    };

    const slideVariants = {
        enter: (dir: number) => ({
            x: dir > 0 ? 300 : -300,
            opacity: 0,
        }),
        center: {
            x: 0,
            opacity: 1,
        },
        exit: (dir: number) => ({
            x: dir > 0 ? -300 : 300,
            opacity: 0,
        }),
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999,
                backgroundColor: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 20,
            }}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', duration: 0.5 }}
                style={{
                    width: '100%',
                    maxWidth: 520,
                    backgroundColor: 'white',
                    borderRadius: 24,
                    overflow: 'hidden',
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                }}
            >
                {/* Skip button */}
                <button
                    onClick={handleSkip}
                    style={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        padding: 8,
                        background: 'rgba(255,255,255,0.9)',
                        border: 'none',
                        borderRadius: 8,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: 13,
                        color: '#64748b',
                    }}
                >
                    Skip <X size={16} />
                </button>

                {/* Header with gradient */}
                <div
                    style={{
                        background: `linear-gradient(135deg, ${step.color}, ${step.color}dd)`,
                        padding: '48px 32px',
                        textAlign: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                    }}
                >
                    {/* Background pattern */}
                    <div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            opacity: 0.1,
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                        }}
                    />

                    <AnimatePresence mode="wait" custom={direction}>
                        <motion.div
                            key={currentStep}
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.3 }}
                        >
                            <motion.div
                                animate={{
                                    y: [0, -10, 0],
                                    rotate: [0, 5, -5, 0],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    repeatType: 'reverse',
                                }}
                                style={{
                                    display: 'inline-flex',
                                    padding: 20,
                                    backgroundColor: 'rgba(255,255,255,0.2)',
                                    borderRadius: '50%',
                                    marginBottom: 16,
                                }}
                            >
                                <Icon size={48} color="white" />
                            </motion.div>
                            <h2 style={{
                                fontSize: 28,
                                fontWeight: 700,
                                color: 'white',
                                margin: 0,
                            }}>
                                {step.title}
                            </h2>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Content */}
                <div style={{ padding: '32px' }}>
                    <AnimatePresence mode="wait" custom={direction}>
                        <motion.div
                            key={currentStep}
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.3 }}
                        >
                            <p style={{
                                fontSize: 16,
                                color: '#475569',
                                lineHeight: 1.7,
                                marginBottom: step.tips ? 24 : 0,
                                textAlign: 'center',
                            }}>
                                {step.description}
                            </p>

                            {step.tips && (
                                <div style={{
                                    backgroundColor: '#f8fafc',
                                    borderRadius: 12,
                                    padding: 20,
                                }}>
                                    {step.tips.map((tip, idx) => (
                                        <div
                                            key={idx}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 12,
                                                padding: '8px 0',
                                                borderBottom: idx < step.tips!.length - 1 ? '1px solid #e2e8f0' : 'none',
                                            }}
                                        >
                                            <CheckCircle size={18} color={step.color} />
                                            <span style={{ fontSize: 14, color: '#334155' }}>{tip}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Footer */}
                <div style={{
                    padding: '20px 32px 32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}>
                    {/* Step indicators */}
                    <div style={{ display: 'flex', gap: 6 }}>
                        {steps.map((_, idx) => (
                            <motion.div
                                key={idx}
                                animate={{
                                    width: idx === currentStep ? 24 : 8,
                                    backgroundColor: idx === currentStep ? step.color : '#e2e8f0',
                                }}
                                style={{
                                    height: 8,
                                    borderRadius: 4,
                                    cursor: 'pointer',
                                }}
                                onClick={() => {
                                    setDirection(idx > currentStep ? 1 : -1);
                                    setCurrentStep(idx);
                                }}
                            />
                        ))}
                    </div>

                    {/* Navigation buttons */}
                    <div style={{ display: 'flex', gap: 12 }}>
                        {!isFirstStep && (
                            <button
                                onClick={handlePrev}
                                style={{
                                    padding: '12px 20px',
                                    borderRadius: 10,
                                    border: '1px solid #e2e8f0',
                                    backgroundColor: 'white',
                                    color: '#475569',
                                    fontWeight: 500,
                                    fontSize: 14,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6,
                                }}
                            >
                                <ChevronLeft size={18} />
                                Back
                            </button>
                        )}
                        <button
                            onClick={handleNext}
                            style={{
                                padding: '12px 24px',
                                borderRadius: 10,
                                border: 'none',
                                backgroundColor: step.color,
                                color: 'white',
                                fontWeight: 600,
                                fontSize: 14,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                            }}
                        >
                            {isLastStep ? 'Get Started' : 'Next'}
                            {!isLastStep && <ChevronRight size={18} />}
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

// Hook to manage onboarding state
export function useOnboarding() {
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const hasSeenOnboarding = localStorage.getItem('kalyan_onboarding_complete');
        if (!hasSeenOnboarding) {
            setShowOnboarding(true);
        }
        setIsLoaded(true);
    }, []);

    const completeOnboarding = () => {
        localStorage.setItem('kalyan_onboarding_complete', 'true');
        setShowOnboarding(false);
    };

    const resetOnboarding = () => {
        localStorage.removeItem('kalyan_onboarding_complete');
        setShowOnboarding(true);
    };

    return { showOnboarding, completeOnboarding, resetOnboarding, isLoaded };
}
