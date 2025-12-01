import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, X, CheckCircle, Clock, Lightbulb, MapPin, Globe, Instagram } from 'lucide-react';

// --- Constants & Variants ---

const COLORS = {
    year: { bg: 'rgba(255, 255, 255, 0.05)', border: 'rgba(255, 255, 255, 0.2)', text: '#ffffff' },
    vision: { bg: 'rgba(0, 243, 255, 0.1)', border: 'rgba(0, 243, 255, 0.3)', text: '#e0fbfc' },
    theme: { bg: 'rgba(188, 19, 254, 0.1)', border: 'rgba(188, 19, 254, 0.3)', text: '#f3d9fa' },
    project: { bg: 'rgba(10, 255, 10, 0.1)', border: 'rgba(10, 255, 10, 0.3)', text: '#dcfce7' },
};

const MORPH_VARIANTS = {
    initial: { borderRadius: "50%" },
    animate: {
        borderRadius: [
            "60% 40% 30% 70% / 60% 30% 70% 40%",
            "30% 60% 70% 40% / 50% 60% 30% 60%",
            "60% 40% 30% 70% / 60% 30% 70% 40%"
        ],
        transition: { duration: 8, repeat: Infinity, ease: "easeInOut" }
    }
};

const FLOAT_VARIANTS = {
    animate: {
        y: [0, -15, 0],
        transition: { duration: 6, repeat: Infinity, ease: "easeInOut" }
    }
};

// --- Components ---

const Bubble = ({ title, subtitle, type, onClick, size = 180, delay = 0, theme = 'dark' }) => {
    const style = COLORS[type] || COLORS.year;

    // Light mode colors - vibrant and colorful
    const lightModeColors = {
        year: { bg: 'rgba(255, 255, 255, 0.95)', border: '#667eea', text: '#667eea' },
        vision: { bg: 'rgba(255, 255, 255, 0.95)', border: '#00d4ff', text: '#00d4ff' },
        theme: { bg: 'rgba(255, 255, 255, 0.95)', border: '#a855f7', text: '#a855f7' },
        project: { bg: 'rgba(255, 255, 255, 0.95)', border: '#10b981', text: '#10b981' },
    };

    const bubbleStyle = theme === 'dark' ? style : (lightModeColors[type] || lightModeColors.year);

    return (
        <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 15, delay }}
            style={{ position: 'relative', width: size, height: size, cursor: 'pointer' }}
            onClick={onClick}
        >
            {/* Morphing Background Layer */}
            <motion.div
                variants={MORPH_VARIANTS}
                initial="initial"
                animate="animate"
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: bubbleStyle.bg,
                    border: `2px solid ${bubbleStyle.border}`,
                    backdropFilter: 'blur(12px)',
                    boxShadow: theme === 'dark' ? '0 8px 32px 0 rgba(0, 0, 0, 0.3)' : '0 8px 32px 0 rgba(0, 0, 0, 0.15)',
                    zIndex: 1
                }}
            />

            {/* Content Layer (Stable, floating) */}
            <motion.div
                variants={FLOAT_VARIANTS}
                animate="animate"
                style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2,
                    padding: '1.5rem',
                    textAlign: 'center',
                    color: bubbleStyle.text
                }}
            >
                {subtitle && (
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8, marginBottom: '0.5rem' }}>
                        {subtitle}
                    </span>
                )}
                <h3 style={{ margin: 0, fontSize: size > 200 ? '2rem' : '1.1rem', fontWeight: size > 200 ? 700 : 600, lineHeight: 1.2 }}>
                    {title}
                </h3>
            </motion.div>
        </motion.div>
    );
};

const OrbitLayout = ({ centerItem, orbitItems, onCenterClick, onOrbitClick, centerType, orbitType, theme = 'dark' }) => {
    return (
        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Center Node */}
            <div style={{ zIndex: 10 }}>
                <Bubble
                    title={centerItem.title}
                    subtitle={centerItem.subtitle}
                    type={centerType}
                    size={260}
                    onClick={onCenterClick}
                    theme={theme}
                />
            </div>

            {/* Orbit Nodes */}
            {orbitItems.map((item, index) => {
                const count = orbitItems.length;
                const angle = (index / count) * 2 * Math.PI - (Math.PI / 2); // Start from top
                const radius = 320; // Distance from center
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;

                return (
                    <div
                        key={item.id}
                        style={{
                            position: 'absolute',
                            left: '50%',
                            top: '50%',
                            transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
                            zIndex: 5
                        }}
                    >
                        <Bubble
                            title={item.title}
                            subtitle={orbitType === 'project' ? item.status : `${orbitItems.length} položek`}
                            type={orbitType}
                            size={160}
                            delay={index * 0.1}
                            onClick={() => onOrbitClick(item)}
                            theme={theme}
                        />
                    </div>
                );
            })}
        </div>
    );
};

const YearsLayout = ({ years, onYearClick, theme = 'dark' }) => {
    return (
        <div style={{ display: 'flex', gap: '3rem', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%' }}>
            {years.map((year, index) => (
                <Bubble
                    key={year.id}
                    title={year.title}
                    subtitle="Rok"
                    type="year"
                    size={240}
                    delay={index * 0.1}
                    onClick={() => onYearClick(year)}
                    theme={theme}
                />
            ))}
        </div>
    );
};

const BrandCard = ({ brand, locations }) => {
    const brandLocations = locations.filter(l => l.brandId === brand.id);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: '1.5rem',
                backdropFilter: 'blur(12px)',
                color: 'white'
            }}
        >
            {/* Header */}
            <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>{brand.name}</h3>
                    {brand.foundationYear && (
                        <span style={{
                            fontSize: '0.85rem',
                            opacity: 0.6,
                            background: 'rgba(255, 255, 255, 0.1)',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '12px'
                        }}>
                            {brand.foundationYear}
                        </span>
                    )}
                </div>
                {brand.conceptShort && (
                    <p style={{
                        fontSize: '0.9rem',
                        opacity: 0.8,
                        margin: '0.5rem 0 0 0',
                        fontStyle: 'italic',
                        color: '#00f3ff'
                    }}>
                        {brand.conceptShort}
                    </p>
                )}
            </div>

            {/* Description */}
            {brand.description && (
                <p style={{
                    fontSize: '0.85rem',
                    lineHeight: 1.6,
                    opacity: 0.7,
                    marginBottom: '1rem'
                }}>
                    {brand.description}
                </p>
            )}

            {/* Locations */}
            {brandLocations.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                    <div style={{
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        opacity: 0.5,
                        marginBottom: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <MapPin size={12} />
                        Pobočky ({brandLocations.length})
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        {brandLocations.map(loc => (
                            <div key={loc.id} style={{ fontSize: '0.8rem', opacity: 0.7, paddingLeft: '1.25rem' }}>
                                • {loc.name}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Social Links */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                {brand.socialLinks?.web && (
                    <a
                        href={`https://${brand.socialLinks.web}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            color: 'rgba(255, 255, 255, 0.6)',
                            textDecoration: 'none',
                            fontSize: '0.8rem',
                            transition: 'color 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.color = '#00f3ff'}
                        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)'}
                    >
                        <Globe size={14} />
                        Web
                    </a>
                )}
                {brand.socialLinks?.instagram && (
                    <a
                        href={`https://instagram.com/${brand.socialLinks.instagram}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            color: 'rgba(255, 255, 255, 0.6)',
                            textDecoration: 'none',
                            fontSize: '0.8rem',
                            transition: 'color 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.color = '#00f3ff'}
                        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)'}
                    >
                        <Instagram size={14} />
                        Instagram
                    </a>
                )}
            </div>
        </motion.div>
    );
};

const BrandsGrid = ({ brands, locations }) => {
    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.5rem',
            padding: '2rem',
            maxWidth: '1400px',
            margin: '0 auto',
            overflowY: 'auto',
            height: '100%'
        }}>
            {brands.map((brand, index) => (
                <BrandCard key={brand.id} brand={brand} locations={locations} />
            ))}
        </div>
    );
};

// --- Main Component ---

export function VisionBoard({ data, theme = 'dark' }) {
    // State for Navigation Path
    const [path, setPath] = useState([]); // Array of selected items
    const [selectedDetail, setSelectedDetail] = useState(null);
    const [viewMode, setViewMode] = useState('vision'); // 'vision' | 'brands'

    // Derived State
    const currentLevel = path.length;

    // Helper to get current view data
    const viewData = useMemo(() => {
        if (currentLevel === 0) {
            // Level 0: Years ONLY (No Orbit, No Center Parent)
            return { type: 'years', items: data.years };
        }
        else if (currentLevel === 1) {
            // Level 1: Vision Center + Themes Orbit
            // We clicked a Year. We need to find the Vision for this year.
            const year = path[0];
            const visions = data.visions.filter(v => v.yearId === year.id);
            // Auto-select the first vision
            const activeVision = visions[0] || { title: 'Žádná vize', subtitle: 'Vytvořte vizi', id: 'empty', yearId: year.id };

            const themes = activeVision.id !== 'empty' ? data.themes.filter(t => t.visionId === activeVision.id) : [];

            return {
                type: 'orbit',
                center: { ...activeVision, subtitle: 'Vize' },
                orbit: themes,
                centerType: 'vision',
                orbitType: 'theme'
            };
        }
        else if (currentLevel === 2) {
            // Level 2: Theme Center + Projects Orbit
            // path[0] = Year, path[1] = Theme (because we skipped selecting Vision explicitly in UI)

            const theme = path[1];
            const projects = data.projects.filter(p => p.themeId === theme.id);
            return {
                type: 'orbit',
                center: { ...theme, subtitle: 'Hlavní téma' },
                orbit: projects,
                centerType: 'theme',
                orbitType: 'project'
            };
        }
        return null;
    }, [path, data, currentLevel]);

    // Handlers
    const handleItemClick = (item) => {
        if (currentLevel === 0) {
            // Clicked Year -> Go to Level 1 (Auto-select Vision)
            setPath([item]);
        } else if (currentLevel === 1) {
            // Clicked Theme -> Go to Level 2
            setPath([...path, item]);
        } else if (currentLevel === 2) {
            // Clicked Project -> Show Detail
            setSelectedDetail(item);
        }
    };

    const handleBack = () => {
        if (selectedDetail) {
            setSelectedDetail(null);
        } else if (path.length > 0) {
            setPath(path.slice(0, -1));
        }
    };

    if (!viewData) return <div className="vision-container"><div style={{ color: 'white' }}>Žádná data k zobrazení</div></div>;

    const bgGradient = theme === 'dark'
        ? 'radial-gradient(circle at 50% 50%, #1a1a1a 0%, #000000 100%)'
        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';

    return (
        <div className="vision-container" style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: bgGradient,
            overflow: 'hidden', position: 'relative'
        }}>
            {/* Background Blobs */}
            {theme === 'dark' && (
                <div className="vision-background">
                    <div className="blob blob-1"></div>
                    <div className="blob blob-2"></div>
                    <div className="blob blob-3"></div>
                </div>
            )}

            {/* Tab Navigation */}
            <div style={{ position: 'absolute', top: '2rem', left: '50%', transform: 'translateX(-50%)', zIndex: 50, display: 'flex', gap: '0.5rem', background: theme === 'dark' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.3)', padding: '0.5rem', borderRadius: '12px', backdropFilter: 'blur(10px)', border: theme === 'dark' ? 'none' : '1px solid rgba(255, 255, 255, 0.4)' }}>
                <button
                    onClick={() => setViewMode('vision')}
                    style={{
                        background: viewMode === 'vision' ? (theme === 'dark' ? 'rgba(0, 243, 255, 0.2)' : 'rgba(255, 255, 255, 0.9)') : 'transparent',
                        border: viewMode === 'vision' ? (theme === 'dark' ? '1px solid rgba(0, 243, 255, 0.5)' : '1px solid rgba(255, 255, 255, 0.6)') : '1px solid transparent',
                        color: theme === 'dark' ? 'white' : '#fff',
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: viewMode === 'vision' ? 600 : 400,
                        transition: 'all 0.2s'
                    }}
                >
                    Mapa vize
                </button>
                <button
                    onClick={() => setViewMode('brands')}
                    style={{
                        background: viewMode === 'brands' ? (theme === 'dark' ? 'rgba(0, 243, 255, 0.2)' : 'rgba(255, 255, 255, 0.9)') : 'transparent',
                        border: viewMode === 'brands' ? (theme === 'dark' ? '1px solid rgba(0, 243, 255, 0.5)' : '1px solid rgba(255, 255, 255, 0.6)') : '1px solid transparent',
                        color: theme === 'dark' ? 'white' : '#fff',
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: viewMode === 'brands' ? 600 : 400,
                        transition: 'all 0.2s'
                    }}
                >
                    Značky
                </button>
            </div>

            {/* Navigation Header */}
            {viewMode === 'vision' && (
                <div style={{ position: 'absolute', top: '5rem', left: '2rem', zIndex: 50 }}>
                    {path.length > 0 && (
                        <button
                            onClick={handleBack}
                            style={{
                                background: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.3)',
                                border: theme === 'dark' ? 'none' : '1px solid rgba(255, 255, 255, 0.4)',
                                color: '#fff',
                                padding: '0.5rem 1rem', borderRadius: '20px', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                backdropFilter: 'blur(10px)'
                            }}
                        >
                            <ArrowLeft size={16} /> Zpět
                        </button>
                    )}
                </div>
            )}

            {/* Breadcrumbs */}
            {
                viewMode === 'vision' && (
                    <div style={{ position: 'absolute', top: '5rem', left: '50%', transform: 'translateX(-50%)', color: theme === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.8)', zIndex: 50, display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span style={{ color: path.length === 0 ? '#fff' : 'inherit' }}>Ambiente</span>
                        {path.length > 0 && <span style={{ color: '#fff' }}> / {path[0].title}</span>}
                        {path.length > 1 && <span style={{ color: '#fff' }}> / {path[1].title}</span>}
                    </div>
                )
            }

            {/* Main Content Area */}
            {
                viewMode === 'vision' ? (
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={path.length} // Re-render on level change
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.1 }}
                            transition={{ duration: 0.5 }}
                            style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            {viewData.type === 'years' ? (
                                <YearsLayout years={viewData.items} onYearClick={handleItemClick} />
                            ) : (
                                <OrbitLayout
                                    centerItem={viewData.center}
                                    orbitItems={viewData.orbit}
                                    centerType={viewData.centerType}
                                    orbitType={viewData.orbitType}
                                    onOrbitClick={handleItemClick}
                                    onCenterClick={() => { }}
                                />
                            )}
                        </motion.div>
                    </AnimatePresence>
                ) : (
                    <BrandsGrid brands={data.brands} locations={data.locations || []} />
                )
            }

            {/* Detail Overlay */}
            <AnimatePresence>
                {selectedDetail && (
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        style={{
                            position: 'absolute', right: 0, top: 0, bottom: 0, width: '400px',
                            background: 'rgba(20, 20, 20, 0.95)', borderLeft: '1px solid rgba(255,255,255,0.1)',
                            backdropFilter: 'blur(20px)', padding: '2rem', zIndex: 100, color: 'white'
                        }}
                    >
                        <button onClick={() => setSelectedDetail(null)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', marginBottom: '2rem' }}>
                            <X size={24} />
                        </button>
                        <span style={{
                            padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600,
                            background: selectedDetail.status === 'Hotovo' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                            color: selectedDetail.status === 'Hotovo' ? '#34d399' : 'white'
                        }}>
                            {selectedDetail.status}
                        </span>
                        <h2 style={{ fontSize: '2rem', marginTop: '1rem', marginBottom: '1rem' }}>{selectedDetail.title}</h2>
                        <p style={{ lineHeight: 1.6, opacity: 0.8 }}>{selectedDetail.description || 'Bez popisu.'}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div >
    );
}
