import './Login.css';

function Login({ onLogin }) {
  return (
    <div className="login">
      <div className="login-content">
        <div className="login-orb" />
        <h1>Kedlubna</h1>
        <p className="tagline">Správa drobků a strategického plánu</p>
        <button className="login-btn" onClick={onLogin}>
          Přihlásit se
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
      <div className="ambiente-brand">
        <img src="/ambi_symbol_cernobile_rgb_fullhd.png" alt="Ambiente" className="ambiente-logo" />
        <span>Důvěrné · Pouze pro interní použití <strong>Ambiente</strong></span>
      </div>
    </div>
  );
}

export default Login;
