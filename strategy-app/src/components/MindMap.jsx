import React from 'react';
import { Plus, ChevronRight, ChevronDown, Lightbulb, Calendar, Target } from 'lucide-react';
import { getThemesForVision, getProjectsForTheme } from '../utils/buildStrategyTree';

export function YearNode({ data, visions, allThemes, allProjects, expanded, onToggle, selected, onSelect, onAddVision, onToggleNode, expandedNodes, selectedNode, onSelectNode, onAddTheme, onAddProject }) {
    return (
        <div className="tree-node level-year">
            <div className={`node-content ${selected ? 'selected' : ''}`} onClick={(e) => { e.stopPropagation(); onSelect(); }}>
                <button className="node-toggle" onClick={(e) => { e.stopPropagation(); onToggle(); }}>
                    {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </button>
                <div className="node-body">
                    <div className="node-title" style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                        <Calendar size={16} style={{ marginRight: '0.5rem', verticalAlign: 'text-bottom' }} />
                        {data.title}
                    </div>
                </div>
            </div>

            {expanded && (
                <div className="children-container">
                    {visions.map(vision => (
                        <VisionNode
                            key={vision.id}
                            data={vision}
                            themes={getThemesForVision({ themes: allThemes }, vision.id)}
                            allProjects={allProjects}
                            expanded={!!expandedNodes[vision.id]}
                            onToggle={() => onToggleNode(vision.id)}
                            selected={selectedNode?.id === vision.id}
                            onSelect={() => onSelectNode('vision', vision.id)}
                            onAddTheme={() => onAddTheme(vision.id)}
                            onToggleNode={onToggleNode}
                            expandedNodes={expandedNodes}
                            selectedNode={selectedNode}
                            onSelectNode={onSelectNode}
                            onAddProject={onAddProject}
                        />
                    ))}
                    <div className="add-btn-container">
                        <button className="btn btn-sm" onClick={onAddVision} style={{ marginLeft: '2rem' }}>
                            <Plus size={14} /> Přidat vizi
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export function VisionNode({ data, themes, allProjects, expanded, onToggle, selected, onSelect, onAddTheme, onToggleNode, expandedNodes, selectedNode, onSelectNode, onAddProject }) {
    return (
        <div className="tree-node level-vision">
            <div className={`node-content ${selected ? 'selected' : ''}`} onClick={(e) => { e.stopPropagation(); onSelect(); }}>
                <button className="node-toggle" onClick={(e) => { e.stopPropagation(); onToggle(); }}>
                    {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </button>
                <div className="node-body">
                    <div className="node-title" style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                        <Target size={16} style={{ marginRight: '0.5rem', verticalAlign: 'text-bottom' }} />
                        {data.title}
                    </div>
                    {data.description && <div className="node-desc">{data.description}</div>}
                </div>
            </div>

            {expanded && (
                <div className="children-container">
                    {themes.map(theme => (
                        <ThemeNode
                            key={theme.id}
                            data={theme}
                            projects={getProjectsForTheme({ projects: allProjects }, theme.id)}
                            expanded={!!expandedNodes[theme.id]}
                            onToggle={() => onToggleNode(theme.id)}
                            selected={selectedNode?.id === theme.id}
                            onSelect={() => onSelectNode('theme', theme.id)}
                            onAddProject={() => onAddProject(theme.id)}
                            selectedNode={selectedNode}
                            onSelectNode={onSelectNode}
                        />
                    ))}
                    <div className="add-btn-container">
                        <button className="btn btn-sm" onClick={onAddTheme} style={{ marginLeft: '2rem' }}>
                            <Plus size={14} /> Přidat hlavní téma
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export function ThemeNode({ data, projects, expanded, onToggle, selected, onSelect, onAddProject, selectedNode, onSelectNode }) {
    const priorityColor = {
        'Nízká': 'badge-priority-low',
        'Střední': 'badge-priority-medium',
        'Vysoká': 'badge-priority-high'
    }[data.priority] || 'badge-priority-medium';

    return (
        <div className="tree-node level-theme">
            <div className={`node-content ${selected ? 'selected' : ''}`} onClick={(e) => { e.stopPropagation(); onSelect(); }}>
                <button className="node-toggle" onClick={(e) => { e.stopPropagation(); onToggle(); }}>
                    {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </button>
                <div className="node-body">
                    <div className="node-title">{data.title}</div>
                    {data.description && <div className="node-desc">{data.description}</div>}
                    <div className="node-badges">
                        <span className={`badge ${priorityColor}`}>{data.priority}</span>
                    </div>
                </div>
            </div>

            {expanded && (
                <div className="children-container">
                    {projects.map(project => (
                        <ProjectNode
                            key={project.id}
                            data={project}
                            selected={selectedNode?.id === project.id}
                            onSelect={() => onSelectNode('project', project.id)}
                        />
                    ))}
                    <div className="add-btn-container">
                        <button className="btn btn-sm" onClick={onAddProject} style={{ marginLeft: '2rem' }}>
                            <Plus size={14} /> Přidat úkol
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export function ProjectNode({ data, selected, onSelect }) {
    const statusClass = {
        'Nápad': 'badge-status-idea',
        'V přípravě': 'badge-status-prep',
        'Běží': 'badge-status-running',
        'Hotovo': 'badge-status-done'
    }[data.status] || 'badge-status-idea';

    return (
        <div className="tree-node level-project">
            <div className={`node-content ${selected ? 'selected' : ''}`} onClick={(e) => { e.stopPropagation(); onSelect(); }}>
                <div style={{ width: '20px' }}></div> {/* Spacer for alignment */}
                <div className="node-body">
                    <div className="node-title">{data.title}</div>
                    {data.description && <div className="node-desc">{data.description}</div>}
                    <div className="node-badges">
                        <span className={`badge ${statusClass}`}>{data.status}</span>
                        {data.brands.length > 0 && (
                            <span className="badge badge-brands">{data.brands.length} značky</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
