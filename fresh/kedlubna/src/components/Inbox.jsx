import { useState } from 'react';
import './Inbox.css';

function Inbox({
  signals,
  topics,
  brands,
  projects,
  onAssignToTopic,
  onUnassignFromTopic,
  onAssignToBrand,
  onUnassignFromBrand,
  onResolve,
  onReject,
  onDelete
}) {
  const [filter, setFilter] = useState('all');
  const [assigningId, setAssigningId] = useState(null);
  const [assignType, setAssignType] = useState(null); // 'topic' or 'brand'

  const formatTime = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'právě teď';
    if (diffMins < 60) return `před ${diffMins} min`;
    if (diffHours < 24) return `před ${diffHours} h`;
    if (diffDays < 7) return `před ${diffDays} d`;
    return d.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short' });
  };

  const getTopicsForSignal = (signal) => {
    return topics.filter(t => signal.topic_ids?.includes(t.id));
  };

  const getBrandsForSignal = (signal) => {
    return brands.filter(b => signal.brand_ids?.includes(b.id));
  };

  const getProjectForSignal = (signal) => {
    if (!signal.project_id) return null;
    return projects?.find(p => p.id === signal.project_id);
  };

  const filteredSignals = signals.filter(s => {
    if (filter === 'inbox') return s.status === 'inbox';
    if (filter === 'assigned') return s.status === 'assigned';
    if (filter === 'resolved') return s.status === 'resolved' || s.status === 'rejected';
    return true;
  });

  const handleAssignTopic = (signalId, topicId) => {
    onAssignToTopic(signalId, topicId);
    setAssigningId(null);
    setAssignType(null);
  };

  const handleAssignBrand = (signalId, brandId) => {
    onAssignToBrand(signalId, brandId);
    setAssigningId(null);
    setAssignType(null);
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'inbox': return 'Nový';
      case 'assigned': return 'Přiřazeno';
      case 'resolved': return 'Vyřešeno';
      case 'rejected': return 'Zamítnuto';
      default: return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'inbox': return '#8B8680';
      case 'assigned': return '#64B5F6';
      case 'resolved': return '#81C784';
      case 'rejected': return '#E57373';
      default: return '#8B8680';
    }
  };

  return (
    <div className="inbox">
      {/* Filters */}
      <div className="inbox-filters">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Vše ({signals.length})
        </button>
        <button
          className={`filter-btn ${filter === 'inbox' ? 'active' : ''}`}
          onClick={() => setFilter('inbox')}
        >
          Nové ({signals.filter(s => s.status === 'inbox').length})
        </button>
        <button
          className={`filter-btn ${filter === 'assigned' ? 'active' : ''}`}
          onClick={() => setFilter('assigned')}
        >
          Přiřazené ({signals.filter(s => s.status === 'assigned').length})
        </button>
        <button
          className={`filter-btn ${filter === 'resolved' ? 'active' : ''}`}
          onClick={() => setFilter('resolved')}
        >
          Vyřešené ({signals.filter(s => s.status === 'resolved' || s.status === 'rejected').length})
        </button>
      </div>

      {/* List */}
      {filteredSignals.length === 0 ? (
        <div className="inbox-empty">
          <p>Žádné signály</p>
        </div>
      ) : (
        <ul className="signals-list">
          {filteredSignals.map(signal => {
            const signalTopics = getTopicsForSignal(signal);
            const signalBrands = getBrandsForSignal(signal);
            const linkedProject = getProjectForSignal(signal);

            return (
              <li key={signal.id} className={`signal-item ${signal.priority === 'high' ? 'priority' : ''} status-${signal.status}`}>
                <div className="signal-content">
                  <div className="signal-header">
                    {signal.priority === 'high' && <span className="priority-badge">!</span>}
                    <span className="signal-title">{signal.title}</span>
                  </div>

                  <div className="signal-meta">
                    <span className="signal-author">{signal.author_name || 'Anonym'}</span>
                    <span className="signal-divider">·</span>
                    <span className="signal-time">{formatTime(signal.created_at)}</span>
                  </div>

                  <div className="signal-row">
                    <span className="signal-status" style={{ color: getStatusColor(signal.status) }}>
                      {getStatusLabel(signal.status)}
                    </span>
                    {signalTopics.map(topic => (
                      <span key={topic.id} className="tag topic-tag" style={{ background: topic.color }}>
                        {topic.name}
                        <button
                          className="tag-remove"
                          onClick={() => onUnassignFromTopic(signal.id, topic.id)}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    {signalBrands.map(brand => (
                      <span key={brand.id} className="tag brand-tag">
                        {brand.name}
                        <button
                          className="tag-remove"
                          onClick={() => onUnassignFromBrand(signal.id, brand.id)}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    {linkedProject && (
                      <span className="signal-project-inline">→ {linkedProject.name}</span>
                    )}
                  </div>

                  {signal.resolution_note && (
                    <div className="signal-resolution">
                      <span className="resolution-label">Poznámka:</span>
                      {signal.resolution_note}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="signal-actions">
                  {signal.status !== 'resolved' && signal.status !== 'rejected' ? (
                    <>
                      {assigningId === signal.id ? (
                        <div className="assign-dropdown">
                          {assignType === 'topic' && (
                            <>
                              <div className="dropdown-header">Přiřadit téma</div>
                              {topics
                                .filter(t => !signal.topic_ids?.includes(t.id))
                                .map(t => (
                                  <button
                                    key={t.id}
                                    className="assign-option"
                                    onClick={() => handleAssignTopic(signal.id, t.id)}
                                  >
                                    <span className="option-dot" style={{ background: t.color }} />
                                    {t.name}
                                  </button>
                                ))}
                              {topics.filter(t => !signal.topic_ids?.includes(t.id)).length === 0 && (
                                <div className="dropdown-empty">Všechna témata přiřazena</div>
                              )}
                            </>
                          )}
                          {assignType === 'brand' && (
                            <>
                              <div className="dropdown-header">Přiřadit značku</div>
                              {brands
                                .filter(b => !signal.brand_ids?.includes(b.id))
                                .map(b => (
                                  <button
                                    key={b.id}
                                    className="assign-option"
                                    onClick={() => handleAssignBrand(signal.id, b.id)}
                                  >
                                    {b.name}
                                  </button>
                                ))}
                              {brands.filter(b => !signal.brand_ids?.includes(b.id)).length === 0 && (
                                <div className="dropdown-empty">Všechny značky přiřazeny</div>
                              )}
                            </>
                          )}
                          <button
                            className="assign-cancel"
                            onClick={() => { setAssigningId(null); setAssignType(null); }}
                          >
                            Zrušit
                          </button>
                        </div>
                      ) : (
                        <div className="action-buttons">
                          <button
                            className="action-btn-icon"
                            onClick={() => { setAssigningId(signal.id); setAssignType('topic'); }}
                            title="Přiřadit téma"
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                          </button>
                          <button
                            className="action-btn-icon resolve"
                            onClick={() => onResolve(signal.id, '')}
                            title="Hotovo"
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8L6.5 11.5L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          </button>
                          <button
                            className="action-btn-icon reject"
                            onClick={() => onReject(signal.id, '')}
                            title="Zamítnout"
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                          </button>
                          <button
                            className="action-btn-icon delete"
                            onClick={() => { if (window.confirm('Smazat?')) onDelete(signal.id); }}
                            title="Smazat"
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 4H14M5 4V3C5 2.44772 5.44772 2 6 2H10C10.5523 2 11 2.44772 11 3V4M6 7V11M10 7V11M4 4L5 13C5 13.5523 5.44772 14 6 14H10C10.5523 14 11 13.5523 11 13L12 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <button
                      className="action-btn-icon delete"
                      onClick={() => { if (window.confirm('Smazat?')) onDelete(signal.id); }}
                      title="Smazat"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 4H14M5 4V3C5 2.44772 5.44772 2 6 2H10C10.5523 2 11 2.44772 11 3V4M6 7V11M10 7V11M4 4L5 13C5 13.5523 5.44772 14 6 14H10C10.5523 14 11 13.5523 11 13L12 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default Inbox;
