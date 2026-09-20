import React from 'react';

interface RangeBarProps {
  min: number;
  max: number;
  score?: number;
}

export function RangeBar({ min, max, score }: RangeBarProps) {
  // If score is provided, use it; otherwise compute midpoint
  const safeMin = Math.max(0, Math.min(100, min));
  const safeMax = Math.max(safeMin, Math.min(100, max));
  const activeScore = typeof score === 'number' ? score : Math.round((safeMin + safeMax) / 2);

  const isNominal = activeScore >= 70;
  const scoreColor = isNominal ? 'var(--emerald)' : 'var(--amber)';

  const rangeLeft = safeMin;
  const rangeWidth = safeMax - safeMin;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* Primary dynamic score readout */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '32px',
            fontWeight: 700,
            color: scoreColor,
            letterSpacing: '-0.02em',
          }}
        >
          {activeScore}%{' '}
          <span style={{ fontSize: '15px', color: 'var(--text-2)', fontWeight: 600 }}>
            CONF
          </span>
        </div>

        {/* Range bounds indicator */}
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--text-2)',
            backgroundColor: 'var(--bg-recessed)',
            padding: '3px 8px',
            borderRadius: '3px',
            border: '1px solid var(--keyline)',
          }}
        >
          RANGE: {safeMin}%–{safeMax}%
        </div>
      </div>

      {/* Visual meter track */}
      <div style={{ position: 'relative', width: '100%', paddingTop: '6px', paddingBottom: '16px' }}>
        {/* Base Track */}
        <div
          style={{
            height: '10px',
            width: '100%',
            backgroundColor: 'var(--bg-recessed)',
            borderRadius: '3px',
            border: '1px solid var(--keyline)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Active Range Bracket Window */}
          <div
            style={{
              position: 'absolute',
              left: `${rangeLeft}%`,
              width: `${rangeWidth}%`,
              height: '100%',
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              borderLeft: '1px solid var(--text-2)',
              borderRight: '1px solid var(--text-2)',
            }}
          />

          {/* Filled progress up to score */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              width: `${activeScore}%`,
              height: '100%',
              backgroundColor: scoreColor,
              opacity: 0.85,
            }}
          />
        </div>

        {/* Active Score Pin Marker */}
        <div
          style={{
            position: 'absolute',
            left: `${activeScore}%`,
            top: '2px',
            transform: 'translateX(-50%)',
            width: '4px',
            height: '18px',
            backgroundColor: '#ffffff',
            borderRadius: '1px',
            boxShadow: `0 0 8px ${scoreColor}`,
            zIndex: 10,
          }}
        />

        {/* 70% threshold marker */}
        <div
          style={{
            position: 'absolute',
            left: '70%',
            top: '0px',
            width: '2px',
            height: '20px',
            backgroundColor: 'var(--text-2)',
            zIndex: 5,
            borderLeft: '1px dashed #ffffff',
          }}
        />

        {/* 70% label */}
        <span
          style={{
            position: 'absolute',
            left: '70%',
            top: '22px',
            transform: 'translateX(-50%)',
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            fontWeight: 600,
            color: 'var(--text-2)',
          }}
        >
          70% PASS
        </span>

        {/* Min / Max bounds markers */}
        <span
          style={{
            position: 'absolute',
            left: '0',
            top: '22px',
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            color: 'var(--text-off)',
          }}
        >
          0%
        </span>
        <span
          style={{
            position: 'absolute',
            right: '0',
            top: '22px',
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            color: 'var(--text-off)',
          }}
        >
          100%
        </span>
      </div>
    </div>
  );
}
