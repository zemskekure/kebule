import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, X, CheckCircle, Clock, Lightbulb, MapPin, Globe, Instagram, Calendar, Hammer, Sparkles, Building2 } from 'lucide-react';

// --- Constants & Variants ---

const COLORS = {
    year: { bg: 'rgba(255, 255, 255, 0.05)', border: 'rgba(255, 255, 255, 0.2)', text: '#ffffff' },
    vision: { bg: 'rgba(20, 184, 166, 0.15)', border: 'rgba(20, 184, 166, 0.4)', text: '#ccfbf1' },
    theme: { bg: 'rgba(139, 92, 246, 0.15)', border: 'rgba(139, 92, 246, 0.4)', text: '#ede9fe' },
    project: { bg: 'rgba(34, 197, 94, 0.15)', border: 'rgba(34, 197, 94, 0.4)', text: '#dcfce7' },
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

// Float animation for entire bubble (not just content)
const FLOAT_VARIANTS = {
    animate: {
        y: [0, -12, 0],
        transition: { duration: 6, repeat: Infinity, ease: "easeInOut" }
    }
};

// --- Components ---

const Bubble = ({ title, subtitle, type, onClick, size = 180, delay = 0, theme = 'dark' }) => {
    const style = COLORS[type] || COLORS.year;

    // Light mode colors - elegant and professional
    const lightModeColors = {
        year: { bg: 'rgba(255, 255, 255, 0.9)', border: 'rgba(15, 23, 42, 0.2)', text: '#0f172a' },
        vision: { bg: 'rgba(240, 253, 250, 0.95)', border: 'rgba(20, 184, 166, 0.5)', text: '#0f766e' },
        theme: { bg: 'rgba(245, 243, 255, 0.95)', border: 'rgba(139, 92, 246, 0.5)', text: '#6d28d9' },
        project: { bg: 'rgba(240, 253, 244, 0.95)', border: 'rgba(34, 197, 94, 0.5)', text: '#15803d' },
    };

    const bubbleStyle = theme === 'dark' ? style : (lightModeColors[type] || lightModeColors.year);

    return (
        // Outer wrapper handles floating animation for the ENTIRE bubble
        <motion.div
            variants={FLOAT_VARIANTS}
            animate="animate"
            style={{ position: 'relative', width: size, height: size }}
        >
            {/* Inner wrapper handles scale animation on mount + hover */}
            <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                whileHover={{ 
                    scale: 1.08,
                    transition: { duration: 0.25, ease: "easeOut" }
                }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 100, damping: 15, delay }}
                style={{ position: 'relative', width: '100%', height: '100%', cursor: 'pointer' }}
                onClick={onClick}
            >
                {/* Morphing Background Layer */}
                <motion.div
                    variants={MORPH_VARIANTS}
                    initial="initial"
                    animate="animate"
                    className="bubble-bg"
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background: bubbleStyle.bg,
                        border: `2px solid ${bubbleStyle.border}`,
                        backdropFilter: 'blur(12px)',
                        boxShadow: theme === 'dark' ? '0 8px 32px 0 rgba(0, 0, 0, 0.3)' : '0 8px 32px 0 rgba(0, 0, 0, 0.15)',
                        zIndex: 1,
                        transition: 'box-shadow 0.3s ease, border-color 0.3s ease'
                    }}
                />

                {/* Content Layer (fixed relative to bubble) */}
                <div
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
                        <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.7, marginBottom: '0.25rem' }}>
                            {subtitle}
                        </span>
                    )}
                    <h3 style={{ margin: 0, fontSize: size > 200 ? '1.75rem' : '1rem', fontWeight: size > 200 ? 700 : 600, lineHeight: 1.2 }}>
                        {title}
                    </h3>
                </div>
            </motion.div>
        </motion.div>
    );
};

const OrbitLayout = ({ centerItem, orbitItems, onCenterClick, onOrbitClick, centerType, orbitType, theme = 'dark' }) => {
    // Calculate dynamic radius based on number of items to prevent overlap
    const baseRadius = 280;
    const itemCount = orbitItems.length;
    const minSpacing = 180; // Minimum space between orbit items
    const circumference = itemCount * minSpacing;
    const dynamicRadius = Math.max(baseRadius, circumference / (2 * Math.PI));
    
    return (
        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingBottom: '5rem' }}>
            {/* Center Node */}
            <div style={{ zIndex: 10 }}>
                <Bubble
                    title={centerItem.title}
                    subtitle={centerItem.subtitle}
                    type={centerType}
                    size={220}
                    onClick={onCenterClick}
                    theme={theme}
                />
            </div>

            {/* Orbit Nodes */}
            {orbitItems.map((item, index) => {
                const count = orbitItems.length;
                const angle = (index / count) * 2 * Math.PI - (Math.PI / 2); // Start from top
                const x = Math.cos(angle) * dynamicRadius;
                const y = Math.sin(angle) * dynamicRadius;

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
                            size={140}
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
        <div style={{ display: 'flex', gap: '3rem', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%', paddingBottom: '5rem' }}>
            {years.map((year, index) => (
                <Bubble
                    key={year.id}
                    title={year.title}
                    subtitle="Rok"
                    type="year"
                    size={200}
                    delay={index * 0.1}
                    onClick={() => onYearClick(year)}
                    theme={theme}
                />
            ))}
        </div>
    );
};

const BrandCard = ({ brand, locations, theme = 'dark' }) => {
    const brandLocations = locations.filter(l => l.brandId === brand.id);
    const isDark = theme === 'dark';
    
    const cardBg = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)';
    const cardBorder = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    const textColor = isDark ? '#ffffff' : '#0f172a';
    const textSecondary = isDark ? 'rgba(255, 255, 255, 0.6)' : '#64748b';
    const accentColor = isDark ? '#5eead4' : '#0f766e';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
                background: cardBg,
                border: `1px solid ${cardBorder}`,
                borderRadius: '16px',
                padding: '1.5rem',
                backdropFilter: 'blur(12px)',
                color: textColor
            }}
        >
            {/* Header */}
            <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>{brand.name}</h3>
                    {brand.foundationYear && (
                        <span style={{
                            fontSize: '0.85rem',
                            color: textSecondary,
                            background: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
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
                        margin: '0.5rem 0 0 0',
                        fontStyle: 'italic',
                        color: accentColor
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
                    color: textSecondary,
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
                        color: textSecondary,
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
                            <div key={loc.id} style={{ fontSize: '0.8rem', color: textSecondary, paddingLeft: '1.25rem' }}>
                                • {loc.name}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Social Links */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', paddingTop: '1rem', borderTop: `1px solid ${cardBorder}` }}>
                {brand.socialLinks?.web && (
                    <a
                        href={`https://${brand.socialLinks.web}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            color: textSecondary,
                            textDecoration: 'none',
                            fontSize: '0.8rem',
                            transition: 'color 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.color = accentColor}
                        onMouseLeave={e => e.currentTarget.style.color = textSecondary}
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
                            color: textSecondary,
                            textDecoration: 'none',
                            fontSize: '0.8rem',
                            transition: 'color 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.color = accentColor}
                        onMouseLeave={e => e.currentTarget.style.color = textSecondary}
                    >
                        <Instagram size={14} />
                        Instagram
                    </a>
                )}
            </div>
        </motion.div>
    );
};

const BrandsGrid = ({ brands, locations, theme = 'dark' }) => {
    const isDark = theme === 'dark';
    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.5rem',
            padding: '6rem 2rem 2rem 2rem',
            maxWidth: '1400px',
            margin: '0 auto',
            overflowY: 'auto',
            height: '100%'
        }}>
            {brands.map((brand, index) => (
                <BrandCard key={brand.id} brand={brand} locations={locations} theme={theme} />
            ))}
        </div>
    );
};

// Timeline component for new restaurants and facelifts
const TimelineView = ({ newRestaurants = [], locations = [], brands = [], theme = 'dark' }) => {
    const isDark = theme === 'dark';
    
    // Sort by opening date
    const sortedItems = [...newRestaurants].sort((a, b) => {
        const dateA = a.openingDate ? new Date(a.openingDate) : new Date('2099-12-31');
        const dateB = b.openingDate ? new Date(b.openingDate) : new Date('2099-12-31');
        return dateA - dateB;
    });

    // Group by year
    const groupedByYear = sortedItems.reduce((acc, item) => {
        const year = item.openingDate ? new Date(item.openingDate).getFullYear() : 'Bez data';
        if (!acc[year]) acc[year] = [];
        acc[year].push(item);
        return acc;
    }, {});

    const getCategoryIcon = (category) => {
        switch (category) {
            case 'facelift': return <Hammer size={16} />;
            case 'new': return <Sparkles size={16} />;
            default: return <Building2 size={16} />;
        }
    };

    const getCategoryColor = (category, isDark) => {
        switch (category) {
            case 'facelift': return isDark ? '#f59e0b' : '#d97706';
            case 'new': return isDark ? '#10b981' : '#059669';
            default: return isDark ? '#6366f1' : '#4f46e5';
        }
    };

    const getCategoryLabel = (category) => {
        switch (category) {
            case 'facelift': return 'Rekonstrukce';
            case 'new': return 'Nové otevření';
            default: return 'Projekt';
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'Datum nespecifikováno';
        const date = new Date(dateStr);
        return date.toLocaleDateString('cs-CZ', { month: 'long', year: 'numeric' });
    };

    const getBrandName = (brandIds) => {
        if (!brandIds || brandIds.length === 0) return null;
        const brand = brands.find(b => b.id === brandIds[0]);
        return brand?.name;
    };

    const cardBg = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)';
    const cardBorder = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    const textColor = isDark ? '#ffffff' : '#0f172a';
    const textSecondary = isDark ? 'rgba(255, 255, 255, 0.6)' : '#64748b';
    const timelineLine = isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)';

    return (
        <div style={{
            padding: '6rem 2rem 2rem 2rem',
            maxWidth: '900px',
            margin: '0 auto',
            overflowY: 'auto',
            height: '100%'
        }}>
            {Object.entries(groupedByYear).map(([year, items]) => (
                <div key={year} style={{ marginBottom: '3rem' }}>
                    {/* Year Header */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        marginBottom: '1.5rem'
                    }}>
                        <div style={{
                            background: isDark ? 'rgba(20, 184, 166, 0.2)' : 'rgba(20, 184, 166, 0.15)',
                            border: `2px solid ${isDark ? 'rgba(20, 184, 166, 0.5)' : 'rgba(20, 184, 166, 0.4)'}`,
                            borderRadius: '50%',
                            width: '60px',
                            height: '60px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '1.1rem',
                            color: isDark ? '#5eead4' : '#0f766e'
                        }}>
                            {year}
                        </div>
                        <div style={{
                            flex: 1,
                            height: '2px',
                            background: timelineLine
                        }} />
                    </div>

                    {/* Timeline Items */}
                    <div style={{ position: 'relative', paddingLeft: '30px' }}>
                        {/* Vertical Line */}
                        <div style={{
                            position: 'absolute',
                            left: '29px',
                            top: 0,
                            bottom: 0,
                            width: '2px',
                            background: timelineLine
                        }} />

                        {items.map((item, index) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                style={{
                                    position: 'relative',
                                    marginBottom: '1.5rem',
                                    marginLeft: '2rem'
                                }}
                            >
                                {/* Timeline Dot */}
                                <div style={{
                                    position: 'absolute',
                                    left: '-2.5rem',
                                    top: '1.5rem',
                                    width: '12px',
                                    height: '12px',
                                    borderRadius: '50%',
                                    background: getCategoryColor(item.category, isDark),
                                    border: `3px solid ${isDark ? '#0a0a0a' : '#f8fafc'}`
                                }} />

                                {/* Card */}
                                <div style={{
                                    background: cardBg,
                                    border: `1px solid ${cardBorder}`,
                                    borderRadius: '16px',
                                    padding: '1.5rem',
                                    backdropFilter: 'blur(12px)'
                                }}>
                                    {/* Header */}
                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                                <span style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.35rem',
                                                    padding: '0.25rem 0.75rem',
                                                    borderRadius: '20px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600,
                                                    background: `${getCategoryColor(item.category, isDark)}20`,
                                                    color: getCategoryColor(item.category, isDark)
                                                }}>
                                                    {getCategoryIcon(item.category)}
                                                    {getCategoryLabel(item.category)}
                                                </span>
                                                {getBrandName(item.brands) && (
                                                    <span style={{
                                                        fontSize: '0.75rem',
                                                        color: textSecondary
                                                    }}>
                                                        {getBrandName(item.brands)}
                                                    </span>
                                                )}
                                            </div>
                                            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, color: textColor }}>
                                                {item.title}
                                            </h3>
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.35rem',
                                            fontSize: '0.85rem',
                                            color: textSecondary
                                        }}>
                                            <Calendar size={14} />
                                            {formatDate(item.openingDate)}
                                        </div>
                                    </div>

                                    {/* Description */}
                                    {item.description && (
                                        <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem', lineHeight: 1.6, color: textSecondary }}>
                                            {item.description}
                                        </p>
                                    )}

                                    {/* Status & Phase */}
                                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                        {item.status && (
                                            <span style={{
                                                fontSize: '0.75rem',
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '6px',
                                                background: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                                                color: textSecondary
                                            }}>
                                                {item.status}
                                            </span>
                                        )}
                                        {item.phase && (
                                            <span style={{
                                                fontSize: '0.75rem',
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '6px',
                                                background: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                                                color: textSecondary
                                            }}>
                                                {item.phase}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            ))}

            {sortedItems.length === 0 && (
                <div style={{
                    textAlign: 'center',
                    padding: '4rem 2rem',
                    color: textSecondary
                }}>
                    <Building2 size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                    <p style={{ fontSize: '1.1rem', margin: 0 }}>Žádné plánované projekty</p>
                </div>
            )}
        </div>
    );
};

// --- Main Component ---

export function VisionBoard({ data, theme = 'dark' }) {
    // State for Navigation Path
    const [path, setPath] = useState([]); // Array of selected items
    const [selectedDetail, setSelectedDetail] = useState(null);
    const [viewMode, setViewMode] = useState('vision'); // 'vision' | 'brands' | 'timeline'

    // Derived State
    const currentLevel = path.length;

    // Helper to get current view data
    const viewData = useMemo(() => {
        if (currentLevel === 0) {
            // Level 0: Years ONLY (No Orbit, No Center Parent)
            return { type: 'years', items: data.years };
        }
        else if (currentLevel === 1) {
            // Level 1: Year Center + Visions Orbit
            // Show all visions for this year as orbiting items
            const year = path[0];
            const visions = data.visions.filter(v => v.yearId === year.id);

            return {
                type: 'orbit',
                center: { ...year, subtitle: 'Rok' },
                orbit: visions.length > 0 ? visions : [{ title: 'Žádná vize', subtitle: 'Vytvořte vizi', id: 'empty' }],
                centerType: 'year',
                orbitType: 'vision'
            };
        }
        else if (currentLevel === 2) {
            // Level 2: Vision Center + Themes Orbit
            const vision = path[1];
            const themes = data.themes.filter(t => t.visionId === vision.id);

            return {
                type: 'orbit',
                center: { ...vision, subtitle: 'Vize' },
                orbit: themes,
                centerType: 'vision',
                orbitType: 'theme'
            };
        }
        else if (currentLevel === 3) {
            // Level 3: Theme Center + Projects Orbit
            const theme = path[2];
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
        if (item.id === 'empty') return; // Don't navigate to empty placeholder
        
        if (currentLevel === 0) {
            // Clicked Year -> Go to Level 1 (Show Visions)
            setPath([item]);
        } else if (currentLevel === 1) {
            // Clicked Vision -> Go to Level 2 (Show Themes)
            setPath([...path, item]);
        } else if (currentLevel === 2) {
            // Clicked Theme -> Go to Level 3 (Show Projects)
            setPath([...path, item]);
        } else if (currentLevel === 3) {
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

    // Refined background gradients
    const bgGradient = theme === 'dark'
        ? 'radial-gradient(ellipse at 20% 80%, rgba(20, 50, 60, 0.4) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(30, 20, 50, 0.3) 0%, transparent 50%), radial-gradient(circle at 50% 50%, #0f0f0f 0%, #050505 100%)'
        : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f1f5f9 100%)';

    return (
        <div className="vision-container" style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: bgGradient,
            overflow: 'hidden', position: 'relative'
        }}>
            {/* Background Blobs - refined colors */}
            {theme === 'dark' && (
                <div className="vision-background">
                    <div className="blob blob-1" style={{ background: 'rgba(20, 184, 166, 0.15)' }}></div>
                    <div className="blob blob-2" style={{ background: 'rgba(139, 92, 246, 0.12)' }}></div>
                    <div className="blob blob-3" style={{ background: 'rgba(34, 197, 94, 0.1)' }}></div>
                </div>
            )}

            {/* Light mode subtle pattern */}
            {theme !== 'dark' && (
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0, 0, 0, 0.03) 1px, transparent 0)',
                    backgroundSize: '40px 40px',
                    pointerEvents: 'none'
                }} />
            )}

            {/* Tab Navigation - moved to BOTTOM to avoid content interference */}
            <div style={{ 
                position: 'absolute', 
                bottom: '2rem', 
                left: '50%', 
                transform: 'translateX(-50%)', 
                zIndex: 50, 
                display: 'flex', 
                gap: '0.25rem', 
                background: theme === 'dark' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.95)', 
                padding: '0.5rem', 
                borderRadius: '16px', 
                backdropFilter: 'blur(16px)', 
                border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
                boxShadow: theme === 'dark' ? '0 8px 32px rgba(0, 0, 0, 0.5)' : '0 8px 32px rgba(0, 0, 0, 0.15)'
            }}>
                {[
                    { id: 'vision', label: 'Mapa vize' },
                    { id: 'brands', label: 'Značky' },
                    { id: 'timeline', label: 'Nové restaurace' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setViewMode(tab.id)}
                        style={{
                            background: viewMode === tab.id 
                                ? (theme === 'dark' ? 'rgba(20, 184, 166, 0.3)' : '#0f172a') 
                                : 'transparent',
                            border: 'none',
                            color: viewMode === tab.id 
                                ? (theme === 'dark' ? '#5eead4' : '#ffffff') 
                                : (theme === 'dark' ? 'rgba(255, 255, 255, 0.6)' : '#64748b'),
                            padding: '0.6rem 1.25rem',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: viewMode === tab.id ? 600 : 500,
                            transition: 'all 0.2s',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Top Navigation Bar - Back button + Breadcrumbs */}
            {viewMode === 'vision' && (
                <div style={{ 
                    position: 'absolute', 
                    top: '1.5rem', 
                    left: '2rem',
                    right: '2rem',
                    zIndex: 50,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                }}>
                    {/* Back Button */}
                    {path.length > 0 && (
                        <button
                            onClick={handleBack}
                            style={{
                                background: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0, 0, 0, 0.05)',
                                border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(0, 0, 0, 0.1)',
                                color: theme === 'dark' ? '#fff' : '#0f172a',
                                padding: '0.5rem 1rem', 
                                borderRadius: '20px', 
                                cursor: 'pointer',
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '0.5rem',
                                backdropFilter: 'blur(10px)',
                                fontSize: '0.85rem',
                                fontWeight: 500,
                                flexShrink: 0
                            }}
                        >
                            <ArrowLeft size={16} /> Zpět
                        </button>
                    )}

                    {/* Breadcrumbs */}
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.85rem',
                        background: theme === 'dark' ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.8)',
                        padding: '0.5rem 1rem',
                        borderRadius: '20px',
                        backdropFilter: 'blur(10px)',
                        border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.08)'
                    }}>
                        <span style={{ 
                            color: path.length === 0 
                                ? (theme === 'dark' ? '#fff' : '#0f172a') 
                                : (theme === 'dark' ? 'rgba(255,255,255,0.5)' : '#94a3b8'),
                            fontWeight: path.length === 0 ? 600 : 400
                        }}>
                            Ambiente
                        </span>
                        {path.map((item, index) => (
                            <React.Fragment key={item.id}>
                                <span style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.3)' : '#cbd5e1' }}>/</span>
                                <span style={{ 
                                    color: index === path.length - 1 
                                        ? (theme === 'dark' ? '#fff' : '#0f172a') 
                                        : (theme === 'dark' ? 'rgba(255,255,255,0.5)' : '#94a3b8'),
                                    fontWeight: index === path.length - 1 ? 600 : 400
                                }}>
                                    {item.title}
                                </span>
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            )}

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
                                <YearsLayout years={viewData.items} onYearClick={handleItemClick} theme={theme} />
                            ) : (
                                <OrbitLayout
                                    centerItem={viewData.center}
                                    orbitItems={viewData.orbit}
                                    centerType={viewData.centerType}
                                    orbitType={viewData.orbitType}
                                    onOrbitClick={handleItemClick}
                                    onCenterClick={() => { }}
                                    theme={theme}
                                />
                            )}
                        </motion.div>
                    </AnimatePresence>
                ) : viewMode === 'brands' ? (
                    <BrandsGrid brands={data.brands} locations={data.locations || []} theme={theme} />
                ) : (
                    <TimelineView 
                        newRestaurants={data.newRestaurants || []} 
                        locations={data.locations || []} 
                        brands={data.brands || []}
                        theme={theme} 
                    />
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
                            background: theme === 'dark' ? 'rgba(15, 15, 15, 0.98)' : 'rgba(255, 255, 255, 0.98)', 
                            borderLeft: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
                            backdropFilter: 'blur(20px)', padding: '2rem', zIndex: 100, 
                            color: theme === 'dark' ? 'white' : '#0f172a'
                        }}
                    >
                        {/* Header with close button and status aligned */}
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '1rem',
                            marginBottom: '2rem'
                        }}>
                            <button onClick={() => setSelectedDetail(null)} style={{ 
                                background: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', 
                                border: 'none', 
                                color: theme === 'dark' ? 'white' : '#0f172a', 
                                cursor: 'pointer',
                                padding: '0.5rem',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'background 0.2s'
                            }}>
                                <X size={20} />
                            </button>
                            <span style={{
                                padding: '0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600,
                                background: selectedDetail.status === 'Hotovo' 
                                    ? (theme === 'dark' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.15)') 
                                    : (theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'),
                                color: selectedDetail.status === 'Hotovo' 
                                    ? (theme === 'dark' ? '#34d399' : '#059669') 
                                    : (theme === 'dark' ? 'white' : '#64748b')
                            }}>
                                {selectedDetail.status}
                            </span>
                        </div>
                        <h2 style={{ fontSize: '1.75rem', marginTop: 0, marginBottom: '1rem', fontWeight: 700 }}>{selectedDetail.title}</h2>
                        <p style={{ lineHeight: 1.7, opacity: 0.8, fontSize: '0.95rem' }}>{selectedDetail.description || 'Bez popisu.'}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div >
    );
}
