import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// In-memory OTP storage (in production, use Redis or database)
const otpStore = new Map<string, { otp: string; expires: number; email: string }>();

// Generate 6-digit OTP
function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Create email transporter
function createTransporter() {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD, // Use App Password, not regular password
        },
    });
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        // Check if user exists
        const connectDB = (await import('@/lib/mongodb')).default;
        const User = (await import('@/models/User')).default;

        await connectDB();

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            // Don't reveal if user exists for security
            return NextResponse.json({
                message: 'If an account with this email exists, you will receive an OTP shortly.',
                success: true,
            });
        }

        // Generate OTP
        const otp = generateOTP();
        const expires = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

        // Store OTP (keyed by email)
        otpStore.set(email.toLowerCase(), { otp, expires, email: email.toLowerCase() });

        // Send email
        if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
            const transporter = createTransporter();

            await transporter.sendMail({
                from: `"Kalyan App" <${process.env.GMAIL_USER}>`,
                to: email,
                subject: '🔐 Password Reset OTP - Kalyan',
                html: `
                    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <h1 style="color: #6366f1; margin: 0;">Kalyan</h1>
                            <p style="color: #64748b; margin: 5px 0 0;">Your Personal Habit Tracker</p>
                        </div>
                        
                        <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 16px; padding: 30px; text-align: center;">
                            <h2 style="color: #0f172a; margin: 0 0 10px;">Password Reset Request</h2>
                            <p style="color: #64748b; margin: 0 0 25px;">Use the OTP below to reset your password. This code expires in 10 minutes.</p>
                            
                            <div style="background: white; border-radius: 12px; padding: 20px; margin: 20px 0; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                                <p style="color: #64748b; margin: 0 0 10px; font-size: 14px;">Your OTP Code</p>
                                <div style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #6366f1;">
                                    ${otp}
                                </div>
                            </div>
                            
                            <p style="color: #94a3b8; font-size: 13px; margin-top: 20px;">
                                If you didn't request this, please ignore this email.
                            </p>
                        </div>
                        
                        <div style="text-align: center; margin-top: 30px; color: #94a3b8; font-size: 12px;">
                            <p>© ${new Date().getFullYear()} Kalyan. All rights reserved.</p>
                        </div>
                    </div>
                `,
            });

            console.log(`✅ OTP sent to ${email}`);
        } else {
            // Development mode - log OTP to console
            console.log(`⚠️ Email not configured. OTP for ${email}: ${otp}`);
        }

        return NextResponse.json({
            message: 'If an account with this email exists, you will receive an OTP shortly.',
            success: true,
        });

    } catch (error: any) {
        console.error('❌ Forgot password error:', error);
        return NextResponse.json(
            { error: 'Failed to process request. Please try again.' },
            { status: 500 }
        );
    }
}

// Export OTP store for verification
export { otpStore };
