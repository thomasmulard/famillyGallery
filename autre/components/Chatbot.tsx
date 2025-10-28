
import React, { useState, useRef, useEffect } from 'react';
import { sendMessageToGemini } from '../services/geminiService';
import type { ChatMessage } from '../types';
import { Role } from '../types';
import { ChatBubble } from './ChatBubble';
import { SendIcon, CloseIcon, BrainIcon } from './icons';

interface ChatbotProps {
  onClose: () => void;
}

const ThinkingModeToggle: React.FC<{ isThinkingMode: boolean; onChange: (checked: boolean) => void }> = ({ isThinkingMode, onChange }) => (
    <div className="flex items-center space-x-2">
      <BrainIcon className={`w-5 h-5 transition-colors ${isThinkingMode ? 'text-amber-500' : 'text-stone-400'}`} />
      <span className={`text-sm font-medium ${isThinkingMode ? 'text-stone-800 dark:text-stone-200' : 'text-stone-500 dark:text-stone-400'}`}>Mode Pensée</span>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={isThinkingMode}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-stone-200 dark:bg-slate-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-amber-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
      </label>
    </div>
);

export const Chatbot: React.FC<ChatbotProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: Role.MODEL, text: "Bonjour! Posez-moi une question sur cette famille ou n'importe quoi d'autre." }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isThinkingMode, setIsThinkingMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: Role.USER, text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await sendMessageToGemini(input, isThinkingMode);
      const modelMessage: ChatMessage = { role: Role.MODEL, text: responseText };
      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = { role: Role.MODEL, text: "Désolé, une erreur s'est produite." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-[calc(100vw-2rem)] sm:w-96 h-[70vh] max-h-[600px] bg-white dark:bg-slate-800 text-stone-800 dark:text-stone-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden border-2 border-amber-100 dark:border-slate-700 animate-fade-in-up">
      <header className="flex items-center justify-between p-3 border-b border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800/50">
        <div className="flex-grow">
            <ThinkingModeToggle isThinkingMode={isThinkingMode} onChange={setIsThinkingMode} />
        </div>
        <button onClick={onClose} className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1 rounded-full hover:bg-stone-200 dark:hover:bg-slate-600 transition-colors">
          <CloseIcon className="w-6 h-6" />
        </button>
      </header>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50/50 dark:bg-slate-900/50">
        {messages.map((msg, index) => (
          <ChatBubble key={index} message={msg} />
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-stone-200 dark:bg-slate-700 text-stone-800 dark:text-stone-200 p-3 rounded-2xl rounded-bl-none max-w-xs animate-pulse">
              ...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <form onSubmit={handleSend} className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Posez votre question..."
            className="flex-1 w-full px-4 py-2 bg-stone-100 dark:bg-slate-700 border border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white dark:focus:bg-slate-600 transition"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="p-3 bg-amber-500 text-white rounded-full transition-colors hover:bg-amber-600 disabled:bg-stone-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed"
          >
            <SendIcon className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
