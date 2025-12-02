import { useSignals } from '../hooks/useSignals';
import './SignalsFeed.css';

/**
 * Component to display signals from Signal Lite
 * @param {string} googleToken - Google OAuth token
 */
export function SignalsFeed({ googleToken }) {
  const { signals, loading, error } = useSignals(googleToken);

  if (loading) {
    return (
      <div className="signals-feed">
        <div className="signals-loading">
          <div className="spinner"></div>
          <p>Načítání signálů...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="signals-feed">
        <div className="signals-error">
          <p>❌ Chyba při načítání signálů</p>
          <small>{error}</small>
        </div>
      </div>
    );
  }

  if (signals.length === 0) {
    return (
      <div className="signals-feed">
        <div className="signals-empty">
          <p>📭 Zatím žádné signály</p>
          <small>Signály se zobrazí, jakmile je někdo odešle z aplikace Signal Lite</small>
        </div>
      </div>
    );
  }

  // Sort by date, newest first
  const sortedSignals = [...signals].sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  );

  return (
    <div className="signals-feed">
      <div className="signals-header">
        <h2>📡 Signály z terénu</h2>
        <span className="signals-count">{signals.length} signálů</span>
      </div>

      <div className="signals-list">
        {sortedSignals.map(signal => (
          <div key={signal.id} className="signal-card">
            <div className="signal-header">
              <span className="signal-source">{getSourceLabel(signal.source)}</span>
              <span className="signal-date">
                {formatDate(signal.createdAt)}
              </span>
            </div>

            <h3 className="signal-title">{signal.title}</h3>

            {signal.body && (
              <p className="signal-body">{signal.body}</p>
            )}

            <div className="signal-footer">
              <div className="signal-author">
                <strong>{signal.authorName}</strong>
                <span className="signal-email">{signal.authorEmail}</span>
              </div>
              {signal.authorBrandIds?.length > 0 && (
                <div className="signal-brands">
                  {signal.authorBrandIds.map(brandId => (
                    <span key={brandId} className="brand-tag">
                      {brandId}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function getSourceLabel(source) {
  const labels = {
    restaurant: '🍽️ Restaurace',
    event: '🎉 Akce',
    customer: '👤 Zákazník',
    competitor: '🎯 Konkurence',
    other: '📌 Ostatní'
  };
  return labels[source] || '📌 ' + source;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Právě teď';
  if (diffMins < 60) return `Před ${diffMins} min`;
  if (diffHours < 24) return `Před ${diffHours} h`;
  if (diffDays < 7) return `Před ${diffDays} dny`;
  
  return date.toLocaleDateString('cs-CZ', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export default SignalsFeed;
