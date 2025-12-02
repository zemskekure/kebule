import React from 'react';
import { Save, Trash2, Globe, Instagram } from 'lucide-react';

export function DetailPanel({ selectedNode, data, onUpdate, onDelete, theme = 'light' }) {
    const isDark = theme === 'dark';
    const panelStyle = {
        backgroundColor: isDark ? '#0a0a0a' : '#fcfcfc',
        borderLeft: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e9ecef'
    };
    const headerStyle = {
        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)',
        color: isDark ? '#ffffff' : '#212529',
        borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e9ecef'
    };
    const contentStyle = {
        backgroundColor: isDark ? '#0a0a0a' : '#fcfcfc',
        color: isDark ? '#ffffff' : '#212529'
    };
    const inputStyle = {
        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#fff',
        color: isDark ? '#fff' : '#212529',
        border: isDark ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid #e9ecef'
    };
    const labelStyle = {
        color: isDark ? '#adb5bd' : '#868e96'
    };

    if (!selectedNode) {
        return (
            <div className="panel panel-right" style={panelStyle}>
                <div className="panel-header" style={headerStyle}>Detail</div>
                <div className="panel-content" style={{ ...contentStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                    <p style={{ color: isDark ? '#adb5bd' : '#868e96' }}>Vyberte uzel ve stromu nebo vliv v levém panelu.</p>
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
    } else if (type === 'brand') {
        item = data.brands.find(i => i.id === id);
    } else if (type === 'location') {
        item = (data.locations || []).find(i => i.id === id);
        parentItem = data.brands.find(b => b.id === item?.brandId);
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

    // Toggle influence connection from Theme side (reverse linking)
    const handleThemeInfluenceToggle = (influenceId) => {
        if (type !== 'theme') return;
        const influence = data.influences.find(i => i.id === influenceId);
        if (!influence) return;
        const currentThemes = influence.connectedThemeIds || [];
        const newThemes = currentThemes.includes(id)
            ? currentThemes.filter(t => t !== id)
            : [...currentThemes, id];
        onUpdate('influence', influenceId, { connectedThemeIds: newThemes });
    };

    // Toggle influence connection from Project side
    const handleProjectInfluenceToggle = (influenceId) => {
        if (type !== 'project') return;
        const influence = data.influences.find(i => i.id === influenceId);
        if (!influence) return;
        const currentProjects = influence.connectedProjectIds || [];
        const newProjects = currentProjects.includes(id)
            ? currentProjects.filter(p => p !== id)
            : [...currentProjects, id];
        onUpdate('influence', influenceId, { connectedProjectIds: newProjects });
    };

    return (
        <div className="panel panel-right" style={panelStyle}>
            <div className="panel-header" style={headerStyle}>
                {type === 'year' && 'Editace Roku'}
                {type === 'vision' && 'Editace Vize'}
                {type === 'theme' && 'Editace Hlavního tématu'}
                {type === 'project' && 'Editace Úkolu'}
                {type === 'newRestaurant' && 'Editace nové restaurace'}
                {type === 'influence' && 'Editace vlivu'}
                {type === 'brand' && 'Editace značky'}
                {type === 'location' && 'Editace pobočky'}
            </div>
            <div className="panel-content" style={contentStyle}>
                <div className="form-group">
                    <label className="form-label" style={labelStyle}>
                        {type === 'year' ? 'Rok' : 'Název'}
                    </label>
                    <input
                        type="text"
                        className="form-control"
                        style={inputStyle}
                        value={item.title || item.name || ''}
                        onChange={e => handleChange(item.name ? 'name' : 'title', e.target.value)}
                    />
                </div>

                {type !== 'newRestaurant' && type !== 'year' && (
                    <div className="form-group">
                        <label className="form-label" style={labelStyle}>Popis</label>
                        <textarea
                            className="form-control"
                            style={inputStyle}
                            value={item.description || ''}
                            onChange={e => handleChange('description', e.target.value)}
                        />
                    </div>
                )}

                {/* Enhanced Profile Fields for New Restaurants */}
                {type === 'newRestaurant' && (
                    <>
                        <div style={{ backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#f0f7ff', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                            <div className="form-group">
                                <label className="form-label" style={labelStyle}>Kategorie</label>
                                <select
                                    className="form-control"
                                    style={inputStyle}
                                    value={item.category || 'new'}
                                    onChange={e => handleChange('category', e.target.value)}
                                >
                                    <option value="new">Nový koncept</option>
                                    <option value="facelift">Facelift / Rekonstrukce</option>
                                </select>
                            </div>

                            {item.category === 'facelift' && (
                                <div className="form-group">
                                    <label className="form-label" style={labelStyle}>Lokace (Pobočka)</label>
                                    <select
                                        className="form-control"
                                        style={inputStyle}
                                        value={item.locationId || ''}
                                        onChange={e => handleChange('locationId', e.target.value)}
                                    >
                                        <option value="">-- Vyberte pobočku --</option>
                                        {/* Show locations for selected brands, or all if no brand selected */}
                                        {(data.locations || [])
                                            .filter(l => item.brands?.length ? item.brands.includes(l.brandId) : true)
                                            .map(loc => (
                                                <option key={loc.id} value={loc.id}>
                                                    {data.brands.find(b => b.id === loc.brandId)?.name} - {loc.name}
                                                </option>
                                            ))}
                                    </select>
                                </div>
                            )}

                            {/* Different fields for Facelifts vs New Restaurants */}
                            {item.category === 'facelift' ? (
                                <>
                                    <div className="form-group">
                                        <label className="form-label" style={labelStyle}>Datum realizace</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            style={inputStyle}
                                            value={item.realizationDate || ''}
                                            onChange={e => handleChange('realizationDate', e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label" style={labelStyle}>Zavřeno od</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            style={inputStyle}
                                            value={item.closedFrom || ''}
                                            onChange={e => handleChange('closedFrom', e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label" style={labelStyle}>Zavřeno do</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            style={inputStyle}
                                            value={item.closedTo || ''}
                                            onChange={e => handleChange('closedTo', e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label" style={labelStyle}>Plánované změny</label>
                                        <textarea
                                            className="form-control"
                                            style={{ ...inputStyle, minHeight: '100px' }}
                                            placeholder="Popište plánované změny..."
                                            value={item.plannedChanges || ''}
                                            onChange={e => handleChange('plannedChanges', e.target.value)}
                                        />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="form-group">
                                        <label className="form-label" style={labelStyle}>Datum otevření</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            style={inputStyle}
                                            value={item.openingDate || ''}
                                            onChange={e => handleChange('openingDate', e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label" style={labelStyle}>Shrnutí konceptu</label>
                                        <textarea
                                            className="form-control"
                                            style={inputStyle}
                                            placeholder="Krátký popis konceptu..."
                                            value={item.conceptSummary || ''}
                                            onChange={e => handleChange('conceptSummary', e.target.value)}
                                        />
                                    </div>
                                </>
                            )}

                            <div className="form-group">
                                <label className="form-label" style={labelStyle}>Fáze</label>
                                <select
                                    className="form-control"
                                    style={inputStyle}
                                    value={item.phase || 'Nápad'}
                                    onChange={e => handleChange('phase', e.target.value)}
                                >
                                    <option value="Nápad">Nápad</option>
                                    {item.category === 'facelift' ? (
                                        <>
                                            <option value="Plánování">Plánování</option>
                                            <option value="Rekonstrukce">Rekonstrukce</option>
                                            <option value="Znovuotevření">Znovuotevření</option>
                                        </>
                                    ) : (
                                        <>
                                            <option value="Stavba">Stavba</option>
                                            <option value="Nábor">Nábor</option>
                                            <option value="Menu">Menu a testování</option>
                                            <option value="Otevření">Otevření</option>
                                        </>
                                    )}
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label" style={labelStyle}>Kontaktní osoba</label>
                            <input
                                type="text"
                                className="form-control"
                                style={inputStyle}
                                placeholder="Jméno a příjmení"
                                value={item.contact || ''}
                                onChange={e => handleChange('contact', e.target.value)}
                            />
                        </div>

                        {/* Social links and Account Manager only for NEW restaurants */}
                        {item.category !== 'facelift' && (
                            <>
                                <div className="form-group">
                                    <label className="form-label" style={labelStyle}>Account Manager</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        style={inputStyle}
                                        placeholder="Jméno managera"
                                        value={item.accountManager || ''}
                                        onChange={e => handleChange('accountManager', e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label" style={labelStyle}>Sociální sítě</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        style={{ ...inputStyle, marginBottom: '0.5rem' }}
                                        placeholder="Web URL"
                                        value={item.socialLinks?.web || ''}
                                        onChange={e => handleNestedChange('socialLinks', 'web', e.target.value)}
                                    />
                                    <input
                                        type="text"
                                        className="form-control"
                                        style={{ ...inputStyle, marginBottom: '0.5rem' }}
                                        placeholder="Instagram URL"
                                        value={item.socialLinks?.instagram || ''}
                                        onChange={e => handleNestedChange('socialLinks', 'instagram', e.target.value)}
                                    />
                                    <input
                                        type="text"
                                        className="form-control"
                                        style={inputStyle}
                                        placeholder="Facebook URL"
                                        value={item.socialLinks?.facebook || ''}
                                        onChange={e => handleNestedChange('socialLinks', 'facebook', e.target.value)}
                                    />
                                </div>
                            </>
                        )}
                    </>
                )}

                {type === 'theme' && (
                    <>
                        <div className="form-group">
                            <label className="form-label" style={labelStyle}>Priorita</label>
                            <select
                                className="form-control"
                                style={inputStyle}
                                value={item.priority}
                                onChange={e => handleChange('priority', e.target.value)}
                            >
                                <option value="Nízká">Nízká</option>
                                <option value="Střední">Střední</option>
                                <option value="Vysoká">Vysoká</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label" style={labelStyle}>Vlivy (proč téma existuje):</label>
                            <div style={{ maxHeight: '200px', overflowY: 'auto', border: isDark ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid #e9ecef', padding: '0.5rem', borderRadius: '0.25rem', backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#fff' }}>
                                {(data.influences || []).length === 0 && (
                                    <p style={{ color: isDark ? '#adb5bd' : '#868e96', fontSize: '0.85rem', margin: 0 }}>Žádné vlivy k dispozici</p>
                                )}
                                {(data.influences || []).map(influence => {
                                    const isConnected = (influence.connectedThemeIds || []).includes(id);
                                    const isExternal = influence.type === 'external';
                                    return (
                                        <div key={influence.id} style={{ marginBottom: '0.25rem' }}>
                                            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', color: isDark ? '#fff' : '#212529' }}>
                                                <input
                                                    type="checkbox"
                                                    style={{ marginRight: '0.5rem' }}
                                                    checked={isConnected}
                                                    onChange={() => handleThemeInfluenceToggle(influence.id)}
                                                />
                                                <span style={{
                                                    display: 'inline-block',
                                                    width: '8px',
                                                    height: '8px',
                                                    borderRadius: '50%',
                                                    backgroundColor: isExternal ? '#dc3545' : '#198754',
                                                    marginRight: '0.5rem'
                                                }} />
                                                {influence.title}
                                                <span style={{ fontSize: '0.75rem', color: isDark ? '#adb5bd' : '#868e96', marginLeft: '0.5rem' }}>
                                                    ({isExternal ? 'externí' : 'interní'})
                                                </span>
                                            </label>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </>
                )}

                {(type === 'project' || type === 'newRestaurant') && (
                    <>
                        <div className="form-group">
                            <label className="form-label" style={labelStyle}>Stav</label>
                            <select
                                className="form-control"
                                style={inputStyle}
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
                            <label className="form-label" style={labelStyle}>Přiřazené značky</label>
                            <div style={{ maxHeight: '200px', overflowY: 'auto', border: isDark ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid #e9ecef', padding: '0.5rem', borderRadius: '0.25rem', backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#fff' }}>
                                {data.brands.map(brand => (
                                    <div key={brand.id} style={{ marginBottom: '0.25rem' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', color: isDark ? '#fff' : '#212529' }}>
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

                {type === 'project' && (
                    <div className="form-group">
                        <label className="form-label" style={labelStyle}>Vlivy (tlaky na tento projekt):</label>
                        <div style={{ maxHeight: '200px', overflowY: 'auto', border: isDark ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid #e9ecef', padding: '0.5rem', borderRadius: '0.25rem', backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#fff' }}>
                            {(data.influences || []).length === 0 && (
                                <p style={{ color: isDark ? '#adb5bd' : '#868e96', fontSize: '0.85rem', margin: 0 }}>Žádné vlivy k dispozici</p>
                            )}
                            {(data.influences || []).map(influence => {
                                const isConnected = (influence.connectedProjectIds || []).includes(id);
                                const isExternal = influence.type === 'external';
                                return (
                                    <div key={influence.id} style={{ marginBottom: '0.25rem' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', color: isDark ? '#fff' : '#212529' }}>
                                            <input
                                                type="checkbox"
                                                style={{ marginRight: '0.5rem' }}
                                                checked={isConnected}
                                                onChange={() => handleProjectInfluenceToggle(influence.id)}
                                            />
                                            <span style={{
                                                display: 'inline-block',
                                                width: '8px',
                                                height: '8px',
                                                borderRadius: '50%',
                                                backgroundColor: isExternal ? '#dc3545' : '#198754',
                                                marginRight: '0.5rem'
                                            }} />
                                            {influence.title}
                                            <span style={{ fontSize: '0.75rem', color: isDark ? '#adb5bd' : '#868e96', marginLeft: '0.5rem' }}>
                                                ({isExternal ? 'externí' : 'interní'})
                                            </span>
                                        </label>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {type === 'influence' && (
                    <>
                        <div className="form-group">
                            <label className="form-label" style={labelStyle}>Typ vlivu</label>
                            <select
                                className="form-control"
                                style={inputStyle}
                                value={item.type}
                                onChange={e => handleChange('type', e.target.value)}
                            >
                                <option value="external">Externí (Vnější)</option>
                                <option value="internal">Interní (Vnitřní)</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label" style={labelStyle}>Ovlivňuje témata:</label>
                            <div style={{ maxHeight: '200px', overflowY: 'auto', border: isDark ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid #e9ecef', padding: '0.5rem', borderRadius: '0.25rem', backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#fff' }}>
                                {data.themes.map(themeItem => (
                                    <div key={themeItem.id} style={{ marginBottom: '0.25rem' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', color: isDark ? '#fff' : '#212529' }}>
                                            <input
                                                type="checkbox"
                                                style={{ marginRight: '0.5rem' }}
                                                checked={(item.connectedThemeIds || []).includes(themeItem.id)}
                                                onChange={() => handleInfluenceThemeToggle(themeItem.id)}
                                            />
                                            {themeItem.title}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {type === 'brand' && (
                    <>
                        <div className="form-group">
                            <label className="form-label" style={labelStyle}>Krátký koncept</label>
                            <input
                                type="text"
                                className="form-control"
                                style={inputStyle}
                                value={item.conceptShort || ''}
                                onChange={e => handleChange('conceptShort', e.target.value)}
                                placeholder="Např. Tradiční česká hospoda"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label" style={labelStyle}>Popis</label>
                            <textarea
                                className="form-control"
                                style={{ ...inputStyle, minHeight: '80px' }}
                                value={item.description || ''}
                                onChange={e => handleChange('description', e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label" style={labelStyle}>Rok založení</label>
                            <input
                                type="text"
                                className="form-control"
                                style={inputStyle}
                                value={item.foundationYear || ''}
                                onChange={e => handleChange('foundationYear', e.target.value)}
                                placeholder="Např. 2009"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label" style={labelStyle}>Web</label>
                            <input
                                type="text"
                                className="form-control"
                                style={inputStyle}
                                value={item.socialLinks?.web || ''}
                                onChange={e => handleNestedChange('socialLinks', 'web', e.target.value)}
                                placeholder="https://..."
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label" style={labelStyle}>Instagram</label>
                            <input
                                type="text"
                                className="form-control"
                                style={inputStyle}
                                value={item.socialLinks?.instagram || ''}
                                onChange={e => handleNestedChange('socialLinks', 'instagram', e.target.value)}
                                placeholder="@username"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label" style={labelStyle}>Kontakt</label>
                            <input
                                type="text"
                                className="form-control"
                                style={inputStyle}
                                value={item.contact || ''}
                                onChange={e => handleChange('contact', e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label" style={labelStyle}>Account Manager</label>
                            <input
                                type="text"
                                className="form-control"
                                style={inputStyle}
                                value={item.accountManager || ''}
                                onChange={e => handleChange('accountManager', e.target.value)}
                            />
                        </div>
                    </>
                )}

                {type === 'location' && (
                    <>
                        <div className="form-group">
                            <label className="form-label" style={labelStyle}>Adresa</label>
                            <input
                                type="text"
                                className="form-control"
                                style={inputStyle}
                                value={item.address || ''}
                                onChange={e => handleChange('address', e.target.value)}
                                placeholder="Ulice, město"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label" style={labelStyle}>Account Manager</label>
                            <input
                                type="text"
                                className="form-control"
                                style={inputStyle}
                                value={item.accountManager || ''}
                                onChange={e => handleChange('accountManager', e.target.value)}
                                placeholder="Jméno managera"
                            />
                        </div>
                    </>
                )}

                {parentItem && (
                    <div style={{ marginTop: '1rem', padding: '0.5rem', backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#f8f9fa', borderRadius: '0.25rem', fontSize: '0.85rem', color: isDark ? '#adb5bd' : '#212529' }}>
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
