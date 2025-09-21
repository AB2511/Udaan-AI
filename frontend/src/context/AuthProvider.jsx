import React, { createContext, useContext, useEffect, useState } from "react";
import { authService } from "../services/authService";
import { getToken, setToken, removeToken, getUserFromToken, isTokenExpired } from "../utils/authUtils";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check token on mount
  useEffect(() => {
    const token = getToken();
    if (token && !isTokenExpired(token)) {
      const decodedUser = getUserFromToken(token);
      setUser(decodedUser);
      setIsAuthenticated(true);
    } else {
      removeToken();
    }
    setLoading(false);
  }, []);

  // Login
  const login = async (email, password) => {
    try {
      const response = await authService.login({ email, password });
      if (response?.token) {
        setToken(response.token);
        const decodedUser = getUserFromToken(response.token);
        setUser(decodedUser);
        setIsAuthenticated(true);
        return { success: true };
      }
      return { success: false, message: response?.message || "Login failed" };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Login failed" };
    }
  };

  // Register
  const register = async (name, email, password, confirmPassword) => {
    try {
      const response = await authService.register({ name, email, password, confirmPassword });
      if (response?.token) {
        setToken(response.token);
        const decodedUser = getUserFromToken(response.token);
        setUser(decodedUser);
        setIsAuthenticated(true);
        return { success: true };
      }
      return { success: false, message: response?.message || "Registration failed" };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Registration failed" };
    }
  };

  // Logout
  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      removeToken();
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
