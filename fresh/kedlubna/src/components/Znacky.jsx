import { useState } from 'react';
import './Znacky.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function Znacky({ brands, signals, onCreateBrand, onUpdateBrand, onDeleteBrand }) {
  const [showAdd, setShowAdd] = useState(false);
  const [showBulkAdd, setShowBulkAdd] = useState(false);
  const [bulkPrompt, setBulkPrompt] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);
  const [generatedBrands, setGeneratedBrands] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    vision: '',
    description: '',
    address: '',
    color: '#64B5F6'
  });

  const colors = ['#FF8C00', '#E31837', '#4CAF50', '#2196F3', '#9C27B0', '#FF5722', '#607D8B'];

  const getSignalsCount = (brandId) => {
    return signals.filter(s => s.brand_ids?.includes(brandId)).length;
  };

  const handleAdd = async () => {
    if (!formData.name.trim()) return;
    try {
      await onCreateBrand(formData);
      setFormData({ name: '', vision: '', description: '', address: '', color: '#64B5F6' });
      setShowAdd(false);
    } catch (error) {
      console.error('Failed to create brand:', error);
    }
  };

  const handleEdit = (brand) => {
    setEditingId(brand.id);
    setFormData({
      name: brand.name || '',
      vision: brand.vision || '',
      description: brand.description || '',
      address: brand.address || '',
      color: brand.color || '#64B5F6'
    });
  };

  const handleSaveEdit = async () => {
    try {
      await onUpdateBrand(editingId, formData);
      setEditingId(null);
      setFormData({ name: '', vision: '', description: '', address: '', color: '#64B5F6' });
    } catch (error) {
      console.error('Failed to update brand:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', vision: '', description: '', address: '', color: '#64B5F6' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Opravdu smazat tuto značku?')) {
      try {
        await onDeleteBrand(id);
      } catch (error) {
        console.error('Delete brand error:', error);
        alert('Nepodařilo se smazat značku: ' + (error.message || 'Neznámá chyba'));
      }
    }
  };

  // Bulk add functions
  const handleBulkGenerate = async () => {
    if (!bulkPrompt.trim()) return;
    setBulkLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/generate-brands`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: bulkPrompt })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate');
      }

      setGeneratedBrands(data.brands || []);
    } catch (error) {
      console.error('Failed to generate brands:', error);
      alert(error.message || 'Nepodařilo se vygenerovat značky');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleAddGenerated = async (brand) => {
    try {
      await onCreateBrand(brand);
      setGeneratedBrands(prev => prev.filter(b => b.name !== brand.name));
    } catch (error) {
      console.error('Failed to add brand:', error);
    }
  };

  const handleAddAllGenerated = async () => {
    for (const brand of generatedBrands) {
      try {
        await onCreateBrand(brand);
      } catch (error) {
        console.error('Failed to add brand:', brand.name, error);
      }
    }
    setGeneratedBrands([]);
    setShowBulkAdd(false);
    setBulkPrompt('');
  };

  const handleRemoveGenerated = (name) => {
    setGeneratedBrands(prev => prev.filter(b => b.name !== name));
  };

  const handleCloseBulkAdd = () => {
    setShowBulkAdd(false);
    setGeneratedBrands([]);
    setBulkPrompt('');
  };

  return (
    <div className="znacky">
      <div className="znacky-header">
        <h2>Značky</h2>
        <div className="znacky-header-actions">
          <button className="bulk-add-btn" onClick={() => setShowBulkAdd(true)}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 4H14M2 8H14M2 12H10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Bulk Add (AI)
          </button>
          <button className="add-znacka-btn" onClick={() => setShowAdd(true)}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Přidat značku
          </button>
        </div>
      </div>

      {/* Bulk Add Modal */}
      {showBulkAdd && (
        <div className="bulk-add-overlay" onClick={handleCloseBulkAdd}>
          <div className="bulk-add-modal" onClick={e => e.stopPropagation()}>
            <div className="bulk-add-header">
              <h3>Bulk Add - AI Generování</h3>
              <button className="close-btn" onClick={handleCloseBulkAdd}>×</button>
            </div>

            {generatedBrands.length === 0 ? (
              <div className="bulk-add-form">
                <div className="form-group">
                  <label>Popis značek</label>
                  <textarea
                    placeholder="Např.: Vygeneruj 10 českých restauračních značek zaměřených na tradiční kuchyni, street food koncepty pro mladé..."
                    value={bulkPrompt}
                    onChange={(e) => setBulkPrompt(e.target.value)}
                    rows={4}
                  />
                </div>
                <button
                  className="generate-btn"
                  onClick={handleBulkGenerate}
                  disabled={bulkLoading || !bulkPrompt.trim()}
                >
                  {bulkLoading ? 'Generuji...' : 'Vygenerovat'}
                </button>
              </div>
            ) : (
              <div className="bulk-add-results">
                <div className="results-header">
                  <span>{generatedBrands.length} vygenerovaných značek</span>
                  <button className="add-all-btn" onClick={handleAddAllGenerated}>
                    Přidat všechny
                  </button>
                </div>
                <div className="generated-brands-list">
                  {generatedBrands.map((brand, i) => (
                    <div key={i} className="generated-brand" style={{ borderLeftColor: brand.color }}>
                      <div className="generated-brand-header">
                        <div className="brand-color-dot" style={{ background: brand.color }} />
                        <span className="brand-name">{brand.name}</span>
                        <div className="generated-brand-actions">
                          <button className="add-one-btn" onClick={() => handleAddGenerated(brand)}>
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                              <path d="M2 7L5.5 10.5L12 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                          <button className="remove-btn" onClick={() => handleRemoveGenerated(brand.name)}>
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                              <path d="M3 3L11 11M11 3L3 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                      {brand.vision && <p className="brand-vision">{brand.vision}</p>}
                      {brand.description && <p className="brand-desc">{brand.description}</p>}
                    </div>
                  ))}
                </div>
                <button className="regenerate-btn" onClick={() => setGeneratedBrands([])}>
                  Generovat znovu
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Form */}
      {showAdd && (
        <div className="brand-form">
          <h3>Nová značka</h3>
          <div className="form-group">
            <label>Název značky</label>
            <input
              type="text"
              placeholder="např. Burger King"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              autoFocus
            />
          </div>
          <div className="form-group">
            <label>Vize</label>
            <textarea
              placeholder="Krátká vize značky..."
              value={formData.vision}
              onChange={(e) => setFormData({ ...formData, vision: e.target.value })}
              rows={2}
            />
          </div>
          <div className="form-group">
            <label>Popis</label>
            <textarea
              placeholder="Základní informace o značce, její hodnoty, cílová skupina..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>
          <div className="form-group">
            <label>Adresa</label>
            <input
              type="text"
              placeholder="např. Václavské náměstí 1, Praha"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Barva</label>
            <div className="color-picker">
              {colors.map(c => (
                <button
                  key={c}
                  className={`color-option ${formData.color === c ? 'selected' : ''}`}
                  style={{ background: c }}
                  onClick={() => setFormData({ ...formData, color: c })}
                />
              ))}
            </div>
          </div>
          <div className="form-actions">
            <button className="save-btn" onClick={handleAdd}>Uložit</button>
            <button className="cancel-btn" onClick={() => { setShowAdd(false); setFormData({ name: '', vision: '', description: '', address: '', color: '#64B5F6' }); }}>Zrušit</button>
          </div>
        </div>
      )}

      {/* Brands List */}
      <div className="znacky-list">
        {brands.length === 0 ? (
          <div className="empty-state">
            <p>Zatím žádné značky</p>
            <p className="empty-hint">Přidejte první značku kliknutím na tlačítko výše</p>
          </div>
        ) : (
          brands.map(brand => {
            const isEditing = editingId === brand.id;

            return (
              <div key={brand.id} className="znacka-card" style={{ '--znacka-color': brand.color || '#64B5F6' }}>
                {isEditing ? (
                  // Edit Mode
                  <div className="brand-edit-form">
                    <div className="form-group">
                      <label>Název</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Vize</label>
                      <textarea
                        value={formData.vision}
                        onChange={(e) => setFormData({ ...formData, vision: e.target.value })}
                        rows={2}
                      />
                    </div>
                    <div className="form-group">
                      <label>Popis</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                      />
                    </div>
                    <div className="form-group">
                      <label>Adresa</label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="např. Václavské náměstí 1, Praha"
                      />
                    </div>
                    <div className="form-group">
                      <label>Barva</label>
                      <div className="color-picker">
                        {colors.map(c => (
                          <button
                            key={c}
                            className={`color-option ${formData.color === c ? 'selected' : ''}`}
                            style={{ background: c }}
                            onClick={() => setFormData({ ...formData, color: c })}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="form-actions">
                      <button className="save-btn" onClick={handleSaveEdit}>Uložit</button>
                      <button className="cancel-btn" onClick={handleCancelEdit}>Zrušit</button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <>
                    <div className="znacka-header">
                      <div className="znacka-color" />
                      <h3>{brand.name}</h3>
                    </div>

                    {brand.address && (
                      <p className="znacka-address">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M6 1C4.067 1 2.5 2.567 2.5 4.5C2.5 7.25 6 11 6 11C6 11 9.5 7.25 9.5 4.5C9.5 2.567 7.933 1 6 1Z" stroke="currentColor" strokeWidth="1.2"/>
                          <circle cx="6" cy="4.5" r="1.5" stroke="currentColor" strokeWidth="1.2"/>
                        </svg>
                        {brand.address}
                      </p>
                    )}

                    {brand.vision && (
                      <p className="znacka-vision">{brand.vision}</p>
                    )}

                    {brand.description && (
                      <p className="znacka-description">{brand.description}</p>
                    )}

                    <div className="znacka-footer">
                      <span className="znacka-signals-count">
                        {getSignalsCount(brand.id)} {getSignalsCount(brand.id) === 1 ? 'drobek' : getSignalsCount(brand.id) >= 2 && getSignalsCount(brand.id) <= 4 ? 'drobky' : 'drobků'}
                      </span>
                      <div className="znacka-actions">
                        <button className="edit-btn" onClick={() => handleEdit(brand)} title="Upravit">
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M10.5 1.5L12.5 3.5L4 12H2V10L10.5 1.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                        <button className="delete-btn" onClick={() => handleDelete(brand.id)} title="Smazat">
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M2 4h10M5 4V3a1 1 0 011-1h2a1 1 0 011 1v1M11 4v7a1 1 0 01-1 1H4a1 1 0 01-1-1V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default Znacky;
