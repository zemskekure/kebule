import { useState, useEffect } from 'react';
import { supabase } from './services/supabaseClient';
import Orb from './components/Orb';
import LoginScreen from './components/LoginScreen';
import { logout, getUserFromSession } from './utils/auth';
import { processOfflineQueue } from './utils/offlineQueue';
import './App.css';

function App() {
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);

      // Process any queued signals if we have a session
      if (session?.access_token) {
        processOfflineQueue(session.access_token);
      }
    });

    // Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);

      // Process offline queue when user logs in or token refreshes
      if (session?.access_token && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
        processOfflineQueue(session.access_token);
      }
    });

    // Listen for online events to process queue
    const handleOnline = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        processOfflineQueue(session.access_token);
      }
    };

    window.addEventListener('online', handleOnline);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    setSession(null);
  };

  if (isLoading) {
    return (
      <div className="app loading">
        <div className="spinner"></div>
      </div>
    );
  }

  const token = session?.access_token;
  const user = getUserFromSession(session);

  return (
    <div className="app">
      {!session ? (
        <LoginScreen />
      ) : (
        <Orb token={token} user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
