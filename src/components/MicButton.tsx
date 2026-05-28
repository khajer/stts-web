import { useState, useRef, useEffect } from 'react';
import type { RecognitionStatus } from '../types/speech';
import './MicButton.css';

// Arc lengths per state (r=16, circumference ≈ 100.5)
const arcDash: Record<RecognitionStatus, string> = {
  idle:       '0 101',
  listening:  '45 56',   // ~160° arc
  processing: '20 81',   // ~72° arc
  speaking:   '70 31',   // ~250° arc
};

// Lerp speed controls how snappily the arc chases the target
const lerpSpeed: Record<RecognitionStatus, number> = {
  idle:       0,
  listening:  0.025,
  processing: 0.09,
  speaking:   0.045,
};

function useRandomRotation(status: RecognitionStatus) {
  const rotRef    = useRef<number>(0);
  const targetRef = useRef<number>(0);
  const rafRef    = useRef<number>(0);
  const [deg, setDeg] = useState(0);

  useEffect(() => {
    if (status === 'idle') {
      cancelAnimationFrame(rafRef.current);
      return;
    }

    const speed = lerpSpeed[status];

    const pickTarget = () => {
      const dir = Math.random() > 0.5 ? 1 : -1;
      const mag = 100 + Math.random() * 320;
      targetRef.current = rotRef.current + dir * mag;
    };

    pickTarget();

    const tick = () => {
      const diff = targetRef.current - rotRef.current;
      if (Math.abs(diff) < 8) pickTarget();
      rotRef.current += diff * speed;
      setDeg(rotRef.current);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [status]);

  return deg;
}

interface StatusIndicatorProps {
  status: RecognitionStatus;
}

export function StatusIndicator({ status }: StatusIndicatorProps) {
  const rotation = useRandomRotation(status);

  return (
    <div className={`status-indicator ${status}`} role="status" aria-live="polite">
      <svg className="circle-icon" viewBox="0 0 40 40" fill="none">
        {/* Faint background track */}
        <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="2.5" opacity="0.2" />
        {/* Randomly rotating arc */}
        <circle
          cx="20" cy="20" r="16"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={arcDash[status]}
          style={{
            transformBox: 'fill-box',
            transformOrigin: 'center',
            transform: `rotate(${rotation}deg)`,
          }}
        />
        {status === 'idle' && (
          <circle cx="20" cy="20" r="3.5" fill="currentColor" opacity="0.4" />
        )}
      </svg>
      <span className="mic-label">
        {status === 'idle' && 'Ready'}
        {status === 'listening' && 'Listening...'}
        {status === 'processing' && 'Thinking...'}
        {status === 'speaking' && 'Speaking...'}
      </span>
    </div>
  );
}
