import type { RecognitionStatus } from "../types/speech";
import "./MicButton.css";

interface MicButtonProps {
  status: RecognitionStatus;
  onStart: () => void;
  onStop: () => void;
}

export function MicButton({ status, onStart, onStop }: MicButtonProps) {
  const isListening = status === "listening";
  const isDisabled = status === "processing" || status === "speaking";

  return (
    <button
      className={`mic-button status-${status} ${isListening ? "listening" : ""} ${isDisabled ? "disabled" : ""}`}
      onClick={isListening ? onStop : onStart}
      disabled={isDisabled}
      aria-label={isListening ? "Stop listening" : "Start listening"}
    >
      <div className="hud-rings">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          {/* Dark backdrop */}
          <circle cx="100" cy="100" r="93" fill="rgba(6,16,32,0.85)" />

          {/* Ring 1 — thin near-complete outer ring */}
          <g className="ring ring-1">
            <circle
              cx="100"
              cy="100"
              r="88"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.8"
              strokeDasharray="545 8"
              strokeLinecap="round"
            />
          </g>

          {/* Ring 2 — 4 wide arc segments */}
          <g className="ring ring-2">
            <circle
              cx="100"
              cy="100"
              r="72"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray="100 13"
              strokeLinecap="butt"
            />
          </g>

          {/* Ring 3 — dense tick marks */}
          <g className="ring ring-3">
            <circle
              cx="100"
              cy="100"
              r="55"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="2.5 4.4"
            />
          </g>

          {/* Ring 4 — 3 inner arc segments */}
          <g className="ring ring-4">
            <circle
              cx="100"
              cy="100"
              r="40"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeDasharray="56 27.7"
              strokeLinecap="butt"
            />
          </g>

          {/* Center circle */}
          <circle
            cx="100"
            cy="100"
            r="24"
            fill="#061020"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          <circle cx="100" cy="100" r="6" fill="currentColor" opacity="0.9" />
        </svg>
      </div>

      <span className="mic-label">
        {status === "idle" && "WAITING"}
        {status === "listening" && "LISTENING"}
        {status === "processing" && "PROCESSING"}
        {status === "speaking" && "SPEAKING"}
      </span>
    </button>
  );
}
