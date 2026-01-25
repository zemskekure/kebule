import { useState, useRef, useEffect } from 'react';
import { sendSignal } from '../utils/api';
import { queueSignal } from '../utils/offlineQueue';
import DrobekHistory from './DrobekHistory';
import './Orb.css';

const OrbState = {
  IDLE: 'idle',
  CAPTURE: 'capture',
  SENDING: 'sending',
  SUCCESS: 'success',
  ERROR: 'error'
};

function Orb({ token, user, onLogout }) {
  const [state, setState] = useState(OrbState.IDLE);
  const [inputValue, setInputValue] = useState('');
  const [showSpark, setShowSpark] = useState(false);
  const [sparkStyle, setSparkStyle] = useState({});
  const [showHistory, setShowHistory] = useState(false);
  const inputRef = useRef(null);

  const userName = user?.name || user?.email || '';

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

    // Generate random path for spark/flare
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

    // Wait for spark animation
    setTimeout(async () => {
      try {
        await sendPromise;

        setState(OrbState.SUCCESS);

        if (navigator.vibrate) {
          navigator.vibrate([10, 50, 10]);
        }
      } catch (error) {
        if (error.isTokenError) {
          setShowSpark(false);
          setState(OrbState.IDLE);
          alert('Your session expired. Please log in again.');
          onLogout();
          return;
        }

        console.log('Falling back to offline queue:', error);
        queueSignal(signalData);
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
    }, 3500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getOrbHint = () => {
    if (state === OrbState.IDLE) return 'Ťukni pro signál';
    if (state === OrbState.CAPTURE) {
      return inputValue.trim() ? 'Ťukni pro odeslání' : 'Napiš něco...';
    }
    return '';
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
              <span style={{ marginLeft: '0.5rem', color: '#E57373', fontWeight: '600' }}>! Vysoká priorita</span>
            )}
          </div>
        </div>
      )}

      {/* Success message */}
      {state === OrbState.SUCCESS && (
        <div className="success-message">
          Děkujeme!
        </div>
      )}

      {/* Error message */}
      {state === OrbState.ERROR && (
        <div className="error-message">
          Zkus to znovu
        </div>
      )}

      {/* Hint text */}
      {(state === OrbState.IDLE || state === OrbState.CAPTURE) && (
        <p style={{
          color: '#8B8680',
          fontSize: '15px',
          marginBottom: '-20px',
          fontWeight: '400'
        }}>
          {getOrbHint()}
        </p>
      )}

      {/* The orb - morphs between states */}
      <button
        className={`orb orb-${state} ${inputValue.trim() ? 'orb-ready' : ''}`}
        onClick={handleOrbClick}
        disabled={state === OrbState.SENDING}
      >
        <span className="orb-label"></span>
      </button>

      {/* Spark/Flare animation */}
      {showSpark && <div className="spark" style={sparkStyle} />}

      {/* Navigation */}
      <div className="user-info">
        <button className="history-button" onClick={() => setShowHistory(true)} title="History">
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

      {/* Ambiente Branding */}
      <div className="ambiente-brand">
        <img src="/ambi_symbol_cernobile_rgb_fullhd.png" alt="Ambiente" className="ambiente-logo" />
      </div>
    </div>
  );
}

export default Orb;
