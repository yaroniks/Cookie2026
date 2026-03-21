import React, { useState, useEffect, useRef } from 'react';
import MessageBubble from '../components/chat/MessageBubble';
import ChatSuggestions from '../components/chat/ChatSuggestions';
import ChatInput from '../components/chat/ChatInput';
import { sendMessageStream } from '../api/chat';

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState([
    { text: "Привет! Я SparkNews AI. О чем хочешь узнать?", isAi: true }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    if (isLoading) return;

    setMessages(prev => [...prev, { text, isAi: false }]);
    setMessages(prev => [...prev, { text: "", isAi: true }]);
    
    setIsLoading(true);

    try {
      await sendMessageStream(text, (chunk) => {
        setMessages(prev => {
          const newMessages = [...prev];
          const lastIdx = newMessages.length - 1;
          newMessages[lastIdx] = { 
            ...newMessages[lastIdx], 
            text: newMessages[lastIdx].text + chunk 
          };
          return newMessages;
        });
      });
    } catch (error) {
      console.error(error);
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1].text = "Произошла ошибка при получении ответа.";
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#a5bef4] min-h-[calc(100vh-64px)] flex flex-col items-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-4xl flex flex-col h-[85vh]">
        
        <div className="grow overflow-y-auto mb-6 pr-2 custom-scrollbar">
          {messages.map((msg, idx) => (
            <MessageBubble key={idx} text={msg.text} isAi={msg.isAi} />
          ))}
          
          {isLoading && messages[messages.length - 1].text === "" && (
            <div className="flex justify-start mb-4">
              <div className="bg-white/50 px-4 py-2 rounded-2xl animate-pulse text-blue-800 text-xs font-bold">
                Печатаю ответ...
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <div className="mt-auto">
          <ChatSuggestions onSelect={handleSendMessage} disabled={isLoading} />
          <ChatInput onSend={handleSendMessage} disabled={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;