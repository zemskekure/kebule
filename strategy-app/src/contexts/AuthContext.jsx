import React, { createContext, useContext, useState, useEffect } from 'react';

// Admin users - simple hardcoded list
const ADMIN_USERS = [
  { 
    id: 'u1', 
    email: 'jan.cervenka@ambi.cz', 
    name: 'Jan Červenka', 
    role: 'admin',
    initials: 'JČ'
  },
  { 
    id: 'u2', 
    email: 'stepanka.borisovova@ambi.cz', 
    name: 'Štěpánka Borisovová', 
    role: 'admin',
    initials: 'ŠB'
  }
];

// Simple password - in production, use proper auth!
const ADMIN_PASSWORD = 'ambiente2024';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('ambiente_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        // Verify user still exists in our list
        const validUser = ADMIN_USERS.find(u => u.id === parsed.id);
        if (validUser) {
          setCurrentUser(validUser);
        }
      }
    } catch (e) {
      console.error('Failed to load user:', e);
    }
    setIsLoading(false);
  }, []);

  const login = (email, password) => {
    const normalizedEmail = email.toLowerCase().trim();
    const user = ADMIN_USERS.find(u => u.email.toLowerCase() === normalizedEmail);
    
    if (!user) {
      return { success: false, error: 'Neznámý email' };
    }
    
    if (password !== ADMIN_PASSWORD) {
      return { success: false, error: 'Nesprávné heslo' };
    }
    
    setCurrentUser(user);
    localStorage.setItem('ambiente_user', JSON.stringify(user));
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('ambiente_user');
  };

  const isAdmin = currentUser?.role === 'admin';

  return (
    <AuthContext.Provider value={{
      currentUser,
      isAdmin,
      isLoading,
      login,
      logout,
      ADMIN_USERS
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

// Helper to get user by ID (for displaying who made changes)
export function getUserById(userId) {
  return ADMIN_USERS.find(u => u.id === userId) || null;
}

export { ADMIN_USERS };
