import React, { useState } from 'react';
import { SendHorizontal } from 'lucide-react';

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled }) => {
  const [value, setValue] = useState('');

  const handleSend = () => {
    if (value.trim() && !disabled) {
      onSend(value);
      setValue('');
    }
  };

  return (
    <div className={`bg-white p-3 rounded-3xl shadow-xl flex items-center gap-2 border border-blue-100 transition-all ${disabled ? 'opacity-75' : ''}`}>
      <input
        type="text"
        value={value}
        disabled={disabled}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        placeholder={disabled ? "Ассистент печатает..." : "Спросите меня о чем-нибудь..."}
        className="grow bg-[#D6E6FF]/50 rounded-2xl px-5 py-3 text-sm sm:text-base outline-none text-[#003289] placeholder-[#003289]/50 disabled:cursor-not-allowed"
      />
      <button 
        onClick={handleSend}
        disabled={disabled || !value.trim()}
        className={`p-3 rounded-full transition-all active:scale-90 flex items-center justify-center
          ${disabled || !value.trim() 
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
            : 'bg-[#5C89E8] hover:bg-[#3366CC] text-white'
          }`}
      >
        <SendHorizontal className="w-6 h-6" />
      </button>
    </div>
  );
};

export default ChatInput;