import React, { useState, useCallback, useMemo, useRef } from 'react';
import ReactFlow, {
    ReactFlowProvider,
    addEdge,
    useNodesState,
    useEdgesState,
    Controls,
    Background,
    MiniMap,
    Panel,
    MarkerType,
    useReactFlow,
    Handle,
    Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
    Calendar, Eye, Layers, CheckSquare, Zap, Store, MapPin, Plus, Trash2, Link2, Save, RotateCcw, X, GitBranch, Utensils, HardHat
} from 'lucide-react';

// Custom Node Components
const nodeColors = {
    year: { bg: '#0ea5e9', border: '#0284c7', text: '#fff' },
    vision: { bg: '#8b5cf6', border: '#7c3aed', text: '#fff' },
    theme: { bg: '#f59e0b', border: '#d97706', text: '#fff' },
    project: { bg: '#22c55e', border: '#16a34a', text: '#fff' },
    influence: { bg: '#ef4444', border: '#dc2626', text: '#fff' },
    brand: { bg: '#ec4899', border: '#db2777', text: '#fff' },
    location: { bg: '#6366f1', border: '#4f46e5', text: '#fff' },
    newRestaurant: { bg: '#14b8a6', border: '#0d9488', text: '#fff' },
    reconstruction: { bg: '#f97316', border: '#ea580c', text: '#fff' },
};

const nodeIcons = {
    year: Calendar,
    vision: Eye,
    theme: Layers,
    project: CheckSquare,
    influence: Zap,
    brand: Store,
    location: MapPin,
    newRestaurant: Utensils,
    reconstruction: HardHat,
};

// Czech labels for node types
const nodeTypeLabels = {
    year: 'Rok',
    vision: 'Vize',
    theme: 'Téma',
    project: 'Projekt',
    influence: 'Vliv',
    brand: 'Značka',
    location: 'Pobočka',
    newRestaurant: 'Nová restaurace',
    newRestaurant: 'Nová restaurace',
    reconstruction: 'Rekonstrukce',
};

const edgeTypeLabels = {
    default: 'Výchozí (Šedá)',
    hierarchy: 'Hierarchie (Modrá)',
    influence: 'Vliv (Červená přerušovaná)',
    brand: 'Značka (Růžová)',
};

function CustomNode({ data, selected }) {
    const Icon = nodeIcons[data.nodeType] || CheckSquare;
    const colors = nodeColors[data.nodeType] || nodeColors.project;

    return (
        <div
            style={{
                padding: '12px 16px',
                borderRadius: '12px',
                backgroundColor: colors.bg,
                border: `2px solid ${selected ? '#fff' : colors.border}`,
                boxShadow: selected ? '0 0 0 2px #fff, 0 4px 20px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.2)',
                minWidth: '140px',
                maxWidth: '200px',
                color: colors.text,
                transition: 'all 0.2s ease',
                position: 'relative',
            }}
        >
            {/* Connection Handles */}
            <Handle
                type="target"
                position={Position.Top}
                style={{
                    background: '#fff',
                    border: `2px solid ${colors.border}`,
                    width: '12px',
                    height: '12px',
                }}
            />
            <Handle
                type="source"
                position={Position.Bottom}
                style={{
                    background: '#fff',
                    border: `2px solid ${colors.border}`,
                    width: '12px',
                    height: '12px',
                }}
            />
            <Handle
                type="source"
                position={Position.Right}
                id="right"
                style={{
                    background: '#fff',
                    border: `2px solid ${colors.border}`,
                    width: '12px',
                    height: '12px',
                }}
            />
            <Handle
                type="target"
                position={Position.Left}
                id="left"
                style={{
                    background: '#fff',
                    border: `2px solid ${colors.border}`,
                    width: '12px',
                    height: '12px',
                }}
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <Icon size={16} />
                <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', opacity: 0.8, letterSpacing: '0.5px' }}>
                    {nodeTypeLabels[data.nodeType] || data.nodeType}
                </span>
            </div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', lineHeight: 1.3 }}>
                {data.label}
            </div>
            {data.subtitle && (
                <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '4px' }}>
                    {data.subtitle}
                </div>
            )}
            {/* Show linked location for reconstruction/newRestaurant */}
            {data.linkedLocationName && (
                <div style={{
                    fontSize: '0.7rem',
                    marginTop: '6px',
                    padding: '4px 8px',
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                }}>
                    <MapPin size={10} />
                    <span>{data.linkedBrandName} → {data.linkedLocationName}</span>
                </div>
            )}
        </div>
    );
}

const nodeTypes = {
    custom: CustomNode,
};

// Edge styles
const edgeStyles = {
    default: { stroke: '#64748b', strokeWidth: 2 },
    hierarchy: { stroke: '#0ea5e9', strokeWidth: 2 },
    influence: { stroke: '#ef4444', strokeWidth: 2, strokeDasharray: '5,5' },
    brand: { stroke: '#ec4899', strokeWidth: 2 },
};

const SYNCABLE_TYPES = ['year', 'vision', 'theme', 'project', 'influence', 'newRestaurant', 'reconstruction'];

// Main Sandbox Component
function SandboxFlow({ data, theme, onSavePositions, onUpdateNode, onDeleteNode }) {
    const isDark = theme === 'dark';
    const textSecondary = isDark ? '#94a3b8' : '#64748b';
    const reactFlowWrapper = useRef(null);
    const { project } = useReactFlow();

    const brandMap = useMemo(() => {
        const map = {};
        data.brands.forEach(brand => {
            map[brand.id] = brand;
        });
        return map;
    }, [data.brands]);

    const locationMap = useMemo(() => {
        const map = {};
        (data.locations || []).forEach(location => {
            map[location.id] = location;
        });
        return map;
    }, [data.locations]);

    // Convert app data to React Flow nodes
    const initialNodes = useMemo(() => {
        const nodes = [];
        let yOffset = 0;

        // Years
        data.years.forEach((year, i) => {
            nodes.push({
                id: `year-${year.id}`,
                type: 'custom',
                position: year.sandboxPosition || { x: 100, y: yOffset },
                data: { label: year.title, nodeType: 'year', originalId: year.id },
            });
        });
        yOffset += 150;

        // Visions
        data.visions.forEach((vision, i) => {
            nodes.push({
                id: `vision-${vision.id}`,
                type: 'custom',
                position: vision.sandboxPosition || { x: 100 + i * 250, y: yOffset },
                data: { label: vision.title, nodeType: 'vision', originalId: vision.id, subtitle: vision.description?.slice(0, 40) + '...' },
            });
        });
        yOffset += 150;

        // Themes
        data.themes.forEach((themeItem, i) => {
            nodes.push({
                id: `theme-${themeItem.id}`,
                type: 'custom',
                position: themeItem.sandboxPosition || { x: 50 + i * 220, y: yOffset },
                data: { label: themeItem.title, nodeType: 'theme', originalId: themeItem.id, subtitle: `Priorita: ${themeItem.priority}` },
            });
        });
        yOffset += 150;

        // Projects
        data.projects.forEach((project, i) => {
            nodes.push({
                id: `project-${project.id}`,
                type: 'custom',
                position: project.sandboxPosition || { x: 50 + (i % 5) * 200, y: yOffset + Math.floor(i / 5) * 120 },
                data: { label: project.title, nodeType: 'project', originalId: project.id, subtitle: project.status },
            });
        });
        yOffset += 200;

        // Influences
        (data.influences || []).forEach((inf, i) => {
            nodes.push({
                id: `influence-${inf.id}`,
                type: 'custom',
                position: inf.sandboxPosition || { x: 600 + (i % 3) * 180, y: 50 + Math.floor(i / 3) * 120 },
                data: { label: inf.title, nodeType: 'influence', originalId: inf.id, subtitle: inf.type === 'external' ? 'Externí' : 'Interní' },
            });
        });

        // New Restaurants and Facelifts (strategy items, not physical locations)
        (data.newRestaurants || []).forEach((nr, i) => {
            const isFacelift = nr.category === 'facelift';
            const linkedBrandId = (nr.brands && nr.brands[0]) || null;
            const linkedBrand = linkedBrandId ? brandMap[linkedBrandId] : null;
            const linkedLocation = nr.locationId ? locationMap[nr.locationId] : null;

            nodes.push({
                id: `${isFacelift ? 'reconstruction' : 'newRestaurant'}-${nr.id}`,
                type: 'custom',
                position: nr.sandboxPosition || { x: 800 + (i % 3) * 200, y: (isFacelift ? 250 : 50) + Math.floor(i / 3) * 120 },
                data: {
                    label: nr.title,
                    nodeType: isFacelift ? 'reconstruction' : 'newRestaurant',
                    originalId: nr.id,
                    subtitle: nr.status || nr.phase,
                    fullData: nr,
                    linkedBrandId,
                    linkedBrandName: linkedBrand?.name || null,
                    linkedLocationId: isFacelift ? nr.locationId : null,
                    linkedLocationName: isFacelift && linkedLocation ? linkedLocation.name : null,
                },
            });
        });

        // NOTE: Brands and Locations are NOT shown by default
        // They are available in the sidebar to be added as connection targets when needed

        return nodes;
    }, [data]);

    // Convert relationships to edges
    const initialEdges = useMemo(() => {
        const edges = [];

        // Year -> Vision
        data.visions.forEach(vision => {
            edges.push({
                id: `e-year-vision-${vision.id}`,
                source: `year-${vision.yearId}`,
                target: `vision-${vision.id}`,
                type: 'smoothstep',
                style: edgeStyles.hierarchy,
                markerEnd: { type: MarkerType.ArrowClosed, color: '#0ea5e9' },
            });
        });

        // Vision -> Theme
        data.themes.forEach(themeItem => {
            edges.push({
                id: `e-vision-theme-${themeItem.id}`,
                source: `vision-${themeItem.visionId}`,
                target: `theme-${themeItem.id}`,
                type: 'smoothstep',
                style: edgeStyles.hierarchy,
                markerEnd: { type: MarkerType.ArrowClosed, color: '#0ea5e9' },
            });
        });

        // Theme -> Project
        data.projects.forEach(project => {
            edges.push({
                id: `e-theme-project-${project.id}`,
                source: `theme-${project.themeId}`,
                target: `project-${project.id}`,
                type: 'smoothstep',
                style: edgeStyles.hierarchy,
                markerEnd: { type: MarkerType.ArrowClosed, color: '#0ea5e9' },
            });
        });

        // Influence -> Theme connections
        (data.influences || []).forEach(inf => {
            (inf.connectedThemeIds || []).forEach(themeId => {
                edges.push({
                    id: `e-influence-theme-${inf.id}-${themeId}`,
                    source: `influence-${inf.id}`,
                    target: `theme-${themeId}`,
                    type: 'smoothstep',
                    style: edgeStyles.influence,
                    animated: true,
                    markerEnd: { type: MarkerType.ArrowClosed, color: '#ef4444' },
                });
            });
        });

        // NOTE: Brand connections are not pre-loaded since brands are not shown by default
        // Users can manually add brands and connect them to strategy elements

        return edges;
    }, [data]);

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [selectedNodes, setSelectedNodes] = useState([]);
    const [selectedEdges, setSelectedEdges] = useState([]);
    const [isAddingNode, setIsAddingNode] = useState(null);
    const [editingNode, setEditingNode] = useState(null);
    const [editLabel, setEditLabel] = useState('');
    const [editSubtitle, setEditSubtitle] = useState('');

    const onConnect = useCallback(
        (params) => setEdges((eds) => addEdge({
            ...params,
            type: 'smoothstep',
            style: edgeStyles.default,
            markerEnd: { type: MarkerType.ArrowClosed, color: '#64748b' },
        }, eds)),
        [setEdges]
    );

    const onSelectionChange = useCallback(({ nodes, edges }) => {
        setSelectedNodes(nodes);
        setSelectedEdges(edges);
    }, []);

    // Handle node click to open edit sidebar
    const onNodeClick = useCallback((event, node) => {
        setEditingNode(node);
        setEditLabel(node.data.label || '');
        setEditSubtitle(node.data.subtitle || '');
    }, []);

    // Update node data (and sync with main data where applicable)
    const handleUpdateNode = () => {
        if (!editingNode) return;

        // Update visual node in sandbox
        setNodes((nds) =>
            nds.map((n) =>
                n.id === editingNode.id
                    ? { ...n, data: { ...n.data, label: editLabel, subtitle: editSubtitle } }
                    : n
            )
        );

        // Sync back to main data for strategy elements that come from real data
        const nodeType = editingNode.data.nodeType;
        const originalId = editingNode.data.originalId;
        const canSync = originalId && SYNCABLE_TYPES.includes(nodeType);

        if (canSync && typeof onUpdateNode === 'function') {
            const updates = { title: editLabel };
            // For non-year items also sync subtitle as description
            if (nodeType !== 'year') {
                updates.description = editSubtitle;
            }
            onUpdateNode(nodeType, originalId, updates);
        }

        setEditingNode(null);
    };

    // Close edit sidebar
    const handleCloseEdit = () => {
        setEditingNode(null);
    };

    const handleAddNode = (nodeType) => {
        const newNode = {
            id: `${nodeType}-new-${Date.now()}`,
            type: 'custom',
            position: { x: 400, y: 300 },
            data: {
                label: `Nový ${nodeTypeLabels[nodeType] || nodeType}`,
                nodeType: nodeType,
                originalId: null,
                isNew: true,
            },
        };
        setNodes((nds) => [...nds, newNode]);
        setIsAddingNode(null);
    };

    const handleDeleteSelected = () => {
        // Delete selected edges
        if (selectedEdges.length > 0) {
            const selectedEdgeIds = selectedEdges.map(e => e.id);
            setEdges((eds) => eds.filter(e => !selectedEdgeIds.includes(e.id)));
        }

        // Delete selected nodes
        if (selectedNodes.length === 0) return;

        // For strategy nodes with originalId, delete from main data as well
        selectedNodes.forEach(node => {
            const nodeType = node.data?.nodeType;
            const originalId = node.data?.originalId;

            // Brands/locations are static in data: only remove from canvas
            if (['brand', 'location'].includes(nodeType)) {
                return;
            }

            // New sandbox-only nodes (no originalId) also only exist in canvas
            if (!originalId) {
                return;
            }

            if (SYNCABLE_TYPES.includes(nodeType) && typeof onDeleteNode === 'function') {
                onDeleteNode(nodeType, originalId, { skipConfirm: true });
            }
        });

        const selectedIds = selectedNodes.map(n => n.id);
        setNodes((nds) => nds.filter(n => !selectedIds.includes(n.id)));
        setEdges((eds) => eds.filter(e => !selectedIds.includes(e.source) && !selectedIds.includes(e.target)));
    };

    const handleChangeEdgeType = (type) => {
        if (selectedEdges.length === 0) return;

        const style = edgeStyles[type];
        const markerColor = style.stroke;

        setEdges((eds) => eds.map(e => {
            if (selectedEdges.some(sel => sel.id === e.id)) {
                return {
                    ...e,
                    style: style,
                    markerEnd: { type: MarkerType.ArrowClosed, color: markerColor },
                    animated: type === 'influence', // Animate influence edges
                    data: { ...e.data, type: type } // Store type in data for potential persistence
                };
            }
            return e;
        }));
    };

    const handleSavePositions = () => {
        const positions = {};
        nodes.forEach(node => {
            positions[node.id] = node.position;
        });
        if (onSavePositions) {
            onSavePositions(positions);
        }
        // Save to localStorage as backup
        localStorage.setItem('sandbox_positions', JSON.stringify(positions));
        alert('Pozice uloženy!');
    };

    const handleResetLayout = () => {
        setNodes(initialNodes);
        setEdges(initialEdges);
    };

    const bgColor = isDark ? '#0a0a0a' : '#f8fafc';
    const gridColor = isDark ? '#1e293b' : '#e2e8f0';

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative', display: 'flex' }} ref={reactFlowWrapper}>
            <div style={{ flex: 1, height: '100%' }}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onSelectionChange={onSelectionChange}
                    onNodeClick={onNodeClick}
                    nodeTypes={nodeTypes}
                    fitView
                    snapToGrid
                    snapGrid={[15, 15]}
                    connectionMode="loose"
                    edgesReconnectable={true}
                    elementsSelectable={true}
                    defaultEdgeOptions={{
                        type: 'smoothstep',
                    }}
                    style={{ backgroundColor: bgColor }}
                >
                    <Background color={gridColor} gap={20} />
                    <Controls
                        style={{
                            backgroundColor: isDark ? '#1e293b' : '#fff',
                            borderRadius: '8px',
                            border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                        }}
                    />
                    <MiniMap
                        style={{
                            backgroundColor: isDark ? '#1e293b' : '#fff',
                            border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                        }}
                        nodeColor={(node) => nodeColors[node.data?.nodeType]?.bg || '#64748b'}
                        maskColor={isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)'}
                    />

                    {/* Toolbar Panel */}
                    <Panel position="top-left">
                        <div style={{
                            display: 'flex',
                            gap: '8px',
                            padding: '12px',
                            backgroundColor: isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                            borderRadius: '12px',
                            border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                            backdropFilter: 'blur(8px)',
                            alignItems: 'center',
                        }}>
                            {/* Sandbox Mode Label */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '8px 12px',
                                backgroundColor: isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.1)',
                                border: '1px solid rgba(139, 92, 246, 0.3)',
                                borderRadius: '8px',
                                color: isDark ? '#c4b5fd' : '#7c3aed',
                                fontWeight: 600,
                                fontSize: '0.85rem',
                            }}>
                                <GitBranch size={16} /> Strategická mapa
                            </div>

                            <div style={{ width: '1px', height: '24px', backgroundColor: isDark ? '#334155' : '#e2e8f0' }} />

                            {/* Add Node Dropdown - only strategy elements, not brands/locations */}
                            <div style={{ position: 'relative' }}>
                                <button
                                    onClick={() => setIsAddingNode(isAddingNode ? null : 'menu')}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        padding: '8px 12px',
                                        backgroundColor: '#22c55e',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontWeight: 500,
                                        fontSize: '0.85rem',
                                    }}
                                >
                                    <Plus size={16} /> Přidat prvek
                                </button>
                                {isAddingNode === 'menu' && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '100%',
                                        left: 0,
                                        marginTop: '4px',
                                        backgroundColor: isDark ? '#1e293b' : '#fff',
                                        border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                        padding: '8px',
                                        zIndex: 100,
                                        minWidth: '180px',
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                                    }}>
                                        {/* Only show editable node types - NOT brand/location */}
                                        {['year', 'vision', 'theme', 'project', 'influence', 'newRestaurant', 'reconstruction'].map(type => {
                                            const Icon = nodeIcons[type];
                                            const colors = nodeColors[type];
                                            return (
                                                <button
                                                    key={type}
                                                    onClick={() => handleAddNode(type)}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        width: '100%',
                                                        padding: '8px 12px',
                                                        backgroundColor: 'transparent',
                                                        color: isDark ? '#fff' : '#1e293b',
                                                        border: 'none',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer',
                                                        fontSize: '0.85rem',
                                                        textAlign: 'left',
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.1)' : '#f1f5f9'}
                                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                                >
                                                    <div style={{
                                                        width: '24px',
                                                        height: '24px',
                                                        borderRadius: '6px',
                                                        backgroundColor: colors.bg,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                    }}>
                                                        <Icon size={14} color="#fff" />
                                                    </div>
                                                    <span>{nodeTypeLabels[type] || type}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Add Brand/Location from existing data */}
                            <div style={{ position: 'relative' }}>
                                <button
                                    onClick={() => setIsAddingNode(isAddingNode === 'brands' ? null : 'brands')}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        padding: '8px 12px',
                                        backgroundColor: '#ec4899',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontWeight: 500,
                                        fontSize: '0.85rem',
                                    }}
                                >
                                    <Store size={16} /> Značka / Pobočka
                                </button>
                                {isAddingNode === 'brands' && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '100%',
                                        left: 0,
                                        marginTop: '4px',
                                        backgroundColor: isDark ? '#1e293b' : '#fff',
                                        border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                        padding: '8px',
                                        zIndex: 100,
                                        minWidth: '220px',
                                        maxHeight: '300px',
                                        overflowY: 'auto',
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                                    }}>
                                        <div style={{ fontSize: '0.75rem', color: textSecondary, padding: '4px 8px', marginBottom: '4px' }}>
                                            Vyberte značku nebo pobočku:
                                        </div>
                                        {data.brands.map(brand => {
                                            const brandLocations = (data.locations || []).filter(l => l.brandId === brand.id);
                                            const isBrandOnCanvas = nodes.some(n => n.id === `brand-${brand.id}`);
                                            return (
                                                <div key={brand.id}>
                                                    <button
                                                        onClick={() => {
                                                            if (!isBrandOnCanvas) {
                                                                const newNode = {
                                                                    id: `brand-${brand.id}`,
                                                                    type: 'custom',
                                                                    position: { x: 600, y: 400 },
                                                                    data: { label: brand.name, nodeType: 'brand', originalId: brand.id, subtitle: brand.conceptShort },
                                                                };
                                                                setNodes((nds) => [...nds, newNode]);
                                                            }
                                                            setIsAddingNode(null);
                                                        }}
                                                        disabled={isBrandOnCanvas}
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '8px',
                                                            width: '100%',
                                                            padding: '8px 12px',
                                                            backgroundColor: 'transparent',
                                                            color: isBrandOnCanvas ? (isDark ? '#475569' : '#cbd5e1') : (isDark ? '#fff' : '#1e293b'),
                                                            border: 'none',
                                                            borderRadius: '6px',
                                                            cursor: isBrandOnCanvas ? 'not-allowed' : 'pointer',
                                                            fontSize: '0.85rem',
                                                            textAlign: 'left',
                                                            fontWeight: 600,
                                                        }}
                                                    >
                                                        <Store size={14} color={nodeColors.brand.bg} />
                                                        {brand.name}
                                                        {isBrandOnCanvas && <span style={{ marginLeft: 'auto', fontSize: '0.7rem' }}>✓</span>}
                                                    </button>
                                                    {brandLocations.map(loc => {
                                                        const isLocOnCanvas = nodes.some(n => n.id === `location-${loc.id}`);
                                                        return (
                                                            <button
                                                                key={loc.id}
                                                                onClick={() => {
                                                                    if (!isLocOnCanvas) {
                                                                        const newNode = {
                                                                            id: `location-${loc.id}`,
                                                                            type: 'custom',
                                                                            position: { x: 650, y: 450 },
                                                                            data: { label: loc.name, nodeType: 'location', originalId: loc.id, subtitle: loc.address },
                                                                        };
                                                                        setNodes((nds) => [...nds, newNode]);
                                                                    }
                                                                    setIsAddingNode(null);
                                                                }}
                                                                disabled={isLocOnCanvas}
                                                                style={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '8px',
                                                                    width: '100%',
                                                                    padding: '6px 12px 6px 28px',
                                                                    backgroundColor: 'transparent',
                                                                    color: isLocOnCanvas ? (isDark ? '#475569' : '#cbd5e1') : (isDark ? '#94a3b8' : '#64748b'),
                                                                    border: 'none',
                                                                    borderRadius: '6px',
                                                                    cursor: isLocOnCanvas ? 'not-allowed' : 'pointer',
                                                                    fontSize: '0.8rem',
                                                                    textAlign: 'left',
                                                                }}
                                                            >
                                                                <MapPin size={12} color={nodeColors.location.bg} />
                                                                {loc.name}
                                                                {isLocOnCanvas && <span style={{ marginLeft: 'auto', fontSize: '0.7rem' }}>✓</span>}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Delete/Remove Selected */}
                            <button
                                onClick={handleDeleteSelected}
                                disabled={selectedNodes.length === 0 && selectedEdges.length === 0}
                                title={
                                    selectedEdges.length > 0
                                        ? 'Smazat propojení'
                                        : selectedNodes.some(n => ['brand', 'location'].includes(n.data?.nodeType))
                                            ? 'Odebrat z mapy (data zůstanou)'
                                            : 'Smazat prvek'
                                }
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '8px 12px',
                                    backgroundColor: (selectedNodes.length > 0 || selectedEdges.length > 0)
                                        ? (selectedEdges.length > 0
                                            ? '#f59e0b'
                                            : selectedNodes.some(n => ['brand', 'location'].includes(n.data?.nodeType))
                                                ? '#f59e0b'
                                                : '#ef4444')
                                        : (isDark ? '#334155' : '#e2e8f0'),
                                    color: (selectedNodes.length > 0 || selectedEdges.length > 0)
                                        ? '#fff'
                                        : (isDark ? '#64748b' : '#94a3b8'),
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: (selectedNodes.length > 0 || selectedEdges.length > 0) ? 'pointer' : 'not-allowed',
                                    fontWeight: 500,
                                    fontSize: '0.85rem',
                                }}
                            >
                                <Trash2 size={16} />
                                {selectedEdges.length > 0 && (
                                    <span style={{ fontSize: '0.75rem' }}>Propojení ({selectedEdges.length})</span>
                                )}
                                {selectedNodes.some(n => ['brand', 'location'].includes(n.data?.nodeType)) && selectedNodes.length > 0 && selectedEdges.length === 0 && (
                                    <span style={{ fontSize: '0.75rem' }}>Odebrat</span>
                                )}
                            </button>

                            <div style={{ width: '1px', height: '24px', backgroundColor: isDark ? '#334155' : '#e2e8f0' }} />

                            {/* Edge Type Selector */}
                            {selectedEdges.length > 0 && (
                                <>
                                    <div style={{ width: '1px', height: '24px', backgroundColor: isDark ? '#334155' : '#e2e8f0' }} />
                                    <div style={{ position: 'relative' }}>
                                        <button
                                            onClick={() => setIsAddingNode(isAddingNode === 'edgeType' ? null : 'edgeType')}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                padding: '8px 12px',
                                                backgroundColor: isDark ? '#334155' : '#e2e8f0',
                                                color: isDark ? '#fff' : '#1e293b',
                                                border: 'none',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                fontWeight: 500,
                                                fontSize: '0.85rem',
                                            }}
                                            title="Změnit typ propojení"
                                        >
                                            <Link2 size={16} /> Typ propojení
                                        </button>
                                        {isAddingNode === 'edgeType' && (
                                            <div style={{
                                                position: 'absolute',
                                                top: '100%',
                                                left: 0,
                                                marginTop: '4px',
                                                backgroundColor: isDark ? '#1e293b' : '#fff',
                                                border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                                                borderRadius: '8px',
                                                padding: '8px',
                                                zIndex: 100,
                                                minWidth: '180px',
                                                boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                                            }}>
                                                {Object.entries(edgeTypeLabels).map(([type, label]) => (
                                                    <button
                                                        key={type}
                                                        onClick={() => {
                                                            handleChangeEdgeType(type);
                                                            setIsAddingNode(null);
                                                        }}
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '8px',
                                                            width: '100%',
                                                            padding: '8px 12px',
                                                            backgroundColor: 'transparent',
                                                            color: isDark ? '#fff' : '#1e293b',
                                                            border: 'none',
                                                            borderRadius: '6px',
                                                            cursor: 'pointer',
                                                            fontSize: '0.85rem',
                                                            textAlign: 'left',
                                                        }}
                                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.1)' : '#f1f5f9'}
                                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                                    >
                                                        <div style={{
                                                            width: '20px',
                                                            height: '2px',
                                                            backgroundColor: edgeStyles[type].stroke,
                                                            borderTop: type === 'influence' ? '2px dashed ' + edgeStyles[type].stroke : 'none',
                                                            background: type === 'influence' ? 'transparent' : edgeStyles[type].stroke,
                                                        }} />
                                                        <span>{label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}

                            <div style={{ width: '1px', height: '24px', backgroundColor: isDark ? '#334155' : '#e2e8f0' }} />

                            {/* Save Positions */}
                            <button
                                onClick={handleSavePositions}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '8px 12px',
                                    backgroundColor: '#0ea5e9',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: 500,
                                    fontSize: '0.85rem',
                                }}
                            >
                                <Save size={16} /> Uložit
                            </button>

                            {/* Reset Layout */}
                            <button
                                onClick={handleResetLayout}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '8px 12px',
                                    backgroundColor: isDark ? '#334155' : '#e2e8f0',
                                    color: isDark ? '#fff' : '#1e293b',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: 500,
                                    fontSize: '0.85rem',
                                }}
                            >
                                <RotateCcw size={16} />
                            </button>
                        </div>
                    </Panel>

                    {/* Legend Panel */}
                    <Panel position="bottom-left">
                        <div style={{
                            padding: '12px',
                            backgroundColor: isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                            borderRadius: '12px',
                            border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                            backdropFilter: 'blur(8px)',
                            fontSize: '0.75rem',
                        }}>
                            <div style={{ fontWeight: 600, marginBottom: '8px', color: isDark ? '#fff' : '#1e293b' }}>Legenda</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {Object.entries(nodeColors).map(([type, colors]) => {
                                    const Icon = nodeIcons[type];
                                    return (
                                        <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <div style={{
                                                width: '16px',
                                                height: '16px',
                                                borderRadius: '4px',
                                                backgroundColor: colors.bg,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}>
                                                <Icon size={10} color="#fff" />
                                            </div>
                                            <span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>{nodeTypeLabels[type] || type}</span>
                                        </div>
                                    );
                                })}
                            </div>
                            <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: isDark ? '1px solid #334155' : '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', gap: '12px', color: isDark ? '#94a3b8' : '#64748b' }}>
                                    <span>─── Hierarchie</span>
                                    <span style={{ color: '#ef4444' }}>- - - Vliv</span>
                                    <span style={{ color: '#ec4899' }}>─── Značka</span>
                                </div>
                            </div>
                        </div>
                    </Panel>

                    {/* Instructions Panel */}
                    <Panel position="top-right">
                        <div style={{
                            padding: '12px',
                            backgroundColor: isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                            borderRadius: '12px',
                            border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                            backdropFilter: 'blur(8px)',
                            fontSize: '0.8rem',
                            maxWidth: '260px',
                            color: isDark ? '#94a3b8' : '#64748b',
                        }}>
                            <div style={{ fontWeight: 600, marginBottom: '6px', color: isDark ? '#fff' : '#1e293b' }}>Příprava strategie</div>
                            <div>• Přidávejte vize, témata, projekty</div>
                            <div>• Přidejte značku/pobočku jako cíl</div>
                            <div>• Propojte strategii se značkami</div>
                            <div>• Táhněte z teček pro spojení</div>
                            <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: isDark ? '1px solid #334155' : '1px solid #e2e8f0', fontSize: '0.75rem' }}>
                                <span style={{ color: '#ec4899' }}>●</span> Značky = cíle strategie
                            </div>
                        </div>
                    </Panel>
                </ReactFlow>
            </div>

            {/* Edit Sidebar */}
            {editingNode && (
                <div style={{
                    width: '320px',
                    height: '100%',
                    backgroundColor: isDark ? '#1e293b' : '#fff',
                    borderLeft: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                    padding: '1.5rem',
                    overflowY: 'auto',
                    flexShrink: 0,
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ margin: 0, color: isDark ? '#fff' : '#1e293b', fontSize: '1.1rem' }}>
                            Upravit {nodeTypeLabels[editingNode.data.nodeType] || 'uzel'}
                        </h3>
                        <button
                            onClick={handleCloseEdit}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: isDark ? '#94a3b8' : '#64748b',
                                padding: '4px',
                            }}
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Node Type Badge */}
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        backgroundColor: nodeColors[editingNode.data.nodeType]?.bg || '#64748b',
                        color: '#fff',
                        fontSize: '0.8rem',
                        marginBottom: '1.5rem',
                    }}>
                        {(() => {
                            const Icon = nodeIcons[editingNode.data.nodeType];
                            return Icon ? <Icon size={14} /> : null;
                        })()}
                        {nodeTypeLabels[editingNode.data.nodeType] || editingNode.data.nodeType}
                    </div>

                    {/* Label Input */}
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            fontSize: '0.85rem',
                            fontWeight: 500,
                            color: isDark ? '#94a3b8' : '#64748b',
                        }}>
                            Název
                        </label>
                        <input
                            type="text"
                            value={editLabel}
                            onChange={(e) => setEditLabel(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                                backgroundColor: isDark ? '#0f172a' : '#f8fafc',
                                color: isDark ? '#fff' : '#1e293b',
                                fontSize: '0.95rem',
                                outline: 'none',
                            }}
                            placeholder="Zadejte název..."
                        />
                    </div>

                    {/* Subtitle Input */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            fontSize: '0.85rem',
                            fontWeight: 500,
                            color: isDark ? '#94a3b8' : '#64748b',
                        }}>
                            Popis / Poznámka
                        </label>
                        <textarea
                            value={editSubtitle}
                            onChange={(e) => setEditSubtitle(e.target.value)}
                            rows={3}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                                backgroundColor: isDark ? '#0f172a' : '#f8fafc',
                                color: isDark ? '#fff' : '#1e293b',
                                fontSize: '0.9rem',
                                outline: 'none',
                                resize: 'vertical',
                                fontFamily: 'inherit',
                            }}
                            placeholder="Volitelný popis..."
                        />
                    </div>

                    {/* Node ID Info */}
                    <div style={{
                        padding: '0.75rem',
                        borderRadius: '8px',
                        backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9',
                        marginBottom: '1.5rem',
                        fontSize: '0.8rem',
                        color: isDark ? '#64748b' : '#94a3b8',
                    }}>
                        <div><strong>ID:</strong> {editingNode.id}</div>
                        {editingNode.data.originalId && (
                            <div><strong>Původní ID:</strong> {editingNode.data.originalId}</div>
                        )}
                    </div>

                    {/* Different UI for brands/locations vs strategy elements */}
                    {['brand', 'location'].includes(editingNode.data.nodeType) ? (
                        <>
                            {/* Info - brands/locations are fixed */}
                            <div style={{
                                padding: '0.75rem',
                                borderRadius: '8px',
                                backgroundColor: isDark ? 'rgba(236, 72, 153, 0.1)' : 'rgba(236, 72, 153, 0.1)',
                                border: '1px solid rgba(236, 72, 153, 0.3)',
                                marginBottom: '1rem',
                                fontSize: '0.8rem',
                                color: isDark ? '#f9a8d4' : '#be185d',
                            }}>
                                <strong>Fixní prvek</strong><br />
                                Značky a pobočky nelze upravovat v Sandboxu. Slouží jako cíle pro propojení strategie.
                            </div>
                            <button
                                onClick={handleCloseEdit}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                                    backgroundColor: 'transparent',
                                    color: isDark ? '#fff' : '#1e293b',
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                }}
                            >
                                Zavřít
                            </button>
                        </>
                    ) : (
                        <>
                            {/* Brand selector for new restaurants */}
                            {editingNode.data.nodeType === 'newRestaurant' && (
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '0.5rem',
                                        fontSize: '0.85rem',
                                        fontWeight: 500,
                                        color: isDark ? '#94a3b8' : '#64748b',
                                    }}>
                                        Cílová značka
                                    </label>
                                    <select
                                        value={editingNode.data.linkedBrandId || ''}
                                        onChange={(e) => {
                                            const brandId = e.target.value;
                                            const brand = data.brands.find(b => b.id === brandId);
                                            setNodes((nds) => nds.map((n) =>
                                                n.id === editingNode.id
                                                    ? {
                                                        ...n,
                                                        data: {
                                                            ...n.data,
                                                            linkedBrandId: brandId || null,
                                                            linkedBrandName: brand?.name || null,
                                                        }
                                                    }
                                                    : n
                                            ));
                                            setEditingNode(prev => ({
                                                ...prev,
                                                data: {
                                                    ...prev.data,
                                                    linkedBrandId: brandId || null,
                                                    linkedBrandName: brand?.name || null,
                                                }
                                            }));
                                            if (editingNode.data.originalId && typeof onUpdateNode === 'function') {
                                                onUpdateNode('newRestaurant', editingNode.data.originalId, { brands: brandId ? [brandId] : [] });
                                            }
                                        }}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            borderRadius: '8px',
                                            border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                                            backgroundColor: isDark ? '#0f172a' : '#f8fafc',
                                            color: isDark ? '#fff' : '#1e293b',
                                            fontSize: '0.9rem',
                                            outline: 'none',
                                        }}
                                    >
                                        <option value="">-- Vyberte značku --</option>
                                        {data.brands.map(brand => (
                                            <option key={brand.id} value={brand.id}>{brand.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Location selector for reconstruction */}
                            {editingNode.data.nodeType === 'reconstruction' && (
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '0.5rem',
                                        fontSize: '0.85rem',
                                        fontWeight: 500,
                                        color: isDark ? '#94a3b8' : '#64748b',
                                    }}>
                                        Cílová pobočka
                                    </label>
                                    <select
                                        value={editingNode.data.linkedLocationId || ''}
                                        onChange={(e) => {
                                            const locationId = e.target.value;
                                            const location = (data.locations || []).find(l => l.id === locationId);
                                            const brand = location ? data.brands.find(b => b.id === location.brandId) : null;
                                            setNodes((nds) => nds.map((n) =>
                                                n.id === editingNode.id
                                                    ? {
                                                        ...n,
                                                        data: {
                                                            ...n.data,
                                                            linkedLocationId: locationId || null,
                                                            linkedLocationName: location?.name || null,
                                                            linkedBrandName: brand?.name || null,
                                                        }
                                                    }
                                                    : n
                                            ));
                                            setEditingNode(prev => ({
                                                ...prev,
                                                data: {
                                                    ...prev.data,
                                                    linkedLocationId: locationId || null,
                                                    linkedLocationName: location?.name || null,
                                                    linkedBrandName: brand?.name || null,
                                                }
                                            }));
                                            if (editingNode.data.originalId && typeof onUpdateNode === 'function') {
                                                onUpdateNode('reconstruction', editingNode.data.originalId, { locationId: locationId || null });
                                            }
                                        }}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            borderRadius: '8px',
                                            border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                                            backgroundColor: isDark ? '#0f172a' : '#f8fafc',
                                            color: isDark ? '#fff' : '#1e293b',
                                            fontSize: '0.9rem',
                                            outline: 'none',
                                        }}
                                    >
                                        <option value="">-- Vyberte pobočku --</option>
                                        {data.brands.map(brand => {
                                            const brandLocations = (data.locations || []).filter(l => l.brandId === brand.id);
                                            return (
                                                <optgroup key={brand.id} label={brand.name}>
                                                    {brandLocations.map(loc => (
                                                        <option key={loc.id} value={loc.id}>
                                                            {loc.name} {loc.address ? `(${loc.address})` : ''}
                                                        </option>
                                                    ))}
                                                </optgroup>
                                            );
                                        })}
                                    </select>
                                    {editingNode.data.linkedLocationId && (
                                        <div style={{
                                            marginTop: '0.5rem',
                                            padding: '0.5rem',
                                            borderRadius: '6px',
                                            backgroundColor: isDark ? 'rgba(236, 72, 153, 0.1)' : 'rgba(236, 72, 153, 0.1)',
                                            fontSize: '0.8rem',
                                            color: isDark ? '#f9a8d4' : '#be185d',
                                        }}>
                                            <strong>{editingNode.data.linkedBrandName}</strong> → {editingNode.data.linkedLocationName}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Action Buttons for editable elements */}
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button
                                    onClick={handleUpdateNode}
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        borderRadius: '8px',
                                        border: 'none',
                                        backgroundColor: '#22c55e',
                                        color: '#fff',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        fontSize: '0.9rem',
                                    }}
                                >
                                    Uložit změny
                                </button>
                                <button
                                    onClick={() => {
                                        const nodeType = editingNode.data.nodeType;
                                        const originalId = editingNode.data.originalId;
                                        if (originalId && SYNCABLE_TYPES.includes(nodeType) && typeof onDeleteNode === 'function') {
                                            onDeleteNode(nodeType, originalId, { skipConfirm: true });
                                        }
                                        setNodes((nds) => nds.filter((n) => n.id !== editingNode.id));
                                        setEdges((eds) => eds.filter((e) => e.source !== editingNode.id && e.target !== editingNode.id));
                                        setEditingNode(null);
                                    }}
                                    style={{
                                        padding: '0.75rem',
                                        borderRadius: '8px',
                                        border: 'none',
                                        backgroundColor: '#ef4444',
                                        color: '#fff',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        fontSize: '0.9rem',
                                    }}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

// Wrapper with Provider
export function SandboxEditor({ data, theme, onSavePositions, onUpdateNode, onDeleteNode }) {
    return (
        <div style={{ width: '100%', height: '100%' }}>
            <ReactFlowProvider>
                <SandboxFlow
                    data={data}
                    theme={theme}
                    onSavePositions={onSavePositions}
                    onUpdateNode={onUpdateNode}
                    onDeleteNode={onDeleteNode}
                />
            </ReactFlowProvider>
        </div>
    );
}
