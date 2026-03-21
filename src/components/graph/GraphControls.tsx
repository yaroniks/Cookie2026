import React from 'react';
import { Search, ArrowLeft } from 'lucide-react';

interface GraphControlsProps {
  selectedNodes: Set<string>;
  onBack: () => void;
  onSearch: () => void;
  typeColors: Record<string, string>;
}

const GraphControls: React.FC<GraphControlsProps> = ({ 
  selectedNodes, 
  onBack, 
  onSearch, 
  typeColors 
}) => {
  return (
    <div className="absolute top-6 left-6 z-10 flex flex-col gap-4 w-72">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl backdrop-blur-md border border-white/10 transition-all w-fit"
      >
        <ArrowLeft size={18} /> Назад
      </button>

      <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 p-5 rounded-2xl text-white shadow-2xl">
        <h1 className="text-xl font-black mb-1 tracking-tight uppercase italic text-blue-400">Связи</h1>
        <p className="text-[10px] text-slate-400 mb-6 uppercase tracking-widest">Интерактивный анализ</p>
        
        <div className="space-y-3 mb-8">
          {Object.entries(typeColors).map(([type, color]) => (
            <div key={type} className="flex items-center gap-3 text-[10px] font-bold tracking-tighter opacity-70">
              <div className="w-2 h-2 rounded-full shadow-[0_0_8px] shadow-current" style={{ backgroundColor: color, color: color }} />
              <span className="uppercase">{type}</span>
            </div>
          ))}
        </div>

        {selectedNodes.size > 0 && (
          <div className="space-y-4 pt-4 border-t border-white/10 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex flex-wrap gap-1">
              {Array.from(selectedNodes).map(name => (
                <span key={name} className="bg-blue-600 text-white px-2 py-1 rounded text-[10px] font-bold">
                  {name}
                </span>
              ))}
            </div>
            <button 
              onClick={onSearch}
              className="w-full bg-blue-500 hover:bg-blue-400 text-white font-black py-3 rounded-xl flex items-center justify-center gap-2 transition-all transform active:scale-95"
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