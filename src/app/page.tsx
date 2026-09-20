'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/context/SessionContext';

export default function ConfirmPage() {
  const router = useRouter();
  const { startSession } = useSession();

  const [currentTime, setCurrentTime] = useState<string>('--:--:--');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Live ticking clock for Step 1
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toTimeString().split(' ')[0] || now.toLocaleTimeString()
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleConfirm = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const sessionId = startSession();

    // 400ms delay per UI/UX brief for tactile transition
    setTimeout(() => {
      router.push('/camera');
    }, 400);
  };

  return (
    <div className="tactical-frame">
      {/* Minimal, isolated standalone top bar per P1-1 */}
      <header className="command-deck" style={{ justifyContent: 'space-between' }}>
        <span
          style={{
            fontFamily: 'var(--font-headline)',
            fontSize: '16px',
            fontWeight: 700,
            letterSpacing: '0.08em',
            color: 'var(--text)',
          }}
        >
          NARCOSENSE
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--teal)' }} />
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--teal)',
              fontWeight: 600,
              letterSpacing: '0.08em',
            }}
          >
            SYSTEM READY
          </span>
        </div>
      </header>

      {/* Telemetry Canvas */}
      <main className="telemetry-canvas" style={{ justifyContent: 'center', gap: '18px' }}>
        {/* Terminal Stage 1 Card matching specification */}
        <div
          style={{
            backgroundColor: '#0c1017',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '16px',
            padding: '24px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.6)',
          }}
        >
          {/* Card Header */}
          <div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '15px',
                fontWeight: 700,
                color: 'var(--text)',
                letterSpacing: '0.12em',
              }}
            >
              NARCOSENSE
            </div>
            <div
              style={{
                color: 'rgba(255, 255, 255, 0.25)',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                margin: '6px 0 10px 0',
                userSelect: 'none',
              }}
            >
              ------------------------------------------------------------
            </div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
                fontWeight: 700,
                color: '#10b981',
                letterSpacing: '0.08em',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                  boxShadow: '0 0 10px #10b981',
                  display: 'inline-block',
                }}
              />
              SYSTEM STATUS: READY
            </div>
          </div>

          {/* Module List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', margin: '4px 0' }}>
            {/* Breath Analysis Module */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <span
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: 'var(--text)',
                }}
              >
                Breath Analysis Module
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '13px',
                  color: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontWeight: 600,
                }}
              >
                • Ready
              </span>
            </div>

            {/* Camera Module */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <span
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: 'var(--text)',
                }}
              >
                Camera Module
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '13px',
                  color: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontWeight: 600,
                }}
              >
                • Ready
              </span>
            </div>

            {/* AI Engine */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <span
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: 'var(--text)',
                }}
              >
                AI Engine
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '13px',
                  color: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontWeight: 600,
                }}
              >
                • Ready
              </span>
            </div>
          </div>

          {/* Direct [ START TEST ] Button per Image 1 */}
          <button
            type="button"
            className="btn-primary"
            onClick={handleConfirm}
            disabled={isSubmitting}
            style={{
              width: '100%',
              height: '52px',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              letterSpacing: '0.08em',
              fontSize: '14px',
              borderRadius: '8px',
              marginTop: '8px',
            }}
          >
            {isSubmitting ? '[ INITIALIZING... ]' : '[ START TEST ]'}
          </button>
        </div>

        {/* Dual Telemetry Pods */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className="instrument-pod">
            <span className="pod-label">SESSION</span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '16px',
                fontWeight: 700,
                color: 'var(--teal)',
              }}
            >
              NEW
            </span>
          </div>

          <div className="instrument-pod">
            <span className="pod-label">LOCAL TIME</span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '16px',
                fontWeight: 700,
                color: 'var(--text)',
              }}
            >
              {currentTime}
            </span>
          </div>
        </div>

        {/* Operational Advisory */}
        <div
          style={{
            backgroundColor: 'var(--bg-recessed)',
            border: '1px solid var(--keyline)',
            borderRadius: '4px',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: 'var(--teal)',
            }}
          />
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--text-2)',
              letterSpacing: '0.04em',
            }}
          >
            STAGE 1 · SENSOR CHAMBER PURGED & READY
          </span>
        </div>
      </main>

      {/* Action Shelf */}
      <footer className="action-shelf" style={{ justifyContent: 'space-between', padding: '0 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: 'var(--teal)' }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-2)', letterSpacing: '0.04em' }}>
            BLE: RPi-4B (STANDBY)
          </span>
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-off)', letterSpacing: '0.04em' }}>
          DEMO BUILD v2.4
        </span>
      </footer>
    </div>
  );
}
