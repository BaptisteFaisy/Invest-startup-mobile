import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, getToken, googleAuth, profileAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        if (token) {
          const data = await authAPI.me();
          setUser(data.user);
        }
      } catch {
        // token expired or invalid
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email, password) => {
    try {
      const data = await authAPI.login(email, password);
      setUser(data.user);
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  const register = async (email, password, full_name) => {
    try {
      const data = await authAPI.register(email, password, full_name);
      setUser(data.user);
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  const googleLogin = async (accessToken) => {
    try {
      const data = await googleAuth(accessToken);
      setUser(data.user);
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  const updateProfile = async (full_name, email) => {
    try {
      const data = await profileAPI.update(full_name, email);
      setUser(data.user);
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  const logout = async () => {
    await authAPI.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, googleLogin, updateProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
