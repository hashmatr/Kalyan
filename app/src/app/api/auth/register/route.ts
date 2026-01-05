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

        // Try MongoDB first, fallback to simple auth if connection fails
        let user;
        let useLocalStorage = false;

        try {
            const connectDB = (await import('@/lib/mongodb')).default;
            const User = (await import('@/models/User')).default;

            await connectDB();

            // Check if user already exists
            const existingUser = await User.findOne({ email: email.toLowerCase() });
            if (existingUser) {
                return NextResponse.json(
                    { error: 'An account with this email already exists' },
                    { status: 400 }
                );
            }

            // Create new user in MongoDB
            user = await User.create({
                name,
                email: email.toLowerCase(),
                password,
                provider: 'local',
            });
        } catch (dbError) {
            console.error('MongoDB connection failed, using simple auth:', dbError);
            useLocalStorage = true;

            // Create a simple user object for localStorage-based auth
            user = {
                _id: `local_${Date.now()}`,
                name,
                email: email.toLowerCase(),
                provider: 'local',
            };
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: user._id,
                email: user.email || email.toLowerCase(),
                name: user.name || name
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Return user data
        return NextResponse.json({
            user: {
                id: user._id,
                name: user.name || name,
                email: user.email || email.toLowerCase(),
                avatar: user.avatar || null,
                provider: user.provider || 'local',
            },
            token,
            localStorage: useLocalStorage,
        });
    } catch (error: any) {
        console.error('Registration error:', error);

        if (error.code === 11000) {
            return NextResponse.json(
                { error: 'An account with this email already exists' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Something went wrong. Please try again.' },
            { status: 500 }
        );
    }
}
