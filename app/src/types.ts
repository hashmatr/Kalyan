// Type definitions for the Beast Mode Progress Tracker

export type HabitCategory = 'spiritual' | 'physical' | 'mental' | 'discipline';

export interface DailyHabit {
    id: string;
    name: string;
    description: string;
    icon: string;
    completed: boolean;
    category: HabitCategory;
}

export type RewardTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'legendary';

export interface Reward {
    id: string;
    name: string;
    description: string;
    daysRequired: number;
    icon: string;
    unlocked: boolean;
    unlockedDate?: string;
    tier: RewardTier;
}

export interface TierStyle {
    bg: string;
    text: string;
    border: string;
    glow: string;
}

export type TierColors = Record<RewardTier, TierStyle>;

export interface DayData {
    date: string;
    completed: boolean;
    habitsCompleted: number;
    totalHabits: number;
}

export interface UserStats {
    currentStreak: number;
    longestStreak: number;
    totalDaysTracked: number;
    perfectDays: number;
    totalScore: number;
    averageScore: number;
    rewardsUnlocked: number;
    punishments: number;
    startDate: string;
}

// Missing types added below

export interface DailyProgress {
    date: string;
    habits: Record<string, boolean>;
    score: number;
    streakBroken: boolean;
}

export type ViewMode = 'daily' | 'weekly' | 'monthly' | 'yearly';

export type PunishmentSeverity = 'warning' | 'minor' | 'major' | 'critical';

export interface Punishment {
    id: string;
    name: string;
    description: string;
    triggeredDate: string;
    habitBroken: string;
    severity: PunishmentSeverity;
    completed?: boolean;
    icon?: string;
}

// Re-export User type from auth library
export type { User } from '@/lib/auth';
