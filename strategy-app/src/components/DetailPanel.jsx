import React from 'react';
import { Save, Trash2 } from 'lucide-react';

export function DetailPanel({ selectedNode, data, onUpdate, onDelete }) {
    if (!selectedNode) {
        return (
            <div className="panel panel-right">
                <div className="panel-header">Detail</div>
                <div className="panel-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'var(--secondary-color)' }}>
                    <p>Vyberte uzel ve stromu nebo vliv v levém panelu.</p>
                </div>
            </div>
        );
    }

    const { type, id } = selectedNode;
    let item, parentItem;

    if (type === 'year') {
        item = data.years.find(i => i.id === id);
    } else if (type === 'vision') {
        item = data.visions.find(i => i.id === id);
        parentItem = data.years.find(y => y.id === item?.yearId);
    } else if (type === 'theme') {
        item = data.themes.find(i => i.id === id);
        parentItem = data.visions.find(v => v.id === item?.visionId);
    } else if (type === 'project') {
        item = data.projects.find(i => i.id === id);
        parentItem = data.themes.find(t => t.id === item?.themeId);
    } else if (type === 'newRestaurant') {
        item = data.newRestaurants.find(i => i.id === id);
    } else if (type === 'influence') {
        item = data.influences.find(i => i.id === id);
    }

    if (!item) return null;

    const handleChange = (field, value) => {
        onUpdate(type, id, { [field]: value });
    };

    const handleNestedChange = (parentField, key, value) => {
        const currentObj = item[parentField] || {};
        onUpdate(type, id, { [parentField]: { ...currentObj, [key]: value } });
    };

    const handleBrandToggle = (brandId) => {
        if (type !== 'project' && type !== 'newRestaurant') return;
        const currentBrands = item.brands || [];
        const newBrands = currentBrands.includes(brandId)
            ? currentBrands.filter(b => b !== brandId)
            : [...currentBrands, brandId];
        handleChange('brands', newBrands);
    };

    const handleInfluenceThemeToggle = (themeId) => {
        if (type !== 'influence') return;
        const currentThemes = item.connectedThemeIds || [];
        const newThemes = currentThemes.includes(themeId)
            ? currentThemes.filter(t => t !== themeId)
            : [...currentThemes, themeId];
        handleChange('connectedThemeIds', newThemes);
    };

    return (
        <div className="panel panel-right">
            <div className="panel-header">
                {type === 'year' && 'Editace Roku'}
                {type === 'vision' && 'Editace Vize'}
                {type === 'theme' && 'Editace Hlavního tématu'}
                {type === 'project' && 'Editace Úkolu'}
                {type === 'newRestaurant' && 'Editace nové restaurace'}
                {type === 'influence' && 'Editace vlivu'}
            </div>
            <div className="panel-content">
                <div className="form-group">
                    <label className="form-label">
                        {type === 'year' ? 'Rok' : 'Název'}
                    </label>
                    <input
                        type="text"
                        className="form-control"
                        value={item.title || item.name || ''}
                        onChange={e => handleChange(item.name ? 'name' : 'title', e.target.value)}
                    />
                </div>

                {type !== 'newRestaurant' && type !== 'year' && (
                    <div className="form-group">
                        <label className="form-label">Popis</label>
                        <textarea
                            className="form-control"
                            value={item.description || ''}
                            onChange={e => handleChange('description', e.target.value)}
                        />
                    </div>
                )}

                {/* Enhanced Profile Fields for New Restaurants */}
                {type === 'newRestaurant' && (
                    <>
                        <div style={{ backgroundColor: '#f0f7ff', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                            <div className="form-group">
                                <label className="form-label">Datum otevření</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={item.openingDate || ''}
                                    onChange={e => handleChange('openingDate', e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Fáze</label>
                                <select
                                    className="form-control"
                                    value={item.phase || 'Idea'}
                                    onChange={e => handleChange('phase', e.target.value)}
                                >
                                    <option value="Idea">Idea</option>
                                    <option value="Construction">Stavba</option>
                                    <option value="Hiring">Nábor</option>
                                    <option value="Menu">Menu & Tasting</option>
                                    <option value="Opening">Opening</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Shrnutí konceptu</label>
                                <textarea
                                    className="form-control"
                                    placeholder="Krátký popis konceptu..."
                                    value={item.conceptSummary || ''}
                                    onChange={e => handleChange('conceptSummary', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Kontaktní osoba</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Jméno a příjmení"
                                value={item.contact || ''}
                                onChange={e => handleChange('contact', e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Account Manager</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Jméno managera"
                                value={item.accountManager || ''}
                                onChange={e => handleChange('accountManager', e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Sociální sítě</label>
                            <input
                                type="text"
                                className="form-control"
                                style={{ marginBottom: '0.5rem' }}
                                placeholder="Web URL"
                                value={item.socialLinks?.web || ''}
                                onChange={e => handleNestedChange('socialLinks', 'web', e.target.value)}
                            />
                            <input
                                type="text"
                                className="form-control"
                                style={{ marginBottom: '0.5rem' }}
                                placeholder="Instagram URL"
                                value={item.socialLinks?.instagram || ''}
                                onChange={e => handleNestedChange('socialLinks', 'instagram', e.target.value)}
                            />
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Facebook URL"
                                value={item.socialLinks?.facebook || ''}
                                onChange={e => handleNestedChange('socialLinks', 'facebook', e.target.value)}
                            />
                        </div>
                    </>
                )}

                {type === 'theme' && (
                    <div className="form-group">
                        <label className="form-label">Priorita</label>
                        <select
                            className="form-control"
                            value={item.priority}
                            onChange={e => handleChange('priority', e.target.value)}
                        >
                            <option value="Nízká">Nízká</option>
                            <option value="Střední">Střední</option>
                            <option value="Vysoká">Vysoká</option>
                        </select>
                    </div>
                )}

                {(type === 'project' || type === 'newRestaurant') && (
                    <>
                        <div className="form-group">
                            <label className="form-label">Stav</label>
                            <select
                                className="form-control"
                                value={item.status}
                                onChange={e => handleChange('status', e.target.value)}
                            >
                                <option value="Nápad">Nápad</option>
                                <option value="V přípravě">V přípravě</option>
                                <option value="Běží">Běží</option>
                                <option value="Hotovo">Hotovo</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Přiřazené značky</label>
                            <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid var(--border-color)', padding: '0.5rem', borderRadius: '0.25rem' }}>
                                {data.brands.map(brand => (
                                    <div key={brand.id} style={{ marginBottom: '0.25rem' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                style={{ marginRight: '0.5rem' }}
                                                checked={(item.brands || []).includes(brand.id)}
                                                onChange={() => handleBrandToggle(brand.id)}
                                            />
                                            {brand.name}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {type === 'influence' && (
                    <>
                        <div className="form-group">
                            <label className="form-label">Typ vlivu</label>
                            <select
                                className="form-control"
                                value={item.type}
                                onChange={e => handleChange('type', e.target.value)}
                            >
                                <option value="external">Externí (Vnější)</option>
                                <option value="internal">Interní (Vnitřní)</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Ovlivňuje témata:</label>
                            <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid var(--border-color)', padding: '0.5rem', borderRadius: '0.25rem' }}>
                                {data.themes.map(theme => (
                                    <div key={theme.id} style={{ marginBottom: '0.25rem' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                style={{ marginRight: '0.5rem' }}
                                                checked={(item.connectedThemeIds || []).includes(theme.id)}
                                                onChange={() => handleInfluenceThemeToggle(theme.id)}
                                            />
                                            {theme.title}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {parentItem && (
                    <div style={{ marginTop: '1rem', padding: '0.5rem', backgroundColor: '#f8f9fa', borderRadius: '0.25rem', fontSize: '0.85rem' }}>
                        <strong>Patří pod:</strong> {parentItem.title}
                    </div>
                )}

                <div style={{ marginTop: '2rem', display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-primary" onClick={() => { }}>
                        <Save size={16} /> Hotovo
                    </button>
                    <button className="btn btn-danger" onClick={() => onDelete(type, id)}>
                        <Trash2 size={16} /> Smazat
                    </button>
                </div>
            </div>
        </div>
    );
}
