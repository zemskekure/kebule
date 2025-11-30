import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, X, CheckCircle, Clock, Lightbulb } from 'lucide-react';

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

const Bubble = ({ title, subtitle, type, onClick, size = 180, delay = 0 }) => {
    const style = COLORS[type] || COLORS.year;

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
                    background: style.bg,
                    border: `1px solid ${style.border}`,
                    backdropFilter: 'blur(12px)',
                    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
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
                    color: style.text
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

const OrbitLayout = ({ centerItem, orbitItems, onCenterClick, onOrbitClick, centerType, orbitType }) => {
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
                        />
                    </div>
                );
            })}
        </div>
    );
};

const YearsLayout = ({ years, onYearClick }) => {
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
                />
            ))}
        </div>
    );
};

// --- Main Component ---

export function VisionBoard({ data }) {
    // State for Navigation Path
    const [path, setPath] = useState([]); // Array of selected items
    const [selectedDetail, setSelectedDetail] = useState(null);

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

    return (
        <div className="vision-container" style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'radial-gradient(circle at 50% 50%, #1a1a1a 0%, #000000 100%)',
            overflow: 'hidden', position: 'relative'
        }}>
            {/* Background Blobs */}
            <div className="vision-background">
                <div className="blob blob-1"></div>
                <div className="blob blob-2"></div>
                <div className="blob blob-3"></div>
            </div>

            {/* Navigation Header */}
            <div style={{ position: 'absolute', top: '2rem', left: '2rem', zIndex: 50 }}>
                {path.length > 0 && (
                    <button
                        onClick={handleBack}
                        style={{
                            background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white',
                            padding: '0.5rem 1rem', borderRadius: '20px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            backdropFilter: 'blur(10px)'
                        }}
                    >
                        <ArrowLeft size={16} /> Zpět
                    </button>
                )}
            </div>

            {/* Breadcrumbs */}
            <div style={{ position: 'absolute', top: '2rem', left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.5)', zIndex: 50, display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ color: path.length === 0 ? 'white' : 'inherit' }}>Ambiente</span>
                {path.length > 0 && <span style={{ color: 'white' }}> / {path[0].title}</span>}
                {path.length > 1 && <span style={{ color: 'white' }}> / {path[1].title}</span>}
            </div>

            {/* Main Content Area */}
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
        </div>
    );
}
