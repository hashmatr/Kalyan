'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Activity, Book, Brain, Coffee, Dumbbell, Flame, Heart, Moon, Music, Sun, Zap, Briefcase, Calculator, Camera, Code, Globe, Laptop, Mic, PenTool, Smartphone, Smile, Star, Target, Watch, Droplets, Utensils, BedDouble } from 'lucide-react';
import { HabitCategory } from '@/types';
import { CATEGORY_COLORS } from '@/lib/constants';

interface AddHabitModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (habit: { name: string; description: string; icon: string; category: HabitCategory }) => void;
}

const AVAILABLE_ICONS = [
    { name: 'Activity', icon: Activity },
    { name: 'Book', icon: Book },
    { name: 'Brain', icon: Brain },
    { name: 'Coffee', icon: Coffee },
    { name: 'Dumbbell', icon: Dumbbell },
    { name: 'Flame', icon: Flame },
    { name: 'Heart', icon: Heart },
    { name: 'Moon', icon: Moon },
    { name: 'Sun', icon: Sun },
    { name: 'Zap', icon: Zap },
    { name: 'Target', icon: Target },
    { name: 'Briefcase', icon: Briefcase },
    { name: 'Code', icon: Code },
    { name: 'Laptop', icon: Laptop },
    { name: 'Music', icon: Music },
    { name: 'PenTool', icon: PenTool },
    { name: 'Smile', icon: Smile },
    { name: 'Star', icon: Star },
    { name: 'Watch', icon: Watch },
    { name: 'Droplets', icon: Droplets },
    { name: 'Utensils', icon: Utensils },
    { name: 'BedDouble', icon: BedDouble },
];

const CATEGORIES: { id: HabitCategory; label: string }[] = [
    { id: 'physical', label: 'Physical' },
    { id: 'mental', label: 'Mental' },
    { id: 'spiritual', label: 'Spiritual' },
    { id: 'discipline', label: 'Discipline' },
];

export function AddHabitModal({ isOpen, onClose, onAdd }: AddHabitModalProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<HabitCategory>('physical');
    const [selectedIcon, setSelectedIcon] = useState('Activity');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        onAdd({
            name,
            description,
            icon: selectedIcon,
            category,
        });

        // Reset form
        setName('');
        setDescription('');
        setCategory('physical');
        setSelectedIcon('Activity');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 50,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 16,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(4px)'
                }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        style={{
                            width: '100%',
                            maxWidth: 500,
                            backgroundColor: 'white',
                            borderRadius: 24,
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                            border: '1px solid #e2e8f0',
                            overflow: 'hidden'
                        }}
                    >
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '24px 32px 16px',
                            borderBottom: 'none'
                        }}>
                            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>Add New Habit</h2>
                            <button
                                onClick={onClose}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#94a3b8',
                                    cursor: 'pointer',
                                    padding: 4
                                }}
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div style={{ padding: 24, maxHeight: '80vh', overflowY: 'auto' }}>
                            <form onSubmit={handleSubmit}>
                                {/* Name */}
                                <div style={{ marginBottom: 24 }}>
                                    <label style={{ display: 'block', color: '#475569', marginBottom: 8, fontSize: 14, fontWeight: 600 }}>
                                        Habit Name
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="e.g., Read 10 Pages"
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            borderRadius: 12,
                                            backgroundColor: '#f8fafc',
                                            border: '1px solid #e2e8f0',
                                            color: '#0f172a',
                                            outline: 'none',
                                            fontSize: 16,
                                            transition: 'all 0.2s',
                                            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                                        }}
                                        required
                                    />
                                </div>

                                {/* Description */}
                                <div style={{ marginBottom: 24 }}>
                                    <label style={{ display: 'block', color: '#475569', marginBottom: 8, fontSize: 14, fontWeight: 600 }}>
                                        Description (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Keep it brief and motivating"
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            borderRadius: 12,
                                            backgroundColor: '#f8fafc',
                                            border: '1px solid #e2e8f0',
                                            color: '#0f172a',
                                            outline: 'none',
                                            fontSize: 15,
                                            transition: 'all 0.2s',
                                            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                                        }}
                                    />
                                </div>

                                {/* Category */}
                                <div style={{ marginBottom: 24 }}>
                                    <label style={{ display: 'block', color: '#475569', marginBottom: 8, fontSize: 14, fontWeight: 600 }}>
                                        Category
                                    </label>
                                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                        {CATEGORIES.map((cat) => (
                                            <button
                                                key={cat.id}
                                                type="button"
                                                onClick={() => setCategory(cat.id)}
                                                style={{
                                                    padding: '10px 20px',
                                                    borderRadius: 16,
                                                    border: category === cat.id ? 'none' : '1px solid #e2e8f0',
                                                    background: category === cat.id
                                                        ? `linear-gradient(135deg, ${getGradientColors(cat.id)})`
                                                        : '#f8fafc',
                                                    color: category === cat.id ? 'white' : '#64748b',
                                                    fontSize: 14,
                                                    cursor: 'pointer',
                                                    fontWeight: category === cat.id ? 600 : 500,
                                                    boxShadow: category === cat.id ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                {cat.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Icon Selection */}
                                <div style={{ marginBottom: 32 }}>
                                    <label style={{ display: 'block', color: '#475569', marginBottom: 12, fontSize: 14, fontWeight: 600 }}>
                                        Choose Icon
                                    </label>
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fill, minmax(56px, 1fr))',
                                        gap: 12,
                                        maxHeight: 200,
                                        overflowY: 'auto',
                                        padding: 4
                                    }}>
                                        {AVAILABLE_ICONS.map((item) => (
                                            <button
                                                key={item.name}
                                                type="button"
                                                onClick={() => setSelectedIcon(item.name)}
                                                style={{
                                                    width: 56,
                                                    height: 56,
                                                    borderRadius: 16,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    backgroundColor: selectedIcon === item.name ? '#6366f1' : '#f8fafc',
                                                    border: selectedIcon === item.name ? 'none' : '1px solid #e2e8f0',
                                                    color: selectedIcon === item.name ? 'white' : '#64748b',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                    boxShadow: selectedIcon === item.name
                                                        ? '0 8px 16px -4px rgba(99, 102, 241, 0.4)'
                                                        : 'none'
                                                }}
                                            >
                                                <item.icon size={28} />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: 8,
                                        backgroundColor: '#10b981',
                                        border: 'none',
                                        color: 'white',
                                        fontSize: 16,
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 8
                                    }}
                                >
                                    <Check size={20} />
                                    Create Habit
                                </button>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

function getGradientColors(category: HabitCategory): string {
    // This is a simplified extraction from CATEGORY_COLORS
    // Ideally import from constants, but for now specific values:
    switch (category) {
        case 'spiritual': return '#a855f7, #4f46e5';
        case 'physical': return '#22c55e, #059669';
        case 'mental': return '#3b82f6, #0891b2';
        case 'discipline': return '#f97316, #dc2626';
        default: return '#64748b, #475569';
    }
}
