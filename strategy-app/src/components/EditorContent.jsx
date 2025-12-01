import React, { useState } from 'react';
import { Plus, ChevronDown, ChevronRight, Edit2, Trash2, Calendar, MapPin, User, ExternalLink, Zap } from 'lucide-react';
import { BackupManager } from './BackupManager';

// Šiška Content (Thought System)
function ThoughtSystemContent({ data, onSelectNode, selectedNode, expandedNodes, onToggleNode, onAddYear, onAddVision, onAddTheme, onAddProject, theme }) {
    const isDark = theme === 'dark';
    const textColor = isDark ? '#ffffff' : '#212529';
    const textSecondary = isDark ? '#adb5bd' : '#6c757d';
    const borderColor = isDark ? 'rgba(255, 255, 255, 0.1)' : '#e9ecef';
    const cardBg = isDark ? 'rgba(255, 255, 255, 0.03)' : '#ffffff';

    return (
        <div style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0, color: textColor, fontSize: '1.5rem' }}>Šiška</h2>
                <button
                    onClick={onAddYear}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        backgroundColor: isDark ? '#ffffff' : '#000000',
                        color: isDark ? '#000000' : '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 500
                    }}
                >
                    <Plus size={16} /> Přidat rok
                </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {data.years.map(year => {
                    const yearVisions = data.visions.filter(v => v.yearId === year.id);
                    const isExpanded = expandedNodes[year.id];

                    return (
                        <div
                            key={year.id}
                            style={{
                                border: `1px solid ${borderColor}`,
                                borderRadius: '12px',
                                backgroundColor: cardBg,
                                overflow: 'hidden'
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '1rem',
                                    cursor: 'pointer',
                                    backgroundColor: selectedNode?.id === year.id
                                        ? (isDark ? 'rgba(0, 180, 216, 0.1)' : 'rgba(0, 180, 216, 0.05)')
                                        : 'transparent'
                                }}
                                onClick={() => onSelectNode('year', year.id)}
                            >
                                <button
                                    onClick={(e) => { e.stopPropagation(); onToggleNode(year.id); }}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: '4px',
                                        color: textSecondary
                                    }}
                                >
                                    {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                                </button>
                                <Calendar size={20} style={{ marginRight: '0.75rem', color: '#00b4d8' }} />
                                <span style={{ fontSize: '1.1rem', fontWeight: 600, color: textColor }}>{year.title}</span>
                                <span style={{ marginLeft: 'auto', fontSize: '0.85rem', color: textSecondary }}>
                                    {yearVisions.length} vize
                                </span>
                            </div>

                            {isExpanded && (
                                <div style={{ padding: '0 1rem 1rem 2.5rem' }}>
                                    {yearVisions.map(vision => {
                                        const visionThemes = data.themes.filter(t => t.visionId === vision.id);
                                        const isVisionExpanded = expandedNodes[vision.id];

                                        return (
                                            <div key={vision.id} style={{ marginTop: '0.75rem' }}>
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        padding: '0.75rem',
                                                        borderRadius: '8px',
                                                        backgroundColor: selectedNode?.id === vision.id
                                                            ? (isDark ? 'rgba(0, 180, 216, 0.15)' : 'rgba(0, 180, 216, 0.1)')
                                                            : (isDark ? 'rgba(255, 255, 255, 0.03)' : '#f8f9fa'),
                                                        cursor: 'pointer'
                                                    }}
                                                    onClick={() => onSelectNode('vision', vision.id)}
                                                >
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); onToggleNode(vision.id); }}
                                                        style={{
                                                            background: 'none',
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                            padding: '4px',
                                                            color: textSecondary
                                                        }}
                                                    >
                                                        {isVisionExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                                    </button>
                                                    <span style={{ fontWeight: 500, color: textColor }}>{vision.title}</span>
                                                    <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: textSecondary }}>
                                                        {visionThemes.length} témat
                                                    </span>
                                                </div>

                                                {isVisionExpanded && (
                                                    <div style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
                                                        {visionThemes.map(themeItem => {
                                                            const themeProjects = data.projects.filter(p => p.themeId === themeItem.id);
                                                            const isThemeExpanded = expandedNodes[themeItem.id];

                                                            return (
                                                                <div key={themeItem.id} style={{ marginBottom: '0.5rem' }}>
                                                                    <div
                                                                        style={{
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            padding: '0.5rem 0.75rem',
                                                                            borderLeft: '3px solid #ffc107',
                                                                            backgroundColor: selectedNode?.id === themeItem.id
                                                                                ? (isDark ? 'rgba(255, 193, 7, 0.1)' : 'rgba(255, 193, 7, 0.05)')
                                                                                : 'transparent',
                                                                            cursor: 'pointer',
                                                                            borderRadius: '0 6px 6px 0'
                                                                        }}
                                                                        onClick={() => onSelectNode('theme', themeItem.id)}
                                                                    >
                                                                        <button
                                                                            onClick={(e) => { e.stopPropagation(); onToggleNode(themeItem.id); }}
                                                                            style={{
                                                                                background: 'none',
                                                                                border: 'none',
                                                                                cursor: 'pointer',
                                                                                padding: '2px',
                                                                                marginRight: '0.5rem',
                                                                                color: textSecondary
                                                                            }}
                                                                        >
                                                                            {isThemeExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                                                        </button>
                                                                        <span style={{ color: textColor, fontWeight: 500, flex: 1 }}>{themeItem.title}</span>
                                                                        <span style={{ fontSize: '0.75rem', color: textSecondary }}>{themeProjects.length} projektů</span>
                                                                    </div>

                                                                    {/* Projects under theme */}
                                                                    {isThemeExpanded && (
                                                                        <div style={{ marginLeft: '1.5rem', marginTop: '0.25rem' }}>
                                                                            {themeProjects.map(project => (
                                                                                <div
                                                                                    key={project.id}
                                                                                    onClick={() => onSelectNode('project', project.id)}
                                                                                    style={{
                                                                                        display: 'flex',
                                                                                        alignItems: 'center',
                                                                                        padding: '0.5rem 0.75rem',
                                                                                        marginBottom: '0.25rem',
                                                                                        borderLeft: '3px solid #198754',
                                                                                        backgroundColor: selectedNode?.id === project.id
                                                                                            ? (isDark ? 'rgba(25, 135, 84, 0.15)' : 'rgba(25, 135, 84, 0.1)')
                                                                                            : (isDark ? 'rgba(255, 255, 255, 0.02)' : '#fafafa'),
                                                                                        cursor: 'pointer',
                                                                                        borderRadius: '0 6px 6px 0'
                                                                                    }}
                                                                                >
                                                                                    <div style={{ flex: 1 }}>
                                                                                        <div style={{ color: textColor, fontWeight: 500, fontSize: '0.9rem' }}>{project.title}</div>
                                                                                        {project.description && (
                                                                                            <div style={{ fontSize: '0.8rem', color: textSecondary, marginTop: '0.25rem' }}>{project.description}</div>
                                                                                        )}
                                                                                    </div>
                                                                                    <span style={{
                                                                                        fontSize: '0.7rem',
                                                                                        padding: '0.2rem 0.5rem',
                                                                                        borderRadius: '4px',
                                                                                        backgroundColor: project.status === 'Hotovo' ? 'rgba(25, 135, 84, 0.2)' :
                                                                                            project.status === 'Běží' ? 'rgba(13, 110, 253, 0.2)' :
                                                                                                project.status === 'V přípravě' ? 'rgba(255, 193, 7, 0.2)' : 'rgba(108, 117, 125, 0.2)',
                                                                                        color: project.status === 'Hotovo' ? '#198754' :
                                                                                            project.status === 'Běží' ? '#0d6efd' :
                                                                                                project.status === 'V přípravě' ? '#cc9a00' : textSecondary
                                                                                    }}>
                                                                                        {project.status}
                                                                                    </span>
                                                                                </div>
                                                                            ))}
                                                                            {themeProjects.length === 0 && (
                                                                                <div style={{ fontSize: '0.8rem', color: textSecondary, fontStyle: 'italic', padding: '0.5rem 0.75rem' }}>
                                                                                    Žádné projekty
                                                                                </div>
                                                                            )}
                                                                            <button
                                                                                onClick={() => onAddProject(themeItem.id)}
                                                                                style={{
                                                                                    display: 'flex',
                                                                                    alignItems: 'center',
                                                                                    gap: '0.25rem',
                                                                                    padding: '0.25rem 0.5rem',
                                                                                    marginTop: '0.25rem',
                                                                                    background: 'none',
                                                                                    border: `1px dashed ${borderColor}`,
                                                                                    borderRadius: '4px',
                                                                                    color: textSecondary,
                                                                                    cursor: 'pointer',
                                                                                    fontSize: '0.75rem'
                                                                                }}
                                                                            >
                                                                                <Plus size={12} /> Přidat projekt
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                        <button
                                                            onClick={() => onAddTheme(vision.id)}
                                                            style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '0.25rem',
                                                                padding: '0.25rem 0.5rem',
                                                                marginTop: '0.5rem',
                                                                background: 'none',
                                                                border: `1px dashed ${borderColor}`,
                                                                borderRadius: '4px',
                                                                color: textSecondary,
                                                                cursor: 'pointer',
                                                                fontSize: '0.8rem'
                                                            }}
                                                        >
                                                            <Plus size={14} /> Přidat téma
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                    <button
                                        onClick={() => onAddVision(year.id)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.25rem',
                                            padding: '0.5rem 0.75rem',
                                            marginTop: '0.75rem',
                                            background: 'none',
                                            border: `1px dashed ${borderColor}`,
                                            borderRadius: '6px',
                                            color: textSecondary,
                                            cursor: 'pointer',
                                            fontSize: '0.85rem'
                                        }}
                                    >
                                        <Plus size={14} /> Přidat vizi
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// Influences Content
function InfluencesContent({ data, onSelectNode, selectedNode, onAddInfluence, theme }) {
    const isDark = theme === 'dark';
    const textColor = isDark ? '#ffffff' : '#212529';
    const textSecondary = isDark ? '#adb5bd' : '#6c757d';
    const borderColor = isDark ? 'rgba(255, 255, 255, 0.1)' : '#e9ecef';
    const cardBg = isDark ? 'rgba(255, 255, 255, 0.03)' : '#ffffff';

    const externalInfluences = (data.influences || []).filter(i => i.type === 'external');
    const internalInfluences = (data.influences || []).filter(i => i.type === 'internal');

    const renderInfluenceCard = (influence) => (
        <div
            key={influence.id}
            onClick={() => onSelectNode('influence', influence.id)}
            style={{
                padding: '1rem',
                borderRadius: '8px',
                border: `1px solid ${selectedNode?.id === influence.id ? '#00b4d8' : borderColor}`,
                backgroundColor: selectedNode?.id === influence.id
                    ? (isDark ? 'rgba(0, 180, 216, 0.1)' : 'rgba(0, 180, 216, 0.05)')
                    : cardBg,
                cursor: 'pointer',
                transition: 'all 0.2s'
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <Zap size={18} style={{ color: influence.type === 'external' ? '#dc3545' : '#198754' }} />
                <span style={{ fontWeight: 600, color: textColor }}>{influence.title}</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.85rem', color: textSecondary }}>{influence.description}</p>
            {influence.connectedThemeIds?.length > 0 && (
                <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {influence.connectedThemeIds.map(themeId => {
                        const themeItem = data.themes.find(t => t.id === themeId);
                        return themeItem ? (
                            <span
                                key={themeId}
                                style={{
                                    fontSize: '0.75rem',
                                    padding: '0.25rem 0.5rem',
                                    borderRadius: '4px',
                                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#f1f3f5',
                                    color: textSecondary
                                }}
                            >
                                {themeItem.title}
                            </span>
                        ) : null;
                    })}
                </div>
            )}
        </div>
    );

    return (
        <div style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0, color: textColor, fontSize: '1.5rem' }}>Vlivy</h2>
                <button
                    onClick={() => onAddInfluence('', 'external')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        backgroundColor: isDark ? '#ffffff' : '#000000',
                        color: isDark ? '#000000' : '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 500
                    }}
                >
                    <Plus size={16} /> Přidat vliv
                </button>
            </div>

            <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ color: '#dc3545', fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ExternalLink size={18} /> Externí vlivy ({externalInfluences.length})
                </h3>
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                    {externalInfluences.map(renderInfluenceCard)}
                    {externalInfluences.length === 0 && (
                        <p style={{ color: textSecondary, fontStyle: 'italic' }}>Žádné externí vlivy</p>
                    )}
                </div>
            </div>

            <div>
                <h3 style={{ color: '#198754', fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Zap size={18} /> Interní vlivy ({internalInfluences.length})
                </h3>
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                    {internalInfluences.map(renderInfluenceCard)}
                    {internalInfluences.length === 0 && (
                        <p style={{ color: textSecondary, fontStyle: 'italic' }}>Žádné interní vlivy</p>
                    )}
                </div>
            </div>
        </div>
    );
}

// Reconstructions Content
function ReconstructionsContent({ data, onSelectNode, selectedNode, onAddNewRestaurant, theme }) {
    const isDark = theme === 'dark';
    const textColor = isDark ? '#ffffff' : '#212529';
    const textSecondary = isDark ? '#adb5bd' : '#6c757d';
    const borderColor = isDark ? 'rgba(255, 255, 255, 0.1)' : '#e9ecef';
    const cardBg = isDark ? 'rgba(255, 255, 255, 0.03)' : '#ffffff';

    const facelifts = (data.newRestaurants || []).filter(r => r.category === 'facelift');

    return (
        <div style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0, color: textColor, fontSize: '1.5rem' }}>Rekonstrukce & Facelifty</h2>
                <button
                    onClick={() => onAddNewRestaurant('facelift')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        backgroundColor: '#eab308',
                        color: '#000000',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 500
                    }}
                >
                    <Plus size={16} /> Přidat rekonstrukci
                </button>
            </div>

            <div style={{ display: 'grid', gap: '1rem' }}>
                {facelifts.map(item => {
                    const location = data.locations?.find(l => l.id === item.locationId);
                    const brand = location ? data.brands.find(b => b.id === location.brandId) : null;

                    return (
                        <div
                            key={item.id}
                            onClick={() => onSelectNode('newRestaurant', item.id)}
                            style={{
                                padding: '1.25rem',
                                borderRadius: '12px',
                                border: `1px solid ${selectedNode?.id === item.id ? '#eab308' : borderColor}`,
                                borderLeft: '4px solid #eab308',
                                backgroundColor: selectedNode?.id === item.id
                                    ? (isDark ? 'rgba(234, 179, 8, 0.1)' : 'rgba(234, 179, 8, 0.05)')
                                    : cardBg,
                                cursor: 'pointer'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                                <h3 style={{ margin: 0, color: textColor, fontSize: '1.1rem' }}>{item.title}</h3>
                                <span style={{
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '12px',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    backgroundColor: isDark ? 'rgba(234, 179, 8, 0.2)' : 'rgba(234, 179, 8, 0.15)',
                                    color: '#eab308'
                                }}>
                                    {item.phase}
                                </span>
                            </div>
                            <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem', color: textSecondary }}>
                                {location && (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <MapPin size={14} /> {brand?.name} - {location.name}
                                    </span>
                                )}
                                {item.openingDate && (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <Calendar size={14} /> {item.openingDate}
                                    </span>
                                )}
                                {item.contact && (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <User size={14} /> {item.contact}
                                    </span>
                                )}
                            </div>
                            {item.conceptSummary && (
                                <p style={{ margin: '0.75rem 0 0', fontSize: '0.85rem', color: textSecondary }}>{item.conceptSummary}</p>
                            )}
                        </div>
                    );
                })}
                {facelifts.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '3rem', color: textSecondary }}>
                        <p>Žádné plánované rekonstrukce</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// New Restaurants Content
function NewRestaurantsContent({ data, onSelectNode, selectedNode, onAddNewRestaurant, theme }) {
    const isDark = theme === 'dark';
    const textColor = isDark ? '#ffffff' : '#212529';
    const textSecondary = isDark ? '#adb5bd' : '#6c757d';
    const borderColor = isDark ? 'rgba(255, 255, 255, 0.1)' : '#e9ecef';
    const cardBg = isDark ? 'rgba(255, 255, 255, 0.03)' : '#ffffff';

    const newVentures = (data.newRestaurants || []).filter(r => r.category === 'new');

    return (
        <div style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0, color: textColor, fontSize: '1.5rem' }}>Nové restaurace</h2>
                <button
                    onClick={() => onAddNewRestaurant('new')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        backgroundColor: '#00b4d8',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 500
                    }}
                >
                    <Plus size={16} /> Přidat novou restauraci
                </button>
            </div>

            <div style={{ display: 'grid', gap: '1rem' }}>
                {newVentures.map(item => (
                    <div
                        key={item.id}
                        onClick={() => onSelectNode('newRestaurant', item.id)}
                        style={{
                            padding: '1.25rem',
                            borderRadius: '12px',
                            border: `1px solid ${selectedNode?.id === item.id ? '#00b4d8' : borderColor}`,
                            borderLeft: '4px solid #00b4d8',
                            backgroundColor: selectedNode?.id === item.id
                                ? (isDark ? 'rgba(0, 180, 216, 0.1)' : 'rgba(0, 180, 216, 0.05)')
                                : cardBg,
                            cursor: 'pointer'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                            <h3 style={{ margin: 0, color: textColor, fontSize: '1.1rem' }}>{item.title}</h3>
                            <span style={{
                                padding: '0.25rem 0.75rem',
                                borderRadius: '12px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                backgroundColor: isDark ? 'rgba(0, 180, 216, 0.2)' : 'rgba(0, 180, 216, 0.15)',
                                color: '#00b4d8'
                            }}>
                                {item.phase}
                            </span>
                        </div>
                        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem', color: textSecondary }}>
                            {item.openingDate && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <Calendar size={14} /> {item.openingDate}
                                </span>
                            )}
                            {item.contact && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <User size={14} /> {item.contact}
                                </span>
                            )}
                        </div>
                        {item.conceptSummary && (
                            <p style={{ margin: '0.75rem 0 0', fontSize: '0.85rem', color: textSecondary }}>{item.conceptSummary}</p>
                        )}
                    </div>
                ))}
                {newVentures.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '3rem', color: textSecondary }}>
                        <p>Žádné nové restaurace v plánu</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// Brands Content
function BrandsContent({ data, onSelectNode, selectedNode, onAddBrand, onAddLocation, theme }) {
    const isDark = theme === 'dark';
    const textColor = isDark ? '#ffffff' : '#212529';
    const textSecondary = isDark ? '#adb5bd' : '#6c757d';
    const borderColor = isDark ? 'rgba(255, 255, 255, 0.1)' : '#e9ecef';
    const cardBg = isDark ? 'rgba(255, 255, 255, 0.03)' : '#ffffff';

    const [expandedBrands, setExpandedBrands] = useState({});

    const toggleBrand = (brandId) => {
        setExpandedBrands(prev => ({ ...prev, [brandId]: !prev[brandId] }));
    };

    return (
        <div style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0, color: textColor, fontSize: '1.5rem' }}>Značky & Pobočky</h2>
                <button
                    onClick={() => onAddBrand('')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        backgroundColor: isDark ? '#ffffff' : '#000000',
                        color: isDark ? '#000000' : '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 500
                    }}
                >
                    <Plus size={16} /> Přidat značku
                </button>
            </div>

            <div style={{ display: 'grid', gap: '0.75rem' }}>
                {data.brands.map(brand => {
                    const brandLocations = (data.locations || []).filter(l => l.brandId === brand.id);
                    const isExpanded = expandedBrands[brand.id];

                    return (
                        <div
                            key={brand.id}
                            style={{
                                borderRadius: '12px',
                                border: `1px solid ${borderColor}`,
                                backgroundColor: cardBg,
                                overflow: 'hidden'
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '1rem',
                                    cursor: 'pointer',
                                    backgroundColor: selectedNode?.id === brand.id
                                        ? (isDark ? 'rgba(0, 180, 216, 0.1)' : 'rgba(0, 180, 216, 0.05)')
                                        : 'transparent'
                                }}
                                onClick={() => onSelectNode('brand', brand.id)}
                            >
                                <button
                                    onClick={(e) => { e.stopPropagation(); toggleBrand(brand.id); }}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: '4px',
                                        color: textSecondary
                                    }}
                                >
                                    {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                </button>
                                <span style={{ fontWeight: 600, color: textColor, marginLeft: '0.5rem' }}>{brand.name}</span>
                                {brand.conceptShort && (
                                    <span style={{ marginLeft: '0.75rem', fontSize: '0.85rem', color: textSecondary }}>
                                        — {brand.conceptShort}
                                    </span>
                                )}
                                <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: textSecondary }}>
                                    {brandLocations.length} poboček
                                </span>
                            </div>

                            {isExpanded && (
                                <div style={{ padding: '0 1rem 1rem 2.5rem' }}>
                                    {brandLocations.map(location => (
                                        <div
                                            key={location.id}
                                            onClick={() => onSelectNode('location', location.id)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                padding: '0.5rem 0.75rem',
                                                marginBottom: '0.25rem',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                backgroundColor: selectedNode?.id === location.id
                                                    ? (isDark ? 'rgba(0, 180, 216, 0.15)' : 'rgba(0, 180, 216, 0.1)')
                                                    : 'transparent'
                                            }}
                                        >
                                            <MapPin size={14} style={{ color: textSecondary }} />
                                            <span style={{ color: textColor }}>{location.name}</span>
                                            {location.address && (
                                                <span style={{ fontSize: '0.8rem', color: textSecondary, marginLeft: 'auto' }}>
                                                    {location.address}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                    {brandLocations.length === 0 && (
                                        <div style={{ fontSize: '0.85rem', color: textSecondary, fontStyle: 'italic', padding: '0.5rem 0' }}>
                                            Žádné pobočky
                                        </div>
                                    )}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onAddLocation(brand.id, '', ''); }}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.25rem',
                                            padding: '0.5rem 0.75rem',
                                            marginTop: '0.5rem',
                                            background: 'none',
                                            border: `1px dashed ${borderColor}`,
                                            borderRadius: '6px',
                                            color: textSecondary,
                                            cursor: 'pointer',
                                            fontSize: '0.85rem',
                                            width: '100%',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <Plus size={14} /> Přidat pobočku
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// Main EditorContent component
export function EditorContent({
    activeSection,
    data,
    selectedNode,
    expandedNodes,
    onSelectNode,
    onToggleNode,
    onAddYear,
    onAddVision,
    onAddTheme,
    onAddProject,
    onAddInfluence,
    onAddNewRestaurant,
    onAddBrand,
    onAddLocation,
    onRestoreBackup,
    theme
}) {
    const isDark = theme === 'dark';

    const containerStyle = {
        flex: 1,
        backgroundColor: isDark ? '#0a0a0a' : '#ffffff',
        overflowY: 'auto',
        height: '100%'
    };

    const renderContent = () => {
        switch (activeSection) {
            case 'thought-system':
                return (
                    <ThoughtSystemContent
                        data={data}
                        onSelectNode={onSelectNode}
                        selectedNode={selectedNode}
                        expandedNodes={expandedNodes}
                        onToggleNode={onToggleNode}
                        onAddYear={onAddYear}
                        onAddVision={onAddVision}
                        onAddTheme={onAddTheme}
                        onAddProject={onAddProject}
                        theme={theme}
                    />
                );
            case 'influences':
                return (
                    <InfluencesContent
                        data={data}
                        onSelectNode={onSelectNode}
                        selectedNode={selectedNode}
                        onAddInfluence={onAddInfluence}
                        theme={theme}
                    />
                );
            case 'reconstructions':
                return (
                    <ReconstructionsContent
                        data={data}
                        onSelectNode={onSelectNode}
                        selectedNode={selectedNode}
                        onAddNewRestaurant={onAddNewRestaurant}
                        theme={theme}
                    />
                );
            case 'new-restaurants':
                return (
                    <NewRestaurantsContent
                        data={data}
                        onSelectNode={onSelectNode}
                        selectedNode={selectedNode}
                        onAddNewRestaurant={onAddNewRestaurant}
                        theme={theme}
                    />
                );
            case 'brands':
                return (
                    <BrandsContent
                        data={data}
                        onSelectNode={onSelectNode}
                        selectedNode={selectedNode}
                        onAddBrand={onAddBrand}
                        onAddLocation={onAddLocation}
                        theme={theme}
                    />
                );
            case 'backups':
                return (
                    <BackupManager
                        data={data}
                        onRestore={onRestoreBackup}
                        theme={theme}
                    />
                );
            default:
                return (
                    <div style={{ padding: '2rem', textAlign: 'center', color: isDark ? '#adb5bd' : '#6c757d' }}>
                        Vyberte sekci z menu vlevo
                    </div>
                );
        }
    };

    return (
        <div style={containerStyle}>
            {renderContent()}
        </div>
    );
}
