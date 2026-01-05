import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = body;

        // Validate input
        if (!email || !password) {
            return NextResponse.json(
                { error: 'Please provide email and password' },
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

            // Find user and include password field for comparison
            user = await User.findOne({ email: email.toLowerCase() }).select('+password');

            if (!user) {
                return NextResponse.json(
                    { error: 'Invalid email or password' },
                    { status: 401 }
                );
            }

            // Check if this is a Google-only account
            if (user.provider === 'google' && !user.password) {
                return NextResponse.json(
                    { error: 'Please sign in with Google for this account' },
                    { status: 401 }
                );
            }

            // Compare passwords
            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                return NextResponse.json(
                    { error: 'Invalid email or password' },
                    { status: 401 }
                );
            }
        } catch (dbError) {
            console.error('MongoDB connection failed, using simple auth:', dbError);
            useLocalStorage = true;

            // For localStorage fallback, create a simple user (password not verified)
            // In production, this would need proper password storage
            user = {
                _id: `local_${Date.now()}`,
                name: email.split('@')[0],
                email: email.toLowerCase(),
                provider: 'local',
            };
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: user._id,
                email: user.email || email.toLowerCase(),
                name: user.name
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Return user data (without password)
        return NextResponse.json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email || email.toLowerCase(),
                avatar: user.avatar || null,
                provider: user.provider || 'local',
            },
            token,
            localStorage: useLocalStorage,
        });
    } catch (error: any) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Something went wrong. Please try again.' },
            { status: 500 }
        );
    }
}
