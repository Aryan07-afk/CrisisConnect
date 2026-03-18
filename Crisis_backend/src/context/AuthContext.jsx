import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(() => {
    try { return JSON.parse(localStorage.getItem('cc_user')); }
    catch { return null; }
  });
  const [loading, setLoading] = useState(false);

  const login = async (credentials) => {
    const { data } = await authAPI.login(credentials);
    localStorage.setItem('cc_token', data.data.token);
    localStorage.setItem('cc_user',  JSON.stringify(data.data.user));
    setUser(data.data.user);
    return data.data.user;
  };

  const register = async (payload) => {
    const { data } = await authAPI.register(payload);
    localStorage.setItem('cc_token', data.data.token);
    localStorage.setItem('cc_user',  JSON.stringify(data.data.user));
    setUser(data.data.user);
    return data.data.user;
  };

  const logout = () => {
    localStorage.removeItem('cc_token');
    localStorage.removeItem('cc_user');
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const { data } = await authAPI.getMe();
      setUser(data.data);
      localStorage.setItem('cc_user', JSON.stringify(data.data));
    } catch {}
  };

  const isAdmin       = user?.role === 'admin';
  const isCoordinator = user?.role === 'coordinator';
  const isVolunteer   = user?.role === 'volunteer';
  const canManage     = isAdmin || isCoordinator;

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser, isAdmin, isCoordinator, isVolunteer, canManage }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
