import React from 'react';
import { MicIcon, SparklesIcon } from './Icons';

interface LockScreenProps {
  onStartSession: () => void;
  isProcessing: boolean;
  error: string | null;
}

export const LockScreen: React.FC<LockScreenProps> = ({ onStartSession, isProcessing, error }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-6 animate-scale-up">
      <div className="flex items-center gap-2 text-3xl md:text-4xl font-bold text-accent mb-2">
         <SparklesIcon className="w-8 h-8"/>
         <h1>Alexa Voice Assistant</h1>
      </div>
      <p className="text-light-text-secondary dark:text-dark-text-secondary mb-12">
        Tap the microphone to start a conversation.
      </p>

      <button
        onClick={onStartSession}
        disabled={isProcessing}
        className="relative w-28 h-28 md:w-36 md:h-36 rounded-full bg-accent text-white flex items-center justify-center shadow-lg transform transition-transform duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-accent/50 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Start voice session"
      >
        {isProcessing ? (
          <div className="w-10 h-10 border-4 border-white/50 border-t-white rounded-full animate-spin"></div>
        ) : (
          <MicIcon className="w-12 h-12 md:w-16 md:h-16" />
        )}
        <span className="absolute w-full h-full rounded-full bg-accent/50 animate-pulse-slow -z-10"></span>
      </button>

      {error && (
        <div className="mt-8 p-4 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-lg max-w-md">
          <p className="font-semibold">An error occurred:</p>
          <p className="text-sm">{error}</p>
        </div>
      )}
       <footer className="absolute bottom-4 text-xs text-light-text-secondary dark:text-dark-text-secondary">
        Powered by Gemini API
      </footer>
    </div>
  );
};