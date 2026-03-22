import React from 'react';
import { MessageSquareText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ChatToggle: React.FC = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate('/chat')}
      className="fixed bottom-8 right-8 z-50 flex items-center justify-center cursor-pointer w-16 h-16 bg-[#5C89E8] text-white rounded-full shadow-2xl hover:bg-[#3366CC] hover:scale-110 active:scale-95 transition-all duration-300 group"
      aria-label="Открыть чат"
    >
      <span className="absolute inset-0 rounded-full bg-[#5C89E8] animate-ping opacity-20 group-hover:opacity-40"></span>
      
      <MessageSquareText className="relative z-10 w-8 h-8" />
      
      <span className="absolute right-20 bg-[#5C89E8] text-white text-xs font-bold px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg">
        Спросить AI-ассистента
      </span>
    </button>
  );
};

export default ChatToggle;