
import React from 'react';

type IconProps = React.SVGProps<SVGSVGElement>;

export const MicIcon: React.FC<IconProps> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Zm0 12.5a3.5 3.5 0 0 1-3.5-3.5V5a3.5 3.5 0 0 1 7 0v6a3.5 3.5 0 0 1-3.5 3.5Z" />
    <path d="M10 5a2 2 0 0 1 4 0v6a2 2 0 0 1-4 0V5Z" />
    <path d="M12 14a1 1 0 0 1 1 1v2a1 1 0 0 1-2 0v-2a1 1 0 0 1 1-1Z" />
    <path d="M19 11a1 1 0 0 0-1 1a6 6 0 0 1-12 0a1 1 0 0 0-2 0a8 8 0 0 0 7 7.93V21a1 1 0 0 0 2 0v-1.07A8 8 0 0 0 19 12a1 1 0 0 0-1-1Z" />
  </svg>
);


export const SparklesIcon: React.FC<IconProps> = (props) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="currentColor" 
        {...props}
    >
        <path fillRule="evenodd" d="M9 4.5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5a.75.75 0 0 1 .75-.75Zm6.5 8.25a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
        <path fillRule="evenodd" d="M12.555 1.332a.75.75 0 0 1 1.06 0l2.806 2.805a.75.75 0 0 1 0 1.06l-2.805 2.806a.75.75 0 0 1-1.06 0l-2.806-2.805a.75.75 0 0 1 0-1.06l2.805-2.806Zm-5.303 9.434a.75.75 0 0 1 1.06 0l2.806 2.805a.75.75 0 0 1 0 1.06l-2.805 2.806a.75.75 0 0 1-1.06 0l-2.806-2.805a.75.75 0 0 1 0-1.06l2.805-2.806Z" clipRule="evenodd" />
    </svg>
);
