import { useState, useRef, useEffect } from 'react';
import type { RecognitionStatus } from '../types/speech';
import './MicButton.css';

// 4 concentric rings: radius, stroke width, arc dasharray, base lerp speed, rotation direction
const RINGS = [
  { r: 40, w: 1.5, dash: '56 196', speed: 0.018, dir:  1 },
  { r: 31, w: 2,   dash: '60 135', speed: 0.030, dir: -1 },
  { r: 22, w: 1.5, dash: '23 116', speed: 0.050, dir:  1 },
  { r: 13, w: 2.5, dash: '20 62',  speed: 0.085, dir: -1 },
] as const;

const SPEED_MULT: Record<RecognitionStatus, number> = {
  idle:       0.08,
  listening:  2.5,
  processing: 3,
  speaking:   1.6,
};

// 24 tick marks around outer ring, every 6th is a major tick
const TICKS = Array.from({ length: 24 }, (_, i) => {
  const angle = ((i * 15) - 90) * (Math.PI / 180);
  const major = i % 6 === 0;
  const r1 = 43.5;
  const r2 = major ? 47.5 : 46;
  return {
    x1: 50 + r1 * Math.cos(angle), y1: 50 + r1 * Math.sin(angle),
    x2: 50 + r2 * Math.cos(angle), y2: 50 + r2 * Math.sin(angle),
    major,
  };
});

function useJarvisRotations(status: RecognitionStatus) {
  const rotRefs    = useRef<number[]>([0, 45, 90, 135]);
  const targetRefs = useRef<number[]>([0, 45, 90, 135]);
  const rafRef     = useRef<number>(0);
  const [rotations, setRotations] = useState<number[]>([0, 45, 90, 135]);

  useEffect(() => {
    const mult = SPEED_MULT[status];

    const pickTarget = (i: number) => {
      const mag = 60 + Math.random() * 300;
      targetRefs.current[i] = rotRefs.current[i] + RINGS[i].dir * mag;
    };

    RINGS.forEach((_, i) => pickTarget(i));

    const tick = () => {
      RINGS.forEach((ring, i) => {
        const diff = targetRefs.current[i] - rotRefs.current[i];
        if (Math.abs(diff) < 6) pickTarget(i);
        rotRefs.current[i] += diff * ring.speed * mult;
      });
      setRotations([...rotRefs.current]);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [status]);

  return rotations;
}

interface StatusIndicatorProps {
  status: RecognitionStatus;
}

export function StatusIndicator({ status }: StatusIndicatorProps) {
  const rotations = useJarvisRotations(status);

  return (
    <div className={`status-indicator ${status}`} role="status" aria-live="polite">
      <div className="jarvis-stage">
        <svg className="circle-icon" viewBox="0 0 100 100" fill="none">
          {/* Outermost faint track */}
          <circle cx="50" cy="50" r="40" stroke="#00c8ff" strokeWidth="0.4" opacity="0.12" />

          {/* Tick marks */}
          {TICKS.map((t, i) => (
            <line key={i}
              x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
              stroke="#00c8ff"
              strokeWidth={t.major ? 1.5 : 0.7}
              opacity={t.major ? 0.55 : 0.22}
            />
          ))}

          {/* Faint ring tracks */}
          {RINGS.map((ring, i) => (
            <circle key={`track-${i}`}
              cx="50" cy="50" r={ring.r}
              stroke="#00c8ff" strokeWidth={ring.w} opacity="0.07"
            />
          ))}

          {/* Randomly rotating arcs */}
          {RINGS.map((ring, i) => (
            <circle key={`arc-${i}`}
              cx="50" cy="50" r={ring.r}
              stroke="#00c8ff"
              strokeWidth={ring.w}
              strokeLinecap="round"
              strokeDasharray={ring.dash}
              opacity={0.65 + i * 0.08}
              style={{
                transformBox: 'fill-box',
                transformOrigin: 'center',
                transform: `rotate(${rotations[i]}deg)`,
              }}
            />
          ))}

          {/* Center crosshair */}
          <line x1="47.5" y1="50" x2="52.5" y2="50" stroke="#00c8ff" strokeWidth="0.8" opacity="0.6" />
          <line x1="50" y1="47.5" x2="50" y2="52.5" stroke="#00c8ff" strokeWidth="0.8" opacity="0.6" />
          <circle cx="50" cy="50" r="2" stroke="#00c8ff" strokeWidth="0.8" opacity="0.5" />

          {/* Center pulse when speaking */}
          {status === 'speaking' && (
            <circle cx="50" cy="50" r="2" fill="#00c8ff" className="center-pulse" />
          )}
        </svg>
      </div>

      <span className="mic-label">
        {status === 'idle'       && 'STANDBY'}
        {status === 'listening'  && 'LISTENING'}
        {status === 'processing' && 'PROCESSING'}
        {status === 'speaking'   && 'RESPONDING'}
      </span>
    </div>
  );
}
