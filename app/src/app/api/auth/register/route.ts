import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, email, password } = body;

        // Validate input
        if (!name || !email || !password) {
            return NextResponse.json(
                { error: 'Please provide name, email, and password' },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: 'Password must be at least 6 characters' },
                { status: 400 }
            );
        }

        // Connect to MongoDB
        const connectDB = (await import('@/lib/mongodb')).default;
        const User = (await import('@/models/User')).default;
        const UserProgress = (await import('@/models/UserProgress')).default;

        await connectDB();
        console.log('✅ Connected to MongoDB for registration');

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return NextResponse.json(
                { error: 'An account with this email already exists' },
                { status: 400 }
            );
        }

        // Create new user in MongoDB
        const user = await User.create({
            name,
            email: email.toLowerCase(),
            password,
            provider: 'local',
        });

        console.log('✅ User created in MongoDB:', user._id);

        // Create initial UserProgress for the new user
        await UserProgress.create({
            userId: user._id.toString(),
            habits: [],
            punishments: [],
            stats: {
                totalDays: 0,
                currentStreak: 0,
                longestStreak: 0,
                completionRate: 0,
            },
            calendarData: new Map(),
        });

        console.log('✅ UserProgress created for user:', user._id);

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: user._id.toString(),
                email: user.email,
                name: user.name
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Return user data
        return NextResponse.json({
            user: {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                avatar: user.avatar || null,
                provider: user.provider,
            },
            token,
            message: 'Registration successful! User saved to MongoDB.'
        });
    } catch (error: any) {
        console.error('❌ Registration error:', error);

        if (error.code === 11000) {
            return NextResponse.json(
                { error: 'An account with this email already exists' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: error.message || 'Something went wrong. Please try again.' },
            { status: 500 }
        );
    }
}
