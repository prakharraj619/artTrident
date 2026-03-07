import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types';
import { jwtDecode } from 'jwt-decode';

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        if (token) {
            try {
                const decoded: any = jwtDecode(token);
                // Temporarily, we extract what we can from standard JWT payload.
                // Spring Boot subject is the email. The role claim starts with "ROLE_"
                let parsedRole: 'ARTIST' | 'COLLECTOR' | 'VIEWER' | 'ADMIN' = 'VIEWER';
                if (decoded.role) {
                    parsedRole = decoded.role.replace('ROLE_', '') as 'ARTIST' | 'COLLECTOR' | 'VIEWER' | 'ADMIN';
                }

                setUser({
                    email: decoded.email || decoded.sub,
                    username: decoded.username || decoded.sub,
                    role: parsedRole
                });
            } catch (err) {
                console.error("Invalid token", err);
                logout();
            }
        } else {
            setUser(null);
        }
    }, [token]);

    const login = (newToken: string) => {
        localStorage.setItem('token', newToken);
        setToken(newToken);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
