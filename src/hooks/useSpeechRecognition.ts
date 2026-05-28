import { useState, useRef, useCallback, useEffect } from 'react';

interface UseSpeechRecognitionOptions {
  onResult: (transcript: string) => void;
  onError?: (error: string) => void;
}

export function useSpeechRecognition({ onResult, onError }: UseSpeechRecognitionOptions) {
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null); // SpeechRecognition instance
  const activeRef = useRef(false);
  const pausedRef = useRef(false);
  const startInstanceRef = useRef<() => void>(() => {});

  const isSupported = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;

  const startInstance = useCallback(() => {
    if (!isSupported || !activeRef.current || pausedRef.current) return;

    const SpeechRecognitionClass = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionClass();
    recognitionRef.current = recognition;

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += t;
        else interim += t;
      }
      setInterimTranscript(interim);
      if (final) {
        setInterimTranscript('');
        // pause before notifying caller so onend won't auto-restart
        pausedRef.current = true;
        onResult(final.trim());
      }
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      setInterimTranscript('');
      if (event.error !== 'aborted' && event.error !== 'no-speech') {
        onError?.(event.error);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript('');
      if (activeRef.current && !pausedRef.current) {
        setTimeout(startInstanceRef.current, 200);
      }
    };

    try {
      recognition.start();
    } catch {
      // ignore if already started
    }
  }, [isSupported, onResult, onError]);

  useEffect(() => {
    startInstanceRef.current = startInstance;
  }, [startInstance]);

  const start = useCallback(() => {
    activeRef.current = true;
    pausedRef.current = false;
    startInstance();
  }, [startInstance]);

  const stop = useCallback(() => {
    activeRef.current = false;
    pausedRef.current = false;
    recognitionRef.current?.abort();
    setIsListening(false);
    setInterimTranscript('');
  }, []);

  const resume = useCallback(() => {
    if (!activeRef.current || !pausedRef.current) return;
    pausedRef.current = false;
    setTimeout(startInstanceRef.current, 300);
  }, []);

  return { isListening, interimTranscript, isSupported, start, stop, resume };
}
