import { useState, useMemo } from 'react';
import { Search, Filter, Radio, AlertCircle, CheckCircle, Archive, ArrowRight } from 'lucide-react';
import './SignalsInbox.css';

/**
 * Enhanced Signals Inbox for admin triage
 */
export function SignalsInbox({ signals = [], projects = [], influences = [], onSelectSignal, theme = 'light' }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [restaurantFilter, setRestaurantFilter] = useState('all');

  const isDark = theme === 'dark';
  const bgColor = isDark ? '#0a0a0a' : '#f8f9fa';
  const cardBg = isDark ? 'rgba(255, 255, 255, 0.05)' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#212529';
  const textSecondary = isDark ? '#adb5bd' : '#6c757d';
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.1)' : '#e9ecef';

  // Get unique restaurants from signals
  const restaurants = useMemo(() => {
    const restaurantSet = new Set();
    signals.forEach(signal => {
      (signal.restaurantIds || []).forEach(id => restaurantSet.add(id));
    });
    return Array.from(restaurantSet);
  }, [signals]);

  // Filter signals
  const filteredSignals = useMemo(() => {
    let result = signals;

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(s => s.status === statusFilter);
    }

    // Restaurant filter
    if (restaurantFilter !== 'all') {
      result = result.filter(s => (s.restaurantIds || []).includes(restaurantFilter));
    }

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s => 
        s.title?.toLowerCase().includes(q) || 
        s.body?.toLowerCase().includes(q) ||
        s.authorName?.toLowerCase().includes(q)
      );
    }

    // Sort newest first
    return result.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
  }, [signals, statusFilter, restaurantFilter, searchQuery]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'inbox': return '#6366f1';
      case 'triaged': return '#f59e0b';
      case 'converted': return '#10b981';
      case 'archived': return '#6b7280';
      default: return textSecondary;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'inbox': return <Radio size={14} />;
      case 'triaged': return <Filter size={14} />;
      case 'converted': return <CheckCircle size={14} />;
      case 'archived': return <Archive size={14} />;
      default: return <AlertCircle size={14} />;
    }
  };

  const getStatusLabel = (signal) => {
    const status = signal.status;
    if (status === 'converted') {
      if (signal.projectId) {
        const project = projects.find(p => p.id === signal.projectId);
        return project ? `Převedeno na: ${project.title}` : 'Převedeno na projekt';
      }
      if (signal.influenceId) {
        const influence = influences.find(i => i.id === signal.influenceId);
        return influence ? `Převedeno na: ${influence.title}` : 'Převedeno na vliv';
      }
      return 'Převedeno';
    }

    switch (status) {
      case 'inbox': return 'Inbox';
      case 'triaged': return 'Tříděno';
      case 'converted': return 'Převedeno';
      case 'archived': return 'Archivováno';
      default: return status || 'Neznámý';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
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
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
      backgroundColor: bgColor,
      overflow: 'hidden'
    }}>
      {/* Header with filters */}
      <div style={{ 
        padding: '1.5rem',
        borderBottom: `1px solid ${borderColor}`,
        backgroundColor: cardBg
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '1rem'
        }}>
          <h2 style={{ margin: 0, color: textColor, fontSize: '1.5rem' }}>
            📡 Drobky
          </h2>
          <span style={{ 
            padding: '0.25rem 0.75rem',
            borderRadius: '12px',
            backgroundColor: isDark ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.1)',
            color: '#6366f1',
            fontSize: '0.85rem',
            fontWeight: '600'
          }}>
            {filteredSignals.length} drobků
          </span>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: '1rem' }}>
          <Search size={16} style={{ 
            position: 'absolute', 
            left: '0.75rem', 
            top: '50%', 
            transform: 'translateY(-50%)',
            color: textSecondary
          }} />
          <input
            type="text"
            placeholder="Hledat v drobcích..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem 0.5rem 2.5rem',
              borderRadius: '8px',
              border: `1px solid ${borderColor}`,
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#fff',
              color: textColor,
              fontSize: '0.9rem'
            }}
          />
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{
              flex: 1,
              padding: '0.5rem',
              borderRadius: '8px',
              border: `1px solid ${borderColor}`,
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#fff',
              color: textColor,
              fontSize: '0.85rem'
            }}
          >
            <option value="all">Všechny stavy</option>
            <option value="inbox">Inbox</option>
            <option value="triaged">Tříděno</option>
            <option value="converted">Převedeno</option>
            <option value="archived">Archivováno</option>
          </select>

          {restaurants.length > 0 && (
            <select
              value={restaurantFilter}
              onChange={e => setRestaurantFilter(e.target.value)}
              style={{
                flex: 1,
                padding: '0.5rem',
                borderRadius: '8px',
                border: `1px solid ${borderColor}`,
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#fff',
                color: textColor,
                fontSize: '0.85rem'
              }}
            >
              <option value="all">Všechny pobočky</option>
              {restaurants.map(id => (
                <option key={id} value={id}>{id}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Signals list */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto',
        padding: '1rem'
      }}>
        {filteredSignals.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem 1rem',
            color: textSecondary
          }}>
            <Radio size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <p>Žádné drobky</p>
            <small>Zkuste změnit filtry nebo vytvořit nový drobek v Signal Lite</small>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filteredSignals.map(signal => (
              <div
                key={signal.id}
                onClick={() => onSelectSignal?.(signal)}
                style={{
                  padding: '1rem',
                  borderRadius: '8px',
                  backgroundColor: cardBg,
                  border: `1px solid ${borderColor}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  ':hover': {
                    borderColor: '#6366f1'
                  }
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#6366f1'}
                onMouseLeave={e => e.currentTarget.style.borderColor = borderColor}
              >
                {/* Header */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  marginBottom: '0.5rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '6px',
                      backgroundColor: `${getStatusColor(signal.status)}20`,
                      color: getStatusColor(signal.status),
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}>
                      {getStatusIcon(signal.status)}
                      {getStatusLabel(signal)}
                    </span>
                    {signal.priority === 'high' && (
                      <span style={{ 
                        padding: '0.25rem 0.5rem',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(239, 68, 68, 0.2)',
                        color: '#ef4444',
                        fontSize: '0.75rem',
                        fontWeight: '600'
                      }}>
                        ! Vysoká priorita
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: textSecondary }}>
                    {formatDate(signal.createdAt || signal.date)}
                  </span>
                </div>

                {/* Title */}
                <h3 style={{ 
                  margin: '0 0 0.5rem 0',
                  color: textColor,
                  fontSize: '1rem',
                  fontWeight: '600'
                }}>
                  {signal.title}
                </h3>

                {/* Body preview */}
                {signal.body && (
                  <p style={{ 
                    margin: '0 0 0.75rem 0',
                    color: textSecondary,
                    fontSize: '0.85rem',
                    lineHeight: '1.4',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical'
                  }}>
                    {signal.body}
                  </p>
                )}

                {/* Footer */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  fontSize: '0.8rem',
                  color: textSecondary
                }}>
                  <div>
                    <strong style={{ color: textColor }}>{signal.authorName}</strong>
                    {signal.authorEmail && (
                      <span style={{ marginLeft: '0.5rem' }}>{signal.authorEmail}</span>
                    )}
                  </div>
                  <ArrowRight size={16} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SignalsInbox;
