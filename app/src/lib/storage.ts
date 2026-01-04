import { DailyProgress, UserStats, Reward, Punishment } from '@/types';
import { DEFAULT_HABITS, REWARDS } from './constants';
import { format, parseISO, differenceInDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isWithinInterval } from 'date-fns';

const STORAGE_KEYS = {
    PROGRESS: 'kalyan_progress',
    STATS: 'kalyan_stats',
    REWARDS: 'kalyan_rewards',
    PUNISHMENTS: 'kalyan_punishments',
    FIRST_LAUNCH: 'kalyan_first_launch',
};

// Get all progress data
export function getAllProgress(): Record<string, DailyProgress> {
    if (typeof window === 'undefined') return {};
    const data = localStorage.getItem(STORAGE_KEYS.PROGRESS);
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
    const allProgress = getAllProgress();
    allProgress[date] = progress;
    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(allProgress));
    updateStats();
    checkRewards();
}

// Calculate score for a day based on completed habits
export function calculateDailyScore(habits: Record<string, boolean>): number {
    const totalHabits = DEFAULT_HABITS.length;
    const completedHabits = Object.values(habits).filter(Boolean).length;
    return Math.round((completedHabits / totalHabits) * 100);
}

// Get user stats
export function getStats(): UserStats {
    if (typeof window === 'undefined') {
        return getDefaultStats();
    }
    const data = localStorage.getItem(STORAGE_KEYS.STATS);
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

    if (dates.length === 0) {
        localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(getDefaultStats()));
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

    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
}

// Get rewards
export function getRewards(): Reward[] {
    if (typeof window === 'undefined') return REWARDS;
    const data = localStorage.getItem(STORAGE_KEYS.REWARDS);
    return data ? JSON.parse(data) : REWARDS;
}

// Check and unlock rewards
export function checkRewards(): Reward[] {
    if (typeof window === 'undefined') return REWARDS;

    const stats = getStats();
    const rewards = getRewards();
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
        localStorage.setItem(STORAGE_KEYS.REWARDS, JSON.stringify(rewards));
    }

    return rewards;
}

// Get punishments
export function getPunishments(): Punishment[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.PUNISHMENTS);
    return data ? JSON.parse(data) : [];
}

// Add punishment
export function addPunishment(punishment: Punishment): void {
    if (typeof window === 'undefined') return;
    const punishments = getPunishments();
    punishments.push(punishment);
    localStorage.setItem(STORAGE_KEYS.PUNISHMENTS, JSON.stringify(punishments));
    updateStats();
}

// Complete punishment
export function completePunishment(id: string): void {
    if (typeof window === 'undefined') return;
    const punishments = getPunishments();
    const updatedPunishments = punishments.map(p =>
        p.id === id ? { ...p, completed: true } : p
    );
    localStorage.setItem(STORAGE_KEYS.PUNISHMENTS, JSON.stringify(updatedPunishments));
    updateStats();
}

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
        totalHabits: daysWithData * DEFAULT_HABITS.length,
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

    DEFAULT_HABITS.forEach(habit => {
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

// Check if first launch
export function isFirstLaunch(): boolean {
    if (typeof window === 'undefined') return true;
    return !localStorage.getItem(STORAGE_KEYS.FIRST_LAUNCH);
}

// Mark as launched
export function markAsLaunched(): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.FIRST_LAUNCH, 'true');
}

// Clear all data (for testing)
export function clearAllData(): void {
    if (typeof window === 'undefined') return;
    Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
    });
}
