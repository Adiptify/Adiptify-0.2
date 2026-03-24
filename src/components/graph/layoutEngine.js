import dagre from 'dagre';

export const getLayoutedElements = (nodes, edges, hiddenIds = new Set(), direction = 'LR') => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({
        rankdir: direction,
        ranksep: 200, // Horizontal gap between parent and child
        nodesep: 150, // Vertical gap between sibling nodes (increased to prevent overlap)
        marginx: 100,
        marginy: 100,
    });

    const visibleNodes = nodes.filter(n => !hiddenIds.has(n.id));
    const visibleEdges = edges.filter(e => !hiddenIds.has(e.source) && !hiddenIds.has(e.target));

    visibleNodes.forEach((node) => {
        const level = node.data?.level || 0;
        const label = node.data?.label || '';

        // Estimate how many lines the label wraps to, based on approximate chars-per-line at each level's width
        const charsPerLine = level === 0 ? 22 : level === 1 ? 18 : level === 2 ? 16 : 14;
        const labelLines = Math.max(1, Math.ceil(label.length / charsPerLine));
        const lineHeight = 20; // approximate rendered line-height in px
        const labelHeight = labelLines * lineHeight;

        // Match dagre dimensions to CSS max-widths and dynamically compute height
        let width, height;

        if (level === 0) {
            width = 350;   // CSS max-width for .node-level-0
            height = Math.max(140, 60 + labelHeight);
        } else if (level === 1) {
            width = 300;   // CSS max-width for .node-level-1
            height = Math.max(130, 55 + labelHeight);
        } else if (level === 2) {
            width = 260;   // CSS max-width for .node-level-2
            height = Math.max(120, 50 + labelHeight);
        } else {
            width = 220;   // CSS max-width for .node-level-3+
            height = Math.max(100, 45 + labelHeight);
        }

        dagreGraph.setNode(node.id, { width, height });
    });

    visibleEdges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    // Map to find parents quickly for hidden nodes
    const parentMap = {};
    edges.forEach(e => { parentMap[e.target] = e.source; });

    const layoutedNodes = nodes.map((node) => {
        if (!hiddenIds.has(node.id)) {
            // Visible node -> Get absolute center position from Dagre
            const nodeWithPosition = dagreGraph.node(node.id);

            return {
                ...node,
                targetPosition: 'left',
                sourcePosition: 'right',
                position: {
                    x: nodeWithPosition.x - (nodeWithPosition.width / 2),
                    y: nodeWithPosition.y - (nodeWithPosition.height / 2),
                },
            };
        } else {
            // Hidden node -> Snap to nearest visible ancestor's center position
            let ancestorId = parentMap[node.id];
            let ancestorPos = { x: 0, y: 0 };

            // Traverse up until we find a visible node or run out
            while (ancestorId) {
                if (!hiddenIds.has(ancestorId)) {
                    const nodeWithPosition = dagreGraph.node(ancestorId);
                    if (nodeWithPosition) {
                        ancestorPos = {
                            x: nodeWithPosition.x - (nodeWithPosition.width / 2),
                            y: nodeWithPosition.y - (nodeWithPosition.height / 2)
                        };
                    }
                    break;
                }
                ancestorId = parentMap[ancestorId];
            }

            return {
                ...node,
                position: ancestorPos
            };
        }
    });

    return { nodes: layoutedNodes, edges };
};
