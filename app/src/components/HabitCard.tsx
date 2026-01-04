'use client';

import { motion } from 'framer-motion';
import {
    Sunrise, Heart, Shield, Dumbbell, Code, Brain, Rocket, Apple,
    Check
} from 'lucide-react';
import { DailyHabit } from '@/types';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    Sunrise,
    Heart,
    Shield,
    Dumbbell,
    Code,
    Brain,
    Rocket,
    Apple,
};

const categoryGradients: Record<string, string> = {
    spiritual: 'from-purple-500 to-indigo-600',
    physical: 'from-green-500 to-emerald-600',
    mental: 'from-blue-500 to-cyan-600',
    discipline: 'from-orange-500 to-red-600',
};

const categoryBgColors: Record<string, string> = {
    spiritual: 'bg-purple-500/10 border-purple-500/30 hover:border-purple-500/50',
    physical: 'bg-green-500/10 border-green-500/30 hover:border-green-500/50',
    mental: 'bg-blue-500/10 border-blue-500/30 hover:border-blue-500/50',
    discipline: 'bg-orange-500/10 border-orange-500/30 hover:border-orange-500/50',
};

interface HabitCardProps {
    habit: DailyHabit;
    isCompleted: boolean;
    onToggle: (habitId: string) => void;
    disabled?: boolean;
}

export function HabitCard({ habit, isCompleted, onToggle, disabled }: HabitCardProps) {
    const IconComponent = iconMap[habit.icon] || Heart;

    return (
        <motion.div
            whileHover={{ scale: disabled ? 1 : 1.03, y: disabled ? 0 : -3 }}
            whileTap={{ scale: disabled ? 1 : 0.97 }}
            onClick={() => !disabled && onToggle(habit.id)}
            className={`
        relative rounded-xl cursor-pointer transition-all duration-300
        border-2 overflow-hidden
        ${isCompleted
                    ? 'bg-emerald-500/15 border-emerald-500/50 shadow-lg shadow-emerald-500/10'
                    : categoryBgColors[habit.category]
                }
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
        >
            {/* Top gradient bar */}
            <div className={`h-1 w-full bg-gradient-to-r ${categoryGradients[habit.category]}`} />

            {/* Main content - Compact */}
            <div className="p-3 sm:p-4">
                {/* Top row: Icon and Checkbox */}
                <div className="flex items-start justify-between mb-2 sm:mb-3">
                    {/* Icon container - Smaller */}
                    <div className={`
            w-10 h-10 sm:w-12 sm:h-12 rounded-lg 
            flex items-center justify-center
            bg-gradient-to-br ${categoryGradients[habit.category]}
            shadow-md
          `}>
                        <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>

                    {/* Checkbox - Smaller */}
                    <div className={`
            w-6 h-6 sm:w-7 sm:h-7 rounded-full 
            flex items-center justify-center
            border-2 transition-all duration-300
            ${isCompleted
                            ? 'border-emerald-500 bg-emerald-500 shadow-md shadow-emerald-500/30'
                            : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500'
                        }
          `}>
                        {isCompleted && <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" strokeWidth={3} />}
                    </div>
                </div>

                {/* Title */}
                <h3 className={`
          font-bold text-sm sm:text-base mb-1
          ${isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}
          line-clamp-2
        `}>
                    {habit.name}
                </h3>

                {/* Category badge */}
                <span className={`
          inline-block px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold uppercase tracking-wide
          bg-gradient-to-r ${categoryGradients[habit.category]} text-white
        `}>
                    {habit.category}
                </span>
            </div>
        </motion.div>
    );
}
