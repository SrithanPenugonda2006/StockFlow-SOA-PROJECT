import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { User, UserRole } from "../types/auth";
import { parseJwt, isTokenExpired } from "../utils/jwt";
import { TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from "../constants/auth";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  role: UserRole | null;
  isLoading: boolean;
  login: (username: string, token: string, mustChangePassword?: boolean) => void;
  logout: () => void;
  clearMustChangePassword: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_STORAGE_KEY));
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem(USER_STORAGE_KEY);
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const clearMustChangePassword = useCallback(() => {
    if (user) {
      const updatedUser = { ...user, mustChangePassword: false };
      setUser(updatedUser);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      if (isTokenExpired(token)) {
        logout();
      } else {
        const payload = parseJwt(token);
        if (payload) {
          const savedUserStr = localStorage.getItem(USER_STORAGE_KEY);
          const savedUser = savedUserStr ? JSON.parse(savedUserStr) : null;

          const activeUser: User = {
            username: payload.sub,
            role: payload.role,
            mustChangePassword: savedUser?.mustChangePassword ?? false,
          };
          setUser(activeUser);
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(activeUser));
        }
      }
    }
    setIsLoading(false);
  }, [token, logout]);

  const login = useCallback((username: string, newToken: string, mustChangePassword?: boolean) => {
    const payload = parseJwt(newToken);
    const role = payload?.role || "CUSTOMER";
    const newUser: User = { username, role, mustChangePassword: !!mustChangePassword };

    localStorage.setItem(TOKEN_STORAGE_KEY, newToken);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));

    setToken(newToken);
    setUser(newUser);
  }, []);

  const role = user?.role || null;
  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        role,
        isLoading,
        login,
        logout,
        clearMustChangePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
