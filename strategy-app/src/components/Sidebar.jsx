import React, { useState } from 'react';
import { Plus, Filter, ChevronDown, ChevronRight, Zap, HardHat, ExternalLink } from 'lucide-react';

export function Sidebar({
    brands,
    influences,
    newRestaurants,
    selectedBrandIds,
    onAddBrand,
    onAddInfluence,
    onAddNewRestaurant,
    onToggleFilter,
    onSelectInfluence,
    onSelectNewRestaurant,
    selectedNode
}) {
    const [newBrandName, setNewBrandName] = useState('');
    const [newInfluenceTitle, setNewInfluenceTitle] = useState('');
    const [isBrandsExpanded, setIsBrandsExpanded] = useState(false); // Collapsed by default to save space

    const handleAddBrand = (e) => {
        e.preventDefault();
        onAddBrand(newBrandName);
        setNewBrandName('');
    };

    const handleAddInfluence = (e) => {
        e.preventDefault();
        onAddInfluence(newInfluenceTitle, 'external');
        setNewInfluenceTitle('');
    };

    return (
        <div className="panel panel-left">
            <div className="panel-header">
                Filtry & Vlivy
            </div>
            <div className="panel-content">

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
                            color: 'var(--text-color)'
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
                                    style={{ fontSize: '0.85rem', padding: '0.3rem 0.5rem' }}
                                />
                                <button type="submit" className="btn btn-sm btn-primary"><Plus size={14} /></button>
                            </form>
                            <ul className="brand-list" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                {brands.map(brand => (
                                    <li key={brand.id} className="brand-item" style={{ padding: '0.3rem 0' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', width: '100%', fontSize: '0.9rem' }}>
                                            <input
                                                type="checkbox"
                                                className="brand-checkbox"
                                                checked={selectedBrandIds.includes(brand.id)}
                                                onChange={() => onToggleFilter(brand.id)}
                                            />
                                            {brand.name}
                                        </label>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* New Restaurants Section */}
                <div style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <HardHat size={16} /> Nové restaurace
                        </h3>
                        <button className="btn btn-sm btn-primary" onClick={onAddNewRestaurant} title="Přidat novou restauraci">
                            <Plus size={14} />
                        </button>
                    </div>
                    <div className="list-group">
                        {newRestaurants.length === 0 && <p style={{ fontSize: '0.85rem', color: '#888' }}>Žádné plánované otevíračky.</p>}
                        {newRestaurants.map(rest => (
                            <div
                                key={rest.id}
                                className={`node-content ${selectedNode?.id === rest.id ? 'selected' : ''}`}
                                onClick={() => onSelectNewRestaurant(rest.id)}
                                style={{ padding: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem' }}
                            >
                                <div style={{ fontWeight: 500 }}>{rest.title}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--secondary-color)' }}>{rest.openingDate || 'Datum neurčeno'}</div>
                            </div>
                        ))}
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
