import React from 'react';
import { motion } from 'framer-motion';
import { PieChart, Activity, CheckCircle, HardHat, Zap, Layers } from 'lucide-react';

export function Dashboard({ data }) {
    const { projects, newRestaurants, themes, brands, influences } = data;

    // Stats
    const totalProjects = projects.length;
    const completedProjects = projects.filter(p => p.status === 'Hotovo').length;
    const runningProjects = projects.filter(p => p.status === 'Běží').length;
    const totalNewRestaurants = (newRestaurants || []).length;
    const totalInfluences = (influences || []).length;

    // Progress
    const progressPercentage = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0;

    return (
        <div className="dashboard-container">
            <div className="dashboard-content">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
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
                    >
                        <div className="kpi-icon"><Activity size={24} /></div>
                        <div className="kpi-value">{totalProjects}</div>
                        <div className="kpi-label">Celkem projektů</div>
                    </motion.div>

                    <motion.div
                        className="glass-card kpi-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="kpi-icon"><HardHat size={24} /></div>
                        <div className="kpi-value">{totalNewRestaurants}</div>
                        <div className="kpi-label">Nové restaurace</div>
                    </motion.div>

                    <motion.div
                        className="glass-card kpi-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="kpi-icon"><Zap size={24} /></div>
                        <div className="kpi-value">{totalInfluences}</div>
                        <div className="kpi-label">Sledované vlivy</div>
                    </motion.div>

                    <motion.div
                        className="glass-card kpi-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <div className="kpi-icon"><CheckCircle size={24} /></div>
                        <div className="kpi-value">{progressPercentage}%</div>
                        <div className="kpi-label">Hotovo</div>
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
                    >
                        <h3><Layers size={18} /> Postup dle témat</h3>
                        <div className="themes-progress-list">
                            {themes.map(theme => {
                                const themeProjects = projects.filter(p => p.themeId === theme.id);
                                const done = themeProjects.filter(p => p.status === 'Hotovo').length;
                                const total = themeProjects.length;
                                const pct = total > 0 ? (done / total) * 100 : 0;

                                return (
                                    <div key={theme.id} className="theme-progress-item">
                                        <div className="theme-info">
                                            <span>{theme.title}</span>
                                            <span className="theme-stats">{done}/{total}</span>
                                        </div>
                                        <div className="progress-bar-bg">
                                            <div
                                                className="progress-bar-fill"
                                                style={{ width: `${pct}%`, backgroundColor: pct === 100 ? 'var(--success-color)' : 'var(--primary-color)' }}
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
                    >
                        <h3><HardHat size={18} /> Plánované otevíračky</h3>
                        <div className="restaurants-list-dashboard">
                            {(newRestaurants || []).length > 0 ? (newRestaurants || []).map(rest => (
                                <div key={rest.id} className="dashboard-rest-item">
                                    <div className="rest-header">
                                        <h4>{rest.title}</h4>
                                        <span className="rest-date">{rest.openingDate || 'TBD'}</span>
                                    </div>
                                    <div className="rest-phase">Fáze: {rest.phase}</div>
                                </div>
                            )) : (
                                <p className="empty-text">Žádné nové restaurace v plánu.</p>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
