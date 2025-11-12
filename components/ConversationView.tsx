import React, { useRef, useEffect } from 'react';
import { Message } from '../types';
import { ListeningIndicator } from './ListeningIndicator';

interface ConversationViewProps {
  transcript: Message[];
  onStopSession: () => void;
  isProcessing: boolean;
}

const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
  const isUser = message.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 animate-scale-up`}>
      <div
        className={`max-w-xs md:max-w-md px-4 py-3 rounded-2xl ${
          isUser
            ? 'bg-accent text-white rounded-br-none'
            : 'bg-light-card dark:bg-dark-card rounded-bl-none'
        }`}
      >
        <p className="text-sm">{message.text}</p>
      </div>
    </div>
  );
};

export const ConversationView: React.FC<ConversationViewProps> = ({ transcript, onStopSession, isProcessing }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript]);

  return (
    <div className="flex flex-col h-full">
      <header className="flex-shrink-0 p-4 border-b border-light-bg dark:border-dark-card flex justify-between items-center">
         <h1 className="text-xl font-bold text-accent">Alexa Assistant</h1>
         <button
            onClick={onStopSession}
            disabled={isProcessing}
            className="px-4 py-2 text-sm font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 disabled:opacity-50"
         >
            {isProcessing ? 'Stopping...' : 'End Session'}
         </button>
      </header>

      <div ref={scrollRef} className="flex-grow p-4 overflow-y-auto">
        {transcript.length === 0 && (
            <div className="text-center text-light-text-secondary dark:text-dark-text-secondary pt-16">
                <p>Listening... Say something to begin.</p>
            </div>
        )}
        {transcript.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
      </div>
      
      <div className="flex-shrink-0 p-4 flex justify-center items-center h-32">
        <ListeningIndicator />
      </div>
    </div>
  );
};