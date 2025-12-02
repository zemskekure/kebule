import { GoogleLogin } from '@react-oauth/google';
import './LoginScreen.css';

function LoginScreen({ onLogin }) {
  const handleSuccess = (credentialResponse) => {
    onLogin(credentialResponse.credential);
  };

  const handleError = () => {
    alert('Přihlášení selhalo. Zkuste to znovu.');
  };

  return (
    <div className="login-screen">
      <div className="login-content">
        <div className="logo">
          <div className="logo-orb"></div>
        </div>
        <h1>Signal Lite</h1>
        <p className="tagline">Rychlé signály z terénu</p>
        <div className="login-button-wrapper">
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={handleError}
            useOneTap
            theme="filled_black"
            size="large"
            text="continue_with"
            shape="pill"
          />
        </div>
      </div>
    </div>
  );
}

export default LoginScreen;
