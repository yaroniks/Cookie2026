import React, { useState, useEffect } from 'react';
import { Search, Filter, ChevronDown, X } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { fetchNews } from '../api/news';

const Header: React.FC = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
// Категории для фильтров
  useEffect(() => {
    const getCategories = async () => {
      try {
        const news = await fetchNews();
        const uniqueCategories = Array.from(new Set(news.map(item => item.category)));
        setCategories(uniqueCategories);
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    };
    getCategories();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchValue.trim()) {
      params.set('search', searchValue.trim());
    } else {
      params.delete('search');
    }
    navigate(`/?${params.toString()}`);
  };

  const handleCategorySelect = (category: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (category) {
      params.set('category', category);
    } else {
      params.delete('category');
    }
    setIsFilterOpen(false);
    navigate(`/?${params.toString()}`);
  };

  return (
    <header className="bg-[#003289] h-16 flex items-center justify-between px-4 sm:px-6 shadow-md w-full gap-2 sm:gap-6 relative z-50">
      <div className="shrink-0">
        <Link to="/">
          <span className="hidden text-2xl font-extrabold tracking-wider text-white sm:block">
            SparkNews
          </span>
        </Link>
      </div>

      <form onSubmit={handleSearch} className="relative flex-1 max-w-2xl">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="w-4 h-4 text-gray-300 sm:h-5 sm:w-5" />
        </div>
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="w-full bg-white/10 border border-[#3366CC] rounded-lg py-2 pl-9 sm:pl-10 pr-3 sm:pr-4 text-sm sm:text-base text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E6FFFF]/50 transition-all"
          placeholder="Поиск..."
        />
      </form>
      
      <div className="relative shrink-0">
        <button 
          onClick={() => setIsFilterOpen(!isFilterOpen)} 
          className={`flex items-center cursor-pointer justify-center bg-[#3366CC] hover:bg-blue-600 text-white p-2 sm:px-5 sm:py-2 rounded-lg transition-colors font-medium sm:space-x-2 ${isFilterOpen ? 'ring-2 ring-white' : ''}`}
        >
          <Filter className="w-5 h-5 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Фильтры</span>
          <ChevronDown className={`hidden sm:block h-4 w-4 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
        </button>

        {isFilterOpen && (
          <div className="absolute right-0 w-56 py-2 mt-2 overflow-hidden duration-200 bg-white border border-gray-200 shadow-2xl rounded-xl animate-in fade-in zoom-in">
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
              <span className="font-bold text-[#003289] text-sm uppercase">Категории</span>
              <button onClick={() => handleCategorySelect(null)} className="text-gray-400 hover:text-red-500">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-y-auto max-h-64">
              <button
                onClick={() => handleCategorySelect(null)}
                className="w-full px-4 py-2 text-sm text-left text-gray-700 transition-colors hover:bg-blue-50"
              >
                Все категории
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategorySelect(cat)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 transition-colors ${
                    searchParams.get('category') === cat ? 'bg-blue-100 text-[#003289] font-bold' : 'text-gray-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;