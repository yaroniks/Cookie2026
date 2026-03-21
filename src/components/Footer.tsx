import React from 'react';
import { Share2, Download } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#003289] text-white px-4 sm:px-6 border-t border-[#3366CC]/20 mt-auto">
      <div className="max-w-7xl mx-auto py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
            <div className="flex items-center space-x-2 shrink-0">
              <Share2 className="h-5 w-5 text-[#E6FFFF]" />
              <span className="text-lg font-bold tracking-wider uppercase">SparkNews</span>
            </div>
            <p className="text-[11px] sm:text-xs text-blue-100/50 leading-tight max-w-280px border-l-0 sm:border-l sm:border-white/10 sm:pl-6">
                Передовая платформа мониторинга СМИ и соцсетей. SparkNews автоматически строит интерактивный граф знаний, позволяя аналитикам мгновенно 
                находить первоисточники новостей.
            </p>
          </div>

          <button className="flex items-center space-x-3 bg-[#3366CC]/50 hover:bg-[#3366CC] text-white px-4 py-2 rounded-lg transition-all active:scale-95 border border-white/10 group">
            <Download className="h-4 w-4 text-[#E6FFFF]" />
            <div className="text-left">
              <p className="text-[8px] uppercase opacity-60 leading-none">Скачать на</p>
              <p className="text-xs font-bold leading-tight">GitHub</p>
            </div>
          </button>
        </div>

        <div className="mt-6 pt-4 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-3">
          <span className="text-[10px] text-blue-100/30 uppercase tracking-[0.2em]">
            © 2026 SparkNews. Все права защищены.
          </span>
          
          <div className="flex space-x-6">
            <a href="#" className="text-[10px] text-blue-100/30 uppercase tracking-widest hover:text-white transition-colors">Privacy</a>
            <a href="#" className="text-[10px] text-blue-100/30 uppercase tracking-widest hover:text-white transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;