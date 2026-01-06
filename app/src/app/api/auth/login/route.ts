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

        // Connect to MongoDB
        const connectDB = (await import('@/lib/mongodb')).default;
        const User = (await import('@/models/User')).default;

        await connectDB();
        console.log('✅ Connected to MongoDB for login');

        // Find user and include password field for comparison
        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

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

        console.log('✅ User authenticated:', user._id);

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

        // Return user data (without password)
        return NextResponse.json({
            user: {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                avatar: user.avatar || null,
                provider: user.provider || 'local',
            },
            token,
            message: 'Login successful!'
        });
    } catch (error: any) {
        console.error('❌ Login error:', error);
        return NextResponse.json(
            { error: error.message || 'Something went wrong. Please try again.' },
            { status: 500 }
        );
    }
}
