import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Kalyan - Habit Tracker',
        short_name: 'Kalyan',
        description: 'Track your habits and build a better you',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#ffffff',
        icons: [
            {
                src: '/logo.svg',
                sizes: '192x192',
                type: 'image/svg+xml',
            },
            {
                src: '/logo.svg',
                sizes: '512x512',
                type: 'image/svg+xml',
            },
        ],
    };
}
