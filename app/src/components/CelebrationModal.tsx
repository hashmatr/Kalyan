'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Flame, Trophy, X } from 'lucide-react';
import Confetti from 'react-confetti';

interface CelebrationModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'streak' | 'reward' | 'perfect';
    title: string;
    message: string;
    icon?: string;
}

export function CelebrationModal({ isOpen, onClose, type, title, message, icon }: CelebrationModalProps) {
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setShowConfetti(true);
            const timer = setTimeout(() => setShowConfetti(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const typeStyles = {
        streak: {
            gradient: 'from-orange-500 via-red-500 to-rose-600',
            icon: <Flame className="w-16 h-16 text-white" />,
        },
        reward: {
            gradient: 'from-yellow-400 via-amber-500 to-orange-600',
            icon: <Trophy className="w-16 h-16 text-white" />,
        },
        perfect: {
            gradient: 'from-emerald-400 via-green-500 to-teal-600',
            icon: <Sparkles className="w-16 h-16 text-white" />,
        },
    };

    const style = typeStyles[type];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {showConfetti && (
                        <Confetti
                            width={window.innerWidth}
                            height={window.innerHeight}
                            recycle={false}
                            numberOfPieces={500}
                            gravity={0.3}
                        />
                    )}

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
                        onClick={onClose}
                    >
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0, rotateY: 180 }}
                            animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            transition={{ type: "spring", damping: 15 }}
                            onClick={e => e.stopPropagation()}
                            className="relative w-full max-w-md overflow-hidden rounded-3xl"
                        >
                            {/* Animated background */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${style.gradient}`}>
                                <motion.div
                                    animate={{
                                        background: [
                                            'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.3) 0%, transparent 50%)',
                                            'radial-gradient(circle at 80% 80%, rgba(255,255,255,0.3) 0%, transparent 50%)',
                                            'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.3) 0%, transparent 50%)',
                                            'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.3) 0%, transparent 50%)',
                                        ],
                                    }}
                                    transition={{ duration: 4, repeat: Infinity }}
                                    className="absolute inset-0"
                                />
                            </div>

                            {/* Content */}
                            <div className="relative p-8 text-center">
                                {/* Close button */}
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                                >
                                    <X className="w-5 h-5 text-white" />
                                </button>

                                {/* Icon */}
                                <motion.div
                                    animate={{
                                        scale: [1, 1.2, 1],
                                        rotate: [-5, 5, -5]
                                    }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="inline-flex p-6 rounded-full bg-white/20 mb-6"
                                >
                                    {icon ? (
                                        <span className="text-6xl">{icon}</span>
                                    ) : (
                                        style.icon
                                    )}
                                </motion.div>

                                {/* Title */}
                                <motion.h2
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-3xl font-bold text-white mb-4"
                                >
                                    {title}
                                </motion.h2>

                                {/* Message */}
                                <motion.p
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-lg text-white/90 mb-8"
                                >
                                    {message}
                                </motion.p>

                                {/* Button */}
                                <motion.button
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={onClose}
                                    className="px-8 py-3 rounded-full bg-white text-gray-900 font-bold
                    shadow-lg hover:shadow-xl transition-shadow"
                                >
                                    Continue the Journey! 🚀
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
