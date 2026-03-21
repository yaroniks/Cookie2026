import React, { useEffect } from 'react';
import { X, Clock, Globe, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

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
        <button onClick={onClose} className="absolute z-10 p-2 rounded-full top-4 right-4 bg-black/5 hover:bg-black/10">
          <X className="w-5 h-5 text-gray-700" />
        </button>

        <div className="p-6 overflow-y-auto sm:p-8">
          <div className="flex items-center gap-4 mb-4 text-sm font-medium text-gray-500">
            <span className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full">
              <Globe className="w-4 h-4" />
              {article.source || 'SparkNews'}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {formatDateTime(article.time)}
            </span>
          </div>

          <h2 className="mb-6 text-2xl font-extrabold text-gray-900 sm:text-3xl">{article.title}</h2>

          {article.imageUrl && (
            <div className="mb-6 overflow-hidden border border-gray-200 rounded-xl">
              <img src={article.imageUrl} alt="" className="object-cover w-full max-h-100" />
            </div>
          )}

          <div className="mb-8 text-lg leading-relaxed text-gray-700">{article.excerpt}</div>

          {article.entities && article.entities.length > 0 && (
            <div className="pt-6 mt-8 border-t border-gray-200">
              <h3 className="flex items-center gap-2 mb-4 text-lg font-bold text-gray-900">
                <Tag className="w-5 h-5 text-[#3366CC]" /> Сущности:
              </h3>
              <div className="flex flex-wrap gap-2">
                {article.entities.map((entity, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => {
                      onClose();
                      navigate(`/graph?active=${encodeURIComponent(entity.name)}`);
                    }}
                    className={`px-3 py-1.5 border rounded-lg text-sm font-semibold transition-transform active:scale-95 ${entityColors[entity.type]}`}
                  >
                    {entity.name}
                  </button>
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