import React, { useState, useRef, useEffect } from 'react';
import { Search, ArrowLeft, X } from 'lucide-react';
import type { Node } from './GraphView';

interface GraphControlsProps {
  selectedNodes: Set<string>;
  onBack: () => void;
  onSearch: () => void;
  typeColors: Record<string, string>;
  nodes: Node[];
  onNodeSelect: (node: Node) => void;
}

const GraphControls: React.FC<GraphControlsProps> = ({ 
  selectedNodes, 
  onBack, 
  onSearch, 
  typeColors,
  nodes,
  onNodeSelect
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filteredNodes = searchQuery.trim() 
    ? nodes.filter(n => n.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 10)
    : [];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // ИСправлено: Явно указываем globalThis.Node, чтобы избежать конфликта с нашим типом Node графа
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as globalThis.Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="absolute z-10 flex flex-col gap-4 top-6 left-6 w-72">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 px-4 py-2 text-white transition-all border bg-white/10 hover:bg-white/20 rounded-xl backdrop-blur-md border-white/10 w-fit"
      >
        <ArrowLeft size={18} /> Назад
      </button>

      <div className="flex-col hidden p-5 text-white border shadow-2xl md:flex bg-slate-900/80 backdrop-blur-xl border-white/10 rounded-2xl">
        <h1 className="mb-1 text-xl italic font-black tracking-tight text-blue-400 uppercase">Связи</h1>
        <p className="text-[10px] text-slate-400 mb-6 uppercase tracking-widest">Интерактивный анализ</p>
        
        <div className="relative mb-6" ref={wrapperRef}>
          <div className="relative flex items-center">
            <Search size={14} className="absolute left-3 text-slate-400" />
            <input
              type="text"
              placeholder="Поиск узла..."
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setShowResults(true);
              }}
              onFocus={() => setShowResults(true)}
              className="w-full py-2.5 pl-9 pr-8 text-sm text-white transition-colors border bg-slate-800/50 border-white/10 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-slate-800"
            />
            {searchQuery && (
              <X
                size={14}
                className="absolute transition-colors cursor-pointer right-3 text-slate-400 hover:text-white"
                onClick={() => {
                  setSearchQuery('');
                  setShowResults(false);
                }}
              />
            )}
          </div>

          {showResults && filteredNodes.length > 0 && (
            <div className="absolute z-20 w-full mt-2 overflow-y-auto border shadow-xl max-h-48 bg-slate-800 border-white/10 rounded-xl animate-in fade-in slide-in-from-top-2">
              {filteredNodes.map(node => (
                <div
                  key={node.id}
                  onClick={() => {
                    onNodeSelect(node);
                    setSearchQuery('');
                    setShowResults(false);
                  }}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm cursor-pointer hover:bg-slate-700 transition-colors"
                >
                  <div 
                    className="w-2 h-2 rounded-full shrink-0 shadow-[0_0_5px] shadow-current" 
                    style={{ backgroundColor: typeColors[node.type], color: typeColors[node.type] }} 
                  />
                  <span className="truncate">{node.name}</span>
                </div>
              ))}
            </div>
          )}
          
          {showResults && searchQuery.trim() && filteredNodes.length === 0 && (
            <div className="absolute z-20 w-full p-3 mt-2 text-sm text-center border shadow-xl text-slate-400 bg-slate-800 border-white/10 rounded-xl">
              Ничего не найдено
            </div>
          )}
        </div>

        <div className="mb-8 space-y-3">
          {Object.entries(typeColors).map(([type, color]) => (
            <div key={type} className="flex items-center gap-3 text-[10px] font-bold tracking-tighter opacity-70">
              <div className="w-2 h-2 rounded-full shadow-[0_0_8px] shadow-current" style={{ backgroundColor: color, color: color }} />
              <span className="uppercase">{type}</span>
            </div>
          ))}
        </div>

        {selectedNodes.size > 0 && (
          <div className="pt-4 space-y-4 border-t border-white/10 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex flex-wrap gap-1">
              {Array.from(selectedNodes).map(name => (
                <span key={name} className="bg-blue-600 text-white px-2 py-1 rounded text-[10px] font-bold">
                  {name}
                </span>
              ))}
            </div>
            <button 
              onClick={onSearch}
              className="flex items-center justify-center w-full gap-2 py-3 font-black text-white transition-all transform bg-blue-500 hover:bg-blue-400 rounded-xl active:scale-95"
            >
              <Search size={16} /> ИСКАТЬ НОВОСТИ
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GraphControls;