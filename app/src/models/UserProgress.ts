import mongoose, { Document, Model, Schema } from 'mongoose';

// ============ HABIT INTERFACES ============
export interface IHabit {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: string;
    color: string;
    streak: number;
    completed: boolean;
    lastCompleted?: Date;
    isCustom: boolean;
    createdAt: Date;
}

// ============ DAILY PROGRESS ============
export interface IDailyProgress {
    date: string;  // "2026-01-06"
    habits: Record<string, boolean>;  // habitId -> completed
    score: number;
    streakBroken: boolean;
    notes?: string;
}

// ============ PUNISHMENT ============
export interface IPunishment {
    id: string;
    name: string;
    description: string;
    triggeredDate: string;
    habitBroken: string;
    severity: 'minor' | 'moderate' | 'severe';
    completed: boolean;
    completedDate?: string;
}

// ============ REWARD ============
export interface IReward {
    id: string;
    name: string;
    description: string;
    icon: string;
    daysRequired: number;
    unlocked: boolean;
    unlockedDate?: string;
}

// ============ STATS ============
export interface IStats {
    currentStreak: number;
    longestStreak: number;
    totalDaysTracked: number;
    perfectDays: number;
    totalScore: number;
    averageScore: number;
    rewardsUnlocked: number;
    punishmentsCount: number;
    startDate: string;
}

// ============ MAIN USER PROGRESS ============
export interface IUserProgress extends Document {
    userId: string;

    // Habits (both default and custom)
    habits: IHabit[];

    // Daily progress - keyed by date string
    dailyProgress: Map<string, IDailyProgress>;

    // Punishments
    punishments: IPunishment[];

    // Rewards
    rewards: IReward[];

    // Stats
    stats: IStats;

    // Timestamps
    createdAt: Date;
    updatedAt: Date;
}

// ============ SCHEMAS ============

const HabitSchema = new Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    icon: { type: String, required: true },
    category: { type: String, default: 'health' },
    color: { type: String, default: '#6366f1' },
    streak: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
    lastCompleted: { type: Date },
    isCustom: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
}, { _id: false });

const DailyProgressSchema = new Schema({
    date: { type: String, required: true },
    habits: { type: Map, of: Boolean, default: new Map() },
    score: { type: Number, default: 0 },
    streakBroken: { type: Boolean, default: false },
    notes: { type: String, default: '' },
}, { _id: false });

const PunishmentSchema = new Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    triggeredDate: { type: String, required: true },
    habitBroken: { type: String, required: true },
    severity: { type: String, enum: ['minor', 'moderate', 'severe'], default: 'minor' },
    completed: { type: Boolean, default: false },
    completedDate: { type: String },
}, { _id: false });

const RewardSchema = new Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    icon: { type: String, required: true },
    daysRequired: { type: Number, required: true },
    unlocked: { type: Boolean, default: false },
    unlockedDate: { type: String },
}, { _id: false });

const StatsSchema = new Schema({
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    totalDaysTracked: { type: Number, default: 0 },
    perfectDays: { type: Number, default: 0 },
    totalScore: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    rewardsUnlocked: { type: Number, default: 0 },
    punishmentsCount: { type: Number, default: 0 },
    startDate: { type: String, default: '' },
}, { _id: false });

// ============ MAIN SCHEMA ============

const UserProgressSchema = new Schema<IUserProgress>(
    {
        userId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        habits: {
            type: [HabitSchema],
            default: [],
        },
        dailyProgress: {
            type: Map,
            of: DailyProgressSchema,
            default: new Map(),
        },
        punishments: {
            type: [PunishmentSchema],
            default: [],
        },
        rewards: {
            type: [RewardSchema],
            default: [],
        },
        stats: {
            type: StatsSchema,
            default: {
                currentStreak: 0,
                longestStreak: 0,
                totalDaysTracked: 0,
                perfectDays: 0,
                totalScore: 0,
                averageScore: 0,
                rewardsUnlocked: 0,
                punishmentsCount: 0,
                startDate: '',
            },
        },
    },
    {
        timestamps: true,
    }
);

// Prevent model recompilation in development
const UserProgress: Model<IUserProgress> =
    mongoose.models.UserProgress || mongoose.model<IUserProgress>('UserProgress', UserProgressSchema);

export default UserProgress;
