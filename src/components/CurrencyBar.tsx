import React, { useEffect, useState } from 'react';
import { fetchCurrencies, type Currency } from '../api/currencies';
import { TrendingUp } from 'lucide-react';

const TARGET_CURRENCIES: Record<string, string> = {
  "USD": "Доллар",
  "EUR": "Евро",
  "GBP": "Фунт",
  "CNY": "Юань",
  "UAH": "Гривна",
};

const CurrencyBar: React.FC = () => {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getCurrencies = async () => {
      const data = await fetchCurrencies();
      const filtered = data.filter((c: Currency) => TARGET_CURRENCIES[c.char_code]);
      setCurrencies(filtered);
      setIsLoading(false);
    };
    getCurrencies();
  }, []);

  if (isLoading || currencies.length === 0) return null;

  return (
    <div className="w-full mb-8 overflow-hidden">
      <div className="flex flex-wrap items-center justify-center gap-4 px-6 py-4 border shadow-lg bg-white/30 backdrop-blur-md rounded-2xl border-white/40">
        <div className="items-center hidden gap-2 pr-4 border-r md:flex border-white/20">
          <span className="text-[10px] font-black text-blue-800 uppercase tracking-tighter">Курсы валют</span>
        </div>
        
        {currencies.map((curr) => (
          <div key={curr.char_code} className="flex items-center gap-3 px-3 py-1">
            <span className="text-sm font-black text-slate-800">{curr.char_code}</span>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-blue-900">
                {curr.value.toFixed(2)} ₽
              </span>
              <span className="text-[9px] text-slate-600 font-medium uppercase opacity-70">
                {TARGET_CURRENCIES[curr.char_code]}
              </span>
            </div>
            <TrendingUp size={14} className="text-blue-600 opacity-50" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CurrencyBar;