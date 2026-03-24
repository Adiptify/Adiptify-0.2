import React, { useState, useCallback, useEffect, useMemo } from 'react';
import ReactFlow, {
  useNodesState, useEdgesState, Background, Controls, MiniMap, MarkerType, useReactFlow
} from 'reactflow';
import 'reactflow/dist/style.css';
import { getAIResponse } from '../../services/llmService';
import { getLayoutedElements } from './layoutEngine';
import { Send, Trash2, Zap, Cpu, RefreshCcw, Layout } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import CustomNode from './CustomNode';
import './GraphExplorer.css';

import { ReactFlowProvider } from 'reactflow';

const nodeTypes = {
  custom: CustomNode,
};

function GraphExplorerInner() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [collapsedNodes, setCollapsedNodes] = useState(new Set());
  const { fitView, setCenter } = useReactFlow();
  const location = useLocation();
  const autoExpandTopic = location.state?.topic;

  // Focus and Context Menu State
  const [focusedNodeId, setFocusedNodeId] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);

  // Load from Memory — collapse everything to root on refresh for a clean view
  useEffect(() => {
    const saved = localStorage.getItem('ai_graph_memory');
    if (saved) {
      try {
        const { nodes: n, edges: e } = JSON.parse(saved);
        if (Array.isArray(n) && Array.isArray(e) && n.length > 0) {
          // Find all nodes that have children (i.e. are a source of at least one edge)
          const parentIds = new Set(e.map(edge => edge.source));
          // Collapse every parent node so only the root is visible
          const initialCollapsed = new Set();
          parentIds.forEach(id => initialCollapsed.add(id));

          const hiddenOnLoad = getHiddenIds(initialCollapsed, e);
          const { nodes: layoutedNodes } = getLayoutedElements(n, e, hiddenOnLoad);

          setNodes(layoutedNodes);
          setEdges(e);
          setCollapsedNodes(initialCollapsed);

          // Center on root after a tick
          setTimeout(() => {
            fitView({ duration: 600, padding: 0.3, maxZoom: 1, minZoom: 0.15 });
          }, 100);
        }
      } catch (err) {
        console.error("Failed to load memory:", err);
        localStorage.removeItem('ai_graph_memory');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-expand from router state
  useEffect(() => {
    if (autoExpandTopic && !loading && nodes.length === 0) {
      setInput(autoExpandTopic);
      // Use setTimeout to avoid calling onExpand before it's ready or causing a render loop
      setTimeout(() => onExpand(autoExpandTopic), 100);
    }
  }, [autoExpandTopic]);

  const getHiddenIds = useCallback((collapsedSet, currentEdges) => {
    const ids = new Set();
    const checkHidden = (parentId) => {
      currentEdges.forEach(edge => {
        if (edge.source === parentId) {
          ids.add(edge.target);
          checkHidden(edge.target);
        }
      });
    };
    collapsedSet.forEach(id => checkHidden(id));
    return ids;
  }, []);

  // Track the last toggled node for camera framing
  const [lastToggledNode, setLastToggledNode] = useState(null);

  const toggleChildren = useCallback((nodeId) => {
    setCollapsedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId); // expanding
        setLastToggledNode({ id: nodeId, action: 'expand' });
      } else {
        next.add(nodeId); // collapsing
        setLastToggledNode({ id: nodeId, action: 'collapse' });
      }
      return next;
    });
  }, []);

  // Re-layout whenever collapsedNodes changes — uses LATEST nodes and edges from state
  useEffect(() => {
    if (nodes.length === 0) return;
    const currentHiddenIds = getHiddenIds(collapsedNodes, edges);
    const { nodes: layoutedNodes } = getLayoutedElements(nodes, edges, currentHiddenIds);

    // Only update if positions actually changed to avoid infinite loop
    const positionsChanged = layoutedNodes.some((ln, i) => {
      const orig = nodes[i];
      return !orig || ln.position.x !== orig.position.x || ln.position.y !== orig.position.y;
    });

    if (positionsChanged) {
      setNodes(layoutedNodes);
    }

    // Camera framing for the last toggled node
    if (lastToggledNode) {
      setTimeout(() => {
        if (lastToggledNode.action === 'expand') {
          const childrenIds = edges
            .filter(e => e.source === lastToggledNode.id && !currentHiddenIds.has(e.target))
            .map(e => ({ id: e.target }));
          const nodesToFrame = [{ id: lastToggledNode.id }, ...childrenIds];
          fitView({ nodes: nodesToFrame, duration: 800, padding: 0.25, maxZoom: 0.9, minZoom: 0.15 });
        } else {
          fitView({ nodes: [{ id: lastToggledNode.id }], duration: 600, padding: 0.25, maxZoom: 0.9, minZoom: 0.15 });
        }
        setLastToggledNode(null);
      }, 150);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collapsedNodes]);

  // Derived state for hidden nodes/edges
  const hiddenIds = useMemo(() => getHiddenIds(collapsedNodes, edges), [collapsedNodes, edges, getHiddenIds]);

  const onExpand = useCallback(async (topic, parentId = null) => {
    if (!topic.trim()) return;

    setLoading(true);
    try {
      const data = await getAIResponse(topic, parentId);
      let nodesToAdd = [];
      let edgesToAdd = [];

      if (!parentId && data?.root) {
        // Initial deep load
        const rootId = `root-${Date.now()}`;
        const initialCollapsed = new Set();

        // COLLAPSE BY DEFAULT: Root and Level-1
        initialCollapsed.add(rootId);

        const rootNode = {
          id: rootId,
          type: 'custom',
          data: {
            label: data.root.label || topic,
            desc: data.root.desc || '',
            isRoot: true,
            level: 0,
            onToggleChildren: toggleChildren,
            childCount: data.children?.length || 0
          },
          position: { x: 0, y: 0 },
        };
        nodesToAdd.push(rootNode);

        if (Array.isArray(data.children)) {
          data.children.forEach((l1, i) => {
            const l1Id = `l1-${i}-${Date.now()}`;
            initialCollapsed.add(l1Id);

            nodesToAdd.push({
              id: l1Id,
              type: 'custom',
              data: {
                label: l1.label || 'Category',
                desc: l1.desc || '',
                level: 1,
                childCount: l1.children?.length || 0,
                onToggleChildren: toggleChildren
              },
              position: { x: 0, y: 0 }
            });
            edgesToAdd.push({
              id: `e-${rootId}-${l1Id}`,
              source: rootId,
              target: l1Id,
              type: 'smoothstep',
              animated: true,
              markerEnd: { type: MarkerType.ArrowClosed, color: '#1DCD9F' }
            });

            if (Array.isArray(l1.children)) {
              l1.children.forEach((l2, j) => {
                const l2Id = `l2-${i}-${j}-${Date.now()}`;
                nodesToAdd.push({
                  id: l2Id,
                  type: 'custom',
                  data: {
                    label: l2.label || 'Sub-category',
                    desc: l2.desc || '',
                    level: 2,
                    onToggleChildren: toggleChildren
                  },
                  position: { x: 0, y: 0 }
                });
                edgesToAdd.push({
                  id: `e-${l1Id}-${l2Id}`,
                  source: l1Id,
                  target: l2Id,
                  type: 'smoothstep',
                  animated: true,
                  markerEnd: { type: MarkerType.ArrowClosed, color: '#1DCD9F' }
                });
              });
            }
          });
        }
        setCollapsedNodes(prev => new Set([...prev, ...initialCollapsed]));
      } else if (data?.nodes) {
        // Recursive expansion (2 levels deep)
        const parentNode = nodes.find(n => n.id === parentId);
        const parentLevel = parentNode?.data?.level || 0;
        const parentPos = parentNode?.position || { x: 0, y: 0 };

        data.nodes.forEach(n => {
          const l1Id = `${n.id}-${Math.random().toString(36).substr(2, 9)}`;

          nodesToAdd.push({
            id: l1Id,
            type: 'custom',
            data: {
              label: n.label || 'Topic',
              desc: n.desc || '',
              level: parentLevel + 1,
              onToggleChildren: toggleChildren,
              childCount: n.children?.length || 0
            },
            position: { x: parentPos.x, y: parentPos.y }, // Spawn exactly at parent for outward expansion
          });

          edgesToAdd.push({
            id: `e-${parentId}-${l1Id}`,
            source: parentId,
            target: l1Id,
            type: 'smoothstep',
            animated: true,
            markerEnd: { type: MarkerType.ArrowClosed, color: '#1DCD9F' }
          });

          // Handle Level 2 Children if they exist
          if (Array.isArray(n.children)) {
            n.children.forEach(c => {
              const l2Id = `${c.id}-${Math.random().toString(36).substr(2, 9)}`;
              nodesToAdd.push({
                id: l2Id,
                type: 'custom',
                data: {
                  label: c.label || 'Detail',
                  desc: c.desc || '',
                  level: parentLevel + 2,
                  onToggleChildren: toggleChildren
                },
                position: { x: parentPos.x, y: parentPos.y }, // Nested offset spawns exactly at parent
              });
              edgesToAdd.push({
                id: `e-${l1Id}-${l2Id}`,
                source: l1Id,
                target: l2Id,
                type: 'smoothstep',
                animated: true,
                markerEnd: { type: MarkerType.ArrowClosed, color: '#1DCD9F' }
              });
            });
          }
        });

        // Ensure the expanded parent is not collapsed
        setCollapsedNodes(prev => {
          const next = new Set(prev);
          next.delete(parentId);
          return next;
        });
      }

      const allNodes = [...nodes, ...nodesToAdd];
      const allEdges = [...edges, ...edgesToAdd];

      const tempCollapsed = new Set(collapsedNodes);
      if (!parentId && data?.root) {
        const rootId = nodesToAdd[0]?.id;
        if (rootId) tempCollapsed.add(rootId);
        nodesToAdd.filter(n => n.id.startsWith('l1')).forEach(n => tempCollapsed.add(n.id));
      } else if (parentId) {
        tempCollapsed.delete(parentId);
      }

      const nextHiddenIds = getHiddenIds(tempCollapsed, allEdges);
      const { nodes: layoutedNodes } = getLayoutedElements(allNodes, allEdges, nextHiddenIds);

      // UPDATE childCount on parent and set final positions
      const finalNodes = layoutedNodes.map(n => {
        if (parentId && n.id === parentId) {
          return {
            ...n,
            data: {
              ...n.data,
              childCount: (n.data.childCount || 0) + data.nodes.length
            }
          };
        }
        return n;
      });

      setCollapsedNodes(tempCollapsed);
      setNodes(finalNodes);
      setEdges(allEdges);
      localStorage.setItem('ai_graph_memory', JSON.stringify({ nodes: finalNodes, edges: allEdges }));

      // Smooth camera shift to frame the parent and newly expanded children
      setTimeout(() => {
        if (parentId) {
          const nodesToFrame = [{ id: parentId }, ...nodesToAdd.map(n => ({ id: n.id }))];
          fitView({ nodes: nodesToFrame, duration: 800, padding: 0.25, maxZoom: 0.9, minZoom: 0.15 });
        } else {
          // Frame main cluster on root generation
          const nodesToFrame = nodesToAdd.map(n => ({ id: n.id }));
          fitView({ nodes: nodesToFrame, duration: 800, padding: 0.25, maxZoom: 0.9, minZoom: 0.15 });
        }
      }, 150); // slight delay to ensure React Flow has mounted the new coordinates

    } catch (error) {
      console.error("Expansion error:", error);
    } finally {
      setLoading(false);
      if (!parentId) setInput('');
    }
  }, [nodes, edges, setNodes, setEdges, toggleChildren, collapsedNodes]);

  const visibleNodes = useMemo(() => {
    // If there's a focused node, calculate its ancestors and descendants
    const connectedIds = new Set();
    if (focusedNodeId) {
      connectedIds.add(focusedNodeId);
      // Find descendants
      const getDescendants = (id) => {
        edges.forEach(e => {
          if (e.source === id && !connectedIds.has(e.target)) {
            connectedIds.add(e.target);
            getDescendants(e.target);
          }
        });
      };
      // Find ancestors
      const getAncestors = (id) => {
        edges.forEach(e => {
          if (e.target === id && !connectedIds.has(e.source)) {
            connectedIds.add(e.source);
            getAncestors(e.source);
          }
        });
      };
      getDescendants(focusedNodeId);
      getAncestors(focusedNodeId);
    }

    return nodes.map(node => {
      const isHidden = hiddenIds.has(node.id);
      const isDimmed = focusedNodeId && !connectedIds.has(node.id);
      const isActive = node.id === focusedNodeId;
      const isConnected = focusedNodeId && connectedIds.has(node.id) && !isActive;

      let zIndex = 1;
      if (isActive) zIndex = 1000;
      else if (isConnected) zIndex = 500;

      let cls = node.className || '';
      if (isDimmed) cls += ' dimmed';
      if (isActive) cls += ' active-node';
      if (isConnected) cls += ' connected-node';

      return {
        ...node,
        hidden: isHidden,
        zIndex: zIndex,
        className: cls.trim(),
        data: {
          ...node.data,
          isCollapsed: collapsedNodes.has(node.id),
          onToggleChildren: toggleChildren,
          onExpand: onExpand
        }
      };
    });
  }, [nodes, hiddenIds, collapsedNodes, toggleChildren, onExpand, focusedNodeId, edges]);

  const visibleEdges = useMemo(() => {
    // Same connection logic for edges
    const connectedIds = new Set();
    if (focusedNodeId) {
      connectedIds.add(focusedNodeId);
      const getDescendants = (id) => {
        edges.forEach(e => {
          if (e.source === id && !connectedIds.has(e.target)) {
            connectedIds.add(e.target);
            getDescendants(e.target);
          }
        });
      };
      const getAncestors = (id) => {
        edges.forEach(e => {
          if (e.target === id && !connectedIds.has(e.source)) {
            connectedIds.add(e.source);
            getAncestors(e.source);
          }
        });
      };
      getDescendants(focusedNodeId);
      getAncestors(focusedNodeId);
    }

    return edges.map(edge => {
      const isHidden = hiddenIds.has(edge.target) || hiddenIds.has(edge.source);
      const isDimmed = focusedNodeId && (!connectedIds.has(edge.source) || !connectedIds.has(edge.target));

      return {
        ...edge,
        hidden: isHidden,
        className: isDimmed ? 'dimmed-edge' : ''
      };
    });
  }, [edges, hiddenIds, focusedNodeId]);

  const clearGraph = useCallback(() => {
    if (window.confirm("Clear all nodes?")) {
      setNodes([]);
      setEdges([]);
      localStorage.removeItem('ai_graph_memory');
      setCollapsedNodes(new Set());
    }
  }, [setNodes, setEdges]);

  const triggerLayout = useCallback(() => {
    const { nodes: lNodes } = getLayoutedElements(nodes, edges, hiddenIds);
    setNodes(lNodes);
  }, [nodes, edges, hiddenIds, setNodes]);

  const clearMemory = useCallback(() => {
    if (window.confirm("This will clear the saved memory and reload. Continue?")) {
      localStorage.removeItem('ai_graph_memory');
      setNodes([]);
      setEdges([]);
      setCollapsedNodes(new Set());
    }
  }, [setNodes, setEdges, setCollapsedNodes]);

  // Context Menu Handlers
  const onNodeContextMenu = useCallback(
    (event, node) => {
      event.preventDefault();
      setContextMenu({
        id: node.id,
        top: event.clientY,
        left: event.clientX,
        node: node,
      });
    },
    [setContextMenu]
  );

  const onPaneClick = useCallback(() => {
    setContextMenu(null);
    setFocusedNodeId(null);
  }, [setContextMenu, setFocusedNodeId]);

  const onNodeClick = useCallback((event, node) => {
    setFocusedNodeId(node.id);
    setCenter(node.position.x, node.position.y, { duration: 400, zoom: 1 });
  }, [setCenter]);

  const handleContextMenuAction = useCallback((action) => {
    if (!contextMenu) return;
    const { id, node } = contextMenu;

    if (action === 'expand') {
      onExpand(node.data.label, id);
    } else if (action === 'explain') {
      alert(`Explanation for: ${node.data.label}\n\n${node.data.desc}\n\n(Future: Opens in dedicated side-chat)`);
    } else if (action === 'edit') {
      const newLabel = prompt("Edit node label:", node.data.label);
      if (newLabel && newLabel.trim() !== '') {
        setNodes(nds => nds.map(n => {
          if (n.id === id) {
            n.data = { ...n.data, label: newLabel };
          }
          return n;
        }));
      }
    } else if (action === 'link') {
      alert("Attach external links logic will go here.");
    } else if (action === 'delete') {
      // Recursive delete
      const idsToDelete = new Set([id]);
      const checkChildren = (parentId) => {
        edges.forEach(e => {
          if (e.source === parentId) {
            idsToDelete.add(e.target);
            checkChildren(e.target);
          }
        });
      };
      checkChildren(id);

      setNodes(nds => nds.filter(n => !idsToDelete.has(n.id)));
      setEdges(eds => eds.filter(e => !idsToDelete.has(e.source) && !idsToDelete.has(e.target)));
      setTimeout(() => fitView({ duration: 800, padding: 0.2 }), 100);
    }
    setContextMenu(null);
  }, [contextMenu, edges, onExpand, setNodes, setEdges, fitView]);

  return (
    <div className="app-container">
      {nodes.length > 0 && <div className="header-hover-zone" />}
      <header className={`glass-header ${nodes.length > 0 ? 'graph-active' : ''}`}>
        <div className="logo">
          <Cpu size={24} className="icon-glow" />
          <span>GEN-AI Graph Explorer</span>
        </div>

        <div className="search-box">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Explore a topic (e.g. LLM Architecture)..."
            onKeyDown={(e) => e.key === 'Enter' && onExpand(input)}
          />
          <button onClick={() => onExpand(input)} disabled={loading}>
            {loading ? <RefreshCcw className="spinning" /> : <Send size={18} />}
          </button>
        </div>

        <div className="actions">
          <button className="btn-icon" onClick={triggerLayout} title="Rearrange Layout">
            <Layout size={18} />
          </button>
          <button className="btn-icon" onClick={clearMemory} title="Reset App Memory">
            <RefreshCcw size={18} />
          </button>
          <button className="btn-icon btn-danger" onClick={clearGraph} title="Clear Current Graph">
            <Trash2 size={18} />
          </button>
        </div>
      </header>

      <ReactFlow
        nodes={visibleNodes}
        edges={visibleEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        onNodeContextMenu={onNodeContextMenu}
        onPaneClick={onPaneClick}
        nodesDraggable={true}
        nodesConnectable={false}
        minZoom={0.15}
        maxZoom={2}
        fitView
        fitViewOptions={{ padding: 0.25, duration: 800, minZoom: 0.15, maxZoom: 0.9 }}
        onNodeDragStop={() => {
          localStorage.setItem('ai_graph_memory', JSON.stringify({ nodes, edges }));
        }}
      >
        <Background color="#222222" variant="dots" gap={20} />
        <Controls />
        <MiniMap
          nodeColor={(n) => n.hidden ? 'transparent' : '#1DCD9F'}
          maskColor="rgba(0,0,0,0.5)"
        />
      </ReactFlow>

      {contextMenu && (
        <div
          className="context-menu"
          style={{ top: contextMenu.top, left: contextMenu.left }}
        >
          <button onClick={() => handleContextMenuAction('expand')}>Expand Nodes</button>
          <button onClick={() => handleContextMenuAction('explain')}>Explain in Detail</button>
          <button onClick={() => handleContextMenuAction('edit')}>Edit Label</button>
          <button onClick={() => handleContextMenuAction('link')}>Link Resource</button>
          <button onClick={() => handleContextMenuAction('delete')} className="delete-action">Delete Branch</button>
        </div>
      )}

      {loading && (
        <div className="loader-container">
          <div className="loader-overlay">
            <Zap className="spinning" size={16} />
            <span>Generating 2-Level Deep Graph...</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function GraphExplorer() {
  return (
    <ReactFlowProvider>
      <GraphExplorerInner />
    </ReactFlowProvider>
  );
}
