import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, newPassword, resetToken } = body;

        if (!email || !newPassword || !resetToken) {
            return NextResponse.json(
                { error: 'Email, new password, and reset token are required' },
                { status: 400 }
            );
        }

        if (newPassword.length < 6) {
            return NextResponse.json(
                { error: 'Password must be at least 6 characters' },
                { status: 400 }
            );
        }

        // Verify reset token (simple implementation)
        try {
            const decoded = Buffer.from(resetToken, 'base64').toString('utf-8');
            const [tokenEmail, timestamp] = decoded.split(':');

            // Check if token is for the same email
            if (tokenEmail.toLowerCase() !== email.toLowerCase()) {
                return NextResponse.json(
                    { error: 'Invalid reset token' },
                    { status: 400 }
                );
            }

            // Check if token is still valid (30 minutes)
            const tokenTime = parseInt(timestamp);
            if (Date.now() - tokenTime > 30 * 60 * 1000) {
                return NextResponse.json(
                    { error: 'Reset token has expired. Please start over.' },
                    { status: 400 }
                );
            }
        } catch (e) {
            return NextResponse.json(
                { error: 'Invalid reset token' },
                { status: 400 }
            );
        }

        // Connect to database and update password
        const connectDB = (await import('@/lib/mongodb')).default;
        const User = (await import('@/models/User')).default;

        await connectDB();

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        user.password = hashedPassword;
        await user.save();

        console.log(`✅ Password reset successful for ${email}`);

        return NextResponse.json({
            message: 'Password reset successful! You can now log in with your new password.',
            success: true,
        });

    } catch (error: any) {
        console.error('❌ Reset password error:', error);
        return NextResponse.json(
            { error: 'Failed to reset password. Please try again.' },
            { status: 500 }
        );
    }
}
