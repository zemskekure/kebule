import React from 'react';
import { motion } from 'framer-motion';
import { PieChart, Activity, CheckCircle, HardHat, Zap, Layers, Calendar, Sparkles, Hammer, Building2 } from 'lucide-react';

export function Dashboard({ data, theme = 'dark' }) {
    const { projects, newRestaurants, themes, brands, influences } = data;

    // Stats
    const totalProjects = projects.length;
    const completedProjects = projects.filter(p => p.status === 'Hotovo').length;
    const runningProjects = projects.filter(p => p.status === 'Běží').length;
    const totalNewRestaurants = (newRestaurants || []).length;
    const totalInfluences = (influences || []).length;

    // Progress
    const progressPercentage = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0;

    const isDark = theme === 'dark';
    const bgGradient = isDark
        ? 'radial-gradient(circle at 50% 50%, #0a0a0a 0%, #000000 100%)'
        : 'radial-gradient(circle at 50% 50%, #f8f9fa 0%, #e9ecef 100%)';

    const cardBg = isDark ? 'rgba(30, 30, 30, 0.8)' : 'rgba(255, 255, 255, 0.9)';
    const cardBorder = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)';
    const textColor = isDark ? '#ffffff' : '#212529';
    const textSecondary = isDark ? '#adb5bd' : '#6c757d';
    const accentColor = isDark ? 'var(--neon-blue)' : '#0d6efd';

    return (
        <div className="dashboard-container" style={{ background: bgGradient }}>
            <div className="dashboard-content">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    style={{ 
                        color: textColor,
                        fontSize: '2rem',
                        fontWeight: 700,
                        marginBottom: '2rem'
                    }}
                >
                    Přehled strategie
                </motion.h1>

                {/* KPI Grid */}
                <div className="kpi-grid">
                    <motion.div
                        className="glass-card kpi-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
                    >
                        <div className="kpi-icon" style={{ color: accentColor, background: isDark ? 'rgba(0, 243, 255, 0.1)' : 'rgba(13, 110, 253, 0.1)' }}><Activity size={24} /></div>
                        <div className="kpi-value" style={{ color: textColor }}>{totalProjects}</div>
                        <div className="kpi-label" style={{ color: textSecondary }}>Celkem projektů</div>
                    </motion.div>

                    <motion.div
                        className="glass-card kpi-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
                    >
                        <div className="kpi-icon" style={{ color: accentColor, background: isDark ? 'rgba(0, 243, 255, 0.1)' : 'rgba(13, 110, 253, 0.1)' }}><HardHat size={24} /></div>
                        <div className="kpi-value" style={{ color: textColor }}>{totalNewRestaurants}</div>
                        <div className="kpi-label" style={{ color: textSecondary }}>Nové restaurace</div>
                    </motion.div>

                    <motion.div
                        className="glass-card kpi-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
                    >
                        <div className="kpi-icon" style={{ color: accentColor, background: isDark ? 'rgba(0, 243, 255, 0.1)' : 'rgba(13, 110, 253, 0.1)' }}><Zap size={24} /></div>
                        <div className="kpi-value" style={{ color: textColor }}>{totalInfluences}</div>
                        <div className="kpi-label" style={{ color: textSecondary }}>Sledované vlivy</div>
                    </motion.div>

                    <motion.div
                        className="glass-card kpi-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
                    >
                        <div className="kpi-icon" style={{ color: accentColor, background: isDark ? 'rgba(0, 243, 255, 0.1)' : 'rgba(13, 110, 253, 0.1)' }}><CheckCircle size={24} /></div>
                        <div className="kpi-value" style={{ color: textColor }}>{progressPercentage}%</div>
                        <div className="kpi-label" style={{ color: textSecondary }}>Hotovo</div>
                    </motion.div>
                </div>

                {/* Charts / Lists Row */}
                <div className="dashboard-row">
                    {/* Themes Progress */}
                    <motion.div
                        className="glass-card dashboard-panel"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
                    >
                        <h3 style={{ color: textColor }}><Layers size={18} /> Postup dle témat</h3>
                        <div className="themes-progress-list">
                            {themes.map(themeItem => {
                                const themeProjects = projects.filter(p => p.themeId === themeItem.id);
                                const done = themeProjects.filter(p => p.status === 'Hotovo').length;
                                const total = themeProjects.length;
                                const pct = total > 0 ? (done / total) * 100 : 0;

                                return (
                                    <div key={themeItem.id} className="theme-progress-item">
                                        <div className="theme-info">
                                            <span style={{ color: textColor }}>{themeItem.title}</span>
                                            <span className="theme-stats" style={{ color: textSecondary }}>{done}/{total}</span>
                                        </div>
                                        <div className="progress-bar-bg" style={{ background: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }}>
                                            <div
                                                className="progress-bar-fill"
                                                style={{ width: `${pct}%`, backgroundColor: pct === 100 ? 'var(--success-color)' : accentColor }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>

                    {/* New Restaurants List */}
                    <motion.div
                        className="glass-card dashboard-panel"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                        style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
                    >
                        <h3 style={{ color: textColor }}><HardHat size={18} /> Plánované otevíračky</h3>
                        <div className="restaurants-list-dashboard">
                            {(newRestaurants || []).length > 0 ? (newRestaurants || []).map(rest => {
                                const formatDate = (dateStr) => {
                                    if (!dateStr) return 'TBD';
                                    const date = new Date(dateStr);
                                    return date.toLocaleDateString('cs-CZ', { month: 'long', year: 'numeric' });
                                };
                                return (
                                    <div key={rest.id} className="dashboard-rest-item" style={{ background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)', borderLeftColor: accentColor }}>
                                        <div className="rest-header">
                                            <h4 style={{ color: textColor }}>{rest.title}</h4>
                                            <span className="rest-date" style={{ color: accentColor }}>{formatDate(rest.openingDate)}</span>
                                        </div>
                                        <div className="rest-phase" style={{ color: textSecondary }}>Fáze: {rest.phase}</div>
                                    </div>
                                );
                            }) : (
                                <p className="empty-text" style={{ color: textSecondary }}>Žádné nové restaurace v plánu.</p>
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* Timeline Section */}
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
                    <h3 style={{ color: textColor, marginBottom: '1.5rem' }}>
                        <Calendar size={18} style={{ marginRight: '0.5rem' }} />
                        Klíčové události roku
                    </h3>
                    <div style={{ position: 'relative', paddingLeft: '2rem' }}>
                        {/* Vertical timeline line */}
                        <div style={{
                            position: 'absolute',
                            left: '0.5rem',
                            top: '0.5rem',
                            bottom: '0.5rem',
                            width: '2px',
                            background: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
                            borderRadius: '1px'
                        }} />
                        
                        {/* Timeline items */}
                        {(newRestaurants || []).slice(0, 5).sort((a, b) => {
                            const dateA = a.openingDate ? new Date(a.openingDate) : new Date('2099-12-31');
                            const dateB = b.openingDate ? new Date(b.openingDate) : new Date('2099-12-31');
                            return dateA - dateB;
                        }).map((item, index) => {
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
                            const formatDate = (dateStr) => {
                                if (!dateStr) return 'TBD';
                                const date = new Date(dateStr);
                                return date.toLocaleDateString('cs-CZ', { month: 'short', year: 'numeric' });
                            };

                            return (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.8 + index * 0.1 }}
                                    style={{
                                        position: 'relative',
                                        marginBottom: index < 4 ? '1.5rem' : 0,
                                        paddingLeft: '1rem'
                                    }}
                                >
                                    {/* Timeline dot */}
                                    <div style={{
                                        position: 'absolute',
                                        left: '-1.65rem',
                                        top: '0.35rem',
                                        width: '10px',
                                        height: '10px',
                                        borderRadius: '50%',
                                        background: getCategoryColor(item.category),
                                        border: `2px solid ${isDark ? '#0a0a0a' : '#f8f9fa'}`,
                                        boxShadow: `0 0 0 3px ${getCategoryColor(item.category)}30`
                                    }} />
                                    
                                    {/* Content */}
                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                                        <div>
                                            <div style={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                gap: '0.5rem',
                                                marginBottom: '0.25rem'
                                            }}>
                                                <span style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.25rem',
                                                    color: getCategoryColor(item.category),
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600
                                                }}>
                                                    {getCategoryIcon(item.category)}
                                                </span>
                                                <span style={{ 
                                                    color: textColor, 
                                                    fontWeight: 600,
                                                    fontSize: '0.95rem'
                                                }}>
                                                    {item.title}
                                                </span>
                                            </div>
                                            {item.phase && (
                                                <span style={{ 
                                                    fontSize: '0.8rem', 
                                                    color: textSecondary 
                                                }}>
                                                    {item.phase}
                                                </span>
                                            )}
                                        </div>
                                        <span style={{ 
                                            fontSize: '0.8rem', 
                                            color: accentColor,
                                            fontWeight: 500,
                                            whiteSpace: 'nowrap',
                                            background: isDark ? 'rgba(0, 243, 255, 0.1)' : 'rgba(13, 110, 253, 0.1)',
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '6px'
                                        }}>
                                            {formatDate(item.openingDate)}
                                        </span>
                                    </div>
                                </motion.div>
                            );
                        })}
                        
                        {(newRestaurants || []).length === 0 && (
                            <p style={{ color: textSecondary, fontSize: '0.9rem', margin: 0 }}>
                                Žádné plánované události
                            </p>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
