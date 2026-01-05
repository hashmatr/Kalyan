import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    // For now, redirect to a demo message
    // In production, this would redirect to Google OAuth consent screen

    const googleClientId = process.env.GOOGLE_CLIENT_ID;

    if (!googleClientId) {
        // Demo mode - show message that Google OAuth is not configured
        return NextResponse.redirect(new URL('/Pages/auth?error=google_not_configured', request.url));
    }

    // Build Google OAuth URL
    const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    googleAuthUrl.searchParams.set('client_id', googleClientId);
    googleAuthUrl.searchParams.set('redirect_uri', `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/google/callback`);
    googleAuthUrl.searchParams.set('response_type', 'code');
    googleAuthUrl.searchParams.set('scope', 'openid email profile');
    googleAuthUrl.searchParams.set('access_type', 'offline');
    googleAuthUrl.searchParams.set('prompt', 'consent');

    return NextResponse.redirect(googleAuthUrl.toString());
}
