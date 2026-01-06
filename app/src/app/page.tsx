'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to the main Pages route
        router.replace('/Pages');
    }, [router]);

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0f172a'
        }}>
            <div className="spinner-wheel" />
            <style jsx global>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                .spinner-wheel {
                    width: 32px;
                    height: 32px;
                    border: 2px solid rgba(255,255,255,0.3);
                    border-top-color: white;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
            `}</style>
        </div>
    );
}
