import { useState, useCallback, useEffect, useRef } from 'react';

interface UseSpeechRecognitionOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
}

interface UseSpeechRecognitionReturn {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  interimTranscript: string;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

// Extend Window interface for SpeechRecognition
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

type SpeechRecognitionType = new () => {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
};

const getSpeechRecognition = (): SpeechRecognitionType | null => {
  if (typeof window === 'undefined') return null;
  
  return (
    (window as unknown as { SpeechRecognition?: SpeechRecognitionType }).SpeechRecognition ||
    (window as unknown as { webkitSpeechRecognition?: SpeechRecognitionType }).webkitSpeechRecognition ||
    null
  );
};

export function useSpeechRecognition({
  language = 'ru-RU',
  continuous = true,
  interimResults = true,
  onResult,
  onError,
}: UseSpeechRecognitionOptions = {}): UseSpeechRecognitionReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  
  const recognitionRef = useRef<InstanceType<SpeechRecognitionType> | null>(null);
  const SpeechRecognition = getSpeechRecognition();
  const isSupported = SpeechRecognition !== null;

  const startListening = useCallback(() => {
    if (!SpeechRecognition) {
      onError?.('Браузер не поддерживает голосовой ввод');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = continuous;
      recognition.interimResults = interimResults;
      recognition.lang = language;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        let interimText = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const text = result[0].transcript;
          
          if (result.isFinal) {
            finalTranscript += text;
          } else {
            interimText += text;
          }
        }

        if (finalTranscript) {
          setTranscript(prev => prev + finalTranscript);
          onResult?.(finalTranscript, true);
        }
        
        setInterimTranscript(interimText);
        if (interimText) {
          onResult?.(interimText, false);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        const errorMessages: Record<string, string> = {
          'no-speech': 'Речь не обнаружена',
          'audio-capture': 'Микрофон недоступен',
          'not-allowed': 'Доступ к микрофону запрещён',
          'network': 'Ошибка сети',
          'aborted': 'Запись прервана',
        };
        
        const message = errorMessages[event.error] || `Ошибка: ${event.error}`;
        onError?.(message);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimTranscript('');
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (error) {
      onError?.('Не удалось запустить распознавание речи');
      setIsListening(false);
    }
  }, [SpeechRecognition, continuous, interimResults, language, onResult, onError]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
    setInterimTranscript('');
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  return {
    isListening,
    isSupported,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
  };
}
