'use client';

import { motion } from 'framer-motion';

interface ProgressRingProps {
    progress: number;
    size?: number;
    strokeWidth?: number;
}

export function ProgressRing({ progress, size = 120, strokeWidth = 8 }: ProgressRingProps) {
    const bgStroke = 'rgba(0, 0, 0, 0.1)';
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (progress / 100) * circumference;

    const getColor = (progress: number) => {
        if (progress >= 100) return '#10b981';
        if (progress >= 80) return '#3b82f6';
        if (progress >= 50) return '#f59e0b';
        return '#ef4444';
    };

    return (
        <div className="relative" style={{ width: size, height: size }}>
            {/* Background circle */}
            <svg className="transform -rotate-90" width={size} height={size}>
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={bgStroke}
                    strokeWidth={strokeWidth}
                    fill="none"
                />
                {/* Progress circle */}
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={getColor(progress)}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeLinecap="round"
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    style={{
                        strokeDasharray: circumference,
                    }}
                />
            </svg>

            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                    className="text-3xl font-bold text-slate-900"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    {progress}%
                </motion.span>
                <span className="text-xs text-slate-500 mt-1">Complete</span>
            </div>
        </div>
    );
}

interface ProgressBarProps {
    progress: number;
    label?: string;
    color?: string;
}

export function ProgressBar({ progress, label, color = 'from-slate-700 to-slate-900' }: ProgressBarProps) {
    return (
        <div>
            {label && (
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-slate-600">{label}</span>
                    <span className="text-sm font-semibold text-slate-900">{progress}%</span>
                </div>
            )}
            <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                <motion.div
                    className={`h-full rounded-full bg-gradient-to-r ${color}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                />
            </div>
        </div>
    );
}
