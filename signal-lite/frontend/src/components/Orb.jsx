import { useState, useRef, useEffect } from 'react';
import { sendSignal } from '../utils/api';
import { queueSignal } from '../utils/offlineQueue';
import './Orb.css';

const OrbState = {
  IDLE: 'idle',
  CAPTURE: 'capture',
  SENDING: 'sending',
  SUCCESS: 'success',
  ERROR: 'error'
};

function Orb({ token, onLogout }) {
  const [state, setState] = useState(OrbState.IDLE);
  const [inputValue, setInputValue] = useState('');
  const [showSpark, setShowSpark] = useState(false);
  const [sparkStyle, setSparkStyle] = useState({});
  const [userName, setUserName] = useState('');
  const inputRef = useRef(null);

  // Decode token to get user name
  useEffect(() => {
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserName(payload.name || payload.email);
      } catch (e) {
        console.error('Failed to decode token', e);
      }
    }
  }, [token]);

  useEffect(() => {
    if (state === OrbState.CAPTURE && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [state]);

  const handleOrbClick = () => {
    if (state === OrbState.IDLE) {
      setState(OrbState.CAPTURE);
      if (navigator.vibrate) {
        navigator.vibrate(10);
      }
    } else if (state === OrbState.CAPTURE) {
      handleSend();
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    setState(OrbState.SENDING);
    setShowSpark(true);
    
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }

    const signalData = {
      title: inputValue.trim(),
      body: null,
      date: new Date().toISOString()
    };

    // Generate random path for spark
    const newSparkStyle = {
      '--x1': `${Math.random() * 60 - 30}px`,
      '--x2': `${Math.random() * 100 - 50}px`,
      '--x3': `${Math.random() * 100 - 50}px`,
      '--x4': `${Math.random() * 120 - 60}px`,
    };
    setSparkStyle(newSparkStyle);

    // Wait for spark animation (4s)
    setTimeout(async () => {
      try {
        if (!navigator.onLine) {
          queueSignal(signalData);
          setState(OrbState.SUCCESS);
        } else {
          await sendSignal(signalData, token);
          setState(OrbState.SUCCESS);
          
          if (navigator.vibrate) {
            navigator.vibrate([10, 50, 10]);
          }
        }

        setShowSpark(false);
        
        // Reset after success
        setTimeout(() => {
          setState(OrbState.IDLE);
          setInputValue('');
        }, 2000);
      } catch (error) {
        console.error('Failed to send signal:', error);
        queueSignal(signalData);
        setState(OrbState.ERROR);
        setShowSpark(false);
        
        if (navigator.vibrate) {
          navigator.vibrate([50, 100, 50]);
        }

        setTimeout(() => {
          setState(OrbState.IDLE);
          setInputValue('');
        }, 2000);
      }
    }, 4000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getOrbClass = () => {
    return `orb orb-${state}`;
  };

  const getOrbLabel = () => {
    switch (state) {
      case OrbState.IDLE:
        return 'Signal';
      case OrbState.CAPTURE:
        return 'Send';
      case OrbState.SENDING:
        return '';
      case OrbState.SUCCESS:
        return 'Signál odeslán';
      case OrbState.ERROR:
        return 'Zkuste znovu';
      default:
        return 'Signal';
    }
  };

  return (
    <div className="orb-container">
      {/* Text input - appears above orb in capture state */}
      {state === OrbState.CAPTURE && (
        <div className="input-container">
          <textarea
            ref={inputRef}
            className="signal-input"
            placeholder="Co se děje?"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            rows={3}
          />
        </div>
      )}

      {/* Success message */}
      {state === OrbState.SUCCESS && (
        <div className="success-message">
          Signál odeslán
        </div>
      )}

      {/* Error message */}
      {state === OrbState.ERROR && (
        <div className="error-message">
          Zkuste znovu
        </div>
      )}

      {/* The orb - morphs between states */}
      <button 
        className={`orb orb-${state} ${inputValue.trim() ? 'orb-ready' : ''}`}
        onClick={handleOrbClick}
        disabled={state === OrbState.SENDING}
      >
        <span className="orb-label">{getOrbLabel()}</span>
      </button>

      {/* Spark animation */}
      {showSpark && <div className="spark" style={sparkStyle} />}

      {/* Logout button */}
      <div className="user-info">
        {userName && <span className="user-name">{userName}</span>}
        <button className="logout-button" onClick={onLogout}>
          Odhlásit
        </button>
      </div>

      {/* Offline indicator */}
      {!navigator.onLine && (
        <div className="offline-indicator">
          Offline režim
        </div>
      )}
    </div>
  );
}

export default Orb;
