
import React from 'react';

export const ListeningIndicator: React.FC = () => {
  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <div className="absolute w-full h-full bg-accent/20 rounded-full animate-pulse"></div>
      <div className="absolute w-3/4 h-3/4 bg-accent/40 rounded-full animate-pulse [animation-delay:-0.5s]"></div>
      <div className="w-1/2 h-1/2 bg-accent rounded-full shadow-lg"></div>
    </div>
  );
};
