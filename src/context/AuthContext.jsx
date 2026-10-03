import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // Tracks whether there's a charging session in progress, so the nav bar
  // can show a way back to it from anywhere in the site.
  const [activeSessionId, setActiveSessionIdState] = useState(
    localStorage.getItem('activeSessionId') || null
  );

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) setUser(JSON.parse(savedUser));
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login(email, password);
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  };

  const register = async (name, email, password) => {
    await authApi.register(name, email, password);
    return login(email, password);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('activeSessionId');
    setUser(null);
    setActiveSessionIdState(null);
  };

  // Call with a sessionId when charging starts, or null when it ends.
  const setActiveSessionId = (sessionId) => {
    if (sessionId) {
      localStorage.setItem('activeSessionId', sessionId);
    } else {
      localStorage.removeItem('activeSessionId');
    }
    setActiveSessionIdState(sessionId);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, activeSessionId, setActiveSessionId }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
