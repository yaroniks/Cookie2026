import React from 'react';
import ForceGraph2D from 'react-force-graph-2d';

export interface Node {
  id: string;
  name: string;
  type: 'person' | 'location' | 'organization' | 'event';
  val: number;
  x?: number;
  y?: number;
}

export interface Link {
  source: string | Node;
  target: string | Node;
}

interface GraphViewProps {
  data: { nodes: Node[]; links: Link[] };
  highlightNodes: Set<string>;
  highlightLinks: Set<Link>;
  selectedNodes: Set<string>;
  onNodeClick: (node: Node) => void;
  typeColors: Record<string, string>;
}

const GraphView: React.FC<GraphViewProps> = ({ 
  data, 
  highlightNodes, 
  highlightLinks, 
  selectedNodes, 
  onNodeClick, 
  typeColors 
}) => {
  return (
    <div className="grow cursor-crosshair">
      <ForceGraph2D
        graphData={data}
        nodeLabel="name"
        nodeCanvasObject={(obj, ctx, globalScale) => {
          const node = obj as Node;
          const label = node.name;
          const fontSize = 12 / globalScale;
          ctx.font = `${fontSize}px Inter, sans-serif`;
          
          const isHighlighted = highlightNodes.size === 0 || highlightNodes.has(node.id);
          const isSelected = selectedNodes.has(node.name);
          const alpha = isHighlighted ? 1 : 0.1;

          if (node.x !== undefined && node.y !== undefined) {
            // Рисуем основной круг
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.val / 2, 0, 2 * Math.PI, false);
            ctx.fillStyle = isSelected ? '#fff' : (typeColors[node.type] || '#fff');
            ctx.globalAlpha = alpha;
            ctx.fill();

            // Обводка для выбранных
            if (isSelected) {
              ctx.strokeStyle = '#3B82F6';
              ctx.lineWidth = 2 / globalScale;
              ctx.stroke();
            }

            // Текст
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.fillText(label, node.x, node.y + (node.val / 2) + 4);
          }
          ctx.globalAlpha = 1;
        }}
        linkColor={(linkObj) => {
          const link = linkObj as Link;
          if (highlightLinks.size === 0) return 'rgba(255,255,255,0.2)';
          return highlightLinks.has(link) ? '#3B82F6' : 'rgba(255,255,255,0.02)';
        }}
        linkWidth={(linkObj) => highlightLinks.has(linkObj as Link) ? 2 : 1}
        onNodeClick={(node) => onNodeClick(node as Node)}
        backgroundColor="#0f172a"
      />
    </div>
  );
};

export default GraphView;