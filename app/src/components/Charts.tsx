'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { format, subDays, startOfMonth, eachDayOfInterval, endOfMonth } from 'date-fns';
import { DailyProgress } from '@/types';
import { DEFAULT_HABITS } from '@/lib/constants';
import { useTheme } from './ThemeContext';

interface WeeklyChartProps {
    progress: Record<string, DailyProgress>;
}

export function WeeklyChart({ progress }: WeeklyChartProps) {
    const { theme } = useTheme();
    const textColor = theme === 'dark' ? '#cbd5e1' : '#475569';
    const gridColor = theme === 'dark' ? '#334155' : '#e2e8f0';

    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(new Date(), 6 - i);
        const dateStr = format(date, 'yyyy-MM-dd');
        const dayProgress = progress[dateStr];

        return {
            day: format(date, 'EEE'),
            date: format(date, 'MMM d'),
            score: dayProgress?.score || 0,
            habits: dayProgress ? Object.values(dayProgress.habits).filter(Boolean).length : 0,
        };
    });

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm"
        >
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Weekly Progress</h3>
            <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={last7Days}>
                    <defs>
                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis
                        dataKey="day"
                        stroke="#94a3b8"
                        tick={{ fill: textColor, fontSize: 12 }}
                    />
                    <YAxis
                        stroke="#94a3b8"
                        tick={{ fill: textColor, fontSize: 12 }}
                        domain={[0, 100]}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(15,23,42,0.9)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            color: '#fff'
                        }}
                        labelFormatter={(value) => `${value}`}
                        formatter={(value: number | undefined) => [`${value ?? 0}%`, 'Score']}
                    />
                    <Area
                        type="monotone"
                        dataKey="score"
                        stroke="#10b981"
                        fillOpacity={1}
                        fill="url(#colorScore)"
                        strokeWidth={2}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </motion.div>
    );
}

interface MonthlyChartProps {
    progress: Record<string, DailyProgress>;
}

export function MonthlyChart({ progress }: MonthlyChartProps) {
    const { theme } = useTheme();
    const textColor = theme === 'dark' ? '#cbd5e1' : '#475569';
    const gridColor = theme === 'dark' ? '#334155' : '#e2e8f0';

    const currentMonth = new Date();
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const monthData = daysInMonth.map(date => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const dayProgress = progress[dateStr];

        return {
            day: format(date, 'd'),
            score: dayProgress?.score || 0,
        };
    });

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm"
        >
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                {format(currentMonth, 'MMMM yyyy')} Overview
            </h3>
            <ResponsiveContainer width="100%" height={200}>
                <BarChart data={monthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis
                        dataKey="day"
                        stroke="#94a3b8"
                        tick={{ fill: textColor, fontSize: 10 }}
                        interval={2}
                    />
                    <YAxis
                        stroke="#94a3b8"
                        tick={{ fill: textColor, fontSize: 12 }}
                        domain={[0, 100]}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(15,23,42,0.9)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            color: '#fff'
                        }}
                        labelFormatter={(value) => `Day ${value}`}
                        formatter={(value: number | undefined) => [`${value ?? 0}%`, 'Score']}
                    />
                    <Bar
                        dataKey="score"
                        fill="#6366f1"
                        radius={[4, 4, 0, 0]}
                    />
                </BarChart>
            </ResponsiveContainer>
        </motion.div>
    );
}

interface HabitsPieChartProps {
    progress: Record<string, DailyProgress>;
}

export function HabitsPieChart({ progress }: HabitsPieChartProps) {
    // Calculate completion rate for each habit over time
    const habitStats = DEFAULT_HABITS.map(habit => {
        const totalDays = Object.keys(progress).length;
        const completedDays = Object.values(progress).filter(
            p => p.habits[habit.id]
        ).length;

        return {
            name: habit.name,
            value: totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0,
        };
    });

    const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm"
        >
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Habit Completion Rates</h3>
            <div className="flex flex-col lg:flex-row items-center gap-6">
                <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                        <Pie
                            data={habitStats}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                        >
                            {habitStats.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(15,23,42,0.9)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '8px',
                                color: '#fff'
                            }}
                            formatter={(value: number | undefined) => [`${value ?? 0}%`, 'Completion']}
                        />
                    </PieChart>
                </ResponsiveContainer>

                <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                    {habitStats.map((habit, index) => (
                        <div key={habit.name} className="flex items-center gap-2">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span className="text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                {habit.name.split(' ').slice(0, 2).join(' ')}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}

interface YearlyChartProps {
    monthlyScores: number[];
    year: number;
}

export function YearlyChart({ monthlyScores, year }: YearlyChartProps) {
    const { theme } = useTheme();
    const textColor = theme === 'dark' ? '#cbd5e1' : '#475569';
    const gridColor = theme === 'dark' ? '#334155' : '#e2e8f0';

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const data = months.map((month, index) => ({
        month,
        score: monthlyScores[index] || 0,
    }));

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm"
        >
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">{year} Performance</h3>
            <ResponsiveContainer width="100%" height={200}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis
                        dataKey="month"
                        stroke="#94a3b8"
                        tick={{ fill: textColor, fontSize: 12 }}
                    />
                    <YAxis
                        stroke="#94a3b8"
                        tick={{ fill: textColor, fontSize: 12 }}
                        domain={[0, 100]}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(15,23,42,0.9)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            color: '#fff'
                        }}
                        formatter={(value: number | undefined) => [`${value ?? 0}%`, 'Avg Score']}
                    />
                    <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#f59e0b"
                        strokeWidth={3}
                        dot={{ fill: '#f59e0b', strokeWidth: 2 }}
                        activeDot={{ r: 6, fill: '#f59e0b' }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </motion.div>
    );
}
