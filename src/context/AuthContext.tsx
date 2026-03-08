import React, { createContext, useContext, useState } from 'react';

export type ClassLevel = '9' | '10' | '11' | '12' | 'Genel Kültür';

export interface User {
  username: string;
  classLevel: ClassLevel;
  score: number;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, classLevel: ClassLevel) => void;
  logout: () => void;
  addScore: (points: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (username: string, classLevel: ClassLevel) => {
    setUser({ username, classLevel, score: 0 });
  };

  const logout = () => setUser(null);

  const addScore = (points: number) => {
    setUser(prev => prev ? { ...prev, score: prev.score + points } : null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, addScore }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
