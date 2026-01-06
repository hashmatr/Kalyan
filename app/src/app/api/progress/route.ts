import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Helper to get user ID from token
function getUserIdFromToken(request: NextRequest): string | null {
    try {
        const token = request.headers.get('authorization')?.replace('Bearer ', '');
        if (!token) return null;

        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        return decoded.userId;
    } catch (error) {
        return null;
    }
}

// Dynamic import for MongoDB
async function getDBConnection() {
    try {
        const connectDB = (await import('@/lib/mongodb')).default;
        const UserProgress = (await import('@/models/UserProgress')).default;
        await connectDB();
        return { connected: true, UserProgress };
    } catch (error: any) {
        console.warn('⚠️ MongoDB connection failed:', error.message);
        return { connected: false, UserProgress: null };
    }
}

// Helper to convert Map to Object for JSON response
function mapToObject(map: Map<string, any> | undefined): Record<string, any> {
    if (!map) return {};
    if (map instanceof Map) {
        return Object.fromEntries(map);
    }
    return map as Record<string, any>;
}

// GET - Fetch all user progress data
export async function GET(request: NextRequest) {
    const userId = getUserIdFromToken(request);

    if (!userId) {
        return NextResponse.json({
            success: true,
            data: null,
            message: 'No auth token - using localStorage'
        });
    }

    const db = await getDBConnection();

    if (!db.connected || !db.UserProgress) {
        return NextResponse.json({
            success: true,
            data: null,
            message: 'MongoDB unavailable - using localStorage'
        });
    }

    try {
        let progress = await db.UserProgress.findOne({ userId });

        if (!progress) {
            // Create new progress document for user
            progress = await db.UserProgress.create({
                userId,
                habits: [],
                dailyProgress: new Map(),
                punishments: [],
                rewards: [],
                stats: {
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
            });
            console.log('✅ Created new UserProgress for user:', userId);
        }

        return NextResponse.json({
            success: true,
            data: {
                habits: progress.habits || [],
                dailyProgress: mapToObject(progress.dailyProgress),
                punishments: progress.punishments || [],
                rewards: progress.rewards || [],
                stats: progress.stats || {},
            },
        });
    } catch (error: any) {
        console.error('⚠️ Database error:', error.message);
        return NextResponse.json({
            success: true,
            data: null,
            message: 'Database error - using localStorage'
        });
    }
}

// POST - Save all user progress data
export async function POST(request: NextRequest) {
    const userId = getUserIdFromToken(request);

    if (!userId) {
        return NextResponse.json({
            success: true,
            message: 'No auth - saved to localStorage only'
        });
    }

    const db = await getDBConnection();

    if (!db.connected || !db.UserProgress) {
        return NextResponse.json({
            success: true,
            message: 'MongoDB unavailable - saved to localStorage only'
        });
    }

    try {
        const body = await request.json();
        const { habits, dailyProgress, punishments, rewards, stats } = body;

        // Convert dailyProgress object to Map
        const dailyProgressMap = new Map(Object.entries(dailyProgress || {}));

        const progress = await db.UserProgress.findOneAndUpdate(
            { userId },
            {
                $set: {
                    habits: habits || [],
                    dailyProgress: dailyProgressMap,
                    punishments: punishments || [],
                    rewards: rewards || [],
                    stats: stats || {},
                }
            },
            { new: true, upsert: true }
        );

        console.log('✅ Progress saved to MongoDB for user:', userId);

        return NextResponse.json({
            success: true,
            data: {
                habits: progress.habits || [],
                dailyProgress: mapToObject(progress.dailyProgress),
                punishments: progress.punishments || [],
                rewards: progress.rewards || [],
                stats: progress.stats || {},
            },
            message: 'Synced to MongoDB'
        });
    } catch (error: any) {
        console.error('⚠️ Database error:', error.message);
        return NextResponse.json({
            success: true,
            message: 'Database error - saved to localStorage only'
        });
    }
}

// PATCH - Update specific fields
export async function PATCH(request: NextRequest) {
    const userId = getUserIdFromToken(request);

    if (!userId) {
        return NextResponse.json({
            success: true,
            message: 'No auth - using localStorage'
        });
    }

    const db = await getDBConnection();

    if (!db.connected || !db.UserProgress) {
        return NextResponse.json({
            success: true,
            message: 'MongoDB unavailable'
        });
    }

    try {
        const body = await request.json();
        const { action, data } = body;

        let updateQuery: any = {};

        switch (action) {
            case 'addHabit':
                updateQuery = { $push: { habits: data } };
                break;
            case 'updateHabit':
                updateQuery = { $set: { 'habits.$[elem]': data } };
                break;
            case 'deleteHabit':
                updateQuery = { $pull: { habits: { id: data.id } } };
                break;
            case 'addPunishment':
                updateQuery = {
                    $push: { punishments: data },
                    $inc: { 'stats.punishmentsCount': 1 }
                };
                break;
            case 'completePunishment':
                updateQuery = {
                    $set: {
                        'punishments.$[elem].completed': true,
                        'punishments.$[elem].completedDate': new Date().toISOString()
                    }
                };
                break;
            case 'unlockReward':
                updateQuery = {
                    $set: {
                        'rewards.$[elem].unlocked': true,
                        'rewards.$[elem].unlockedDate': new Date().toISOString().split('T')[0]
                    },
                    $inc: { 'stats.rewardsUnlocked': 1 }
                };
                break;
            case 'updateStats':
                updateQuery = { $set: { stats: data } };
                break;
            case 'saveDailyProgress':
                updateQuery = { $set: { [`dailyProgress.${data.date}`]: data } };
                break;
            default:
                return NextResponse.json({
                    success: false,
                    message: 'Invalid action'
                }, { status: 400 });
        }

        const options: any = { new: true };
        if (action === 'updateHabit' || action === 'completePunishment' || action === 'unlockReward') {
            options.arrayFilters = [{ 'elem.id': data.id }];
        }

        await db.UserProgress.findOneAndUpdate({ userId }, updateQuery, options);

        console.log(`✅ ${action} completed for user:`, userId);

        return NextResponse.json({
            success: true,
            message: `${action} completed`
        });
    } catch (error: any) {
        console.error('⚠️ PATCH error:', error.message);
        return NextResponse.json({
            success: false,
            message: error.message
        }, { status: 500 });
    }
}
