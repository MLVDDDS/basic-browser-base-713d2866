import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface AudioWaveformProps {
  isActive: boolean;
  className?: string;
  barCount?: number;
}

export function AudioWaveform({ isActive, className, barCount = 5 }: AudioWaveformProps) {
  const [levels, setLevels] = useState<number[]>(Array(barCount).fill(0.1));
  const [hasMicAccess, setHasMicAccess] = useState<boolean | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!isActive) {
      // Reset levels when not active
      setLevels(Array(barCount).fill(0.1));
      
      // Cleanup
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      return;
    }

    const setupAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        setHasMicAccess(true);
        
        const audioContext = new AudioContext();
        audioContextRef.current = audioContext;
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        
        analyser.fftSize = 32;
        analyser.smoothingTimeConstant = 0.8;
        source.connect(analyser);
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const updateLevels = () => {
          if (!analyserRef.current) return;
          
          analyserRef.current.getByteFrequencyData(dataArray);
          
          // Calculate average levels for each bar
          const segmentSize = Math.floor(dataArray.length / barCount);
          const newLevels = Array(barCount).fill(0).map((_, i) => {
            const start = i * segmentSize;
            const end = start + segmentSize;
            let sum = 0;
            for (let j = start; j < end; j++) {
              sum += dataArray[j];
            }
            const avg = sum / segmentSize / 255;
            // Scale to visible range with minimum height
            return Math.max(0.15, Math.min(1, avg * 2.5));
          });
          
          setLevels(newLevels);
          animationRef.current = requestAnimationFrame(updateLevels);
        };

        updateLevels();
      } catch (error) {
        console.warn('Microphone access denied or unavailable:', error);
        setHasMicAccess(false);
        
        // Sine wave animation as fallback (smooth, not random)
        let phase = 0;
        const animateSineWave = () => {
          phase += 0.15;
          const newLevels = Array(barCount).fill(0).map((_, i) => {
            // Create smooth sine wave pattern across bars
            const offset = (i / barCount) * Math.PI * 2;
            const value = Math.sin(phase + offset) * 0.35 + 0.5;
            return Math.max(0.15, Math.min(1, value));
          });
          setLevels(newLevels);
          animationRef.current = requestAnimationFrame(animateSineWave);
        };
        animateSineWave();
      }
    };

    setupAudio();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [isActive, barCount]);

  if (!isActive) return null;

  return (
    <div className={cn('flex items-center justify-center gap-0.5 h-4', className)}>
      {levels.map((level, i) => (
        <div
          key={i}
          className={cn(
            'w-0.5 rounded-full transition-all duration-75',
            hasMicAccess === false ? 'bg-amber-500' : 'bg-red-500'
          )}
          style={{
            height: `${Math.max(4, level * 16)}px`,
            opacity: 0.6 + level * 0.4,
          }}
        />
      ))}
    </div>
  );
}
