import React, { useState, useMemo } from 'react';
import { Plus, ChevronDown, ChevronRight, Edit2, Trash2, Calendar, MapPin, User, ExternalLink, Zap, GripVertical, Radio, Search, Filter, Inbox, CheckCircle, Archive, ArrowRight } from 'lucide-react';
import { BackupManager } from './BackupManager';
import { buildStrategyTree, getVisionsForYear, getThemesForVision, getProjectsForTheme, getInitiativesForTheme, getProjectsForInitiative, getUnsortedProjectsForTheme } from '../utils/buildStrategyTree';

// Kedlubna Content (Thought System) with Drag & Drop
function ThoughtSystemContent({ data, onSelectNode, selectedNode, expandedNodes, onToggleNode, onAddYear, onAddVision, onAddTheme, onAddInitiative, onAddProject, onMoveItem, theme }) {
    // Debug logging
    console.log('EditorContent rendered. onAddInitiative present:', !!onAddInitiative);

    const isDark = theme === 'dark';
    const textColor = isDark ? '#ffffff' : '#212529';
    const textSecondary = isDark ? '#adb5bd' : '#6c757d';
    const borderColor = isDark ? 'rgba(255, 255, 255, 0.1)' : '#e9ecef';
    const cardBg = isDark ? 'rgba(255, 255, 255, 0.03)' : '#ffffff';
    
    // Drag and drop state
    const [draggedItem, setDraggedItem] = useState(null);
    const [dropTarget, setDropTarget] = useState(null);

    const handleDragStart = (e, itemType, itemId, parentId) => {
        setDraggedItem({ type: itemType, id: itemId, parentId });
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', JSON.stringify({ type: itemType, id: itemId, parentId }));
        // Add a slight delay to allow the drag image to be captured
        setTimeout(() => {
            e.target.style.opacity = '0.5';
        }, 0);
    };

    const handleDragEnd = (e) => {
        e.target.style.opacity = '1';
        setDraggedItem(null);
        setDropTarget(null);
    };

    const handleDragOver = (e, targetType, targetId) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        
        // Only allow valid drop targets
        if (draggedItem) {
            const isValidDrop = 
                (draggedItem.type === 'project' && targetType === 'theme') ||
                (draggedItem.type === 'theme' && targetType === 'vision') ||
                (draggedItem.type === 'vision' && targetType === 'year') ||
                (draggedItem.type === 'project' && targetType === 'project') ||
                (draggedItem.type === 'theme' && targetType === 'theme') ||
                (draggedItem.type === 'vision' && targetType === 'vision');
            
            if (isValidDrop) {
                setDropTarget({ type: targetType, id: targetId });
            }
        }
    };

    const handleDragLeave = (e) => {
        // Only clear if we're leaving the actual element, not entering a child
        if (!e.currentTarget.contains(e.relatedTarget)) {
            setDropTarget(null);
        }
    };

    const handleDrop = (e, targetType, targetId, targetParentId) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!draggedItem || !onMoveItem) return;
        
        // Determine the new parent based on drop target
        let newParentId = null;
        let newIndex = null;
        
        if (draggedItem.type === 'project') {
            if (targetType === 'theme') {
                // Dropped on a theme - move to that theme
                newParentId = targetId;
            } else if (targetType === 'project') {
                // Dropped on another project - move to same theme, reorder
                const targetProject = data.projects.find(p => p.id === targetId);
                if (targetProject) {
                    newParentId = targetProject.themeId;
                    const themeProjects = data.projects.filter(p => p.themeId === targetProject.themeId);
                    newIndex = themeProjects.findIndex(p => p.id === targetId);
                }
            }
        } else if (draggedItem.type === 'theme') {
            if (targetType === 'vision') {
                newParentId = targetId;
            } else if (targetType === 'theme') {
                const targetTheme = data.themes.find(t => t.id === targetId);
                if (targetTheme) {
                    newParentId = targetTheme.visionId;
                    const visionThemes = data.themes.filter(t => t.visionId === targetTheme.visionId);
                    newIndex = visionThemes.findIndex(t => t.id === targetId);
                }
            }
        } else if (draggedItem.type === 'vision') {
            if (targetType === 'year') {
                newParentId = targetId;
            } else if (targetType === 'vision') {
                const targetVision = data.visions.find(v => v.id === targetId);
                if (targetVision) {
                    newParentId = targetVision.yearId;
                    const yearVisions = data.visions.filter(v => v.yearId === targetVision.yearId);
                    newIndex = yearVisions.findIndex(v => v.id === targetId);
                }
            }
        }
        
        if (newParentId !== null) {
            onMoveItem(draggedItem.type, draggedItem.id, newParentId, newIndex);
        }
        
        setDraggedItem(null);
        setDropTarget(null);
    };

    const getDragHandleStyle = (isHovered = false) => ({
        cursor: 'grab',
        padding: '4px',
        marginRight: '0.5rem',
        color: isHovered ? textColor : textSecondary,
        opacity: isHovered ? 1 : 0.5,
        transition: 'opacity 0.2s'
    });

    const getDropTargetStyle = (targetType, targetId) => {
        const isDropTarget = dropTarget?.type === targetType && dropTarget?.id === targetId;
        return isDropTarget ? {
            outline: `2px dashed ${isDark ? '#00b4d8' : '#0d6efd'}`,
            outlineOffset: '2px',
            backgroundColor: isDark ? 'rgba(0, 180, 216, 0.1)' : 'rgba(13, 110, 253, 0.05)'
        } : {};
    };

    return (
        <div style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0, color: textColor, fontSize: '1.5rem' }}>kedlubna</h2>
                <button
                    onClick={onAddYear}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        background: 'linear-gradient(135deg, #ea580c, #c2410c)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 500,
                        transition: 'all 0.2s ease',
                        boxShadow: '0 2px 8px rgba(234, 88, 12, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(234, 88, 12, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(234, 88, 12, 0.3)';
                    }}
                >
                    <Plus size={16} /> Přidat rok
                </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {data.years.map(year => {
                    const yearVisions = getVisionsForYear(data, year.id);
                    const isExpanded = expandedNodes[year.id];

                    return (
                        <div
                            key={year.id}
                            className="interactive-card"
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
                                <div 
                                    style={{ padding: '0 1rem 1rem 2.5rem' }}
                                    onDragOver={(e) => handleDragOver(e, 'year', year.id)}
                                    onDragLeave={handleDragLeave}
                                    onDrop={(e) => handleDrop(e, 'year', year.id, null)}
                                >
                                    {yearVisions.map(vision => {
                                        const visionThemes = getThemesForVision(data, vision.id);
                                        const isVisionExpanded = expandedNodes[vision.id];

                                        return (
                                            <div 
                                                key={vision.id} 
                                                style={{ marginTop: '0.75rem' }}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, 'vision', vision.id, year.id)}
                                                onDragEnd={handleDragEnd}
                                                onDragOver={(e) => handleDragOver(e, 'vision', vision.id)}
                                                onDragLeave={handleDragLeave}
                                                onDrop={(e) => handleDrop(e, 'vision', vision.id, year.id)}
                                            >
                                                <div
                                                    className="interactive-card"
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        padding: '0.75rem',
                                                        borderRadius: '8px',
                                                        backgroundColor: selectedNode?.id === vision.id
                                                            ? (isDark ? 'rgba(0, 180, 216, 0.15)' : 'rgba(0, 180, 216, 0.1)')
                                                            : (isDark ? 'rgba(255, 255, 255, 0.03)' : '#f8f9fa'),
                                                        cursor: 'pointer',
                                                        ...getDropTargetStyle('vision', vision.id)
                                                    }}
                                                    onClick={() => onSelectNode('vision', vision.id)}
                                                >
                                                    <div style={getDragHandleStyle()} className="drag-handle">
                                                        <GripVertical size={14} />
                                                    </div>
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
                                                    <span style={{ fontWeight: 500, color: textColor, flex: 1 }}>{vision.title}</span>
                                                    <span style={{ fontSize: '0.8rem', color: textSecondary }}>
                                                        {visionThemes.length} témat
                                                    </span>
                                                </div>

                                                {isVisionExpanded && (
                                                    <div 
                                                        style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}
                                                        onDragOver={(e) => handleDragOver(e, 'vision', vision.id)}
                                                        onDragLeave={handleDragLeave}
                                                        onDrop={(e) => handleDrop(e, 'vision', vision.id, year.id)}
                                                    >
                                                        {visionThemes.map(themeItem => {
                                                            const themeProjects = getProjectsForTheme(data, themeItem.id);
                                                            const isThemeExpanded = expandedNodes[themeItem.id];

                                                            return (
                                                                <div 
                                                                    key={themeItem.id} 
                                                                    style={{ marginBottom: '0.5rem' }}
                                                                    draggable
                                                                    onDragStart={(e) => handleDragStart(e, 'theme', themeItem.id, vision.id)}
                                                                    onDragEnd={handleDragEnd}
                                                                    onDragOver={(e) => handleDragOver(e, 'theme', themeItem.id)}
                                                                    onDragLeave={handleDragLeave}
                                                                    onDrop={(e) => handleDrop(e, 'theme', themeItem.id, vision.id)}
                                                                >
                                                                    <div
                                                                        className="interactive-card"
                                                                        style={{
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            padding: '0.5rem 0.75rem',
                                                                            borderLeft: '3px solid #ffc107',
                                                                            backgroundColor: selectedNode?.id === themeItem.id
                                                                                ? (isDark ? 'rgba(255, 193, 7, 0.1)' : 'rgba(255, 193, 7, 0.05)')
                                                                                : 'transparent',
                                                                            cursor: 'pointer',
                                                                            borderRadius: '0 6px 6px 0',
                                                                            ...getDropTargetStyle('theme', themeItem.id)
                                                                        }}
                                                                        onClick={() => onSelectNode('theme', themeItem.id)}
                                                                    >
                                                                        <div style={getDragHandleStyle()} className="drag-handle">
                                                                            <GripVertical size={12} />
                                                                        </div>
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
                                                                        <div style={{ flex: 1 }}>
                                                                            <span style={{ color: textColor, fontWeight: 500 }}>{themeItem.title}</span>
                                                                            {/* Influence badges */}
                                                                            {(() => {
                                                                                const linkedInfluences = (data.influences || []).filter(inf => 
                                                                                    (inf.connectedThemeIds || []).includes(themeItem.id)
                                                                                );
                                                                                if (linkedInfluences.length === 0) return null;
                                                                                return (
                                                                                    <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                                                                                        {linkedInfluences.slice(0, 3).map(inf => (
                                                                                            <span
                                                                                                key={inf.id}
                                                                                                style={{
                                                                                                    fontSize: '0.65rem',
                                                                                                    padding: '0.1rem 0.4rem',
                                                                                                    borderRadius: '3px',
                                                                                                    border: `1px solid ${inf.type === 'external' ? '#dc3545' : '#198754'}`,
                                                                                                    color: inf.type === 'external' ? '#dc3545' : '#198754',
                                                                                                    backgroundColor: inf.type === 'external' 
                                                                                                        ? (isDark ? 'rgba(220, 53, 69, 0.1)' : 'rgba(220, 53, 69, 0.05)')
                                                                                                        : (isDark ? 'rgba(25, 135, 84, 0.1)' : 'rgba(25, 135, 84, 0.05)'),
                                                                                                    whiteSpace: 'nowrap'
                                                                                                }}
                                                                                            >
                                                                                                {inf.title}
                                                                                            </span>
                                                                                        ))}
                                                                                        {linkedInfluences.length > 3 && (
                                                                                            <span style={{ fontSize: '0.65rem', color: textSecondary }}>
                                                                                                +{linkedInfluences.length - 3}
                                                                                            </span>
                                                                                        )}
                                                                                    </div>
                                                                                );
                                                                            })()}
                                                                        </div>
                                                                        <span style={{ fontSize: '0.75rem', color: textSecondary }}>{themeProjects.length} projektů</span>
                                                                    </div>

                                                                    {/* Initiatives and Projects under theme */}
                                                                    {isThemeExpanded && (
                                                                        <div 
                                                                            style={{ marginLeft: '1.5rem', marginTop: '0.25rem' }}
                                                                            onDragOver={(e) => handleDragOver(e, 'theme', themeItem.id)}
                                                                            onDragLeave={handleDragLeave}
                                                                            onDrop={(e) => handleDrop(e, 'theme', themeItem.id, vision.id)}
                                                                        >
                                                                            {/* Initiatives */}
                                                                            {(() => {
                                                                                const themeInitiatives = getInitiativesForTheme(data, themeItem.id);
                                                                                const unsortedProjects = getUnsortedProjectsForTheme(data, themeItem.id);
                                                                                
                                                                                return (
                                                                                    <>
                                                                                        {themeInitiatives.map(initiative => {
                                                                                            const initiativeProjects = getProjectsForInitiative(data, initiative.id);
                                                                                            const isInitiativeExpanded = expandedNodes[initiative.id];
                                                                                            const doneCount = initiativeProjects.filter(p => p.status === 'Hotovo').length;
                                                                                            
                                                                                            return (
                                                                                                <div key={initiative.id} style={{ marginBottom: '0.5rem' }}>
                                                                                                    <div
                                                                                                        className="interactive-card"
                                                                                                        style={{
                                                                                                            display: 'flex',
                                                                                                            alignItems: 'center',
                                                                                                            padding: '0.4rem 0.6rem',
                                                                                                            borderLeft: '3px solid #6f42c1',
                                                                                                            backgroundColor: selectedNode?.id === initiative.id
                                                                                                                ? (isDark ? 'rgba(111, 66, 193, 0.15)' : 'rgba(111, 66, 193, 0.1)')
                                                                                                                : (isDark ? 'rgba(255, 255, 255, 0.02)' : '#fafafa'),
                                                                                                            cursor: 'pointer',
                                                                                                            borderRadius: '0 6px 6px 0'
                                                                                                        }}
                                                                                                        onClick={() => onSelectNode('initiative', initiative.id)}
                                                                                                    >
                                                                                                        <button
                                                                                                            onClick={(e) => { e.stopPropagation(); onToggleNode(initiative.id); }}
                                                                                                            style={{
                                                                                                                background: 'none',
                                                                                                                border: 'none',
                                                                                                                cursor: 'pointer',
                                                                                                                padding: '2px',
                                                                                                                marginRight: '0.5rem',
                                                                                                                color: textSecondary
                                                                                                            }}
                                                                                                        >
                                                                                                            {isInitiativeExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                                                                                                        </button>
                                                                                                        <div style={{ flex: 1 }}>
                                                                                                            <span style={{ color: textColor, fontWeight: 500, fontSize: '0.85rem' }}>{initiative.name}</span>
                                                                                                            <span style={{
                                                                                                                marginLeft: '0.5rem',
                                                                                                                fontSize: '0.65rem',
                                                                                                                padding: '0.1rem 0.4rem',
                                                                                                                borderRadius: '3px',
                                                                                                                backgroundColor: initiative.status === 'done' ? 'rgba(25, 135, 84, 0.2)' :
                                                                                                                    initiative.status === 'in_progress' ? 'rgba(13, 110, 253, 0.2)' :
                                                                                                                    initiative.status === 'shaping' ? 'rgba(255, 193, 7, 0.2)' :
                                                                                                                    initiative.status === 'on_hold' ? 'rgba(220, 53, 69, 0.2)' : 'rgba(108, 117, 125, 0.2)',
                                                                                                                color: initiative.status === 'done' ? '#198754' :
                                                                                                                    initiative.status === 'in_progress' ? '#0d6efd' :
                                                                                                                    initiative.status === 'shaping' ? '#cc9a00' :
                                                                                                                    initiative.status === 'on_hold' ? '#dc3545' : textSecondary
                                                                                                            }}>
                                                                                                                {initiative.status === 'idea' ? 'Nápad' :
                                                                                                                 initiative.status === 'shaping' ? 'Příprava' :
                                                                                                                 initiative.status === 'in_progress' ? 'Běží' :
                                                                                                                 initiative.status === 'done' ? 'Hotovo' :
                                                                                                                 initiative.status === 'on_hold' ? 'Pozastaveno' : initiative.status}
                                                                                                            </span>
                                                                                                        </div>
                                                                                                        <span style={{ fontSize: '0.7rem', color: textSecondary }}>
                                                                                                            {doneCount}/{initiativeProjects.length}
                                                                                                        </span>
                                                                                                    </div>
                                                                                                    
                                                                                                    {/* Projects under initiative */}
                                                                                                    {isInitiativeExpanded && (
                                                                                                        <div style={{ marginLeft: '1.5rem', marginTop: '0.25rem' }}>
                                                                                                            {initiativeProjects.map(project => (
                                                                                                                <div
                                                                                                                    key={project.id}
                                                                                                                    onClick={() => onSelectNode('project', project.id)}
                                                                                                                    className="interactive-card"
                                                                                                                    style={{
                                                                                                                        display: 'flex',
                                                                                                                        alignItems: 'center',
                                                                                                                        padding: '0.4rem 0.6rem',
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
                                                                                                                        <div style={{ color: textColor, fontWeight: 500, fontSize: '0.8rem' }}>{project.title}</div>
                                                                                                                    </div>
                                                                                                                    <span style={{
                                                                                                                        fontSize: '0.65rem',
                                                                                                                        padding: '0.15rem 0.4rem',
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
                                                                                                            <button
                                                                                                                onClick={() => onAddProject(themeItem.id, initiative.id)}
                                                                                                                style={{
                                                                                                                    display: 'flex',
                                                                                                                    alignItems: 'center',
                                                                                                                    gap: '0.25rem',
                                                                                                                    padding: '0.2rem 0.4rem',
                                                                                                                    marginTop: '0.25rem',
                                                                                                                    background: 'none',
                                                                                                                    border: `1px dashed ${borderColor}`,
                                                                                                                    borderRadius: '4px',
                                                                                                                    color: textSecondary,
                                                                                                                    cursor: 'pointer',
                                                                                                                    fontSize: '0.7rem',
                                                                                                                    transition: 'all 0.15s ease'
                                                                                                                }}
                                                                                                                onMouseEnter={(e) => {
                                                                                                                    e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)';
                                                                                                                    e.currentTarget.style.borderStyle = 'solid';
                                                                                                                }}
                                                                                                                onMouseLeave={(e) => {
                                                                                                                    e.currentTarget.style.backgroundColor = 'transparent';
                                                                                                                    e.currentTarget.style.borderStyle = 'dashed';
                                                                                                                }}
                                                                                                            >
                                                                                                                <Plus size={10} /> Přidat projekt
                                                                                                            </button>
                                                                                                        </div>
                                                                                                    )}
                                                                                                </div>
                                                                                            );
                                                                                        })}
                                                                                        
                                                                                        {/* Unsorted projects (without initiative) */}
                                                                                        {unsortedProjects.length > 0 && (
                                                                                            <div style={{ marginBottom: '0.5rem' }}>
                                                                                                <div style={{
                                                                                                    fontSize: '0.75rem',
                                                                                                    color: textSecondary,
                                                                                                    padding: '0.25rem 0.5rem',
                                                                                                    fontStyle: 'italic'
                                                                                                }}>
                                                                                                    Bez cíle ({unsortedProjects.length})
                                                                                                </div>
                                                                                                {unsortedProjects.map(project => (
                                                                                                    <div
                                                                                                        key={project.id}
                                                                                                        draggable
                                                                                                        onDragStart={(e) => handleDragStart(e, 'project', project.id, themeItem.id)}
                                                                                                        onDragEnd={handleDragEnd}
                                                                                                        onDragOver={(e) => handleDragOver(e, 'project', project.id)}
                                                                                                        onDragLeave={handleDragLeave}
                                                                                                        onDrop={(e) => handleDrop(e, 'project', project.id, themeItem.id)}
                                                                                                        onClick={() => onSelectNode('project', project.id)}
                                                                                                        className="interactive-card"
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
                                                                                                            borderRadius: '0 6px 6px 0',
                                                                                                            ...getDropTargetStyle('project', project.id)
                                                                                                        }}
                                                                                                    >
                                                                                                        <div style={getDragHandleStyle()} className="drag-handle">
                                                                                                            <GripVertical size={12} />
                                                                                                        </div>
                                                                                                        <div style={{ flex: 1 }}>
                                                                                                            <div style={{ color: textColor, fontWeight: 500, fontSize: '0.8rem' }}>{project.title}</div>
                                                                                                            {project.description && (
                                                                                                                <div style={{ fontSize: '0.8rem', color: textSecondary, marginTop: '0.25rem' }}>{project.description}</div>
                                                                                                            )}
                                                                                                        </div>
                                                                                                        <span style={{
                                                                                                            fontSize: '0.65rem',
                                                                                                            padding: '0.15rem 0.4rem',
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
                                                                                            </div>
                                                                                        )}
                                                                                        
                                                                                        {/* Empty state */}
                                                                                        {themeInitiatives.length === 0 && unsortedProjects.length === 0 && (
                                                                                            <div style={{ fontSize: '0.8rem', color: textSecondary, fontStyle: 'italic', padding: '0.5rem 0.75rem' }}>
                                                                                                Žádné cíle ani projekty
                                                                                            </div>
                                                                                        )}
                                                                                        
                                                                                        {/* Add buttons */}
                                                                                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                                                                                            <button
                                                                                                onClick={(e) => {
                                                                                                    e.stopPropagation();
                                                                                                    console.log('Button Cíl clicked for theme:', themeItem.id);
                                                                                                    if (onAddInitiative) onAddInitiative(themeItem.id);
                                                                                                    else console.error('onAddInitiative prop is missing!');
                                                                                                }}
                                                                                                style={{
                                                                                                    display: 'flex',
                                                                                                    alignItems: 'center',
                                                                                                    gap: '0.25rem',
                                                                                                    padding: '0.25rem 0.5rem',
                                                                                                    background: 'none',
                                                                                                    border: `1px dashed #6f42c1`,
                                                                                                    borderRadius: '4px',
                                                                                                    color: '#6f42c1',
                                                                                                    cursor: 'pointer',
                                                                                                    fontSize: '0.75rem',
                                                                                                    transition: 'all 0.15s ease'
                                                                                                }}
                                                                                                onMouseEnter={(e) => {
                                                                                                    e.currentTarget.style.backgroundColor = 'rgba(111, 66, 193, 0.1)';
                                                                                                    e.currentTarget.style.borderStyle = 'solid';
                                                                                                }}
                                                                                                onMouseLeave={(e) => {
                                                                                                    e.currentTarget.style.backgroundColor = 'transparent';
                                                                                                    e.currentTarget.style.borderStyle = 'dashed';
                                                                                                }}
                                                                                            >
                                                                                                <Plus size={12} /> Cíl
                                                                                            </button>
                                                                                            <button
                                                                                                onClick={() => onAddProject(themeItem.id)}
                                                                                                style={{
                                                                                                    display: 'flex',
                                                                                                    alignItems: 'center',
                                                                                                    gap: '0.25rem',
                                                                                                    padding: '0.25rem 0.5rem',
                                                                                                    background: 'none',
                                                                                                    border: `1px dashed ${borderColor}`,
                                                                                                    borderRadius: '4px',
                                                                                                    color: textSecondary,
                                                                                                    cursor: 'pointer',
                                                                                                    fontSize: '0.75rem',
                                                                                                    transition: 'all 0.15s ease'
                                                                                                }}
                                                                                                onMouseEnter={(e) => {
                                                                                                    e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)';
                                                                                                    e.currentTarget.style.borderStyle = 'solid';
                                                                                                }}
                                                                                                onMouseLeave={(e) => {
                                                                                                    e.currentTarget.style.backgroundColor = 'transparent';
                                                                                                    e.currentTarget.style.borderStyle = 'dashed';
                                                                                                }}
                                                                                            >
                                                                                                <Plus size={12} /> Projekt
                                                                                            </button>
                                                                                        </div>
                                                                                    </>
                                                                                );
                                                                            })()}
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
                                                                fontSize: '0.8rem',
                                                                transition: 'all 0.15s ease'
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)';
                                                                e.currentTarget.style.borderStyle = 'solid';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.currentTarget.style.backgroundColor = 'transparent';
                                                                e.currentTarget.style.borderStyle = 'dashed';
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
                                            fontSize: '0.85rem',
                                            transition: 'all 0.15s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)';
                                            e.currentTarget.style.borderStyle = 'solid';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                            e.currentTarget.style.borderStyle = 'dashed';
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
            className="interactive-card"
            style={{
                padding: '1rem',
                borderRadius: '8px',
                border: `1px solid ${selectedNode?.id === influence.id ? '#00b4d8' : borderColor}`,
                backgroundColor: selectedNode?.id === influence.id
                    ? (isDark ? 'rgba(0, 180, 216, 0.1)' : 'rgba(0, 180, 216, 0.05)')
                    : cardBg,
                cursor: 'pointer'
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
                        background: 'linear-gradient(135deg, #ea580c, #c2410c)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 500,
                        transition: 'all 0.2s ease',
                        boxShadow: '0 2px 8px rgba(234, 88, 12, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(234, 88, 12, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(234, 88, 12, 0.3)';
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
                        background: 'linear-gradient(135deg, #ea580c, #c2410c)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 500,
                        transition: 'all 0.2s ease',
                        boxShadow: '0 2px 8px rgba(234, 88, 12, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(234, 88, 12, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(234, 88, 12, 0.3)';
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
                            className="interactive-card"
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
                        background: 'linear-gradient(135deg, #ea580c, #c2410c)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 500,
                        transition: 'all 0.2s ease',
                        boxShadow: '0 2px 8px rgba(234, 88, 12, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(234, 88, 12, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(234, 88, 12, 0.3)';
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
                        className="interactive-card"
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

// Signals Content (Inbox)
function SignalsContent({ data, onSelectNode, selectedNode, onAddSignal, theme }) {
    const isDark = theme === 'dark';
    const textColor = isDark ? '#ffffff' : '#212529';
    const textSecondary = isDark ? '#adb5bd' : '#6c757d';
    const borderColor = isDark ? 'rgba(255, 255, 255, 0.1)' : '#e9ecef';
    const cardBg = isDark ? 'rgba(255, 255, 255, 0.03)' : '#ffffff';
    const inputBg = isDark ? 'rgba(255, 255, 255, 0.05)' : '#f8f9fa';

    const [statusFilter, setStatusFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [quickAddTitle, setQuickAddTitle] = useState('');

    // Signals are already merged at App level with live signals from Signal Lite
    const signals = data.signals || [];

    // Filter signals
    const filteredSignals = useMemo(() => {
        let result = signals;
        if (statusFilter !== 'all') {
            result = result.filter(s => s.status === statusFilter);
        }
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(s => 
                s.title.toLowerCase().includes(q) || 
                (s.body || '').toLowerCase().includes(q)
            );
        }
        return result;
    }, [signals, statusFilter, searchQuery]);

    // Stats
    const inboxCount = signals.filter(s => s.status === 'inbox').length;
    const triagedCount = signals.filter(s => s.status === 'triaged').length;
    const convertedCount = signals.filter(s => s.status === 'converted').length;
    const archivedCount = signals.filter(s => s.status === 'archived').length;

    const handleQuickAdd = () => {
        if (!quickAddTitle.trim()) return;
        onAddSignal({ title: quickAddTitle.trim() });
        setQuickAddTitle('');
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'inbox': return '#6366f1';
            case 'triaged': return '#f59e0b';
            case 'converted': return '#10b981';
            case 'archived': return '#6b7280';
            default: return textSecondary;
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'inbox': return 'Inbox';
            case 'triaged': return 'Tříděno';
            case 'converted': return 'Převedeno';
            case 'archived': return 'Archiv';
            default: return status;
        }
    };

    const formatRelativeDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Dnes';
        if (diffDays === 1) return 'Včera';
        if (diffDays < 7) return `Před ${diffDays} dny`;
        if (diffDays < 30) return `Před ${Math.floor(diffDays / 7)} týdny`;
        return date.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short' });
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return '#ef4444';
            case 'med': return '#f59e0b';
            case 'low': return '#22c55e';
            default: return 'transparent';
        }
    };

    return (
        <div style={{ padding: '1.5rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0, color: textColor, fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Radio size={24} style={{ color: '#ea580c' }} /> Drobky
                </h2>
            </div>

            {/* Quick Add */}
            <div style={{ 
                display: 'flex', 
                gap: '0.5rem', 
                marginBottom: '1.5rem',
                padding: '1rem',
                backgroundColor: isDark ? cardBg : '#f8f9fa',
                borderRadius: '12px',
                border: 'none'
            }}>
                <input
                    type="text"
                    placeholder="Rychle přidat signál..."
                    value={quickAddTitle}
                    onChange={(e) => setQuickAddTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd()}
                    style={{
                        flex: 1,
                        padding: '0.75rem 1rem',
                        backgroundColor: inputBg,
                        color: textColor,
                        border: `1px solid ${borderColor}`,
                        borderRadius: '8px',
                        fontSize: '0.95rem'
                    }}
                />
                <button
                    onClick={handleQuickAdd}
                    disabled={!quickAddTitle.trim()}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem 1.25rem',
                        background: quickAddTitle.trim() ? 'linear-gradient(135deg, #ea580c, #c2410c)' : (isDark ? 'rgba(255,255,255,0.1)' : '#e9ecef'),
                        color: quickAddTitle.trim() ? '#ffffff' : textSecondary,
                        border: 'none',
                        borderRadius: '8px',
                        cursor: quickAddTitle.trim() ? 'pointer' : 'not-allowed',
                        fontWeight: 500,
                        transition: 'all 0.2s ease',
                        boxShadow: quickAddTitle.trim() ? '0 2px 8px rgba(234, 88, 12, 0.3)' : 'none'
                    }}
                >
                    <Plus size={18} /> Přidat
                </button>
            </div>

            {/* Stats Row */}
            <div style={{ 
                display: 'flex', 
                gap: '0.75rem', 
                marginBottom: '1.5rem',
                flexWrap: 'wrap'
            }}>
                {[
                    { key: 'all', label: 'Vše', count: signals.length, color: textSecondary },
                    { key: 'inbox', label: 'Inbox', count: inboxCount, color: '#6366f1' },
                    { key: 'triaged', label: 'Tříděno', count: triagedCount, color: '#f59e0b' },
                    { key: 'converted', label: 'Převedeno', count: convertedCount, color: '#10b981' },
                    { key: 'archived', label: 'Archiv', count: archivedCount, color: '#6b7280' },
                ].map(item => (
                    <button
                        key={item.key}
                        onClick={() => setStatusFilter(item.key)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 1rem',
                            backgroundColor: statusFilter === item.key 
                                ? (isDark ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.1)')
                                : 'transparent',
                            color: statusFilter === item.key ? item.color : textSecondary,
                            border: `1px solid ${statusFilter === item.key ? item.color : borderColor}`,
                            borderRadius: '20px',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: statusFilter === item.key ? 600 : 400
                        }}
                    >
                        {item.label}
                        <span style={{
                            backgroundColor: `${item.color}20`,
                            color: item.color,
                            padding: '0.1rem 0.5rem',
                            borderRadius: '10px',
                            fontSize: '0.75rem',
                            fontWeight: 600
                        }}>
                            {item.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* Search */}
            <div style={{ 
                position: 'relative', 
                marginBottom: '1rem'
            }}>
                <Search size={16} style={{ 
                    position: 'absolute', 
                    left: '1rem', 
                    top: '50%', 
                    transform: 'translateY(-50%)',
                    color: textSecondary 
                }} />
                <input
                    type="text"
                    placeholder="Hledat v signálech..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '0.75rem 1rem 0.75rem 2.5rem',
                        backgroundColor: inputBg,
                        color: textColor,
                        border: `1px solid ${borderColor}`,
                        borderRadius: '8px',
                        fontSize: '0.9rem'
                    }}
                />
            </div>

            {/* Signals List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {filteredSignals.length === 0 ? (
                    <div style={{ 
                        textAlign: 'center', 
                        padding: '3rem', 
                        color: textSecondary,
                        backgroundColor: cardBg,
                        borderRadius: '12px',
                        border: `1px solid ${borderColor}`
                    }}>
                        <Radio size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                        <p style={{ margin: 0 }}>
                            {signals.length === 0 
                                ? 'Zatím žádné signály. Přidejte první postřeh výše.'
                                : 'Žádné signály neodpovídají filtru.'}
                        </p>
                    </div>
                ) : (
                    filteredSignals.map(signal => {
                        const restaurants = (signal.restaurantIds || [])
                            .map(id => (data.locations || []).find(l => l.id === id))
                            .filter(Boolean);

                        return (
                            <div
                                key={signal.id}
                                onClick={() => onSelectNode('signal', signal.id)}
                                className="interactive-card"
                                style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '0.75rem',
                                    padding: '1rem',
                                    borderRadius: '10px',
                                    border: `1px solid ${selectedNode?.id === signal.id ? '#6366f1' : borderColor}`,
                                    backgroundColor: selectedNode?.id === signal.id
                                        ? (isDark ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)')
                                        : cardBg,
                                    cursor: 'pointer',
                                    borderLeft: signal.priority 
                                        ? `4px solid ${getPriorityColor(signal.priority)}`
                                        : `4px solid transparent`
                                }}
                            >
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '0.5rem',
                                        marginBottom: '0.25rem'
                                    }}>
                                        <span style={{ 
                                            fontWeight: 600, 
                                            color: textColor,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {signal.title}
                                        </span>
                                    </div>
                                    {signal.body && (
                                        <p style={{ 
                                            margin: '0 0 0.5rem 0', 
                                            fontSize: '0.85rem', 
                                            color: textSecondary,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {signal.body}
                                        </p>
                                    )}
                                    <div style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '0.5rem',
                                        flexWrap: 'wrap'
                                    }}>
                                        {/* Timestamp */}
                                        {(signal.date || signal.createdAt) && (
                                            <span style={{ 
                                                fontSize: '0.7rem', 
                                                color: textSecondary,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.25rem'
                                            }}>
                                                <Calendar size={12} />
                                                {new Date(signal.date || signal.createdAt).toLocaleString('cs-CZ', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                        )}
                                        
                                        {/* Author (for live signals) */}
                                        {signal.authorName && (
                                            <span style={{ 
                                                fontSize: '0.7rem', 
                                                color: textSecondary,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.25rem'
                                            }}>
                                                <User size={12} />
                                                {signal.authorName}
                                            </span>
                                        )}
                                        
                                        {/* Source badge for live signals */}
                                        {signal.isLive && (
                                            <span style={{
                                                fontSize: '0.65rem',
                                                padding: '0.15rem 0.4rem',
                                                borderRadius: '4px',
                                                backgroundColor: '#f97316',
                                                color: '#fff',
                                                fontWeight: 600
                                            }}>
                                                LIVE
                                            </span>
                                        )}
                                        
                                        {restaurants.slice(0, 2).map(loc => (
                                            <span
                                                key={loc.id}
                                                style={{
                                                    fontSize: '0.7rem',
                                                    padding: '0.15rem 0.5rem',
                                                    borderRadius: '4px',
                                                    backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#f1f3f5',
                                                    color: textSecondary
                                                }}
                                            >
                                                {loc.name}
                                            </span>
                                        ))}
                                        {restaurants.length > 2 && (
                                            <span style={{ fontSize: '0.7rem', color: textSecondary }}>
                                                +{restaurants.length - 2}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div style={{ 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    alignItems: 'flex-end',
                                    gap: '0.5rem',
                                    flexShrink: 0
                                }}>
                                    <span style={{ 
                                        fontSize: '0.75rem', 
                                        color: textSecondary 
                                    }}>
                                        {formatRelativeDate(signal.date)}
                                    </span>
                                    <span style={{
                                        fontSize: '0.7rem',
                                        padding: '0.2rem 0.6rem',
                                        borderRadius: '12px',
                                        backgroundColor: `${getStatusColor(signal.status)}20`,
                                        color: getStatusColor(signal.status),
                                        fontWeight: 600
                                    }}>
                                        {getStatusLabel(signal.status)}
                                    </span>
                                </div>
                            </div>
                        );
                    })
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
                        background: 'linear-gradient(135deg, #ea580c, #c2410c)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 500,
                        transition: 'all 0.2s ease',
                        boxShadow: '0 2px 8px rgba(234, 88, 12, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(234, 88, 12, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(234, 88, 12, 0.3)';
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
                            className="interactive-card"
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
                                            className="interactive-card"
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
    onAddInitiative,
    onAddProject,
    onAddInfluence,
    onAddNewRestaurant,
    onAddBrand,
    onAddLocation,
    onAddSignal,
    onMoveItem,
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
                        onAddInitiative={onAddInitiative}
                        onAddProject={onAddProject}
                        onMoveItem={onMoveItem}
                        theme={theme}
                    />
                );
            case 'signals':
                return (
                    <SignalsContent
                        data={data}
                        onSelectNode={onSelectNode}
                        selectedNode={selectedNode}
                        onAddSignal={onAddSignal}
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
