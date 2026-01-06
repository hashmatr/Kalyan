import { DailyProgress, UserStats, Reward, Punishment } from '@/types';
import { REWARDS, PHYSICAL_PUNISHMENTS, PUNISHMENTS } from './constants';
import { format, parseISO, differenceInDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isWithinInterval } from 'date-fns';

// Get current user ID from localStorage
function getCurrentUserId(): string {
    if (typeof window === 'undefined') return 'anonymous';

    try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            return user.id || user._id || 'anonymous';
        }
    } catch (e) {
        console.error('Failed to get user ID');
    }
    return 'anonymous';
}

// Generate user-specific storage key
function getUserStorageKey(baseKey: string): string {
    const userId = getCurrentUserId();
    return `${baseKey}_${userId}`;
}

const BASE_STORAGE_KEYS = {
    PROGRESS: 'kalyan_progress',
    STATS: 'kalyan_stats',
    REWARDS: 'kalyan_rewards',
    PUNISHMENTS: 'kalyan_punishments',
    FIRST_LAUNCH: 'kalyan_first_launch',
    CUSTOM_HABITS: 'kalyan_custom_habits',
};

// Get all progress data for current user
export function getAllProgress(): Record<string, DailyProgress> {
    if (typeof window === 'undefined') return {};
    const key = getUserStorageKey(BASE_STORAGE_KEYS.PROGRESS);
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : {};
}

// Get progress for a specific date
export function getProgressForDate(date: string): DailyProgress | null {
    const allProgress = getAllProgress();
    return allProgress[date] || null;
}

// Save progress for a date
export function saveProgress(date: string, progress: DailyProgress): void {
    if (typeof window === 'undefined') return;
    const key = getUserStorageKey(BASE_STORAGE_KEYS.PROGRESS);
    const allProgress = getAllProgress();
    allProgress[date] = progress;
    localStorage.setItem(key, JSON.stringify(allProgress));
    updateStats();
    checkRewards();
}

// Calculate score for a day based on completed habits
export function calculateDailyScore(habits: Record<string, boolean>): number {
    const totalHabits = Object.keys(habits).length;
    if (totalHabits === 0) return 0;
    const completedHabits = Object.values(habits).filter(Boolean).length;
    return Math.round((completedHabits / totalHabits) * 100);
}

// Get user stats
export function getStats(): UserStats {
    if (typeof window === 'undefined') {
        return getDefaultStats();
    }
    const key = getUserStorageKey(BASE_STORAGE_KEYS.STATS);
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : getDefaultStats();
}

function getDefaultStats(): UserStats {
    return {
        currentStreak: 0,
        longestStreak: 0,
        totalDaysTracked: 0,
        perfectDays: 0,
        totalScore: 0,
        averageScore: 0,
        rewardsUnlocked: 0,
        punishments: 0,
        startDate: format(new Date(), 'yyyy-MM-dd'),
    };
}

// Update stats based on all progress
export function updateStats(): void {
    if (typeof window === 'undefined') return;

    const allProgress = getAllProgress();
    const dates = Object.keys(allProgress).sort();
    const key = getUserStorageKey(BASE_STORAGE_KEYS.STATS);

    if (dates.length === 0) {
        localStorage.setItem(key, JSON.stringify(getDefaultStats()));
        return;
    }

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let perfectDays = 0;
    let totalScore = 0;

    const today = format(new Date(), 'yyyy-MM-dd');
    const sortedDates = dates.sort();

    // Calculate streaks and scores
    for (let i = 0; i < sortedDates.length; i++) {
        const progress = allProgress[sortedDates[i]];
        totalScore += progress.score;

        if (progress.score === 100) {
            perfectDays++;
        }

        // Check for streak
        if (progress.score >= 80) { // 80% completion maintains streak
            tempStreak++;
            longestStreak = Math.max(longestStreak, tempStreak);
        } else {
            tempStreak = 0;
        }
    }

    // Calculate current streak (counting backwards from today)
    currentStreak = 0;
    const todayDate = new Date();
    for (let i = 0; i <= 365; i++) {
        const checkDate = format(new Date(todayDate.getTime() - i * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
        const progress = allProgress[checkDate];

        if (progress && progress.score >= 80) {
            currentStreak++;
        } else if (i > 0) { // Allow today to be incomplete
            break;
        }
    }

    const rewards = getRewards();
    const punishments = getPunishments();

    const stats: UserStats = {
        currentStreak,
        longestStreak,
        totalDaysTracked: dates.length,
        perfectDays,
        totalScore,
        averageScore: Math.round(totalScore / dates.length),
        rewardsUnlocked: rewards.filter(r => r.unlocked).length,
        punishments: punishments.length,
        startDate: sortedDates[0],
    };

    localStorage.setItem(key, JSON.stringify(stats));
}

// Get rewards for current user
export function getRewards(): Reward[] {
    if (typeof window === 'undefined') return REWARDS;
    const key = getUserStorageKey(BASE_STORAGE_KEYS.REWARDS);
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : REWARDS.map(r => ({ ...r })); // Return fresh copy
}

// Check and unlock rewards
export function checkRewards(): Reward[] {
    if (typeof window === 'undefined') return REWARDS;

    const stats = getStats();
    const rewards = getRewards();
    const key = getUserStorageKey(BASE_STORAGE_KEYS.REWARDS);
    let updated = false;

    rewards.forEach((reward, index) => {
        if (!reward.unlocked && stats.currentStreak >= reward.daysRequired) {
            rewards[index] = {
                ...reward,
                unlocked: true,
                unlockedDate: format(new Date(), 'yyyy-MM-dd'),
            };
            updated = true;
        }
    });

    if (updated) {
        localStorage.setItem(key, JSON.stringify(rewards));
    }

    return rewards;
}

// Get punishments for current user
export function getPunishments(): Punishment[] {
    if (typeof window === 'undefined') return [];
    const key = getUserStorageKey(BASE_STORAGE_KEYS.PUNISHMENTS);
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
}

// Add punishment
export function addPunishment(punishment: Punishment): void {
    if (typeof window === 'undefined') return;
    const key = getUserStorageKey(BASE_STORAGE_KEYS.PUNISHMENTS);
    const punishments = getPunishments();
    punishments.push(punishment);
    localStorage.setItem(key, JSON.stringify(punishments));
    updateStats();
}

// Complete punishment
// Toggle punishment completion status
export function togglePunishment(id: string): void {
    if (typeof window === 'undefined') return;
    const key = getUserStorageKey(BASE_STORAGE_KEYS.PUNISHMENTS);
    const punishments = getPunishments();
    const updatedPunishments = punishments.map(p =>
        p.id === id ? { ...p, completed: !p.completed } : p
    );
    localStorage.setItem(key, JSON.stringify(updatedPunishments));
    updateStats();
}

// Deprecated alias for backward compatibility
export const completePunishment = togglePunishment;

// Get weekly stats
export function getWeeklyStats(date: Date) {
    const allProgress = getAllProgress();
    const weekStart = startOfWeek(date, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

    let totalScore = 0;
    let completedHabits = 0;
    let perfectDays = 0;
    let daysWithData = 0;

    days.forEach(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const progress = allProgress[dateStr];
        if (progress) {
            daysWithData++;
            totalScore += progress.score;
            completedHabits += Object.values(progress.habits).filter(Boolean).length;
            if (progress.score === 100) perfectDays++;
        }
    });

    return {
        weekStart: format(weekStart, 'yyyy-MM-dd'),
        weekEnd: format(weekEnd, 'yyyy-MM-dd'),
        averageScore: daysWithData > 0 ? Math.round(totalScore / daysWithData) : 0,
        completedHabits,
        totalHabits: completedHabits, // Use actual completed habits count
        perfectDays,
        daysWithData,
    };
}

// Get monthly stats
export function getMonthlyStats(date: Date) {
    const allProgress = getAllProgress();
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    let totalScore = 0;
    let perfectDays = 0;
    let daysWithData = 0;
    const habitsCompletion: Record<string, number> = {};

    // Initialize from custom habits
    const allHabits = getCustomHabits();
    allHabits.forEach(habit => {
        habitsCompletion[habit.id] = 0;
    });

    days.forEach(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const progress = allProgress[dateStr];
        if (progress) {
            daysWithData++;
            totalScore += progress.score;
            if (progress.score === 100) perfectDays++;

            Object.entries(progress.habits).forEach(([habitId, completed]) => {
                if (completed) {
                    habitsCompletion[habitId] = (habitsCompletion[habitId] || 0) + 1;
                }
            });
        }
    });

    return {
        month: format(date, 'yyyy-MM'),
        averageScore: daysWithData > 0 ? Math.round(totalScore / daysWithData) : 0,
        totalDays: daysWithData,
        perfectDays,
        habitsCompletion,
        daysInMonth: days.length,
    };
}

// Get yearly stats
export function getYearlyStats(year: number) {
    const allProgress = getAllProgress();
    const monthlyScores: number[] = [];
    let totalScore = 0;
    let totalDays = 0;
    let perfectDays = 0;

    for (let month = 0; month < 12; month++) {
        const date = new Date(year, month, 1);
        const stats = getMonthlyStats(date);
        monthlyScores.push(stats.averageScore);
        totalScore += stats.averageScore * stats.totalDays;
        totalDays += stats.totalDays;
        perfectDays += stats.perfectDays;
    }

    const rewards = getRewards().filter(r => {
        if (!r.unlockedDate) return false;
        return parseISO(r.unlockedDate).getFullYear() === year;
    });

    return {
        year,
        averageScore: totalDays > 0 ? Math.round(totalScore / totalDays) : 0,
        totalDays,
        perfectDays,
        monthlyScores,
        rewardsEarned: rewards.length,
    };
}

// Check if first launch for current user
export function isFirstLaunch(): boolean {
    if (typeof window === 'undefined') return true;
    const key = getUserStorageKey(BASE_STORAGE_KEYS.FIRST_LAUNCH);
    return !localStorage.getItem(key);
}

// Mark as launched for current user
export function markAsLaunched(): void {
    if (typeof window === 'undefined') return;
    const key = getUserStorageKey(BASE_STORAGE_KEYS.FIRST_LAUNCH);
    localStorage.setItem(key, 'true');
}

// Clear all data for current user
export function clearAllData(): void {
    if (typeof window === 'undefined') return;
    Object.values(BASE_STORAGE_KEYS).forEach(baseKey => {
        const key = getUserStorageKey(baseKey);
        localStorage.removeItem(key);
    });
}

// Clear all data for a specific user (admin function)
export function clearUserData(userId: string): void {
    if (typeof window === 'undefined') return;
    Object.values(BASE_STORAGE_KEYS).forEach(baseKey => {
        const key = `${baseKey}_${userId}`;
        localStorage.removeItem(key);
    });
}

// ============ CUSTOM HABITS ============

import { DailyHabit } from '@/types';

// Get custom habits for current user
export function getCustomHabits(): DailyHabit[] {
    if (typeof window === 'undefined') return [];
    const key = getUserStorageKey(BASE_STORAGE_KEYS.CUSTOM_HABITS);
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
}

// Add a new custom habit
export function addCustomHabit(habit: Omit<DailyHabit, 'id' | 'completed'>): DailyHabit {
    if (typeof window === 'undefined') throw new Error('Cannot add habit on server');

    const key = getUserStorageKey(BASE_STORAGE_KEYS.CUSTOM_HABITS);
    const habits = getCustomHabits();

    const newHabit: DailyHabit = {
        ...habit,
        id: `custom_${Date.now()}`,
        completed: false,
    };

    habits.push(newHabit);
    localStorage.setItem(key, JSON.stringify(habits));

    return newHabit;
}

// Update a custom habit
export function updateCustomHabit(id: string, updates: Partial<DailyHabit>): void {
    if (typeof window === 'undefined') return;

    const key = getUserStorageKey(BASE_STORAGE_KEYS.CUSTOM_HABITS);
    const habits = getCustomHabits();
    const index = habits.findIndex(h => h.id === id);

    if (index !== -1) {
        habits[index] = { ...habits[index], ...updates };
        localStorage.setItem(key, JSON.stringify(habits));
    }
}

// Delete a custom habit
export function deleteCustomHabit(id: string): void {
    if (typeof window === 'undefined') return;

    const key = getUserStorageKey(BASE_STORAGE_KEYS.CUSTOM_HABITS);
    const habits = getCustomHabits();
    const filtered = habits.filter(h => h.id !== id);
    localStorage.setItem(key, JSON.stringify(filtered));
}

// Get all habits (only custom habits - users create their own)
export function getAllHabits(): DailyHabit[] {
    return getCustomHabits();
}

// Check for incomplete habits from previous day and assign punishments
export function checkDailyPunishments(): Punishment[] {
    if (typeof window === 'undefined') return [];

    const allProgress = getAllProgress();
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = format(yesterday, 'yyyy-MM-dd');

    // Check if we already checked for yesterday
    const lastCheckKey = getUserStorageKey('last_punishment_check');
    const lastCheck = localStorage.getItem(lastCheckKey);

    // Only run once per day
    if (lastCheck === yesterdayStr) {
        return [];
    }

    const yesterdayProgress = allProgress[yesterdayStr];
    const newPunishments: Punishment[] = [];

    const habits = getCustomHabits();
    if (habits.length === 0) return []; // No habits to punish

    const incompleteHabits: DailyHabit[] = [];

    if (yesterdayProgress) {
        // Check which habits were NOT completed
        habits.forEach(habit => {
            if (!yesterdayProgress.habits[habit.id]) {
                incompleteHabits.push(habit);
            }
        });
    } else {
        // check history to avoid punishing new users
        const hasHistory = Object.keys(allProgress).some(date => date < yesterdayStr);
        if (hasHistory) {
            // User existed but didn't open app yesterday -> All habits missed
            incompleteHabits.push(...habits);
        }
    }

    if (incompleteHabits.length > 0) {
        // Pick a random physical punishment
        const randomPunishment = PHYSICAL_PUNISHMENTS[Math.floor(Math.random() * PHYSICAL_PUNISHMENTS.length)];

        const punishment: Punishment = {
            id: `punish_${Date.now()}`,
            name: `${randomPunishment.name}`,
            description: `Penalty for missing ${incompleteHabits.length} habits yesterday. ${randomPunishment.description}`,
            icon: randomPunishment.icon,
            triggeredDate: format(today, 'yyyy-MM-dd HH:mm'),
            habitBroken: `${incompleteHabits.length} Habits`,
            severity: 'minor',
            completed: false
        };

        addPunishment(punishment);
        newPunishments.push(punishment);
    }

    // Mark today as checked
    localStorage.setItem(lastCheckKey, yesterdayStr);

    return newPunishments;
}

