import React, { useEffect } from 'react';
import { X, Clock, Globe, Tag } from 'lucide-react';

export interface Entity {
  name: string;
  type: 'person' | 'location' | 'organization' | 'event';
}

export interface NewsDetail {
  title: string;
  excerpt: string;
  time: string;
  imageUrl?: string;
  source?: string;
  entities?: Entity[];
}

interface NewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  article: NewsDetail | null;
}

const NewsModal: React.FC<NewsModalProps> = ({ isOpen, onClose, article }) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen || !article) return null;

  const formatDateTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return isoString;
      return new Intl.DateTimeFormat('ru-RU', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      }).format(date).replace(',', '');
    } catch (e) {
        console.log(e)
      return isoString;
    }
  };

  const entityColors = {
    person: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200',
    location: 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200',
    organization: 'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200',
    event: 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200',
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-black/5 hover:bg-black/10 rounded-full z-10">
          <X className="w-5 h-5 text-gray-700" />
        </button>

        <div className="overflow-y-auto p-6 sm:p-8">
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4 font-medium">
            <span className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full">
              <Globe className="w-4 h-4" />
              {article.source || 'SparkNews'}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {formatDateTime(article.time)}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-6">{article.title}</h2>

          {article.imageUrl && (
            <div className="mb-6 rounded-xl overflow-hidden border border-gray-200">
              <img src={article.imageUrl} alt="" className="w-full max-h-100 object-cover" />
            </div>
          )}

          <div className="text-gray-700 text-lg leading-relaxed mb-8">{article.excerpt}</div>

          {article.entities && article.entities.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-4">
                <Tag className="w-5 h-5 text-[#3366CC]" /> Сущности:
              </h3>
              <div className="flex flex-wrap gap-2">
                {article.entities.map((entity, idx) => (
                  <div key={idx} className={`px-3 py-1.5 border rounded-lg text-sm font-semibold cursor-pointer ${entityColors[entity.type]}`}>
                    {entity.name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewsModal;