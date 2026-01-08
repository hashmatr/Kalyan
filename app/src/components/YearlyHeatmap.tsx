'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { format, eachDayOfInterval, startOfYear, endOfYear, getDay, subYears, isSameDay, isAfter } from 'date-fns';
import { DailyProgress } from '@/types';

interface YearlyHeatmapProps {
    progress: Record<string, DailyProgress>;
    year?: number;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getColorForScore(score: number | undefined): string {
    if (score === undefined || score === 0) return '#f1f5f9'; // No data - light gray
    if (score < 25) return '#fee2e2'; // Poor - light red
    if (score < 50) return '#fde68a'; // Below average - yellow
    if (score < 75) return '#bbf7d0'; // Good - light green
    if (score < 100) return '#4ade80'; // Great - green
    return '#22c55e'; // Perfect - bright green
}

function getTooltipText(date: Date, progress: DailyProgress | undefined): string {
    const dateStr = format(date, 'MMM d, yyyy');
    if (!progress) return `${dateStr}: No data`;
    return `${dateStr}: ${progress.score}% complete`;
}

export function YearlyHeatmap({ progress, year }: YearlyHeatmapProps) {
    const currentYear = year || new Date().getFullYear();
    const today = new Date();

    const { weeks, monthPositions } = useMemo(() => {
        const yearStart = startOfYear(new Date(currentYear, 0, 1));
        const yearEnd = endOfYear(new Date(currentYear, 0, 1));

        // Get all days of the year
        const allDays = eachDayOfInterval({ start: yearStart, end: yearEnd });

        // Organize into weeks (columns)
        const weeksArray: (Date | null)[][] = [];
        let currentWeek: (Date | null)[] = [];

        // Pad the first week with null values if year doesn't start on Sunday
        const firstDayOfWeek = getDay(yearStart);
        for (let i = 0; i < firstDayOfWeek; i++) {
            currentWeek.push(null);
        }

        allDays.forEach((day) => {
            currentWeek.push(day);
            if (currentWeek.length === 7) {
                weeksArray.push(currentWeek);
                currentWeek = [];
            }
        });

        // Push any remaining days
        if (currentWeek.length > 0) {
            while (currentWeek.length < 7) {
                currentWeek.push(null);
            }
            weeksArray.push(currentWeek);
        }

        // Calculate month label positions
        const monthPos: { month: string; position: number }[] = [];
        let lastMonth = -1;

        weeksArray.forEach((week, weekIndex) => {
            const firstValidDay = week.find(d => d !== null);
            if (firstValidDay) {
                const month = firstValidDay.getMonth();
                if (month !== lastMonth) {
                    monthPos.push({ month: MONTHS[month], position: weekIndex });
                    lastMonth = month;
                }
            }
        });

        return { weeks: weeksArray, monthPositions: monthPos };
    }, [currentYear]);

    const stats = useMemo(() => {
        let totalDays = 0;
        let activeDays = 0;
        let perfectDays = 0;
        let totalScore = 0;
        let currentStreak = 0;
        let longestStreak = 0;
        let tempStreak = 0;

        const yearStart = startOfYear(new Date(currentYear, 0, 1));
        const yearEnd = isAfter(endOfYear(new Date(currentYear, 0, 1)), today)
            ? today
            : endOfYear(new Date(currentYear, 0, 1));

        const allDays = eachDayOfInterval({ start: yearStart, end: yearEnd });

        allDays.forEach((day) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const dayProgress = progress[dateStr];
            totalDays++;

            if (dayProgress && dayProgress.score > 0) {
                activeDays++;
                totalScore += dayProgress.score;

                if (dayProgress.score === 100) {
                    perfectDays++;
                    tempStreak++;
                    longestStreak = Math.max(longestStreak, tempStreak);
                } else {
                    tempStreak = 0;
                }
            } else {
                tempStreak = 0;
            }
        });

        // Calculate current streak from today backwards
        for (let i = allDays.length - 1; i >= 0; i--) {
            const dateStr = format(allDays[i], 'yyyy-MM-dd');
            const dayProgress = progress[dateStr];
            if (dayProgress && dayProgress.score === 100) {
                currentStreak++;
            } else {
                break;
            }
        }

        return {
            totalDays,
            activeDays,
            perfectDays,
            averageScore: activeDays > 0 ? Math.round(totalScore / activeDays) : 0,
            currentStreak,
            longestStreak,
        };
    }, [progress, currentYear, today]);

    const cellSize = 14;
    const gap = 3;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm"
        >
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">
                        {currentYear} Activity
                    </h3>
                    <p className="text-sm text-slate-500">
                        Your habit completion throughout the year
                    </p>
                </div>

                {/* Stats */}
                <div className="flex flex-wrap gap-4">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-slate-900">{stats.activeDays}</p>
                        <p className="text-xs text-slate-500">Active Days</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-emerald-600">{stats.perfectDays}</p>
                        <p className="text-xs text-slate-500">Perfect Days</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">{stats.averageScore}%</p>
                        <p className="text-xs text-slate-500">Avg Score</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-orange-600">{stats.longestStreak}</p>
                        <p className="text-xs text-slate-500">Best Streak</p>
                    </div>
                </div>
            </div>

            {/* Heatmap */}
            <div className="overflow-x-auto">
                <div style={{ minWidth: 'fit-content' }}>
                    {/* Month labels */}
                    <div
                        className="relative h-6 mb-2"
                        style={{ marginLeft: 32 }}
                    >
                        {monthPositions.map(({ month, position }) => (
                            <div
                                key={`${month}-${position}`}
                                className="text-xs text-slate-500 absolute top-0"
                                style={{
                                    left: position * (cellSize + gap),
                                }}
                            >
                                {month}
                            </div>
                        ))}
                    </div>

                    <div className="flex">
                        {/* Day labels */}
                        <div
                            className="flex flex-col justify-between pr-2"
                            style={{ height: 7 * (cellSize + gap) - gap }}
                        >
                            {DAYS.map((day, idx) => (
                                <div
                                    key={day}
                                    className="text-xs text-slate-500"
                                    style={{
                                        height: cellSize,
                                        display: 'flex',
                                        alignItems: 'center',
                                        visibility: idx % 2 === 1 ? 'visible' : 'hidden'
                                    }}
                                >
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Grid */}
                        <div className="flex" style={{ gap }}>
                            {weeks.map((week, weekIdx) => (
                                <div
                                    key={weekIdx}
                                    className="flex flex-col"
                                    style={{ gap }}
                                >
                                    {week.map((day, dayIdx) => {
                                        if (!day) {
                                            return (
                                                <div
                                                    key={`empty-${weekIdx}-${dayIdx}`}
                                                    style={{
                                                        width: cellSize,
                                                        height: cellSize,
                                                    }}
                                                />
                                            );
                                        }

                                        const dateStr = format(day, 'yyyy-MM-dd');
                                        const dayProgress = progress[dateStr];
                                        const isFuture = isAfter(day, today);
                                        const isToday = isSameDay(day, today);

                                        return (
                                            <motion.div
                                                key={dateStr}
                                                whileHover={{ scale: 1.3 }}
                                                title={getTooltipText(day, dayProgress)}
                                                style={{
                                                    width: cellSize,
                                                    height: cellSize,
                                                    borderRadius: 3,
                                                    backgroundColor: isFuture ? '#f8fafc' : getColorForScore(dayProgress?.score),
                                                    border: isToday ? '2px solid #6366f1' : '1px solid rgba(0,0,0,0.05)',
                                                    cursor: 'pointer',
                                                }}
                                            />
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-slate-100">
                <span className="text-xs text-slate-500">Less</span>
                {[0, 25, 50, 75, 100].map((score) => (
                    <div
                        key={score}
                        style={{
                            width: cellSize,
                            height: cellSize,
                            borderRadius: 3,
                            backgroundColor: getColorForScore(score),
                            border: '1px solid rgba(0,0,0,0.05)',
                        }}
                        title={`${score}%`}
                    />
                ))}
                <span className="text-xs text-slate-500">More</span>
            </div>
        </motion.div>
    );
}
