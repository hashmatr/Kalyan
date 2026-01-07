'use client';

import { createContext, useContext, useEffect } from 'react';

type Theme = 'light';

interface ThemeContextType {
    theme: Theme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const theme: Theme = 'light';

    useEffect(() => {
        // Always enforce light mode
        document.documentElement.classList.remove('dark');
        localStorage.removeItem('theme');
    }, []);

    return (
        <ThemeContext.Provider value={{ theme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be used within a ThemeProvider');
    return context;
};
