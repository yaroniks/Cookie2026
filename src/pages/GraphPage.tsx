import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import GraphView from '../components/graph/GraphView';
import type { Node, Link } from '../components/graph/GraphView';
import GraphControls from '../components/graph/GraphControls';

const typeColors = {
  person: '#60A5FA',
  location: '#34D399',
  organization: '#A78BFA',
  event: '#FBBF24'
};

const mockGraphData = {
  nodes: [
    { id: '1', name: 'Илон Маск', type: 'person', val: 15 },
    { id: '2', name: 'Tesla', type: 'organization', val: 10 },
    { id: '3', name: 'США', type: 'location', val: 12 },
    { id: '4', name: 'SpaceX', type: 'organization', val: 10 },
    { id: '6', name: 'Павел Дуров', type: 'person', val: 14 },
    { id: '7', name: 'Telegram', type: 'organization', val: 11 },
  ] as Node[],
  links: [
    { source: '1', target: '2' },
    { source: '1', target: '3' },
    { source: '1', target: '4' },
    { source: '6', target: '7' },
    { source: '1', target: '6' },
  ] as Link[]
};

const GraphPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedNodes, setSelectedNodes] = useState<Set<string>>(new Set());
  const [highlightNodes, setHighlightNodes] = useState<Set<string>>(new Set());
  const [highlightLinks, setHighlightLinks] = useState<Set<Link>>(new Set());

  const handleNodeClick = useCallback((node: Node) => {
    const newHighlightNodes = new Set<string>();
    const newHighlightLinks = new Set<Link>();

    newHighlightNodes.add(node.id);
    
    mockGraphData.links.forEach(link => {
      const sourceId = typeof link.source === 'object' ? (link.source as Node).id : link.source;
      const targetId = typeof link.target === 'object' ? (link.target as Node).id : link.target;

      if (sourceId === node.id || targetId === node.id) {
        newHighlightLinks.add(link);
        newHighlightNodes.add(sourceId);
        newHighlightNodes.add(targetId);
      }
    });

    setHighlightNodes(newHighlightNodes);
    setHighlightLinks(newHighlightLinks);

    setSelectedNodes(prev => {
      const next = new Set(prev);
      if (next.has(node.name)) {
        next.delete(node.name);
      } else {
        next.add(node.name);
      }
      return next;
    });
  }, []);

  const handleSearch = () => {
    const query = Array.from(selectedNodes).join(' ');
    navigate(`/?search=${encodeURIComponent(query)}`);
  };

  return (
    <div className="h-screen w-full bg-[#0f172a] overflow-hidden flex flex-col relative">
      <GraphControls 
        selectedNodes={selectedNodes}
        onBack={() => navigate(-1)}
        onSearch={handleSearch}
        typeColors={typeColors}
      />
      <GraphView 
        data={mockGraphData}
        highlightNodes={highlightNodes}
        highlightLinks={highlightLinks}
        selectedNodes={selectedNodes}
        onNodeClick={handleNodeClick}
        typeColors={typeColors}
      />
    </div>
  );
};

export default GraphPage;