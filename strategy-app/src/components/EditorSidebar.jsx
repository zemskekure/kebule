import React from 'react';
import { Brain, Zap, HardHat, Building2, Store, Database, ChevronRight } from 'lucide-react';

const EDITOR_SECTIONS = [
    { id: 'thought-system', label: 'Šiška', icon: Brain, description: 'Vize, témata a projekty' },
    { id: 'influences', label: 'Vlivy', icon: Zap, description: 'Externí a interní vlivy' },
    { id: 'reconstructions', label: 'Rekonstrukce & Facelifty', icon: HardHat, description: 'Plánované rekonstrukce' },
    { id: 'new-restaurants', label: 'Nové restaurace', icon: Building2, description: 'Nové koncepty a pobočky' },
    { id: 'brands', label: 'Značky & Pobočky', icon: Store, description: 'Správa značek a poboček' },
    { id: 'backups', label: 'Zálohy', icon: Database, description: 'Správa záloh dat' },
];

export function EditorSidebar({ activeSection, onSectionChange, theme = 'light' }) {
    const isDark = theme === 'dark';

    const sidebarStyle = {
        width: '280px',
        backgroundColor: isDark ? '#0a0a0a' : '#fcfcfc',
        borderRight: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e9ecef',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        flexShrink: 0
    };

    const headerStyle = {
        padding: '1rem 1.5rem',
        borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e9ecef',
        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)',
        color: isDark ? '#ffffff' : '#212529',
        fontWeight: 600,
        fontSize: '0.95rem'
    };

    const menuItemStyle = (isActive) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.875rem 1.25rem',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        backgroundColor: isActive
            ? (isDark ? 'rgba(0, 180, 216, 0.15)' : 'rgba(0, 180, 216, 0.1)')
            : 'transparent',
        borderLeft: isActive
            ? '3px solid #00b4d8'
            : '3px solid transparent',
        color: isActive
            ? (isDark ? '#00b4d8' : '#0077b6')
            : (isDark ? '#adb5bd' : '#495057')
    });

    const iconContainerStyle = (isActive) => ({
        width: '36px',
        height: '36px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: isActive
            ? (isDark ? 'rgba(0, 180, 216, 0.2)' : 'rgba(0, 180, 216, 0.15)')
            : (isDark ? 'rgba(255, 255, 255, 0.05)' : '#f1f3f5'),
        color: isActive
            ? '#00b4d8'
            : (isDark ? '#adb5bd' : '#868e96')
    });

    const labelStyle = {
        flex: 1
    };

    const titleStyle = (isActive) => ({
        fontSize: '0.9rem',
        fontWeight: isActive ? 600 : 500,
        marginBottom: '2px'
    });

    const descriptionStyle = {
        fontSize: '0.75rem',
        opacity: 0.7
    };

    return (
        <div style={sidebarStyle}>
            <div style={headerStyle}>
                Editor
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem 0' }}>
                {EDITOR_SECTIONS.map(section => {
                    const isActive = activeSection === section.id;
                    const Icon = section.icon;

                    return (
                        <div
                            key={section.id}
                            style={menuItemStyle(isActive)}
                            onClick={() => onSectionChange(section.id)}
                            onMouseEnter={(e) => {
                                if (!isActive) {
                                    e.currentTarget.style.backgroundColor = isDark
                                        ? 'rgba(255, 255, 255, 0.05)'
                                        : '#f8f9fa';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isActive) {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }
                            }}
                        >
                            <div style={iconContainerStyle(isActive)}>
                                <Icon size={18} />
                            </div>
                            <div style={labelStyle}>
                                <div style={titleStyle(isActive)}>{section.label}</div>
                                <div style={descriptionStyle}>{section.description}</div>
                            </div>
                            <ChevronRight
                                size={16}
                                style={{
                                    opacity: isActive ? 1 : 0.3,
                                    color: isActive ? '#00b4d8' : 'inherit'
                                }}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export { EDITOR_SECTIONS };
