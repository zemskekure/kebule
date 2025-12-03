import React, { useState, useEffect } from 'react';
import { Database, AlertCircle, CheckCircle, X } from 'lucide-react';
import { migrateLocalStorageToSupabase, needsMigration } from '../utils/migrateToSupabase';

export function MigrationBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    // Check if migration is needed
    const hasMigrationDismissed = localStorage.getItem('migration_dismissed');
    if (!hasMigrationDismissed && needsMigration()) {
      setShowBanner(true);
    }
  }, []);

  const handleMigrate = async () => {
    setMigrating(true);
    setResult(null);

    const migrationResult = await migrateLocalStorageToSupabase();
    setResult(migrationResult);
    setMigrating(false);

    if (migrationResult.success) {
      // Auto-hide after 3 seconds on success and reload to fetch data
      setTimeout(() => {
        setShowBanner(false);
        window.location.reload();
      }, 3000);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('migration_dismissed', 'true');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '80px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 1000,
      width: '90%',
      maxWidth: '600px',
      backgroundColor: '#1e293b',
      border: '1px solid #3b82f6',
      borderRadius: '12px',
      padding: '1.5rem',
      boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
    }}>
      {/* Close button */}
      <button
        onClick={handleDismiss}
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: 'none',
          border: 'none',
          color: '#94a3b8',
          cursor: 'pointer',
          padding: '4px'
        }}
      >
        <X size={20} />
      </button>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
        <Database size={24} color="#3b82f6" />
        <h3 style={{ margin: 0, color: '#fff', fontSize: '1.125rem' }}>
          Migrace dat do Supabase
        </h3>
      </div>

      {/* Content */}
      {!result ? (
        <>
          <p style={{ color: '#cbd5e1', margin: '0 0 1rem 0', fontSize: '0.9375rem' }}>
            Vaše data jsou momentálně uložena lokálně v prohlížeči. Migrujte je do Supabase pro:
          </p>
          <ul style={{ color: '#cbd5e1', margin: '0 0 1.5rem 0', paddingLeft: '1.5rem' }}>
            <li>Synchronizaci mezi zařízeními</li>
            <li>Sdílení s týmem</li>
            <li>Zálohu v cloudu</li>
          </ul>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleMigrate}
              disabled={migrating}
              style={{
                flex: 1,
                padding: '0.75rem 1.5rem',
                backgroundColor: '#3b82f6',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.9375rem',
                fontWeight: 600,
                cursor: migrating ? 'wait' : 'pointer',
                opacity: migrating ? 0.7 : 1
              }}
            >
              {migrating ? 'Migruji...' : 'Migrovat data'}
            </button>
            <button
              onClick={handleDismiss}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: 'transparent',
                color: '#94a3b8',
                border: '1px solid #475569',
                borderRadius: '8px',
                fontSize: '0.9375rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Později
            </button>
          </div>
        </>
      ) : result.success ? (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <CheckCircle size={24} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <p style={{ color: '#10b981', margin: '0 0 0.5rem 0', fontWeight: 600 }}>
              Migrace úspěšná!
            </p>
            <p style={{ color: '#cbd5e1', margin: 0, fontSize: '0.875rem' }}>
              {result.message}
            </p>
            {result.results && (
              <div style={{ marginTop: '0.75rem', fontSize: '0.8125rem', color: '#94a3b8' }}>
                Migrováno: {Object.entries(result.results).map(([key, count]) => 
                  `${count} ${key}`
                ).join(', ')}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <AlertCircle size={24} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <p style={{ color: '#ef4444', margin: '0 0 0.5rem 0', fontWeight: 600 }}>
              Migrace selhala
            </p>
            <p style={{ color: '#cbd5e1', margin: 0, fontSize: '0.875rem' }}>
              {result.message}
            </p>
            <button
              onClick={handleMigrate}
              style={{
                marginTop: '0.75rem',
                padding: '0.5rem 1rem',
                backgroundColor: '#3b82f6',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
            >
              Zkusit znovu
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
