import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

// Role mapping - determines user roles based on email
// Later this can move to Supabase profiles table
const ROLE_MAP = {
  'jan.cervenka@amanual.cz': 'admin', // Correct spelling
  'jan.cervenka@ambi.cz': 'admin',
  'stepanka.borisovova@ambi.cz': 'admin',
  // Add more users here as needed
};

const AuthContext = createContext(null);

function getInitials(name) {
  if (!name) return '?';
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return parts[0][0] + parts[parts.length - 1][0];
  }
  return name.substring(0, 2).toUpperCase();
}

function getUserRole(email) {
  const normalizedEmail = email?.toLowerCase()?.trim();
  return ROLE_MAP[normalizedEmail] || 'viewer';
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [googleToken, setGoogleToken] = useState(null); // Now stores Supabase access token

  // Load user session on mount and subscribe to auth changes
  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (session?.user) {
        const user = session.user;
        const userData = {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || user.user_metadata?.full_name || user.email,
          role: getUserRole(user.email),
          initials: getInitials(user.user_metadata?.name || user.user_metadata?.full_name || user.email),
          avatar: user.user_metadata?.avatar_url || user.user_metadata?.picture
        };
        setCurrentUser(userData);
        
        // Use Supabase access token for Signal Lite API
        setGoogleToken(session.access_token);
      }
      setIsLoading(false);
    });

    // Proactively refresh session every 30 minutes to keep user logged in
    const refreshInterval = setInterval(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // This triggers Supabase to refresh the token if needed
        await supabase.auth.refreshSession();
      }
    }, 30 * 60 * 1000); // 30 minutes

    // Also refresh when user returns to the tab after being away
    const handleVisibilityChange = async () => {
      if (!document.hidden) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await supabase.auth.refreshSession();
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const user = session.user;
        const userData = {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || user.user_metadata?.full_name || user.email,
          role: getUserRole(user.email),
          initials: getInitials(user.user_metadata?.name || user.user_metadata?.full_name || user.email),
          avatar: user.user_metadata?.avatar_url || user.user_metadata?.picture
        };
        setCurrentUser(userData);
        
        // Use Supabase access token for Signal Lite API
        setGoogleToken(session.access_token);
      } else {
        setCurrentUser(null);
        setGoogleToken(null);
      }
    });

    return () => {
      subscription.unsubscribe();
      clearInterval(refreshInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const login = async () => {
    // Don't specify redirectTo - let Supabase use the current URL
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        queryParams: {
          prompt: 'select_account', // Force account selection
          access_type: 'offline' // Request refresh token
        },
        scopes: 'email profile' // Request necessary scopes
      }
    });
    
    if (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
  };

  const isAdmin = currentUser?.role === 'admin';

  return (
    <AuthContext.Provider value={{
      currentUser,
      isAdmin,
      isLoading,
      googleToken,
      login,
      logout
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
// This is a stub for now - in the future we can fetch from Supabase profiles table
export function getUserById(userId) {
  // For now, return a placeholder since we don't have a local user cache
  // Later: query Supabase profiles table or maintain a cache
  return {
    id: userId,
    name: 'User',
    email: '',
    initials: 'U'
  };
}
