'use client';

import Authentication from '../Authentication';

export default function AuthPage() {
    const handleAuthSuccess = () => {
        // Redirect to main page after successful authentication
        window.location.href = '/Pages';
    };

    return <Authentication onAuthSuccess={handleAuthSuccess} />;
}
