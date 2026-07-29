import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') !== 'false';
  });

  // Apply/remove dark mode class on html element
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.remove('light');
    } else {
      root.classList.add('light');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  // Fetch current user on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await apiRequest('/auth/me');
        setUser(res.data.user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const register = useCallback(async (name, email, password) => {
    const res = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    });
    setUser(res.data.user);
    return res;
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    setUser(res.data.user);
    return res;
  }, []);

  const logout = useCallback(async () => {
    await apiRequest('/auth/logout', { method: 'POST' });
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (name, email) => {
    const res = await apiRequest('/auth/details', {
      method: 'PUT',
      body: JSON.stringify({ name, email })
    });
    setUser(res.data.user);
    return res;
  }, []);

  const changePassword = useCallback(async (currentPassword, newPassword) => {
    return await apiRequest('/auth/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword })
    });
  }, []);

  const deleteAccount = useCallback(async () => {
    await apiRequest('/auth/account', { method: 'DELETE' });
    setUser(null);
  }, []);

  const toggleDarkMode = useCallback(() => {
    setDarkMode((prev) => !prev);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        darkMode,
        register,
        login,
        logout,
        updateProfile,
        changePassword,
        deleteAccount,
        toggleDarkMode
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
