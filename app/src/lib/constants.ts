import { DailyHabit, Reward, PunishmentSeverity, TierColors } from '@/types';

// Empty by default - users create their own personal habits
export const DEFAULT_HABITS: DailyHabit[] = [];

export const REWARDS: Reward[] = [
    // Bronze Tier (7-14 days)
    {
        id: 'warrior-awakening',
        name: 'Warrior Awakening',
        description: 'Complete 7 consecutive days. Your journey has begun!',
        daysRequired: 7,
        icon: '⚔️',
        unlocked: false,
        tier: 'bronze',
    },
    {
        id: 'discipline-initiate',
        name: 'Discipline Initiate',
        description: '10 days of consistency. The habit is forming.',
        daysRequired: 10,
        icon: '🛡️',
        unlocked: false,
        tier: 'bronze',
    },

    // Silver Tier (14-30 days)
    {
        id: 'iron-will',
        name: 'Iron Will',
        description: '14 days strong. Your willpower is hardening.',
        daysRequired: 14,
        icon: '🔥',
        unlocked: false,
        tier: 'silver',
    },
    {
        id: 'habit-forger',
        name: 'Habit Forger',
        description: '20 days of excellence. Habits are being forged.',
        daysRequired: 20,
        icon: '⚒️',
        unlocked: false,
        tier: 'silver',
    },

    // Gold Tier (30-60 days)
    {
        id: 'beast-mode-activated',
        name: 'Beast Mode Activated',
        description: '30 days of pure discipline. BEAST MODE UNLOCKED!',
        daysRequired: 30,
        icon: '🦁',
        unlocked: false,
        tier: 'gold',
    },
    {
        id: 'unstoppable-force',
        name: 'Unstoppable Force',
        description: '45 days. Nothing can stop you now.',
        daysRequired: 45,
        icon: '💪',
        unlocked: false,
        tier: 'gold',
    },

    // Platinum Tier (60-90 days)
    {
        id: 'mental-fortress',
        name: 'Mental Fortress',
        description: '60 days. Your mind is an impenetrable fortress.',
        daysRequired: 60,
        icon: '🏰',
        unlocked: false,
        tier: 'platinum',
    },
    {
        id: 'elite-performer',
        name: 'Elite Performer',
        description: '75 days of elite performance.',
        daysRequired: 75,
        icon: '👑',
        unlocked: false,
        tier: 'platinum',
    },

    // Diamond Tier (90-180 days)
    {
        id: 'diamond-discipline',
        name: 'Diamond Discipline',
        description: '90 days. Your discipline is unbreakable like diamond.',
        daysRequired: 90,
        icon: '💎',
        unlocked: false,
        tier: 'diamond',
    },
    {
        id: 'centurion',
        name: 'Centurion',
        description: '100 days of excellence. A true Centurion.',
        daysRequired: 100,
        icon: '🎖️',
        unlocked: false,
        tier: 'diamond',
    },
    {
        id: 'half-year-hero',
        name: 'Half-Year Hero',
        description: '180 days. Six months of transformation.',
        daysRequired: 180,
        icon: '🏆',
        unlocked: false,
        tier: 'diamond',
    },

    // Legendary Tier (365+ days)
    {
        id: 'year-of-transformation',
        name: 'Year of Transformation',
        description: '365 days. One full year of dedicated growth.',
        daysRequired: 365,
        icon: '🌟',
        unlocked: false,
        tier: 'legendary',
    },
    {
        id: 'legendary-warrior',
        name: 'Legendary Warrior',
        description: '500 days. You have achieved legendary status.',
        daysRequired: 500,
        icon: '⭐',
        unlocked: false,
        tier: 'legendary',
    },
    {
        id: 'immortal-legacy',
        name: 'Immortal Legacy',
        description: '1000 days. Your legacy is immortal.',
        daysRequired: 1000,
        icon: '🔱',
        unlocked: false,
        tier: 'legendary',
    },
];

export const PHYSICAL_PUNISHMENTS = [
    { name: '50 Push-ups', description: 'Drop and give me 50!', icon: '💪' },
    { name: '100 Squats', description: 'Build those legs. 100 squats now.', icon: '🦵' },
    { name: '5 Min Plank', description: 'Core strength test. Hold it.', icon: '⏱️' },
    { name: '1km Run', description: 'Go for a quick 1km run.', icon: '🏃' },
    { name: '50 Burpees', description: 'Full body punishment. 50 burpees.', icon: '🔥' },
    { name: '100 Jumping Jacks', description: 'Get the heart rate up.', icon: '⚡' },
];

export const PUNISHMENTS: Record<PunishmentSeverity, { name: string; description: string; icon: string }> = {
    warning: {
        name: 'Warning',
        description: 'You missed a habit. Be careful.',
        icon: '⚠️',
    },
    minor: {
        name: 'Exercise Penalty',
        description: 'Complete a physical challenge to redeem yourself.',
        icon: '💢',
    },
    major: {
        name: 'Streak Reset',
        description: 'Your streak has been reset. Start again stronger.',
        icon: '💔',
    },
    critical: {
        name: 'Beast Mode Deactivated',
        description: 'Multiple failures. Time to recommit to your goals.',
        icon: '🚫',
    },
};

export const TIER_COLORS: TierColors = {
    bronze: {
        bg: 'from-amber-700 to-amber-900',
        text: 'text-amber-200',
        border: 'border-amber-500',
        glow: 'shadow-amber-500/50',
    },
    silver: {
        bg: 'from-slate-400 to-slate-600',
        text: 'text-slate-100',
        border: 'border-slate-300',
        glow: 'shadow-slate-400/50',
    },
    gold: {
        bg: 'from-yellow-500 to-yellow-700',
        text: 'text-yellow-100',
        border: 'border-yellow-400',
        glow: 'shadow-yellow-500/50',
    },
    platinum: {
        bg: 'from-cyan-400 to-cyan-600',
        text: 'text-cyan-100',
        border: 'border-cyan-300',
        glow: 'shadow-cyan-400/50',
    },
    diamond: {
        bg: 'from-blue-400 to-purple-600',
        text: 'text-blue-100',
        border: 'border-blue-300',
        glow: 'shadow-blue-400/50',
    },
    legendary: {
        bg: 'from-rose-500 via-purple-500 to-indigo-500',
        text: 'text-white',
        border: 'border-rose-300',
        glow: 'shadow-rose-500/50',
    },
};

export const CATEGORY_COLORS = {
    spiritual: 'from-purple-500 to-indigo-600',
    physical: 'from-green-500 to-emerald-600',
    mental: 'from-blue-500 to-cyan-600',
    discipline: 'from-orange-500 to-red-600',
};
