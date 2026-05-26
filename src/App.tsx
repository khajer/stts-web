import { useState, useRef, useEffect, useCallback } from 'react';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { useSpeechSynthesis } from './hooks/useSpeechSynthesis';
import { getAIResponse } from './services/aiService';
import { MicButton } from './components/MicButton';
import { ChatMessage } from './components/ChatMessage';
import type { Message, RecognitionStatus } from './types/speech';
import './App.css';

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState<RecognitionStatus>('idle');
  const [interimText, setInterimText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<Message[]>([]);

  const { speak, isSpeaking, stop: stopSpeaking } = useSpeechSynthesis();

  const addMessage = useCallback((role: Message['role'], text: string) => {
    const msg: Message = { id: crypto.randomUUID(), role, text, timestamp: new Date() };
    setMessages((prev) => {
      const updated = [...prev, msg];
      historyRef.current = updated;
      return updated;
    });
    return msg;
  }, []);

  const handleUserSpeech = useCallback(
    async (transcript: string) => {
      setError(null);
      addMessage('user', transcript);
      setStatus('processing');

      try {
        const response = await getAIResponse(transcript, historyRef.current);
        addMessage('assistant', response);
        setStatus('speaking');
        speak(response, () => setStatus('idle'));
      } catch {
        setError('Failed to get a response. Please try again.');
        setStatus('idle');
      }
    },
    [addMessage, speak]
  );

  const { isListening, interimTranscript, isSupported, start, stop } = useSpeechRecognition({
    onResult: handleUserSpeech,
    onError: (err) => {
      setError(`Microphone error: ${err}`);
      setStatus('idle');
    },
  });

  useEffect(() => {
    setInterimText(interimTranscript);
  }, [interimTranscript]);

  useEffect(() => {
    if (isListening) setStatus('listening');
  }, [isListening]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, interimText]);

  const handleMicStart = () => {
    stopSpeaking();
    setStatus('listening');
    start();
  };

  const handleMicStop = () => {
    stop();
    setStatus('idle');
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Voice Assistant</h1>
        <p className="subtitle">Powered by Web Speech API</p>
      </header>

      <main className="chat-area">
        {messages.length === 0 && (
          <div className="empty-state">
            <p>Tap the microphone and start speaking.</p>
            <p className="hint">Try: "Hello", "Tell me a joke", "What time is it?"</p>
          </div>
        )}

        <div className="messages">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          {interimText && (
            <div className="interim-text">
              <span>{interimText}</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="app-footer">
        {error && <div className="error-banner">{error}</div>}
        {!isSupported && (
          <div className="error-banner">
            Speech recognition is not supported. Please use Chrome or Edge.
          </div>
        )}
        <MicButton status={isSpeaking ? 'speaking' : status} onStart={handleMicStart} onStop={handleMicStop} />
      </footer>
    </div>
  );
}

export default App;
