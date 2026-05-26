export interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

export type RecognitionStatus = 'idle' | 'listening' | 'processing' | 'speaking';

// Extend window with webkit prefix fallback
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}
