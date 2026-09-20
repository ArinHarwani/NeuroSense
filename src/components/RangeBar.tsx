import React from 'react';

interface RangeBarProps {
  min: number;
  max: number;
}

export function RangeBar({ min, max }: RangeBarProps) {
  // Clamp values between 0 and 100
  const safeMin = Math.max(0, Math.min(100, min));
  const safeMax = Math.max(safeMin, Math.min(100, max));

  // Determine split for amber (<=70) and emerald (>70)
  // Range width = safeMax - safeMin
  const leftPercent = safeMin;
  const widthPercent = safeMax - safeMin;

  const isLowOnly = safeMax <= 70;
  const isHighOnly = safeMin >= 70;
  const isSpanning = safeMin < 70 && safeMax > 70;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* Big readout */}
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '28px',
          fontWeight: 700,
          color: 'var(--text)',
          letterSpacing: '-0.02em',
        }}
      >
        {safeMin}–{safeMax}% <span style={{ fontSize: '16px', color: 'var(--text-2)' }}>CONF</span>
      </div>

      {/* Visual range meter */}
      <div style={{ position: 'relative', width: '100%', paddingTop: '4px', paddingBottom: '16px' }}>
        {/* Track */}
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
          {/* Active Range Segment */}
          {isSpanning ? (
            <>
              {/* Portion below 70% in amber */}
              <div
                style={{
                  position: 'absolute',
                  left: `${leftPercent}%`,
                  width: `${70 - safeMin}%`,
                  height: '100%',
                  backgroundColor: 'var(--amber)',
                }}
              />
              {/* Portion above 70% in emerald */}
              <div
                style={{
                  position: 'absolute',
                  left: '70%',
                  width: `${safeMax - 70}%`,
                  height: '100%',
                  backgroundColor: 'var(--emerald)',
                }}
              />
            </>
          ) : (
            <div
              style={{
                position: 'absolute',
                left: `${leftPercent}%`,
                width: `${widthPercent}%`,
                height: '100%',
                backgroundColor: isHighOnly ? 'var(--emerald)' : 'var(--amber)',
              }}
            />
          )}
        </div>

        {/* 70% threshold marker line */}
        <div
          style={{
            position: 'absolute',
            left: '70%',
            top: '0px',
            width: '2px',
            height: '18px',
            backgroundColor: 'var(--text-2)',
            zIndex: 5,
          }}
        />

        {/* 70% threshold label */}
        <span
          style={{
            position: 'absolute',
            left: '70%',
            top: '20px',
            transform: 'translateX(-50%)',
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            fontWeight: 600,
            color: 'var(--text-2)',
          }}
        >
          70%
        </span>

        {/* 0 and 100 marks */}
        <span
          style={{
            position: 'absolute',
            left: '0',
            top: '20px',
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
            top: '20px',
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
