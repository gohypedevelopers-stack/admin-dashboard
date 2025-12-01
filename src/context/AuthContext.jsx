import React, { createContext, useContext, useMemo, useState } from 'react';
import { getAdminToken, setAdminToken } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = getAdminToken();
    if (!token) return null;
    return { email: 'admin', role: 'admin' };
  });

  const login = ({ user: nextUser, token }) => {
    if (token) {
      setAdminToken(token);
    }
    setUser(nextUser || null);
  };

  const logout = () => {
    setAdminToken('');
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user && getAdminToken()),
      login,
      logout
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
