import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'Kalyan - Habit Tracker',
    description: 'Track your habits and build a better you',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body suppressHydrationWarning>
                <main suppressHydrationWarning>
                    {children}
                </main>
            </body>
        </html>
    );
}
