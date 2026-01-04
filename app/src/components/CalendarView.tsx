'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { format, addDays, subDays, startOfWeek, endOfWeek, isSameDay, isToday, isFuture } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DailyProgress } from '@/types';

interface CalendarViewProps {
    progress: Record<string, DailyProgress>;
    selectedDate: Date;
    onSelectDate: (date: Date) => void;
}

export function CalendarView({ progress, selectedDate, onSelectDate }: CalendarViewProps) {
    const [currentWeekStart, setCurrentWeekStart] = useState(() =>
        startOfWeek(selectedDate, { weekStartsOn: 1 })
    );

    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const navigateWeek = (direction: 'prev' | 'next') => {
        setCurrentWeekStart(prev =>
            direction === 'prev' ? subDays(prev, 7) : addDays(prev, 7)
        );
    };

    const getDateStatus = (date: Date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const dayProgress = progress[dateStr];

        if (!dayProgress) return 'none';
        if (dayProgress.score === 100) return 'perfect';
        if (dayProgress.score >= 80) return 'good';
        if (dayProgress.score >= 50) return 'partial';
        return 'poor';
    };

    const statusColors = {
        none: 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700',
        perfect: 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-700',
        good: 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700',
        partial: 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700',
        poor: 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700',
    };

    return (
        <div className="glass-card p-4 sm:p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 sm:mb-6">
                <button
                    onClick={() => navigateWeek('prev')}
                    className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                    <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </button>

                <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white text-center">
                    {format(currentWeekStart, 'MMM d')} - {format(endOfWeek(currentWeekStart, { weekStartsOn: 1 }), 'MMM d, yyyy')}
                </h3>

                <button
                    onClick={() => navigateWeek('next')}
                    className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                    <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </button>
            </div>

            {/* Week days grid */}
            <div className="grid grid-cols-7 gap-2">
                {/* Day names */}
                {dayNames.map(day => (
                    <div key={day} className="text-center text-xs text-slate-500 dark:text-slate-400 pb-2">
                        {day}
                    </div>
                ))}

                {/* Day buttons */}
                {weekDays.map(date => {
                    const status = getDateStatus(date);
                    const isSelected = isSameDay(date, selectedDate);
                    const dateIsFuture = isFuture(date) && !isToday(date);
                    const dateProgress = progress[format(date, 'yyyy-MM-dd')];

                    return (
                        <motion.button
                            key={date.toISOString()}
                            whileHover={{ scale: dateIsFuture ? 1 : 1.05 }}
                            whileTap={{ scale: dateIsFuture ? 1 : 0.95 }}
                            onClick={() => !dateIsFuture && onSelectDate(date)}
                            disabled={dateIsFuture}
                            className={`
                relative aspect-square rounded-lg border transition-all
                flex flex-col items-center justify-center p-1
                ${statusColors[status]}
                ${isSelected ? 'ring-2 ring-purple-500 ring-offset-1 ring-offset-white dark:ring-offset-slate-900' : ''}
                ${dateIsFuture ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer hover:border-slate-300 dark:hover:border-slate-600'}
                ${isToday(date) && !isSelected ? 'ring-2 ring-orange-500' : ''}
              `}
                        >
                            <span className={`
                text-sm sm:text-base font-bold
                ${status === 'none' ? 'text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'}
              `}>
                                {format(date, 'd')}
                            </span>

                            {dateProgress && (
                                <span className="text-[10px] sm:text-xs font-medium text-slate-600">
                                    {dateProgress.score}%
                                </span>
                            )}
                        </motion.button>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="mt-4 sm:mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                    {[
                        { status: 'perfect', label: '100%', color: 'bg-emerald-500' },
                        { status: 'good', label: '80%+', color: 'bg-blue-500' },
                        { status: 'partial', label: '50%+', color: 'bg-yellow-500' },
                        { status: 'poor', label: '<50%', color: 'bg-red-500' },
                    ].map(({ status, label, color }) => (
                        <div key={status} className="flex items-center gap-1.5">
                            <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
                            <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
