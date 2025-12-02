import { useState, useEffect } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import Orb from './components/Orb';
import LoginScreen from './components/LoginScreen';
import { getStoredToken, storeToken, clearToken } from './utils/auth';
import { processOfflineQueue } from './utils/offlineQueue';
import './App.css';

function App() {
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored token on mount
    const storedToken = getStoredToken();
    if (storedToken) {
      setToken(storedToken);
      // Process any queued signals
      processOfflineQueue(storedToken);
    }
    setIsLoading(false);

    // Listen for online events to process queue
    const handleOnline = () => {
      const currentToken = getStoredToken();
      if (currentToken) {
        processOfflineQueue(currentToken);
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      // Store the access token (we'll exchange it for ID token on backend)
      // For now, we use the credential from the ID token flow
      console.log('Login success:', tokenResponse);
    },
    onError: (error) => {
      console.error('Login failed:', error);
      alert('Login failed. Please try again.');
    },
    flow: 'implicit' // Use implicit flow to get ID token directly
  });

  const handleLogin = (credential) => {
    storeToken(credential);
    setToken(credential);
    processOfflineQueue(credential);
  };

  const handleLogout = () => {
    clearToken();
    setToken(null);
  };

  if (isLoading) {
    return (
      <div className="app loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="app">
      {!token ? (
        <LoginScreen onLogin={handleLogin} />
      ) : (
        <Orb token={token} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
