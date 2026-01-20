import { useState, useMemo, useRef, useEffect } from 'react';
import './Relations.css';

function Relations({ signals, topics, brands, projects }) {
  const [hoveredNode, setHoveredNode] = useState(null);
  const svgRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 1000, height: 600 });

  // All signals except rejected
  const activeSignals = useMemo(() =>
    signals.filter(s => s.status !== 'rejected'),
    [signals]
  );

  const activeProjects = useMemo(() =>
    projects.filter(p => p.status === 'active'),
    [projects]
  );

  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (svgRef.current) {
        const rect = svgRef.current.parentElement.getBoundingClientRect();
        setDimensions({ width: rect.width, height: Math.max(500, rect.height - 100) });
      }
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Find which topics, brands, projects are actually connected to signals
  const connectedIds = useMemo(() => {
    const topicIds = new Set();
    const brandIds = new Set();
    const projectIds = new Set();

    activeSignals.forEach(signal => {
      signal.topic_ids?.forEach(id => topicIds.add(id));
      signal.brand_ids?.forEach(id => brandIds.add(id));
      if (signal.project_id) projectIds.add(signal.project_id);
    });

    return { topicIds, brandIds, projectIds };
  }, [activeSignals]);

  // Only show topics/brands/projects that have connections
  const connectedTopics = useMemo(() =>
    topics.filter(t => connectedIds.topicIds.has(t.id)),
    [topics, connectedIds]
  );

  const connectedBrands = useMemo(() =>
    brands.filter(b => connectedIds.brandIds.has(b.id)),
    [brands, connectedIds]
  );

  const connectedProjects = useMemo(() =>
    activeProjects.filter(p => connectedIds.projectIds.has(p.id)),
    [activeProjects, connectedIds]
  );

  // Calculate node positions
  const nodes = useMemo(() => {
    const { width, height } = dimensions;
    const padding = 60;
    const colWidth = (width - padding * 2) / 4;

    const result = [];

    // Signals (column 0) - only those with at least one connection
    const connectedSignals = activeSignals.filter(s =>
      (s.topic_ids?.length > 0) || (s.brand_ids?.length > 0) || s.project_id
    );

    connectedSignals.forEach((signal, i) => {
      const y = padding + (i + 0.5) * ((height - padding * 2) / Math.max(connectedSignals.length, 1));
      result.push({
        id: `signal-${signal.id}`,
        type: 'signal',
        data: signal,
        x: padding + colWidth * 0.5,
        y: Math.min(y, height - padding),
        color: signal.priority === 'high' ? '#E57373' : '#FFB74D',
        label: signal.title.length > 25 ? signal.title.slice(0, 25) + '...' : signal.title
      });
    });

    // Topics (column 1) - only connected ones
    connectedTopics.forEach((topic, i) => {
      const y = padding + (i + 0.5) * ((height - padding * 2) / Math.max(connectedTopics.length, 1));
      result.push({
        id: `topic-${topic.id}`,
        type: 'topic',
        data: topic,
        x: padding + colWidth * 1.5,
        y,
        color: topic.color || '#81C784',
        label: topic.name
      });
    });

    // Brands (column 2) - only connected ones
    connectedBrands.forEach((brand, i) => {
      const y = padding + (i + 0.5) * ((height - padding * 2) / Math.max(connectedBrands.length, 1));
      result.push({
        id: `brand-${brand.id}`,
        type: 'brand',
        data: brand,
        x: padding + colWidth * 2.5,
        y,
        color: brand.color || '#64B5F6',
        label: brand.name
      });
    });

    // Projects (column 3) - only connected ones
    connectedProjects.forEach((project, i) => {
      const y = padding + (i + 0.5) * ((height - padding * 2) / Math.max(connectedProjects.length, 1));
      result.push({
        id: `project-${project.id}`,
        type: 'project',
        data: project,
        x: padding + colWidth * 3.5,
        y,
        color: '#BA68C8',
        label: project.name.length > 20 ? project.name.slice(0, 20) + '...' : project.name
      });
    });

    return result;
  }, [activeSignals, connectedTopics, connectedBrands, connectedProjects, dimensions]);

  // Calculate connections
  const connections = useMemo(() => {
    const result = [];
    const nodeMap = {};
    nodes.forEach(n => nodeMap[n.id] = n);

    activeSignals.forEach(signal => {
      const signalNode = nodeMap[`signal-${signal.id}`];
      if (!signalNode) return;

      // Signal -> Topics
      signal.topic_ids?.forEach(topicId => {
        const topicNode = nodeMap[`topic-${topicId}`];
        if (topicNode) {
          result.push({
            id: `${signalNode.id}-${topicNode.id}`,
            from: signalNode,
            to: topicNode,
            color: topicNode.color
          });
        }
      });

      // Signal -> Brands
      signal.brand_ids?.forEach(brandId => {
        const brandNode = nodeMap[`brand-${brandId}`];
        if (brandNode) {
          result.push({
            id: `${signalNode.id}-${brandNode.id}`,
            from: signalNode,
            to: brandNode,
            color: brandNode.color
          });
        }
      });

      // Signal -> Project
      if (signal.project_id) {
        const projectNode = nodeMap[`project-${signal.project_id}`];
        if (projectNode) {
          result.push({
            id: `${signalNode.id}-${projectNode.id}`,
            from: signalNode,
            to: projectNode,
            color: projectNode.color
          });
        }
      }
    });

    return result;
  }, [nodes, activeSignals]);

  // Check if connection is highlighted
  const isConnectionHighlighted = (conn) => {
    if (!hoveredNode) return true;
    return conn.from.id === hoveredNode || conn.to.id === hoveredNode;
  };

  // Check if node is highlighted
  const isNodeHighlighted = (node) => {
    if (!hoveredNode) return true;
    if (node.id === hoveredNode) return true;
    return connections.some(c =>
      (c.from.id === hoveredNode && c.to.id === node.id) ||
      (c.to.id === hoveredNode && c.from.id === node.id)
    );
  };


  return (
    <div className="relations">
      <div className="relations-header">
        <h2>Mapa vztahů</h2>
        <p className="relations-subtitle">
          {nodes.filter(n => n.type === 'signal').length} propojených signálů
        </p>
      </div>

      <div className="relations-container">
        <div className="relations-canvas">
          {/* Column labels */}
          <div className="column-labels">
            <span>Signály</span>
            <span>Témata</span>
            <span>Značky</span>
            <span>Projekty</span>
          </div>

          <svg
            ref={svgRef}
            width={dimensions.width}
            height={dimensions.height}
            className="relations-svg"
          >
            {/* Connections */}
            <g className="connections">
              {connections.map(conn => {
                const highlighted = isConnectionHighlighted(conn);
                const midX = (conn.from.x + conn.to.x) / 2;
                return (
                  <path
                    key={conn.id}
                    d={`M ${conn.from.x} ${conn.from.y} Q ${midX} ${conn.from.y}, ${midX} ${(conn.from.y + conn.to.y) / 2} T ${conn.to.x} ${conn.to.y}`}
                    stroke={conn.color}
                    strokeWidth={highlighted ? 2 : 1}
                    fill="none"
                    opacity={highlighted ? 0.8 : 0.15}
                    className="connection-line"
                  />
                );
              })}
            </g>

            {/* Nodes */}
            <g className="nodes">
              {nodes.map(node => {
                const highlighted = isNodeHighlighted(node);
                const isHovered = hoveredNode === node.id;
                const radius = node.type === 'signal' ? 8 : 10;

                return (
                  <g
                    key={node.id}
                    className={`node node-${node.type} ${highlighted ? 'highlighted' : 'dimmed'} ${isHovered ? 'hovered' : ''}`}
                    transform={`translate(${node.x}, ${node.y})`}
                    onMouseEnter={() => setHoveredNode(node.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Node circle */}
                    <circle
                      r={radius}
                      fill={node.color}
                      stroke="#FFFFFF"
                      strokeWidth={2}
                      opacity={highlighted ? 1 : 0.3}
                    />
                    {/* Hover ring */}
                    {isHovered && (
                      <circle
                        r={radius + 4}
                        fill="none"
                        stroke={node.color}
                        strokeWidth={2}
                        opacity={0.5}
                      />
                    )}
                    {/* Label */}
                    <text
                      x={node.type === 'signal' ? -12 : 14}
                      y={4}
                      textAnchor={node.type === 'signal' ? 'end' : 'start'}
                      fontSize={11}
                      fill={highlighted ? '#2D2A26' : '#B8B4AE'}
                      className="node-label"
                    >
                      {node.label}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>

          {/* Empty state */}
          {nodes.length === 0 && (
            <div className="relations-empty">
              <p>Žádné propojené signály</p>
              <span>Přiřaďte signály k tématům, značkám nebo projektům</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default Relations;
