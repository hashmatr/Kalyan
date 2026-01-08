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
        none: 'bg-white border-slate-200',
        perfect: 'bg-emerald-100 border-emerald-300',
        good: 'bg-blue-100 border-blue-300',
        partial: 'bg-yellow-100 border-yellow-300',
        poor: 'bg-red-100 border-red-300',
    };

    return (
        <div className="glass-card rounded-3xl p-4 sm:p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 sm:mb-6">
                <button
                    onClick={() => navigateWeek('prev')}
                    className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                    <ChevronLeft className="w-5 h-5 text-slate-600" />
                </button>

                <h3 className="text-sm sm:text-base font-semibold text-slate-900 text-center">
                    {format(currentWeekStart, 'MMM d')} - {format(endOfWeek(currentWeekStart, { weekStartsOn: 1 }), 'MMM d, yyyy')}
                </h3>

                <button
                    onClick={() => navigateWeek('next')}
                    className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                    <ChevronRight className="w-5 h-5 text-slate-600" />
                </button>
            </div>

            {/* Week days grid */}
            <div className="grid grid-cols-7 gap-2">
                {/* Day names */}
                {dayNames.map(day => (
                    <div key={day} className="text-center text-xs text-slate-500 pb-2">
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
                relative aspect-square rounded-xl border transition-all
                flex flex-col items-center justify-center p-1
                ${statusColors[status]}
                ${isSelected ? 'ring-2 ring-slate-900 ring-offset-1 ring-offset-white' : ''}
                ${dateIsFuture ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer hover:border-slate-300'}
                ${isToday(date) && !isSelected ? 'ring-2 ring-orange-500' : ''}
              `}
                        >
                            <span className={`
                text-sm sm:text-base font-bold
                ${status === 'none' ? 'text-slate-400' : 'text-slate-800'}
              `}>
                                {format(date, 'd')}
                            </span>
                        </motion.button>
                    );
                })}
            </div>


        </div>
    );
}
