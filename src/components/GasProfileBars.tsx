import React from 'react';
import { GasProfile } from '@/types/session';

interface GasProfileBarsProps {
  profile: GasProfile;
}

export function GasProfileBars({ profile }: GasProfileBarsProps) {
  const channels = [
    { id: 'MQ-135', name: 'MQ-135 (Air Quality)', value: profile.mq135 },
    { id: 'MQ-3', name: 'MQ-3 (Vapor/Alcohol)', value: profile.mq3 },
    { id: 'MQ-138', name: 'MQ-138 (Organics)', value: profile.mq138 },
    { id: 'BME680', name: 'BME680 VOC', value: profile.bme680_voc },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {channels.map((channel) => {
          const pct = Math.round(channel.value * 100);
          return (
            <div key={channel.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--text-2)',
                  width: '64px',
                }}
              >
                {channel.id}
              </span>

              {/* Progress bar track */}
              <div
                style={{
                  flex: 1,
                  height: '8px',
                  backgroundColor: 'var(--bg-recessed)',
                  borderRadius: '2px',
                  border: '1px solid var(--keyline)',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    width: `${pct}%`,
                    height: '100%',
                    backgroundColor: pct > 70 ? 'var(--amber)' : 'var(--teal)',
                    transition: 'width 300ms ease',
                  }}
                />
              </div>

              {/* Readout */}
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--text)',
                  width: '38px',
                  textAlign: 'right',
                }}
              >
                {channel.value.toFixed(2)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Environmental sensors row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: '8px',
          borderTop: '1px solid var(--keyline)',
          marginTop: '2px',
        }}
      >
        <div style={{ display: 'flex', gap: '6px', alignItems: 'baseline' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-2)' }}>
            TEMP:
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--text)',
            }}
          >
            {profile.temperature_c.toFixed(1)} °C
          </span>
        </div>

        <div style={{ display: 'flex', gap: '6px', alignItems: 'baseline' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-2)' }}>
            HUM:
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--text)',
            }}
          >
            {profile.humidity_pct}%
          </span>
        </div>
      </div>

      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          color: 'var(--text-off)',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          marginTop: '2px',
        }}
      >
        Predicted from captured gas pattern
      </div>
    </div>
  );
}
