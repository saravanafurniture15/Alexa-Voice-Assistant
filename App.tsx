
import React, { useEffect } from 'react';
import { useVoiceAssistant } from './hooks/useVoiceAssistant';
import { LockScreen } from './components/LockScreen';
import { ConversationView } from './components/ConversationView';
import { Theme } from './types';

const App: React.FC = () => {
  const {
    theme,
    isSessionActive,
    isProcessing,
    transcript,
    error,
    startSession,
    stopSession,
  } = useVoiceAssistant();

  useEffect(() => {
    if (theme === Theme.Dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div className={`w-full h-screen overflow-hidden font-sans bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text transition-colors duration-300`}>
      <main className="max-w-2xl mx-auto h-full flex flex-col">
        {isSessionActive ? (
          <ConversationView
            transcript={transcript}
            onStopSession={stopSession}
            isProcessing={isProcessing}
          />
        ) : (
          <LockScreen onStartSession={startSession} isProcessing={isProcessing} error={error} />
        )}
      </main>
    </div>
  );
};

export default App;
