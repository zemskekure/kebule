import { useState, useEffect } from 'react';
import { getSignals } from '../utils/api';
import './DrobekHistory.css';

function DrobekHistory({ token, isOpen, onClose }) {
  const [drobeks, setDrobeks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && token) {
      fetchDrobeks();
    }
  }, [isOpen, token]);

  const fetchDrobeks = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSignals(token, { limit: 10 });
      setDrobeks(data.signals || []);
    } catch (err) {
      console.error('Failed to fetch drobeks:', err);
      setError('Nepodařilo se načíst historii');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'právě teď';
    if (diffMins < 60) return `před ${diffMins} min`;
    if (diffHours < 24) return `před ${diffHours} h`;
    if (diffDays < 7) return `před ${diffDays} d`;
    
    return date.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short' });
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'high': return '🔴';
      case 'med': return '🟡';
      case 'low': return '🟢';
      default: return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="history-overlay" onClick={onClose}>
      <div className="history-panel" onClick={(e) => e.stopPropagation()}>
        <div className="history-header">
          <h3>Poslední drobky</h3>
          <button className="history-close" onClick={onClose}>×</button>
        </div>

        <div className="history-content">
          {loading && (
            <div className="history-loading">Načítání...</div>
          )}

          {error && (
            <div className="history-error">{error}</div>
          )}

          {!loading && !error && drobeks.length === 0 && (
            <div className="history-empty">Zatím žádné drobky</div>
          )}

          {!loading && !error && drobeks.length > 0 && (
            <ul className="history-list">
              {drobeks.map((drobek) => (
                <li key={drobek.id} className={`history-item ${drobek.priority === 'high' ? 'history-item-priority' : ''}`}>
                  <div className="history-item-content">
                    <div className="history-item-header">
                      {drobek.priority && (
                        <span className="history-item-priority-badge">
                          {getPriorityLabel(drobek.priority)}
                        </span>
                      )}
                      <p className="history-item-title">{drobek.title}</p>
                    </div>
                    {drobek.body && (
                      <p className="history-item-body">{drobek.body}</p>
                    )}
                    <div className="history-item-meta">
                      {drobek.author_name && (
                        <span className="history-item-author">{drobek.author_name}</span>
                      )}
                      <span className="history-item-date">
                        {formatDate(drobek.date || drobek.created_at)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default DrobekHistory;
