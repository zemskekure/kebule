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

  const getStatusInfo = (drobek) => {
    const info = { badges: [], note: null };

    // Check what's been done with this signal
    if (drobek.status === 'resolved') {
      info.badges.push({ label: 'Vyřešeno', color: '#4CAF50', bg: '#E8F5E9' });
      if (drobek.resolution_note) info.note = drobek.resolution_note;
    } else if (drobek.status === 'rejected') {
      info.badges.push({ label: 'Zamítnuto', color: '#E57373', bg: '#FFEBEE' });
      if (drobek.resolution_note) info.note = drobek.resolution_note;
    } else if (drobek.status === 'inbox') {
      info.badges.push({ label: 'Čeká na zpracování', color: '#8B8680', bg: '#F5F2ED' });
    } else {
      // Status is 'assigned' - show what it's assigned to
      if (drobek.project_id) {
        info.badges.push({ label: 'Přidáno do projektu', color: '#7E57C2', bg: '#EDE7F6' });
      }
      if (drobek.topic_ids?.length > 0) {
        info.badges.push({ label: `${drobek.topic_ids.length} témat`, color: '#66BB6A', bg: '#E8F5E9' });
      }
      if (drobek.brand_ids?.length > 0) {
        info.badges.push({ label: `${drobek.brand_ids.length} značek`, color: '#42A5F5', bg: '#E3F2FD' });
      }
      if (info.badges.length === 0) {
        info.badges.push({ label: 'Zpracovává se', color: '#64B5F6', bg: '#E3F2FD' });
      }
    }

    return info;
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
              {drobeks.map((drobek) => {
                const statusInfo = getStatusInfo(drobek);
                return (
                  <li key={drobek.id} className={`history-item ${drobek.priority === 'high' ? 'history-item-priority' : ''} history-item-${drobek.status}`}>
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
                      <div className="history-item-badges">
                        {statusInfo.badges.map((badge, i) => (
                          <span
                            key={i}
                            className="history-item-status-badge"
                            style={{ background: badge.bg, color: badge.color }}
                          >
                            {badge.label}
                          </span>
                        ))}
                      </div>
                      {statusInfo.note && (
                        <p className="history-item-note">{statusInfo.note}</p>
                      )}
                      <div className="history-item-meta">
                        <span className="history-item-date">
                          {formatDate(drobek.created_at)}
                        </span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default DrobekHistory;
