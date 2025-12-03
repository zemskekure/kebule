import { useState, useRef, useEffect } from 'react';
import { sendSignal } from '../utils/api';
import { queueSignal } from '../utils/offlineQueue';
import { isTokenExpired } from '../utils/auth';
import DrobekHistory from './DrobekHistory';
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
  const [showHistory, setShowHistory] = useState(false);
  const inputRef = useRef(null);

  // Decode token to get user name
  useEffect(() => {
    if (token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        // Properly decode UTF-8 from base64
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        const payload = JSON.parse(jsonPayload);
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

    // Check if token is expired
    if (isTokenExpired()) {
      alert('Vaše přihlášení vypršelo. Přihlaste se prosím znovu.');
      onLogout();
      return;
    }

    setState(OrbState.SENDING);
    setShowSpark(true);
    
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }

    // Detect priority from "!" at end of message
    const trimmedInput = inputValue.trim();
    const hasPriority = trimmedInput.endsWith('!');
    const cleanTitle = hasPriority ? trimmedInput.slice(0, -1).trim() : trimmedInput;

    const signalData = {
      title: cleanTitle,
      body: null,
      date: new Date().toISOString(),
      restaurantIds: [],
      priority: hasPriority ? 'high' : null
    };

    // Generate random path for spark
    const newSparkStyle = {
      '--x1': `${Math.random() * 60 - 30}px`,
      '--x2': `${Math.random() * 100 - 50}px`,
      '--x3': `${Math.random() * 100 - 50}px`,
      '--x4': `${Math.random() * 120 - 60}px`,
    };
    setSparkStyle(newSparkStyle);

    // Start sending immediately in background
    const sendPromise = (async () => {
      if (!navigator.onLine) {
        throw new Error('Offline');
      }
      return sendSignal(signalData, token);
    })();

    // Wait for spark animation (4s)
    setTimeout(async () => {
      try {
        // Wait for the request to finish (if it hasn't already)
        await sendPromise;
        
        setState(OrbState.SUCCESS);
        
        if (navigator.vibrate) {
          navigator.vibrate([10, 50, 10]);
        }
      } catch (error) {
        console.log('Falling back to offline queue:', error);
        // If network failed, queue it and still show success (but maybe different?)
        queueSignal(signalData);
        setState(OrbState.SUCCESS); // Show success for user, handled in background
        
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
        return 'Drobek';
      case OrbState.CAPTURE:
        return 'Odeslat';
      case OrbState.SENDING:
        return '';
      case OrbState.SUCCESS:
        return 'Děkujeme!';
      case OrbState.ERROR:
        return 'Zkuste znovu';
      default:
        return 'Drobek';
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
            onChange={(e) => setInputValue(e.target.value.slice(0, 300))}
            onKeyPress={handleKeyPress}
            rows={3}
            maxLength={300}
          />
          <div className="character-counter">
            {inputValue.length}/300
            {inputValue.trim().endsWith('!') && (
              <span style={{ marginLeft: '0.5rem', color: '#ef4444', fontWeight: '600' }}>! Vysoká priorita</span>
            )}
          </div>
        </div>
      )}

      {/* Success message */}
      {state === OrbState.SUCCESS && (
        <div className="success-message">
          Děkujeme za drobek!
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

      {/* Navigation */}
      <div className="user-info">
        <button className="history-button" onClick={() => setShowHistory(true)} title="Historie">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 3.5V8L11 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14 8C14 11.3137 11.3137 14 8 14C4.68629 14 2 11.3137 2 8C2 4.68629 4.68629 2 8 2C10.7614 2 13.0454 3.90721 13.7384 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
        {userName && <span className="user-name">{userName}</span>}
        <button className="logout-button" onClick={onLogout}>
          Odhlásit
        </button>
      </div>

      {/* History Panel */}
      <DrobekHistory 
        token={token} 
        isOpen={showHistory} 
        onClose={() => setShowHistory(false)} 
      />

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
