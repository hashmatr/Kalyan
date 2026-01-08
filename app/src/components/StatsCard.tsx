'use client';

import { motion } from 'framer-motion';
import { Flame, Trophy, Target, Zap, Calendar, TrendingUp } from 'lucide-react';
import { UserStats } from '@/types';

interface StatsCardProps {
    stats: UserStats;
}

export function StatsCard({ stats }: StatsCardProps) {
    const statItems = [
        {
            icon: Flame,
            label: 'Current Streak',
            value: stats.currentStreak,
            suffix: 'days',
            color: 'from-orange-500 to-red-600',
            textGradient: 'text-gradient-beast',
        },
        {
            icon: Trophy,
            label: 'Longest Streak',
            value: stats.longestStreak,
            suffix: 'days',
            color: 'from-yellow-500 to-amber-600',
            textGradient: 'text-gradient-orange',
        },
        {
            icon: Target,
            label: 'Perfect Days',
            value: stats.perfectDays,
            suffix: '',
            color: 'from-emerald-500 to-green-600',
            textGradient: 'text-gradient-green',
        },
        {
            icon: TrendingUp,
            label: 'Average Score',
            value: stats.averageScore,
            suffix: '%',
            color: 'from-blue-500 to-cyan-600',
            textGradient: 'text-gradient-blue',
        },
        {
            icon: Calendar,
            label: 'Days Tracked',
            value: stats.totalDaysTracked,
            suffix: '',
            color: 'from-slate-700 to-zinc-900',
            textGradient: 'text-gradient-purple',
        },
        {
            icon: Zap,
            label: 'Rewards',
            value: stats.rewardsUnlocked,
            suffix: '',
            color: 'from-pink-500 to-rose-600',
            textGradient: 'text-gradient-pink',
        },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4 lg:gap-5" style={{ marginTop: '3rem', marginBottom: '3rem' }}>
            {statItems.map((item, index) => (
                <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="glass-card rounded-3xl p-5 lg:p-6"
                >
                    <div className={`
            inline-flex p-2.5 lg:p-3 rounded-2xl mb-4
            bg-gradient-to-br ${item.color}
          `}>
                        <item.icon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                    </div>

                    <div>
                        <div className="flex items-baseline gap-1.5">
                            <span className={`text-2xl lg:text-3xl font-bold ${item.textGradient}`}>
                                {item.value}
                            </span>
                            {item.suffix && (
                                <span className="text-sm text-slate-500">{item.suffix}</span>
                            )}
                        </div>
                        <p className="text-sm text-slate-400 mt-1.5">{item.label}</p>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
