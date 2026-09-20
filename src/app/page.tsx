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
      <main className="telemetry-canvas" style={{ justifyContent: 'center', gap: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--text-2)',
              letterSpacing: '0.08em',
            }}
          >
            STEP 1 / 4
          </span>

          <h1
            style={{
              fontFamily: 'var(--font-headline)',
              fontSize: '26px',
              lineHeight: '32px',
              fontWeight: 700,
              color: 'var(--text)',
              textTransform: 'uppercase',
              letterSpacing: '-0.01em',
            }}
          >
            Confirm Sample Input
          </h1>

          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '16px',
              lineHeight: '24px',
              color: 'var(--text-2)',
              marginTop: '4px',
            }}
          >
            Confirm that the breath sample has been taken before continuing.
          </p>
        </div>

        {/* Dual Telemetry Pods */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className="instrument-pod">
            <span className="pod-label">SESSION</span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '20px',
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
                fontSize: '20px',
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
            padding: '12px 14px',
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
              fontSize: '12px',
              color: 'var(--text-2)',
              letterSpacing: '0.04em',
            }}
          >
            SENSOR CHAMBER PURGED & READY
          </span>
        </div>
      </main>

      {/* Action Shelf (80px) */}
      <footer className="action-shelf">
        <button
          type="button"
          className="btn-primary"
          onClick={handleConfirm}
          disabled={isSubmitting}
          style={{
            width: '100%',
            height: '56px',
          }}
        >
          {isSubmitting ? 'SESSION STARTED...' : 'CONFIRM: INPUT TAKEN'}
        </button>
      </footer>
    </div>
  );
}
