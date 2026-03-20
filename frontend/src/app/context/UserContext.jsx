import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUser } from '@/auth/auth';
import { authService } from '@/api/authService';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    const user = getUser();
    if (!user || !user.id) {
      setUserData(null);
      setLoading(false);
      return;
    }

    try {
      const res = await authService.getUserSummary(user.id);
      if (res.success && res.data) {
        setUserData(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch user context", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <UserContext.Provider value={{ userData, loading, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
