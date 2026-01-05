// Authentication utilities with JWT token management
// Note: In production, JWT signing should be done server-side

export interface User {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    provider: 'email' | 'google';
    createdAt: string;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
}

export interface LoginData {
    email: string;
    password: string;
}

const AUTH_STORAGE_KEY = 'kalyan_auth';
const USER_STORAGE_KEY = 'kalyan_user';
const USERS_DB_KEY = 'kalyan_users_db';

// Simple base64 encode/decode for demo JWT (in production use proper JWT library)
const base64Encode = (str: string): string => {
    if (typeof window !== 'undefined') {
        return btoa(encodeURIComponent(str));
    }
    return Buffer.from(str).toString('base64');
};

const base64Decode = (str: string): string => {
    if (typeof window !== 'undefined') {
        return decodeURIComponent(atob(str));
    }
    return Buffer.from(str, 'base64').toString('utf-8');
};

// Create a simple JWT-like token
const createToken = (payload: object, expiresIn: number): string => {
    const header = { alg: 'HS256', typ: 'JWT' };
    const now = Date.now();
    const tokenPayload = {
        ...payload,
        iat: now,
        exp: now + expiresIn,
    };

    const headerB64 = base64Encode(JSON.stringify(header));
    const payloadB64 = base64Encode(JSON.stringify(tokenPayload));
    // In production, this would be a proper HMAC signature
    const signature = base64Encode(`${headerB64}.${payloadB64}.secret`);

    return `${headerB64}.${payloadB64}.${signature}`;
};

// Decode JWT token
const decodeToken = (token: string): { payload: any; isValid: boolean } => {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) {
            return { payload: null, isValid: false };
        }

        const payload = JSON.parse(base64Decode(parts[1]));
        const isExpired = payload.exp < Date.now();

        return { payload, isValid: !isExpired };
    } catch {
        return { payload: null, isValid: false };
    }
};

// Hash password (simple hash for demo - use bcrypt in production)
const hashPassword = (password: string): string => {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return `hashed_${Math.abs(hash).toString(16)}_${password.length}`;
};

// Get users database from localStorage
const getUsersDB = (): Record<string, { user: User; passwordHash: string }> => {
    if (typeof window === 'undefined') return {};
    const data = localStorage.getItem(USERS_DB_KEY);
    return data ? JSON.parse(data) : {};
};

// Save users database to localStorage
const saveUsersDB = (db: Record<string, { user: User; passwordHash: string }>): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(db));
};

// Register a new user
export const register = async (data: RegisterData): Promise<{ user: User; tokens: AuthTokens } | { error: string }> => {
    const usersDB = getUsersDB();

    // Check if email already exists
    if (usersDB[data.email]) {
        return { error: 'An account with this email already exists' };
    }

    // Validate password
    if (data.password.length < 6) {
        return { error: 'Password must be at least 6 characters' };
    }

    // Create new user
    const user: User = {
        id: `user_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        email: data.email,
        name: data.name,
        provider: 'email',
        createdAt: new Date().toISOString(),
    };

    // Hash password and save to DB
    const passwordHash = hashPassword(data.password);
    usersDB[data.email] = { user, passwordHash };
    saveUsersDB(usersDB);

    // Generate tokens
    const accessToken = createToken({ userId: user.id, email: user.email }, 60 * 60 * 1000); // 1 hour
    const refreshToken = createToken({ userId: user.id, type: 'refresh' }, 7 * 24 * 60 * 60 * 1000); // 7 days

    const tokens: AuthTokens = {
        accessToken,
        refreshToken,
        expiresAt: Date.now() + 60 * 60 * 1000,
    };

    // Save auth state
    saveAuthState(user, tokens);

    return { user, tokens };
};

// Login with email and password
export const login = async (data: LoginData): Promise<{ user: User; tokens: AuthTokens } | { error: string }> => {
    const usersDB = getUsersDB();

    // Find user by email
    const userRecord = usersDB[data.email];
    if (!userRecord) {
        return { error: 'No account found with this email' };
    }

    // Verify password
    const passwordHash = hashPassword(data.password);
    if (userRecord.passwordHash !== passwordHash) {
        return { error: 'Incorrect password' };
    }

    const user = userRecord.user;

    // Generate tokens
    const accessToken = createToken({ userId: user.id, email: user.email }, 60 * 60 * 1000);
    const refreshToken = createToken({ userId: user.id, type: 'refresh' }, 7 * 24 * 60 * 60 * 1000);

    const tokens: AuthTokens = {
        accessToken,
        refreshToken,
        expiresAt: Date.now() + 60 * 60 * 1000,
    };

    // Save auth state
    saveAuthState(user, tokens);

    return { user, tokens };
};

// Login with Google (mock implementation)
export const loginWithGoogle = async (): Promise<{ user: User; tokens: AuthTokens }> => {
    // In a real app, this would trigger Google OAuth flow
    // For demo, we'll create a mock Google user

    const mockGoogleUser: User = {
        id: `google_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        email: `user${Math.floor(Math.random() * 10000)}@gmail.com`,
        name: 'Google User',
        avatar: 'https://lh3.googleusercontent.com/a/default-user',
        provider: 'google',
        createdAt: new Date().toISOString(),
    };

    // Save to users DB
    const usersDB = getUsersDB();
    if (!usersDB[mockGoogleUser.email]) {
        usersDB[mockGoogleUser.email] = { user: mockGoogleUser, passwordHash: '' };
        saveUsersDB(usersDB);
    }

    // Generate tokens
    const accessToken = createToken({ userId: mockGoogleUser.id, email: mockGoogleUser.email }, 60 * 60 * 1000);
    const refreshToken = createToken({ userId: mockGoogleUser.id, type: 'refresh' }, 7 * 24 * 60 * 60 * 1000);

    const tokens: AuthTokens = {
        accessToken,
        refreshToken,
        expiresAt: Date.now() + 60 * 60 * 1000,
    };

    // Save auth state
    saveAuthState(mockGoogleUser, tokens);

    return { user: mockGoogleUser, tokens };
};

// Refresh access token
export const refreshAccessToken = async (): Promise<AuthTokens | null> => {
    const tokens = getTokens();
    if (!tokens?.refreshToken) return null;

    const { payload, isValid } = decodeToken(tokens.refreshToken);
    if (!isValid || !payload?.userId) return null;

    // Get user from DB
    const usersDB = getUsersDB();
    const userRecord = Object.values(usersDB).find(r => r.user.id === payload.userId);
    if (!userRecord) return null;

    // Generate new access token
    const newAccessToken = createToken({ userId: payload.userId, email: userRecord.user.email }, 60 * 60 * 1000);

    const newTokens: AuthTokens = {
        accessToken: newAccessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: Date.now() + 60 * 60 * 1000,
    };

    // Update auth storage
    if (typeof window !== 'undefined') {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newTokens));
    }

    return newTokens;
};

// Save auth state to localStorage
const saveAuthState = (user: User, tokens: AuthTokens): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(tokens));
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
};

// Get stored tokens
export const getTokens = (): AuthTokens | null => {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(AUTH_STORAGE_KEY);
    return data ? JSON.parse(data) : null;
};

// Get stored user
export const getStoredUser = (): User | null => {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(USER_STORAGE_KEY);
    return data ? JSON.parse(data) : null;
};

// Validate current session
export const validateSession = (): { user: User | null; isValid: boolean } => {
    const tokens = getTokens();
    const user = getStoredUser();

    if (!tokens || !user) {
        return { user: null, isValid: false };
    }

    const { isValid } = decodeToken(tokens.accessToken);

    if (!isValid) {
        // Try to refresh
        refreshAccessToken().then(newTokens => {
            if (!newTokens) {
                logout();
            }
        });
        return { user: null, isValid: false };
    }

    return { user, isValid: true };
};

// Logout
export const logout = (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
    const { isValid } = validateSession();
    return isValid;
};
