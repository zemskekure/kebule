import { useState } from 'react';
import { login } from '../utils/auth';
import './LoginScreen.css';

function LoginScreen() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    const result = await login();
    if (!result.success) {
      alert('Přihlášení selhalo. Zkuste to znovu.');
      setIsLoading(false);
    }
    // On success, page will redirect to Google OAuth
  };

  return (
    <div className="login-screen">
      <div className="login-content">
        <div className="logo">
          <div className="logo-orb"></div>
        </div>
        <h1>Drobky</h1>
        <p className="tagline">Rychlé drobky z terénu</p>
        <div className="login-button-wrapper">
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="google-login-button"
          >
            {isLoading ? 'Přihlašování...' : 'Pokračovat přes Google'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginScreen;
