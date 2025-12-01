import React, { useState } from 'react';
import { Plus, Filter, ChevronDown, ChevronRight, Zap, HardHat, ExternalLink, Edit2 } from 'lucide-react';

export function Sidebar({
    brands,
    locations,
    influences,
    newRestaurants,
    selectedBrandIds,
    selectedLocationIds,
    onAddBrand,
    onAddLocation,
    onAddInfluence,
    onAddNewRestaurant,
    onToggleFilter,
    onToggleLocationFilter,
    onSelectInfluence,
    onSelectNewRestaurant,
    onSelectBrand,
    selectedNode,
    theme = 'light'
}) {
    const [newLocationName, setNewLocationName] = useState('');
    const [addingLocationToBrandId, setAddingLocationToBrandId] = useState(null);
    const [isBrandsExpanded, setIsBrandsExpanded] = useState(true);
    const [newBrandName, setNewBrandName] = useState('');
    const [newInfluenceTitle, setNewInfluenceTitle] = useState('');

    const handleAddBrand = (e) => {
        e.preventDefault();
        if (newBrandName.trim()) {
            onAddBrand(newBrandName);
            setNewBrandName('');
        }
    };

    const handleAddInfluence = (e) => {
        e.preventDefault();
        if (newInfluenceTitle.trim()) {
            onAddInfluence(newInfluenceTitle, 'external'); // Default to external
            setNewInfluenceTitle('');
        }
    };

    const handleAddLocation = (e, brandId) => {
        e.preventDefault();
        if (newLocationName.trim()) {
            onAddLocation(brandId, newLocationName, '');
            setNewLocationName('');
            setAddingLocationToBrandId(null);
        }
    };

    const newVentures = newRestaurants.filter(r => r.category === 'new');
    const facelifts = newRestaurants.filter(r => r.category === 'facelift');

    return (
        <div className="panel panel-left" style={{
            backgroundColor: theme === 'dark' ? '#0a0a0a' : '#fcfcfc',
            borderRight: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e9ecef'
        }}>
            <div className="panel-header" style={{
                backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)',
                color: theme === 'dark' ? '#ffffff' : '#212529',
                borderBottom: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e9ecef'
            }}>
                Filtry & Vlivy
            </div>
            <div className="panel-content" style={{
                backgroundColor: theme === 'dark' ? '#0a0a0a' : '#fcfcfc'
            }}>

                {/* Collapsible Brand Filters */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <div
                        onClick={() => setIsBrandsExpanded(!isBrandsExpanded)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                            padding: '0.5rem 0',
                            fontWeight: 600,
                            color: theme === 'dark' ? '#ffffff' : '#212529'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Filter size={16} />
                            <span>Značky ({brands.length})</span>
                        </div>
                        {isBrandsExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </div>

                    {isBrandsExpanded && (
                        <div style={{ marginTop: '0.5rem', paddingLeft: '0.5rem', borderLeft: '2px solid var(--border-color)' }}>
                            <form onSubmit={handleAddBrand} className="add-brand-form" style={{ padding: 0, marginBottom: '0.5rem' }}>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Nová značka..."
                                    value={newBrandName}
                                    onChange={e => setNewBrandName(e.target.value)}
                                    style={{
                                        fontSize: '0.85rem',
                                        padding: '0.3rem 0.5rem',
                                        backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#fff',
                                        color: theme === 'dark' ? '#fff' : '#212529',
                                        border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid #e9ecef'
                                    }}
                                />
                                <button type="submit" className="btn btn-sm btn-primary"><Plus size={14} /></button>
                            </form>
                            <ul className="brand-list" style={{ maxHeight: '300px', overflowY: 'auto', textAlign: 'left' }}>
                                {brands.map(brand => (
                                    <li key={brand.id} className="brand-item" style={{ padding: '0.3rem 0', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                                                <input
                                                    type="checkbox"
                                                    className="brand-checkbox"
                                                    checked={selectedBrandIds.includes(brand.id)}
                                                    onChange={() => onToggleFilter(brand.id)}
                                                />
                                                <span style={{ fontSize: '0.9rem', cursor: 'pointer', color: theme === 'dark' ? '#fff' : '#212529' }} onClick={() => onToggleFilter(brand.id)}>{brand.name}</span>
                                            </div>
                                            <div style={{ display: 'flex', gap: '4px' }}>
                                                <button
                                                    className="btn-icon-sm"
                                                    onClick={(e) => { e.stopPropagation(); onSelectBrand(brand.id); }}
                                                    title="Upravit značku"
                                                    style={{ opacity: 0.5, padding: '2px' }}
                                                >
                                                    <Edit2 size={12} />
                                                </button>
                                                <button
                                                    className="btn-icon-sm"
                                                    onClick={(e) => { e.stopPropagation(); setAddingLocationToBrandId(brand.id); }}
                                                    title="Přidat pobočku"
                                                    style={{ opacity: 0.5, padding: '2px' }}
                                                >
                                                    <Plus size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Collapsible Location Filters */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                            padding: '0.5rem 0',
                            fontWeight: 600,
                            color: 'var(--text-color)'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Filter size={16} />
                            <span>Pobočky ({locations.length})</span>
                        </div>
                    </div>

                    <div style={{ marginTop: '0.5rem', paddingLeft: '0.5rem', borderLeft: '2px solid var(--border-color)' }}>
                        <form onSubmit={(e) => { e.preventDefault(); /* Add location logic if needed global */ }} className="add-brand-form" style={{ padding: 0, marginBottom: '0.5rem' }}>
                            {/* Global add location could go here, but currently it's per brand. Let's keep it simple for now. */}
                        </form>
                        <div className="location-list" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            {brands.map(brand => {
                                const brandLocations = (locations || []).filter(l => l.brandId === brand.id);
                                if (brandLocations.length === 0) return null;
                                return (
                                    <div key={brand.id} style={{ marginBottom: '0.5rem' }}>
                                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--secondary-color)', marginBottom: '0.2rem' }}>
                                            {brand.name}
                                            <button
                                                className="btn-icon-sm"
                                                onClick={(e) => { e.stopPropagation(); setAddingLocationToBrandId(brand.id); }}
                                                title="Přidat pobočku"
                                                style={{ opacity: 0.5, padding: '2px', marginLeft: '5px', display: 'inline-flex' }}
                                            >
                                                <Plus size={10} />
                                            </button>
                                        </div>
                                        {brandLocations.map(loc => (
                                            <div key={loc.id} style={{ padding: '2px 0 2px 0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedLocationIds.includes(loc.id)}
                                                    onChange={() => onToggleLocationFilter(loc.id)}
                                                    style={{ width: '12px', height: '12px', cursor: 'pointer' }}
                                                />
                                                <span style={{ fontSize: '0.85rem' }}>{loc.name}</span>
                                            </div>
                                        ))}
                                        {addingLocationToBrandId === brand.id && (
                                            <form onSubmit={(e) => handleAddLocation(e, brand.id)} style={{ display: 'flex', gap: '4px', marginTop: '4px', paddingLeft: '0.5rem' }}>
                                                <input
                                                    autoFocus
                                                    type="text"
                                                    value={newLocationName}
                                                    onChange={e => setNewLocationName(e.target.value)}
                                                    placeholder="Název pobočky..."
                                                    style={{ width: '100%', fontSize: '0.8rem', padding: '2px 4px', border: '1px solid var(--border-color)', borderRadius: '4px', background: 'transparent', color: 'var(--text-color)' }}
                                                    onBlur={() => !newLocationName && setAddingLocationToBrandId(null)}
                                                />
                                            </form>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Rozvoj Section */}
                <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 600, margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-color)' }}>
                        <HardHat size={16} /> Rozvoj (Development)
                    </h3>

                    {/* Nové podniky */}
                    <div style={{ marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.7 }}>Nové podniky</span>
                            <button className="btn btn-sm btn-primary" onClick={() => onAddNewRestaurant('new')} title="Přidat nový koncept">
                                <Plus size={12} />
                            </button>
                        </div>
                        <div className="list-group">
                            {newVentures.length === 0 && <p style={{ fontSize: '0.8rem', color: '#888', fontStyle: 'italic' }}>Žádné nové koncepty.</p>}
                            {newVentures.map(rest => (
                                <div
                                    key={rest.id}
                                    className={`node-content ${selectedNode?.id === rest.id ? 'selected' : ''}`}
                                    onClick={() => onSelectNewRestaurant(rest.id)}
                                    style={{ padding: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem', borderLeft: '3px solid var(--accent-color)' }}
                                >
                                    <div style={{ fontWeight: 500 }}>{rest.title}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--secondary-color)' }}>{rest.openingDate || 'Datum neurčeno'}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Facelifty */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.7 }}>Facelifty & Rekonstrukce</span>
                            <button className="btn btn-sm btn-secondary" onClick={() => onAddNewRestaurant('facelift')} title="Přidat facelift">
                                <Plus size={12} />
                            </button>
                        </div>
                        <div className="list-group">
                            {facelifts.length === 0 && <p style={{ fontSize: '0.8rem', color: '#888', fontStyle: 'italic' }}>Žádné plánované rekonstrukce.</p>}
                            {facelifts.map(rest => (
                                <div
                                    key={rest.id}
                                    className={`node-content ${selectedNode?.id === rest.id ? 'selected' : ''}`}
                                    onClick={() => onSelectNewRestaurant(rest.id)}
                                    style={{ padding: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem', borderLeft: '3px solid #eab308' }}
                                >
                                    <div style={{ fontWeight: 500 }}>{rest.title}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--secondary-color)' }}>{rest.openingDate || 'Datum neurčeno'}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Influences Section */}
                <div>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Zap size={16} /> Vlivy (Influences)
                    </h3>
                    <form onSubmit={handleAddInfluence} className="add-brand-form" style={{ padding: 0 }}>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Nový vliv..."
                            value={newInfluenceTitle}
                            onChange={e => setNewInfluenceTitle(e.target.value)}
                            style={{ fontSize: '0.85rem' }}
                        />
                        <button type="submit" className="btn btn-sm btn-primary"><Plus size={14} /></button>
                    </form>
                    <div className="list-group">
                        {influences.map(inf => (
                            <div
                                key={inf.id}
                                className={`node-content ${selectedNode?.id === inf.id ? 'selected' : ''}`}
                                onClick={() => onSelectInfluence(inf.id)}
                                style={{ padding: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem', borderLeft: `3px solid ${inf.type === 'external' ? 'var(--danger-color)' : 'var(--success-color)'}` }}
                            >
                                <div style={{ fontWeight: 500 }}>{inf.title}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--secondary-color)' }}>{inf.type === 'external' ? 'Externí' : 'Interní'}</div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
