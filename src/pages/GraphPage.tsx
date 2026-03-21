import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import GraphView from '../components/graph/GraphView';
import type { Node, Link, NodeType } from '../components/graph/GraphView';
import GraphControls from '../components/graph/GraphControls';
import api from '../lib/axios';

interface BackendNode {
  id: string;
  label: string;
  type: string;
}

interface BackendEdge {
  source: string;
  target: string;
  weight: number;
}

interface GraphResponse {
  nodes: BackendNode[];
  edges: BackendEdge[];
}

const typeColors: Record<string, string> = {
  person: '#60A5FA',
  location: '#34D399',
  organization: '#A78BFA',
  event: '#FBBF24'
};

const VALID_TYPES: NodeType[] = ['person', 'location', 'organization', 'event'];

const GraphPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeName = searchParams.get('active');

  const [graphData, setGraphData] = useState<{ nodes: Node[]; links: Link[] }>({ nodes: [], links: [] });
  const [isLoading, setIsLoading] = useState(true);

  const [selectedNodes, setSelectedNodes] = useState<Set<string>>(new Set());
  const [highlightNodes, setHighlightNodes] = useState<Set<string>>(new Set());
  const [highlightLinks, setHighlightLinks] = useState<Set<Link>>(new Set());

  // Сброс всех выделений
  const resetSelection = useCallback(() => {
    setSelectedNodes(new Set());
    setHighlightNodes(new Set());
    setHighlightLinks(new Set());
  }, []);

  // Обработка клавиши ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        resetSelection();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [resetSelection]);

  const getHighlightData = useCallback((targetNode: Node, allLinks: Link[]) => {
    const hNodes = new Set<string>();
    const hLinks = new Set<Link>();

    hNodes.add(targetNode.id);
    allLinks.forEach(link => {
      const sId = typeof link.source === 'object' ? (link.source as Node).id : link.source;
      const tId = typeof link.target === 'object' ? (link.target as Node).id : link.target;

      if (sId === targetNode.id || tId === targetNode.id) {
        hLinks.add(link);
        hNodes.add(sId);
        hNodes.add(tId);
      }
    });
    return { hNodes, hLinks };
  }, []);

  useEffect(() => {
    const fetchGraph = async () => {
      try {
        setIsLoading(true);
        const { data } = await api.get<GraphResponse>('/graph/co-occurrences');

        const nodesMap = new Map<string, Node>();
        data.nodes.forEach(n => {
          if (n.id !== "None" && n.label !== "None") {
            const rawType = n.type.toLowerCase() as NodeType;
            const safeType = VALID_TYPES.includes(rawType) ? rawType : 'event';
            
            nodesMap.set(n.id, {
              id: n.id,
              name: n.label,
              type: safeType,
              val: 10
            });
          }
        });

        const links: Link[] = data.edges
          .filter(e => e.source !== "None" && e.target !== "None" && nodesMap.has(e.source) && nodesMap.has(e.target))
          .map(e => ({
            source: e.source,
            target: e.target
          }));

        const nodesArray = Array.from(nodesMap.values());
        setGraphData({ nodes: nodesArray, links });

        if (activeName) {
          const target = nodesArray.find(n => n.name === activeName);
          if (target) {
            const { hNodes, hLinks } = getHighlightData(target, links);
            setHighlightNodes(hNodes);
            setHighlightLinks(hLinks);
            setSelectedNodes(new Set([target.name]));
          }
        }
      } catch (err) {
        console.error("Failed to fetch graph:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGraph();
  }, [activeName, getHighlightData]);

  const handleNodeClick = useCallback((node: Node) => {
    const { hNodes, hLinks } = getHighlightData(node, graphData.links);
    setHighlightNodes(hNodes);
    setHighlightLinks(hLinks);

    setSelectedNodes(prev => {
      const next = new Set(prev);
      if (next.has(node.name)) {
        next.delete(node.name);
      } else {
        next.add(node.name);
      }
      return next;
    });
  }, [getHighlightData, graphData.links]);

  const handleSearch = () => {
    if (selectedNodes.size === 0) return;
    const query = Array.from(selectedNodes).join(' ');
    navigate(`/?search=${encodeURIComponent(query)}`);
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full bg-[#0f172a] flex items-center justify-center font-mono text-blue-400">
        <span className="animate-pulse">LOADING_DATA...</span>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-[#0f172a] overflow-hidden flex flex-col relative">
      <GraphControls 
        selectedNodes={selectedNodes}
        onBack={() => navigate(-1)}
        onSearch={handleSearch}
        typeColors={typeColors}
      />
      <GraphView 
        data={graphData}
        highlightNodes={highlightNodes}
        highlightLinks={highlightLinks}
        selectedNodes={selectedNodes}
        onNodeClick={handleNodeClick}
        onBackgroundClick={resetSelection}
        typeColors={typeColors}
      />
    </div>
  );
};

export default GraphPage;