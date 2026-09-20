import React from 'react';
import { DemoBadge } from './DemoBadge';

interface CommandDeckProps {
  title?: string;
  stepText?: string;
  sessionId?: string;
  countdownSeconds?: number;
  inspectorName?: string;
  showDemo?: boolean;
}

export function CommandDeck({
  title = 'NARCOSENSE',
  stepText,
  sessionId,
  countdownSeconds,
  inspectorName,
  showDemo = true,
}: CommandDeckProps) {
  const isUrgent = typeof countdownSeconds === 'number' && countdownSeconds <= 10;

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <header className="command-deck">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {inspectorName ? (
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--text)',
              letterSpacing: '0.04em',
            }}
          >
            INSP: {inspectorName.toUpperCase()}
          </span>
        ) : (
          <span
            style={{
              fontFamily: 'var(--font-headline)',
              fontSize: '15px',
              fontWeight: 700,
              letterSpacing: '0.06em',
              color: 'var(--text)',
            }}
          >
            {title}
          </span>
        )}

        {sessionId && (
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--text-2)',
              letterSpacing: '0.04em',
            }}
          >
            #{sessionId}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {stepText && (
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--text-2)',
              fontWeight: 600,
              letterSpacing: '0.06em',
            }}
          >
            {stepText}
          </span>
        )}

        {showDemo && <DemoBadge />}

        {typeof countdownSeconds === 'number' && (
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '14px',
              fontWeight: 700,
              color: isUrgent ? 'var(--amber)' : 'var(--text-2)',
              backgroundColor: 'var(--bg-pod)',
              padding: '2px 6px',
              borderRadius: '3px',
              border: `1px solid ${isUrgent ? 'var(--amber)' : 'var(--keyline)'}`,
              animation: isUrgent ? 'beaconPulse 1s infinite ease-in-out' : 'none',
            }}
            title="Auto-lock countdown"
          >
            {formatCountdown(countdownSeconds)}
          </span>
        )}
      </div>
    </header>
  );
}
