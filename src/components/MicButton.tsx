import type { RecognitionStatus } from '../types/speech';
import './MicButton.css';

interface MicButtonProps {
  status: RecognitionStatus;
  onStart: () => void;
  onStop: () => void;
}

export function MicButton({ status, onStart, onStop }: MicButtonProps) {
  const isListening = status === 'listening';
  const isDisabled = status === 'processing' || status === 'speaking';

  return (
    <button
      className={`mic-button ${isListening ? 'listening' : ''} ${isDisabled ? 'disabled' : ''}`}
      onClick={isListening ? onStop : onStart}
      disabled={isDisabled}
      aria-label={isListening ? 'Stop listening' : 'Start listening'}
    >
      <span className="mic-icon">
        {isListening ? (
          <svg viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="6" width="12" height="12" rx="2" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
          </svg>
        )}
      </span>
      <span className="mic-label">
        {status === 'idle' && 'Hold Space / Tap'}
        {status === 'listening' && 'Listening...'}
        {status === 'processing' && 'Thinking...'}
        {status === 'speaking' && 'Speaking...'}
      </span>
    </button>
  );
}
