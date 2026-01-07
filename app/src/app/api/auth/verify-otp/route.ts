import { NextRequest, NextResponse } from 'next/server';

// Import OTP store from forgot-password route
// Note: In production, use Redis or database for shared state
const otpStore = new Map<string, { otp: string; expires: number; email: string }>();

// Shared store reference (for development - in production use Redis)
let sharedOtpStore: Map<string, { otp: string; expires: number; email: string }> | null = null;

export function setOtpStore(store: Map<string, { otp: string; expires: number; email: string }>) {
    sharedOtpStore = store;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, otp } = body;

        if (!email || !otp) {
            return NextResponse.json(
                { error: 'Email and OTP are required' },
                { status: 400 }
            );
        }

        // In development, we need to check the stored OTP
        // For now, we'll verify against our local store or accept any 6-digit OTP in dev
        const normalizedEmail = email.toLowerCase();

        // Check if we have the OTP in our store
        const storedData = otpStore.get(normalizedEmail) ||
            (sharedOtpStore && sharedOtpStore.get(normalizedEmail));

        // Development mode bypass for testing
        if (process.env.NODE_ENV === 'development') {
            // Accept OTP if it matches stored OTP or is a valid 6-digit number
            const isValidOtp = storedData
                ? storedData.otp === otp && storedData.expires > Date.now()
                : /^\d{6}$/.test(otp);

            if (!isValidOtp) {
                return NextResponse.json(
                    { error: 'Invalid or expired OTP' },
                    { status: 400 }
                );
            }
        } else {
            // Production: strict OTP validation
            if (!storedData) {
                return NextResponse.json(
                    { error: 'Invalid or expired OTP. Please request a new one.' },
                    { status: 400 }
                );
            }

            if (storedData.otp !== otp) {
                return NextResponse.json(
                    { error: 'Invalid OTP. Please check and try again.' },
                    { status: 400 }
                );
            }

            if (storedData.expires < Date.now()) {
                otpStore.delete(normalizedEmail);
                return NextResponse.json(
                    { error: 'OTP has expired. Please request a new one.' },
                    { status: 400 }
                );
            }
        }

        // Generate reset token (simple implementation for development)
        const resetToken = Buffer.from(`${email}:${Date.now()}`).toString('base64');

        return NextResponse.json({
            message: 'OTP verified successfully',
            success: true,
            resetToken,
        });

    } catch (error: any) {
        console.error('❌ Verify OTP error:', error);
        return NextResponse.json(
            { error: 'Failed to verify OTP. Please try again.' },
            { status: 500 }
        );
    }
}
