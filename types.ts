
export enum Theme {
  Light = 'light',
  Dark = 'dark',
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}
