import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
    Activity, CheckCircle, HardHat, Zap, Layers, Calendar, 
    Sparkles, Hammer, Building2, ChevronDown, AlertTriangle,
    TrendingUp, Clock, Radio, ArrowRight
} from 'lucide-react';

export function Dashboard({ data, theme = 'dark' }) {
    const { projects, newRestaurants, themes, visions, years, influences, signals } = data;

    // Year filter state - default to current year or first available
    const currentYear = new Date().getFullYear();
    const availableYears = useMemo(() => {
        return (years || []).map(y => ({
            id: y.id,
            title: y.title,
            numericYear: parseInt(y.title, 10) || 0
        })).sort((a, b) => b.numericYear - a.numericYear);
    }, [years]);

    const defaultYearId = useMemo(() => {
        const currentYearObj = availableYears.find(y => y.numericYear === currentYear);
        return currentYearObj?.id || availableYears[0]?.id || null;
    }, [availableYears, currentYear]);

    const [selectedYearId, setSelectedYearId] = useState(defaultYearId);
    const [showAllTime, setShowAllTime] = useState(false);

    const selectedYear = availableYears.find(y => y.id === selectedYearId);
    const selectedYearTitle = selectedYear?.title || 'Vše';

    // Helper: Get year from openingDate
    const getYearFromDate = (dateStr) => {
        if (!dateStr) return null;
        const date = new Date(dateStr);
        return isNaN(date.getTime()) ? null : date.getFullYear();
    };

    // Helper: Get themes for a specific year via Vision chain
    const getThemesForYear = (yearId) => {
        if (!yearId) return themes || [];
        const yearVisionIds = (visions || []).filter(v => v.yearId === yearId).map(v => v.id);
        return (themes || []).filter(t => yearVisionIds.includes(t.visionId));
    };

    // Helper: Get projects for a specific year
    const getProjectsForYear = (yearId) => {
        if (!yearId) return projects || [];
        const yearThemeIds = getThemesForYear(yearId).map(t => t.id);
        return (projects || []).filter(p => yearThemeIds.includes(p.themeId));
    };

    // Scoped data based on year filter
    const scopedThemes = showAllTime ? (themes || []) : getThemesForYear(selectedYearId);
    const scopedProjects = showAllTime ? (projects || []) : getProjectsForYear(selectedYearId);
    const scopedNewRestaurants = useMemo(() => {
        if (showAllTime) return newRestaurants || [];
        const yearNum = selectedYear?.numericYear;
        if (!yearNum) return newRestaurants || [];
        return (newRestaurants || []).filter(r => getYearFromDate(r.openingDate) === yearNum);
    }, [newRestaurants, selectedYear, showAllTime]);

    // Stats (year-scoped)
    const totalProjects = scopedProjects.length;
    const completedProjects = scopedProjects.filter(p => p.status === 'Hotovo').length;
    const inProgressProjects = scopedProjects.filter(p => p.status === 'Běží').length;
    const progressPercentage = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0;

    // New restaurants breakdown (year-scoped)
    const newRestaurantsNew = scopedNewRestaurants.filter(r => r.category === 'new');
    const newRestaurantsFacelift = scopedNewRestaurants.filter(r => r.category === 'facelift');

    // Status breakdown helper
    const getStatusBreakdown = (items) => {
        const planned = items.filter(r => ['Idea', 'Planning', 'Plánování'].includes(r.phase)).length;
        const inProgress = items.filter(r => ['Construction', 'Rekonstrukce', 'Hiring', 'Menu'].includes(r.phase)).length;
        const open = items.filter(r => ['Opening', 'Reopening', 'Otevřeno'].includes(r.phase)).length;
        return { planned, inProgress, open };
    };

    const newBreakdown = getStatusBreakdown(newRestaurantsNew);
    const faceliftBreakdown = getStatusBreakdown(newRestaurantsFacelift);

    // Influences (year-scoped connections)
    const scopedInfluences = useMemo(() => {
        const yearThemeIds = new Set(scopedThemes.map(t => t.id));
        const yearProjectIds = new Set(scopedProjects.map(p => p.id));
        
        return (influences || []).map(inf => {
            const themeCount = (inf.connectedThemeIds || []).filter(id => yearThemeIds.has(id)).length;
            const projectCount = (inf.connectedProjectIds || []).filter(id => yearProjectIds.has(id)).length;
            return {
                ...inf,
                yearThemeCount: themeCount,
                yearProjectCount: projectCount,
                yearPull: themeCount + projectCount
            };
        }).sort((a, b) => b.yearPull - a.yearPull);
    }, [influences, scopedThemes, scopedProjects]);

    const totalInfluences = scopedInfluences.filter(i => i.yearPull > 0).length;

    // Theme health data
    const themeHealthData = useMemo(() => {
        return scopedThemes.map(themeItem => {
            const themeProjects = scopedProjects.filter(p => p.themeId === themeItem.id);
            const done = themeProjects.filter(p => p.status === 'Hotovo').length;
            const total = themeProjects.length;
            const inProgress = themeProjects.filter(p => p.status === 'Běží').length;
            const pct = total > 0 ? (done / total) * 100 : 0;
            
            // Health status (simplified without timestamps)
            let health = 'on-track';
            if (total === 0) {
                health = 'empty';
            } else if (done === total) {
                health = 'complete';
            } else if (inProgress > 0 || done > 0) {
                health = 'on-track';
            } else {
                health = 'at-risk';
            }

            // Connected influences
            const connectedInfluences = (influences || []).filter(inf => 
                (inf.connectedThemeIds || []).includes(themeItem.id)
            );

            return {
                ...themeItem,
                projectsTotal: total,
                projectsDone: done,
                projectsInProgress: inProgress,
                completionPct: pct,
                health,
                connectedInfluences
            };
        });
    }, [scopedThemes, scopedProjects, influences]);

    // Roadmap by month
    const roadmapByMonth = useMemo(() => {
        const months = {};
        const yearNum = selectedYear?.numericYear || currentYear;
        
        scopedNewRestaurants.forEach(item => {
            if (!item.openingDate) return;
            const date = new Date(item.openingDate);
            if (isNaN(date.getTime())) return;
            
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (!months[monthKey]) {
                months[monthKey] = { 
                    key: monthKey, 
                    date: new Date(date.getFullYear(), date.getMonth(), 1),
                    items: [] 
                };
            }
            months[monthKey].items.push(item);
        });

        return Object.values(months).sort((a, b) => a.date - b.date);
    }, [scopedNewRestaurants, selectedYear, currentYear]);

    // Theme styling
    const isDark = theme === 'dark';
    const bgGradient = isDark
        ? 'radial-gradient(circle at 50% 50%, #0a0a0a 0%, #000000 100%)'
        : 'radial-gradient(circle at 50% 50%, #f8f9fa 0%, #e9ecef 100%)';

    const cardBg = isDark ? 'rgba(30, 30, 30, 0.8)' : 'rgba(255, 255, 255, 0.9)';
    const cardBorder = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)';
    const textColor = isDark ? '#ffffff' : '#212529';
    const textSecondary = isDark ? '#adb5bd' : '#6c757d';
    const accentColor = isDark ? 'var(--neon-blue)' : '#0d6efd';

    // Helper functions for rendering
    const formatDate = (dateStr) => {
        if (!dateStr) return 'Neupřesněno';
        const date = new Date(dateStr);
        return date.toLocaleDateString('cs-CZ', { month: 'long', year: 'numeric' });
    };

    const formatMonthYear = (date) => {
        return date.toLocaleDateString('cs-CZ', { month: 'long', year: 'numeric' });
    };

    const translatePhase = (phase) => {
        const translations = {
            'Idea': 'Nápad',
            'Planning': 'Plánování',
            'Construction': 'Stavba',
            'Rekonstrukce': 'Rekonstrukce',
            'Hiring': 'Nábor',
            'Menu': 'Menu a testování',
            'Opening': 'Otevření',
            'Reopening': 'Znovuotevření'
        };
        return translations[phase] || phase;
    };

    const getCategoryIcon = (category) => {
        switch (category) {
            case 'facelift': return <Hammer size={14} />;
            case 'new': return <Sparkles size={14} />;
            default: return <Building2 size={14} />;
        }
    };

    const getCategoryColor = (category) => {
        switch (category) {
            case 'facelift': return isDark ? '#f59e0b' : '#d97706';
            case 'new': return isDark ? '#10b981' : '#059669';
            default: return accentColor;
        }
    };

    const getHealthColor = (health) => {
        switch (health) {
            case 'complete': return '#10b981';
            case 'on-track': return accentColor;
            case 'at-risk': return '#f59e0b';
            case 'empty': return textSecondary;
            default: return textSecondary;
        }
    };

    const getHealthLabel = (health) => {
        switch (health) {
            case 'complete': return 'Hotovo';
            case 'on-track': return 'V pořádku';
            case 'at-risk': return 'Pozor';
            case 'empty': return 'Prázdné';
            default: return '';
        }
    };

    return (
        <div className="dashboard-container" style={{ background: bgGradient }}>
            <div className="dashboard-content">
                {/* Header with Year Filter */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    style={{ 
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '2rem',
                        flexWrap: 'wrap',
                        gap: '1rem'
                    }}
                >
                    <h1 style={{ 
                        color: textColor,
                        fontSize: '2rem',
                        fontWeight: 700,
                        margin: 0
                    }}>
                        Přehled strategie
                    </h1>

                    {/* Year Filter */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ color: textSecondary, fontSize: '0.9rem' }}>Rok:</span>
                        <div style={{ display: 'flex', gap: '0.25rem', background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', borderRadius: '8px', padding: '0.25rem' }}>
                            {availableYears.map(year => (
                                <button
                                    key={year.id}
                                    onClick={() => { setSelectedYearId(year.id); setShowAllTime(false); }}
                                    style={{
                                        padding: '0.4rem 0.75rem',
                                        border: 'none',
                                        borderRadius: '6px',
                                        fontSize: '0.85rem',
                                        fontWeight: 500,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        background: (!showAllTime && selectedYearId === year.id) 
                                            ? (isDark ? 'rgba(0, 243, 255, 0.2)' : '#0d6efd') 
                                            : 'transparent',
                                        color: (!showAllTime && selectedYearId === year.id) 
                                            ? (isDark ? accentColor : '#fff') 
                                            : textSecondary
                                    }}
                                >
                                    {year.title}
                                </button>
                            ))}
                            <button
                                onClick={() => setShowAllTime(true)}
                                style={{
                                    padding: '0.4rem 0.75rem',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '0.85rem',
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    background: showAllTime 
                                        ? (isDark ? 'rgba(0, 243, 255, 0.2)' : '#0d6efd') 
                                        : 'transparent',
                                    color: showAllTime 
                                        ? (isDark ? accentColor : '#fff') 
                                        : textSecondary
                                }}
                            >
                                Vše
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Year Indicator */}
                {!showAllTime && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{ 
                            marginBottom: '1.5rem',
                            padding: '0.5rem 1rem',
                            background: isDark ? 'rgba(0, 243, 255, 0.1)' : 'rgba(13, 110, 253, 0.1)',
                            borderRadius: '8px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <Calendar size={16} style={{ color: accentColor }} />
                        <span style={{ color: accentColor, fontWeight: 500 }}>
                            Data pro rok {selectedYearTitle}
                        </span>
                    </motion.div>
                )}

                {/* KPI Grid - Year Scoped */}
                <div className="kpi-grid">
                    {/* Projects KPI */}
                    <motion.div
                        className="glass-card kpi-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
                    >
                        <div className="kpi-icon" style={{ color: accentColor, background: isDark ? 'rgba(0, 243, 255, 0.1)' : 'rgba(13, 110, 253, 0.1)' }}>
                            <Activity size={24} />
                        </div>
                        <div className="kpi-value" style={{ color: textColor }}>{totalProjects}</div>
                        <div className="kpi-label" style={{ color: textSecondary }}>
                            Projektů {!showAllTime && `(${selectedYearTitle})`}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: textSecondary, marginTop: '0.25rem' }}>
                            {inProgressProjects} běží · {completedProjects} hotovo
                        </div>
                    </motion.div>

                    {/* New Restaurants KPI */}
                    <motion.div
                        className="glass-card kpi-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
                    >
                        <div className="kpi-icon" style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.1)' }}>
                            <Sparkles size={24} />
                        </div>
                        <div className="kpi-value" style={{ color: textColor }}>{newRestaurantsNew.length}</div>
                        <div className="kpi-label" style={{ color: textSecondary }}>
                            Nové restaurace {!showAllTime && `(${selectedYearTitle})`}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: textSecondary, marginTop: '0.25rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <span style={{ color: '#6b7280' }}>{newBreakdown.planned} plán</span>
                            <span style={{ color: '#f59e0b' }}>{newBreakdown.inProgress} stavba</span>
                            <span style={{ color: '#10b981' }}>{newBreakdown.open} otevřeno</span>
                        </div>
                    </motion.div>

                    {/* Facelifts KPI */}
                    <motion.div
                        className="glass-card kpi-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
                    >
                        <div className="kpi-icon" style={{ color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)' }}>
                            <Hammer size={24} />
                        </div>
                        <div className="kpi-value" style={{ color: textColor }}>{newRestaurantsFacelift.length}</div>
                        <div className="kpi-label" style={{ color: textSecondary }}>
                            Facelifty {!showAllTime && `(${selectedYearTitle})`}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: textSecondary, marginTop: '0.25rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <span style={{ color: '#6b7280' }}>{faceliftBreakdown.planned} plán</span>
                            <span style={{ color: '#f59e0b' }}>{faceliftBreakdown.inProgress} rekonstrukce</span>
                            <span style={{ color: '#10b981' }}>{faceliftBreakdown.open} hotovo</span>
                        </div>
                    </motion.div>

                    {/* Completion KPI */}
                    <motion.div
                        className="glass-card kpi-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
                    >
                        <div className="kpi-icon" style={{ color: progressPercentage === 100 ? '#10b981' : accentColor, background: progressPercentage === 100 ? 'rgba(16, 185, 129, 0.1)' : (isDark ? 'rgba(0, 243, 255, 0.1)' : 'rgba(13, 110, 253, 0.1)') }}>
                            <CheckCircle size={24} />
                        </div>
                        <div className="kpi-value" style={{ color: textColor }}>{progressPercentage}%</div>
                        <div className="kpi-label" style={{ color: textSecondary }}>
                            Dokončeno {!showAllTime && `(${selectedYearTitle})`}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: textSecondary, marginTop: '0.25rem' }}>
                            {completedProjects} z {totalProjects} projektů
                        </div>
                    </motion.div>
                </div>

                {/* Main Content Row */}
                <div className="dashboard-row">
                    {/* Theme Health Board */}
                    <motion.div
                        className="glass-card dashboard-panel"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.45 }}
                        style={{ background: cardBg, border: `1px solid ${cardBorder}`, flex: 2 }}
                    >
                        <h3 style={{ color: textColor, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                            <Layers size={18} /> Zdraví témat {!showAllTime && `(${selectedYearTitle})`}
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {themeHealthData.length === 0 ? (
                                <p style={{ color: textSecondary, fontSize: '0.9rem', margin: 0 }}>
                                    Žádná témata pro tento rok
                                </p>
                            ) : (
                                themeHealthData.map((themeItem, index) => (
                                    <div
                                        key={themeItem.id}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.75rem',
                                            padding: '0.75rem',
                                            borderRadius: '8px',
                                            background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                                            borderLeft: `3px solid ${getHealthColor(themeItem.health)}`
                                        }}
                                    >
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ 
                                                color: textColor, 
                                                fontWeight: 500, 
                                                fontSize: '0.9rem',
                                                marginBottom: '0.25rem',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {themeItem.title}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                <span style={{ fontSize: '0.75rem', color: textSecondary }}>
                                                    {themeItem.projectsDone}/{themeItem.projectsTotal} projektů
                                                </span>
                                                {themeItem.connectedInfluences.length > 0 && (
                                                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                                                        {themeItem.connectedInfluences.slice(0, 2).map(inf => (
                                                            <span
                                                                key={inf.id}
                                                                style={{
                                                                    fontSize: '0.6rem',
                                                                    padding: '0.1rem 0.35rem',
                                                                    borderRadius: '3px',
                                                                    border: `1px solid ${inf.type === 'external' ? '#dc3545' : '#198754'}`,
                                                                    color: inf.type === 'external' ? '#dc3545' : '#198754',
                                                                    background: 'transparent'
                                                                }}
                                                            >
                                                                {inf.title?.substring(0, 10)}...
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {/* Progress bar */}
                                        <div style={{ width: '60px' }}>
                                            <div style={{ 
                                                height: '4px', 
                                                borderRadius: '2px',
                                                background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                                                overflow: 'hidden'
                                            }}>
                                                <div style={{ 
                                                    height: '100%', 
                                                    width: `${themeItem.completionPct}%`,
                                                    background: getHealthColor(themeItem.health),
                                                    transition: 'width 0.3s'
                                                }} />
                                            </div>
                                        </div>
                                        <span style={{
                                            fontSize: '0.65rem',
                                            padding: '0.2rem 0.4rem',
                                            borderRadius: '4px',
                                            backgroundColor: `${getHealthColor(themeItem.health)}20`,
                                            color: getHealthColor(themeItem.health),
                                            fontWeight: 600,
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {getHealthLabel(themeItem.health)}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>

                    {/* Influences Overview - Year Scoped */}
                    <motion.div
                        className="glass-card dashboard-panel"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        style={{ background: cardBg, border: `1px solid ${cardBorder}`, maxWidth: '320px' }}
                    >
                        <h3 style={{ color: textColor, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Zap size={18} /> Vlivy ({totalInfluences})
                        </h3>
                        <div style={{ marginTop: '1rem' }}>
                            {scopedInfluences.filter(i => i.yearPull > 0).length === 0 ? (
                                <p style={{ color: textSecondary, fontSize: '0.9rem', margin: 0 }}>
                                    Žádné aktivní vlivy pro tento rok
                                </p>
                            ) : (
                                scopedInfluences.filter(i => i.yearPull > 0).slice(0, 4).map((inf, index) => {
                                    const isExternal = inf.type === 'external';
                                    return (
                                        <div
                                            key={inf.id}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.75rem',
                                                padding: '0.6rem',
                                                marginBottom: index < 3 ? '0.4rem' : 0,
                                                borderRadius: '8px',
                                                background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                                                borderLeft: `3px solid ${isExternal ? '#dc3545' : '#198754'}`
                                            }}
                                        >
                                            <div style={{ flex: 1 }}>
                                                <div style={{ 
                                                    color: textColor, 
                                                    fontWeight: 500, 
                                                    fontSize: '0.85rem',
                                                    marginBottom: '0.15rem'
                                                }}>
                                                    {inf.title}
                                                </div>
                                                <div style={{ 
                                                    display: 'flex', 
                                                    gap: '0.5rem', 
                                                    fontSize: '0.7rem', 
                                                    color: textSecondary 
                                                }}>
                                                    <span>{inf.yearThemeCount} témat</span>
                                                    <span>{inf.yearProjectCount} projektů</span>
                                                </div>
                                            </div>
                                            <span style={{
                                                fontSize: '0.6rem',
                                                padding: '0.15rem 0.4rem',
                                                borderRadius: '4px',
                                                backgroundColor: isExternal 
                                                    ? (isDark ? 'rgba(220, 53, 69, 0.2)' : 'rgba(220, 53, 69, 0.1)')
                                                    : (isDark ? 'rgba(25, 135, 84, 0.2)' : 'rgba(25, 135, 84, 0.1)'),
                                                color: isExternal ? '#dc3545' : '#198754',
                                                fontWeight: 600
                                            }}>
                                                {isExternal ? 'EXT' : 'INT'}
                                            </span>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* Second Row: Roadmap + Signals Placeholder */}
                <div className="dashboard-row" style={{ marginTop: '1.5rem' }}>
                    {/* Roadmap by Month */}
                    <motion.div
                        className="glass-card dashboard-panel"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        style={{ background: cardBg, border: `1px solid ${cardBorder}`, flex: 2 }}
                    >
                        <h3 style={{ color: textColor, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Calendar size={18} />
                            Roadmapa {!showAllTime && selectedYearTitle}
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {roadmapByMonth.length === 0 ? (
                                <p style={{ color: textSecondary, fontSize: '0.9rem', margin: 0 }}>
                                    Žádné plánované události s datem
                                </p>
                            ) : (
                                roadmapByMonth.map(month => (
                                    <div key={month.key}>
                                        <div style={{ 
                                            fontSize: '0.8rem', 
                                            fontWeight: 600, 
                                            color: accentColor,
                                            marginBottom: '0.5rem',
                                            textTransform: 'capitalize'
                                        }}>
                                            {formatMonthYear(month.date)}
                                            {month.items.length > 2 && (
                                                <span style={{ 
                                                    marginLeft: '0.5rem',
                                                    padding: '0.1rem 0.4rem',
                                                    background: 'rgba(245, 158, 11, 0.2)',
                                                    color: '#f59e0b',
                                                    borderRadius: '4px',
                                                    fontSize: '0.65rem'
                                                }}>
                                                    <AlertTriangle size={10} style={{ marginRight: '0.2rem' }} />
                                                    Busy
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', paddingLeft: '0.75rem', borderLeft: `2px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}>
                                            {month.items.map(item => (
                                                <div 
                                                    key={item.id}
                                                    style={{ 
                                                        display: 'flex', 
                                                        alignItems: 'center', 
                                                        gap: '0.5rem',
                                                        fontSize: '0.85rem'
                                                    }}
                                                >
                                                    <span style={{ color: getCategoryColor(item.category) }}>
                                                        {getCategoryIcon(item.category)}
                                                    </span>
                                                    <span style={{ color: textColor }}>{item.title}</span>
                                                    <span style={{ 
                                                        fontSize: '0.7rem', 
                                                        color: textSecondary,
                                                        marginLeft: 'auto'
                                                    }}>
                                                        {translatePhase(item.phase)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>

                    {/* Signals Block */}
                    <motion.div
                        className="glass-card dashboard-panel"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.65 }}
                        style={{ background: cardBg, border: `1px solid ${cardBorder}`, maxWidth: '320px' }}
                    >
                        <h3 style={{ color: textColor, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Radio size={18} style={{ color: '#6366f1' }} /> Signály
                        </h3>
                        {(() => {
                            const allSignals = signals || [];
                            const now = new Date();
                            const thisMonth = now.getMonth();
                            const thisYear = now.getFullYear();
                            
                            // Signals this month
                            const signalsThisMonth = allSignals.filter(s => {
                                if (!s.date) return false;
                                const d = new Date(s.date);
                                return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
                            });
                            
                            // Untriaged count
                            const untriagedCount = allSignals.filter(s => s.status === 'inbox').length;
                            
                            // Top restaurants by signal count
                            const restaurantCounts = {};
                            allSignals.forEach(s => {
                                (s.restaurantIds || []).forEach(rid => {
                                    restaurantCounts[rid] = (restaurantCounts[rid] || 0) + 1;
                                });
                            });
                            const topRestaurants = Object.entries(restaurantCounts)
                                .sort((a, b) => b[1] - a[1])
                                .slice(0, 3)
                                .map(([id, count]) => {
                                    const loc = (data.locations || []).find(l => l.id === id);
                                    const brand = loc ? data.brands.find(b => b.id === loc.brandId) : null;
                                    return { id, count, name: loc ? `${brand?.name || ''} ${loc.name}` : id };
                                });
                            
                            // Top influences by signal count
                            const influenceCounts = {};
                            allSignals.forEach(s => {
                                (s.influenceIds || []).forEach(iid => {
                                    influenceCounts[iid] = (influenceCounts[iid] || 0) + 1;
                                });
                            });
                            const topInfluences = Object.entries(influenceCounts)
                                .sort((a, b) => b[1] - a[1])
                                .slice(0, 3)
                                .map(([id, count]) => {
                                    const inf = (influences || []).find(i => i.id === id);
                                    return { id, count, name: inf?.title || id, type: inf?.type };
                                });
                            
                            if (allSignals.length === 0) {
                                return (
                                    <div style={{ 
                                        marginTop: '1rem',
                                        padding: '2rem 1rem',
                                        textAlign: 'center',
                                        background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                                        borderRadius: '8px',
                                        border: `1px dashed ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
                                    }}>
                                        <Radio size={32} style={{ color: textSecondary, marginBottom: '0.75rem', opacity: 0.5 }} />
                                        <p style={{ color: textSecondary, fontSize: '0.85rem', margin: 0 }}>
                                            Zatím žádné signály
                                        </p>
                                        <p style={{ color: textSecondary, fontSize: '0.75rem', margin: '0.5rem 0 0 0', opacity: 0.7 }}>
                                            Přidejte signály v sekci Editor → Signály
                                        </p>
                                    </div>
                                );
                            }
                            
                            return (
                                <div style={{ marginTop: '1rem' }}>
                                    {/* Stats row */}
                                    <div style={{ 
                                        display: 'flex', 
                                        gap: '1rem', 
                                        marginBottom: '1rem',
                                        padding: '0.75rem',
                                        background: isDark ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)',
                                        borderRadius: '8px'
                                    }}>
                                        <div style={{ flex: 1, textAlign: 'center' }}>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#6366f1' }}>
                                                {signalsThisMonth.length}
                                            </div>
                                            <div style={{ fontSize: '0.7rem', color: textSecondary }}>Tento měsíc</div>
                                        </div>
                                        <div style={{ flex: 1, textAlign: 'center' }}>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: untriagedCount > 0 ? '#f59e0b' : '#10b981' }}>
                                                {untriagedCount}
                                            </div>
                                            <div style={{ fontSize: '0.7rem', color: textSecondary }}>Netříděno</div>
                                        </div>
                                        <div style={{ flex: 1, textAlign: 'center' }}>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: textColor }}>
                                                {allSignals.length}
                                            </div>
                                            <div style={{ fontSize: '0.7rem', color: textSecondary }}>Celkem</div>
                                        </div>
                                    </div>
                                    
                                    {/* Top restaurants */}
                                    {topRestaurants.length > 0 && (
                                        <div style={{ marginBottom: '0.75rem' }}>
                                            <div style={{ fontSize: '0.75rem', color: textSecondary, marginBottom: '0.4rem', fontWeight: 600 }}>
                                                Top pobočky
                                            </div>
                                            {topRestaurants.map((r, i) => (
                                                <div key={r.id} style={{ 
                                                    display: 'flex', 
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    padding: '0.3rem 0.5rem',
                                                    marginBottom: '0.2rem',
                                                    background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                                                    borderRadius: '4px',
                                                    fontSize: '0.8rem'
                                                }}>
                                                    <span style={{ color: textColor }}>{r.name}</span>
                                                    <span style={{ 
                                                        color: '#6366f1', 
                                                        fontWeight: 600,
                                                        fontSize: '0.75rem'
                                                    }}>{r.count}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    
                                    {/* Top influences */}
                                    {topInfluences.length > 0 && (
                                        <div>
                                            <div style={{ fontSize: '0.75rem', color: textSecondary, marginBottom: '0.4rem', fontWeight: 600 }}>
                                                Top vlivy
                                            </div>
                                            {topInfluences.map((inf, i) => (
                                                <div key={inf.id} style={{ 
                                                    display: 'flex', 
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    padding: '0.3rem 0.5rem',
                                                    marginBottom: '0.2rem',
                                                    background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                                                    borderRadius: '4px',
                                                    fontSize: '0.8rem',
                                                    borderLeft: `3px solid ${inf.type === 'external' ? '#dc3545' : '#198754'}`
                                                }}>
                                                    <span style={{ color: textColor }}>{inf.name}</span>
                                                    <span style={{ 
                                                        color: '#6366f1', 
                                                        fontWeight: 600,
                                                        fontSize: '0.75rem'
                                                    }}>{inf.count}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })()}
                    </motion.div>
                </div>

                {/* Recent Activity Placeholder */}
                <motion.div
                    className="glass-card dashboard-panel"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    style={{ 
                        background: cardBg, 
                        border: `1px solid ${cardBorder}`,
                        marginTop: '1.5rem'
                    }}
                >
                    <h3 style={{ color: textColor, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Clock size={18} />
                        Nedávná aktivita
                    </h3>
                    <div style={{ 
                        padding: '1.5rem',
                        textAlign: 'center',
                        background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                        borderRadius: '8px',
                        border: `1px dashed ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
                    }}>
                        <Clock size={28} style={{ color: textSecondary, marginBottom: '0.5rem', opacity: 0.5 }} />
                        <p style={{ color: textSecondary, fontSize: '0.85rem', margin: 0 }}>
                            Sledování změn vyžaduje časová razítka
                        </p>
                        <p style={{ color: textSecondary, fontSize: '0.75rem', margin: '0.5rem 0 0 0', opacity: 0.7 }}>
                            Přidejte createdAt/updatedAt pole pro sledování aktivity
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
