// API-based storage service for syncing with MongoDB
// Handles: habits, daily progress, punishments, rewards, stats

// Helper to get auth token
function getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
}

// Helper to get current user ID
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

// Helper to make authenticated API calls
async function apiCall(endpoint: string, method: string = 'GET', body?: any) {
    const token = getAuthToken();

    if (!token) {
        console.log('No auth token - using localStorage mode');
        return null;
    }

    const options: RequestInit = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(endpoint, options);
        const data = await response.json();
        return data;
    } catch (error) {
        console.warn('API call failed:', error);
        return null;
    }
}

// ============ FETCH FROM DATABASE ============

export async function fetchProgressFromDB() {
    const result = await apiCall('/api/progress', 'GET');
    return result?.data || null;
}

// ============ SAVE TO DATABASE ============

export async function saveProgressToDB(data: {
    habits?: any[];
    dailyProgress?: Record<string, any>;
    punishments?: any[];
    rewards?: any[];
    stats?: any;
}) {
    const result = await apiCall('/api/progress', 'POST', data);
    return result?.success || false;
}

// ============ SYNC WITH DATABASE ============

export async function syncWithDatabase() {
    if (typeof window === 'undefined') return;

    const token = getAuthToken();
    if (!token) {
        console.log('No auth token, skipping sync');
        return;
    }

    const userId = getCurrentUserId();
    if (userId === 'anonymous') {
        console.log('Anonymous user, skipping sync');
        return;
    }

    try {
        // Get all data from localStorage
        const progressKey = getUserStorageKey('kalyan_progress');
        const statsKey = getUserStorageKey('kalyan_stats');
        const rewardsKey = getUserStorageKey('kalyan_rewards');
        const punishmentsKey = getUserStorageKey('kalyan_punishments');
        const customHabitsKey = getUserStorageKey('kalyan_custom_habits');

        const dailyProgress = localStorage.getItem(progressKey);
        const stats = localStorage.getItem(statsKey);
        const rewards = localStorage.getItem(rewardsKey);
        const punishments = localStorage.getItem(punishmentsKey);
        const customHabits = localStorage.getItem(customHabitsKey);

        const data = {
            habits: customHabits ? JSON.parse(customHabits) : [],
            dailyProgress: dailyProgress ? JSON.parse(dailyProgress) : {},
            punishments: punishments ? JSON.parse(punishments) : [],
            rewards: rewards ? JSON.parse(rewards) : [],
            stats: stats ? JSON.parse(stats) : {
                currentStreak: 0,
                longestStreak: 0,
                totalDaysTracked: 0,
                perfectDays: 0,
                totalScore: 0,
                averageScore: 0,
                rewardsUnlocked: 0,
                punishmentsCount: 0,
                startDate: new Date().toISOString().split('T')[0],
            },
        };

        const success = await saveProgressToDB(data);
        if (success) {
            console.log('✅ Successfully synced all data with database');
        }
    } catch (error) {
        console.error('❌ Sync failed:', error);
    }
}

// ============ LOAD FROM DATABASE ============

export async function loadFromDatabase(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    const token = getAuthToken();
    if (!token) {
        console.log('No auth token, skipping load');
        return false;
    }

    const userId = getCurrentUserId();
    if (userId === 'anonymous') {
        console.log('Anonymous user, skipping load');
        return false;
    }

    try {
        const data = await fetchProgressFromDB();

        if (data) {
            const progressKey = getUserStorageKey('kalyan_progress');
            const statsKey = getUserStorageKey('kalyan_stats');
            const rewardsKey = getUserStorageKey('kalyan_rewards');
            const punishmentsKey = getUserStorageKey('kalyan_punishments');
            const customHabitsKey = getUserStorageKey('kalyan_custom_habits');

            // Save to localStorage
            if (data.dailyProgress && Object.keys(data.dailyProgress).length > 0) {
                localStorage.setItem(progressKey, JSON.stringify(data.dailyProgress));
            }
            if (data.stats && Object.keys(data.stats).length > 0) {
                localStorage.setItem(statsKey, JSON.stringify(data.stats));
            }
            if (data.rewards && data.rewards.length > 0) {
                localStorage.setItem(rewardsKey, JSON.stringify(data.rewards));
            }
            if (data.punishments && data.punishments.length > 0) {
                localStorage.setItem(punishmentsKey, JSON.stringify(data.punishments));
            }
            if (data.habits && data.habits.length > 0) {
                localStorage.setItem(customHabitsKey, JSON.stringify(data.habits));
            }

            console.log('✅ Successfully loaded all data from database');
            return true;
        }
        return false;
    } catch (error) {
        console.error('❌ Failed to load from database:', error);
        return false;
    }
}

// ============ PATCH OPERATIONS ============

export async function addHabitToDB(habit: any) {
    return apiCall('/api/progress', 'PATCH', { action: 'addHabit', data: habit });
}

export async function deleteHabitFromDB(habitId: string) {
    return apiCall('/api/progress', 'PATCH', { action: 'deleteHabit', data: { id: habitId } });
}

export async function addPunishmentToDB(punishment: any) {
    return apiCall('/api/progress', 'PATCH', { action: 'addPunishment', data: punishment });
}

export async function completePunishmentInDB(punishmentId: string) {
    return apiCall('/api/progress', 'PATCH', { action: 'completePunishment', data: { id: punishmentId } });
}

export async function unlockRewardInDB(rewardId: string) {
    return apiCall('/api/progress', 'PATCH', { action: 'unlockReward', data: { id: rewardId } });
}

export async function saveDailyProgressToDB(progress: any) {
    return apiCall('/api/progress', 'PATCH', { action: 'saveDailyProgress', data: progress });
}

export async function updateStatsToDB(stats: any) {
    return apiCall('/api/progress', 'PATCH', { action: 'updateStats', data: stats });
}

// ============ AUTO-SYNC ============

let syncTimeout: NodeJS.Timeout | null = null;

export function scheduleSyncWithDatabase() {
    if (syncTimeout) {
        clearTimeout(syncTimeout);
    }

    syncTimeout = setTimeout(() => {
        syncWithDatabase();
    }, 2000); // Sync 2 seconds after last change
}

// ============ INITIAL SYNC ON LOGIN ============

export async function syncOnLogin() {
    // First load from database to get latest data
    const loaded = await loadFromDatabase();

    if (!loaded) {
        // If nothing in database, sync localStorage to database
        await syncWithDatabase();
    }

    return loaded;
}
