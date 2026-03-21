import React from 'react';
import ReactMarkdown from 'react-markdown';

interface MessageProps {
  text: string;
  isAi: boolean;
}

const MessageBubble: React.FC<MessageProps> = ({ text, isAi }) => {
  return (
    <div className={`flex ${isAi ? 'justify-start' : 'justify-end'} mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300`}>
      <div
        className={`max-w-[85%] px-5 py-3 rounded-2xl shadow-sm ${
          isAi
            ? 'bg-white text-slate-800 rounded-tl-none border border-blue-100'
            : 'bg-[#3366CC] text-white rounded-tr-none'
        }`}
      >
        <div className="markdown-content text-sm sm:text-base leading-relaxed">
          <ReactMarkdown
            components={{

              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
              ul: ({ children }) => <ul className="list-disc ml-4 mb-2">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal ml-4 mb-2">{children}</ol>,
              li: ({ children }) => <li className="mb-1">{children}</li>,
              strong: ({ children }) => <strong className="font-bold">{children}</strong>,
              code: ({ children }) => <code className="bg-gray-100 px-1 rounded text-pink-600 font-mono text-sm">{children}</code>,
            }}
          >
            {text}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;