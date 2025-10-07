import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    type ReactNode,
} from 'react';
import Cookies from 'js-cookie';
import { AuthApiClient } from '../api/authApiClient.ts';

export enum UserRole {
    ADMIN = 'ADMIN',
    OWNER = 'OWNER',
}

export interface User {
    user_id: string;
    full_name: string;
    role: UserRole;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    login: (email: string, password: string) => Promise<User>;
    logout: () => Promise<void>;
    fetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = useCallback(async () => {
        setLoading(true);
        try {
            const token: string | undefined = Cookies.get('access_token');
            if (!token) {
                setUser(null);
                return;
            }

            const decoded = decodeJwtPayload(token);
            if (!decoded) {
                setUser(null);
                return;
            }

            const mappedUser: User = {
                user_id: String(decoded.user_id ?? decoded.sub ?? ''),
                full_name: String(decoded.full_name ?? decoded.name ?? ''),
                role: (decoded.role as UserRole) ?? UserRole.OWNER,
            };
            setUser(mappedUser);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    const logout = async () => {
        setUser(null);
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
    };

    const login = async (email: string, password: string): Promise<User> => {
        await AuthApiClient.signIn(email, password);
        await fetchUser();
        if (!user) {
            const token: string | undefined = Cookies.get('access_token');
            const decoded = token ? decodeJwtPayload(token) : null;
            if (!decoded) {
                throw new Error('Failed to decode token after login');
            }
            const mappedUser: User = {
                user_id: String(decoded.user_id ?? ''),
                full_name: String(decoded.full_name ?? ''),
                role: decoded.role as UserRole,
            };
            setUser(mappedUser);
            return mappedUser;
        }
        return user;
    };

    const value: AuthContextType = {
        user,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
        fetchUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context == undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

function decodeJwtPayload(token: string): Record<string, unknown> | null {
    try {
        const payload = token.split('.')[1];
        const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
        const json = atob(normalized);
        return JSON.parse(json);
    } catch {
        return null;
    }
}
