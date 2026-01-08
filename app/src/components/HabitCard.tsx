'use client';

import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { DailyHabit } from '@/types';

const categoryGradients: Record<string, string> = {
    spiritual: 'from-slate-700 to-zinc-900',
    physical: 'from-green-500 to-emerald-600',
    mental: 'from-blue-500 to-cyan-600',
    discipline: 'from-orange-500 to-red-600',
};

const categoryBgColors: Record<string, string> = {
    spiritual: 'bg-slate-500/5 border-slate-200 hover:border-slate-500/40',
    physical: 'bg-green-500/5 border-green-200 hover:border-green-500/40',
    mental: 'bg-blue-500/5 border-blue-200 hover:border-blue-500/40',
    discipline: 'bg-orange-500/5 border-orange-200 hover:border-orange-500/40',
};

const categoryBadgeColors: Record<string, string> = {
    spiritual: 'bg-slate-100 text-slate-700 border-slate-200',
    physical: 'bg-green-100 text-green-700 border-green-200',
    mental: 'bg-blue-100 text-blue-700 border-blue-200',
    discipline: 'bg-orange-100 text-orange-700 border-orange-200',
};

interface HabitCardProps {
    habit: DailyHabit;
    isCompleted: boolean;
    onToggle: (habitId: string) => void;
    onDelete?: (habitId: string) => void;
    disabled?: boolean;
}

export function HabitCard({ habit, isCompleted, onToggle, onDelete, disabled }: HabitCardProps) {
    // Dynamically get icon
    const IconComponent = (LucideIcons[habit.icon as keyof typeof LucideIcons] as React.ElementType) || LucideIcons.Heart;

    return (
        <motion.div
            whileHover={{ scale: disabled ? 1 : 1.02, y: disabled ? 0 : -2 }}
            whileTap={{ scale: disabled ? 1 : 0.98 }}
            onClick={() => !disabled && onToggle(habit.id)}
            className={`
        relative rounded-3xl cursor-pointer transition-all duration-300
        border overflow-hidden group
        ${isCompleted
                    ? 'bg-emerald-50 border-emerald-200'
                    : categoryBgColors[habit.category]
                }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'shadow-sm hover:shadow-md'}
      `}
        >
            {/* Delete Button - Absolute positioned top-right, visible on hover */}
            {onDelete && !disabled && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Are you sure you want to delete this habit?')) {
                            onDelete(habit.id);
                        }
                    }}
                    className="
                        absolute top-3 right-3 p-1.5 rounded-lg
                        text-slate-400 hover:text-red-500 hover:bg-red-50
                        opacity-0 group-hover:opacity-100 transition-all duration-200
                        z-10
                    "
                >
                    <LucideIcons.Trash2 className="w-4 h-4" />
                </button>
            )}

            {/* Main content */}
            <div className="p-5">
                {/* Top row: Icon and Checkbox */}
                <div className="flex items-start justify-between mb-4">
                    {/* Icon container */}
                    <div className={`
            w-12 h-12 rounded-2xl
            flex items-center justify-center
            bg-gradient-to-br ${categoryGradients[habit.category]}
            shadow-lg shadow-black/5
            group-hover:scale-105 transition-transform duration-300
          `}>
                        <IconComponent className="w-6 h-6 text-white" />
                    </div>

                    {/* Checkbox */}
                    <div className={`
            w-8 h-8 rounded-full 
            flex items-center justify-center
            border-2 transition-all duration-300
            ${isCompleted
                            ? 'border-emerald-500 bg-emerald-500 shadow-lg shadow-emerald-500/30 scale-110'
                            : 'border-slate-200 group-hover:border-slate-300'
                        }
          `}>
                        {isCompleted && <LucideIcons.Check className="w-5 h-5 text-white" strokeWidth={3} />}
                    </div>
                </div>

                {/* Title */}
                <h3 className={`
          font-bold text-lg leading-tight mb-3
          ${isCompleted ? 'text-emerald-700 line-through decoration-2 opacity-75' : 'text-slate-900'}
          line-clamp-2
        `}>
                    {habit.name}
                </h3>

                {/* Category badge */}
                <span className={`
          inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider
          border ${categoryBadgeColors[habit.category]}
        `}>
                    {habit.category}
                </span>
            </div>
        </motion.div>
    );
}
