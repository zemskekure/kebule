import React, { useState } from 'react';
import { Lock, AlertCircle, X } from 'lucide-react';

export function LoginModal({ onLogin, onClose, theme = 'dark' }) {
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGoogleLogin = async () => {
    setError('');
    setIsSubmitting(true);

    const result = await onLogin();
    
    if (!result.success) {
      setError(result.error || 'Přihlášení se nezdařilo');
      setIsSubmitting(false);
    }
    // If success, user will be redirected to Google and back
  };

  const isDark = theme === 'dark';

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
        borderRadius: '16px',
        padding: '2rem',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e5e7eb',
        position: 'relative'
      }}>
        {/* Close button for Vision view access */}
        {onClose && (
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: 'none',
              border: 'none',
              color: isDark ? '#9ca3af' : '#6b7280',
              cursor: 'pointer',
              padding: '0.25rem'
            }}
          >
            <X size={20} />
          </button>
        )}

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #ea580c, #c2410c)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem'
          }}>
            <Lock size={24} color="white" />
          </div>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 600,
            color: isDark ? '#ffffff' : '#111827',
            margin: 0
          }}>
            Přihlášení
          </h2>
          <p style={{
            color: isDark ? '#9ca3af' : '#6b7280',
            fontSize: '0.875rem',
            marginTop: '0.5rem'
          }}>
            Pro přístup k editoru a dashboardu
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem',
            borderRadius: '8px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            marginBottom: '1rem'
          }}>
            <AlertCircle size={18} color="#ef4444" />
            <span style={{ color: '#ef4444', fontSize: '0.875rem' }}>{error}</span>
          </div>
        )}

        {/* Google Sign In Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={isSubmitting}
          style={{
            width: '100%',
            padding: '0.875rem',
            borderRadius: '8px',
            border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #d1d5db',
            backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff',
            color: isDark ? '#ffffff' : '#111827',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: isSubmitting ? 'wait' : 'pointer',
            opacity: isSubmitting ? 0.7 : 1,
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {isSubmitting ? 'Přihlašuji...' : 'Přihlásit přes Google'}
        </button>

        <p style={{
          textAlign: 'center',
          fontSize: '0.75rem',
          color: isDark ? '#6b7280' : '#9ca3af',
          marginTop: '1.5rem'
        }}>
          Přihlášení je omezeno na Ambiente účty
        </p>
      </div>
    </div>
  );
}
