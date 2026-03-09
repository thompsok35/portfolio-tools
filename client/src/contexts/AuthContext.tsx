import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
    sub: string;
    email: string;
    exp: number;
    iss: string;
    aud: string;
}

interface AuthContextType {
    token: string | null;
    email: string | null;
    activePlanId: string | null;
    login: (token: string, email: string) => void;
    logout: () => void;
    setActivePlan: (planId: string) => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [email, setEmail] = useState<string | null>(localStorage.getItem('email'));
    const [activePlanId, setActivePlanId] = useState<string | null>(localStorage.getItem('activePlanId'));

    useEffect(() => {
        if (token) {
            try {
                const decoded = jwtDecode<DecodedToken>(token);
                // Check if expired
                if (decoded.exp * 1000 < Date.now()) {
                    logout();
                } else {
                    localStorage.setItem('token', token);
                    if (email) localStorage.setItem('email', email);
                    if (activePlanId) localStorage.setItem('activePlanId', activePlanId);
                }
            } catch (err) {
                logout();
            }
        } else {
            localStorage.removeItem('token');
            localStorage.removeItem('email');
            localStorage.removeItem('activePlanId');
        }
    }, [token, email, activePlanId]);

    const login = (newToken: string, newEmail: string) => {
        setToken(newToken);
        setEmail(newEmail);
    };

    const logout = () => {
        setToken(null);
        setEmail(null);
        setActivePlanId(null);
        localStorage.removeItem('token');
        localStorage.removeItem('email');
        localStorage.removeItem('activePlanId');
    };

    const setActivePlan = (planId: string) => {
        setActivePlanId(planId);
        localStorage.setItem('activePlanId', planId);
    };

    return (
        <AuthContext.Provider value={{ token, email, activePlanId, login, logout, setActivePlan, isAuthenticated: !!token }}>
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
