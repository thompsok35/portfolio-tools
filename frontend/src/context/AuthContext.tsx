import React, { createContext, useContext, useEffect, useState } from 'react';
import type { AuthResponse } from '../types';
import { getMe } from '../api/endpoints';

interface AuthContextValue {
  user: AuthResponse | null;
  isLoading: boolean;
  login: (data: AuthResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
  login: () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      getMe()
        .then((data) => setUser(data))
        .catch(() => {
          localStorage.removeItem('authToken');
          localStorage.removeItem('authUser');
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = (data: AuthResponse) => {
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('authUser', JSON.stringify(data));
    setUser(data);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
