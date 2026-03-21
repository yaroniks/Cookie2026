import React from 'react';

interface ChatSuggestionsProps {
  onSelect: (text: string) => void;
  disabled: boolean;
}

const ChatSuggestions: React.FC<ChatSuggestionsProps> = ({ onSelect, disabled }) => {
  const SUGGESTIONS = [
    "Россия-Украина",
    "Важное за день",
    "Тренды в ИИ"
  ];

  return (
    <div className="flex flex-wrap justify-end gap-2 mb-4 max-w-2xl ml-auto">
      {SUGGESTIONS.map((text, idx) => (
        <button
          key={idx}
          onClick={() => !disabled && onSelect(text)}
          disabled={disabled}
          className={`text-[11px] sm:text-xs font-semibold px-4 py-2 rounded-full transition-all border shadow-sm
            ${disabled 
              ? 'bg-gray-300/50 text-gray-500 border-transparent cursor-not-allowed opacity-50' 
              : 'bg-white/40 hover:bg-white/60 text-[#003289] border-white/20'
            }`}
        >
          {text}
        </button>
      ))}
    </div>
  );
};

export default ChatSuggestions;