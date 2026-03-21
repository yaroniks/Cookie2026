import React, { useState } from 'react';
import { Search, Filter, ChevronDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/?search=${encodeURIComponent(searchValue.trim())}`);
    } else {
      navigate('/');
    }
  };

  return (
    <header className="bg-[#003289] h-16 flex items-center justify-between px-4 sm:px-6 shadow-md w-full gap-2 sm:gap-6">
      <div className="shrink-0">
        <Link to="/">
          <span className="hidden sm:block text-2xl font-extrabold text-white tracking-wider">
            SparkNews
          </span>
        </Link>
      </div>

      <form onSubmit={handleSearch} className="flex-1 max-w-2xl relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-300" />
        </div>
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="w-full bg-white/10 border border-[#3366CC] rounded-lg py-2 pl-9 sm:pl-10 pr-3 sm:pr-4 text-sm sm:text-base text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E6FFFF]/50 transition-all"
          placeholder="Поиск..."
        />
      </form>
      
      <div className="shrink-0 relative">
         <button onClick={() => setIsFilterOpen(!isFilterOpen)} className="flex items-center justify-center bg-[#3366CC] hover:bg-blue-600 text-white p-2 sm:px-5 sm:py-2 rounded-lg transition-colors font-medium sm:space-x-2">
            <Filter className="h-5 w-5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Фильтры</span>
            <ChevronDown className={`hidden sm:block h-4 w-4 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
         </button>
      </div>
    </header>
  );
};

export default Header;