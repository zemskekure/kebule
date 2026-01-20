import { useState } from 'react';
import { login } from '../utils/auth';
import './LoginScreen.css';

function LoginScreen() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    const result = await login();
    if (!result.success) {
      alert('Login failed. Please try again.');
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
        <p className="tagline">Signalizuj malé věci, než se<br />stanou velkými problémy.</p>
        <div className="login-button-wrapper">
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="get-started-button"
          >
            {isLoading ? 'Načítání...' : 'Začít'}
            {!isLoading && (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
        </div>
        <p className="footer-tagline">Pro restaurační týmy, kterým záleží na detailech</p>
      </div>
      <div className="ambiente-brand">
        <img src="/ambi_symbol_cernobile_rgb_fullhd.png" alt="Ambiente" className="ambiente-logo" />
        <span>Důvěrné · Pouze pro interní použití <strong>Ambiente</strong></span>
      </div>
    </div>
  );
}

export default LoginScreen;
