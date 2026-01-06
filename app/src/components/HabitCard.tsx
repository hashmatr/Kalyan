'use client';

import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { DailyHabit } from '@/types';

const categoryGradients: Record<string, string> = {
    spiritual: 'from-purple-500 to-indigo-600',
    physical: 'from-green-500 to-emerald-600',
    mental: 'from-blue-500 to-cyan-600',
    discipline: 'from-orange-500 to-red-600',
};

const categoryBgColors: Record<string, string> = {
    spiritual: 'bg-purple-500/5 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/20 hover:border-purple-500/40',
    physical: 'bg-green-500/5 dark:bg-green-500/10 border-green-200 dark:border-green-500/20 hover:border-green-500/40',
    mental: 'bg-blue-500/5 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20 hover:border-blue-500/40',
    discipline: 'bg-orange-500/5 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/20 hover:border-orange-500/40',
};

const categoryBadgeColors: Record<string, string> = {
    spiritual: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300 border-purple-200 dark:border-purple-500/30',
    physical: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300 border-green-200 dark:border-green-500/30',
    mental: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 border-blue-200 dark:border-blue-500/30',
    discipline: 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300 border-orange-200 dark:border-orange-500/30',
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
        relative rounded-2xl cursor-pointer transition-all duration-300
        border overflow-hidden group
        ${isCompleted
                    ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-500/30'
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
                        text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20
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
            w-12 h-12 rounded-xl
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
                            : 'border-slate-200 dark:border-slate-700 group-hover:border-slate-300 dark:group-hover:border-slate-600'
                        }
          `}>
                        {isCompleted && <LucideIcons.Check className="w-5 h-5 text-white" strokeWidth={3} />}
                    </div>
                </div>

                {/* Title */}
                <h3 className={`
          font-bold text-lg leading-tight mb-3
          ${isCompleted ? 'text-emerald-700 dark:text-emerald-400 line-through decoration-2 opacity-75' : 'text-slate-900 dark:text-white'}
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
