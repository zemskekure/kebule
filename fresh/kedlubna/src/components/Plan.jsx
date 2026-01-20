import { useState } from 'react';
import './Plan.css';

function Plan({ topics, signals, onAddTopic, onDeleteTopic, onUnassignSignal }) {
  const [newTopic, setNewTopic] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const getSignalsForTopic = (topicId) => {
    return signals.filter(s => s.topic_ids?.includes(topicId));
  };

  const handleAdd = () => {
    if (!newTopic.trim()) return;
    onAddTopic(newTopic.trim());
    setNewTopic('');
    setShowAdd(false);
  };

  return (
    <div className="plan">
      <div className="plan-header">
        <h2>Plán 2026</h2>
        <button className="add-theme-btn" onClick={() => setShowAdd(true)}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Přidat téma
        </button>
      </div>

      {/* Add Topic Form */}
      {showAdd && (
        <div className="add-theme-form">
          <input
            type="text"
            placeholder="Název tématu..."
            value={newTopic}
            onChange={(e) => setNewTopic(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            autoFocus
          />
          <button className="save-btn" onClick={handleAdd}>Uložit</button>
          <button className="cancel-btn" onClick={() => { setShowAdd(false); setNewTopic(''); }}>Zrušit</button>
        </div>
      )}

      {/* Topics Grid */}
      <div className="themes-grid">
        {topics.length === 0 ? (
          <div className="empty-state">
            <p>Zatím žádná témata</p>
            <p className="empty-hint">Vytvořte první téma kliknutím na tlačítko výše</p>
          </div>
        ) : (
          topics.map(topic => {
            const topicSignals = getSignalsForTopic(topic.id);

            return (
              <div key={topic.id} className="theme-card" style={{ '--theme-color': topic.color }}>
                <div className="theme-header">
                  <div className="theme-dot" />
                  <h3>{topic.name}</h3>
                  <span className="theme-count">{topicSignals.length}</span>
                  <button className="delete-btn" onClick={() => onDeleteTopic(topic.id)} title="Smazat">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M3 3L11 11M11 3L3 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
                <div className="theme-drobky">
                  {topicSignals.length === 0 ? (
                    <p className="empty-hint">Přiřaďte signály z inboxu</p>
                  ) : (
                    <ul className="tema-drobky-list">
                      {topicSignals.map(s => (
                        <li key={s.id} className={`tema-drobek ${s.priority === 'high' ? 'priority' : ''}`}>
                          <span className="tema-drobek-title">{s.title}</span>
                          <button
                            className="tema-drobek-remove"
                            onClick={() => onUnassignSignal(s.id, topic.id)}
                            title="Odebrat"
                          >
                            ×
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default Plan;
