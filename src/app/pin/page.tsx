'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/context/SessionContext';
import { CommandDeck } from '@/components/CommandDeck';
import { Lock, Delete, RotateCcw } from 'lucide-react';

export default function PinAccessPage() {
  const router = useRouter();
  const {
    verifyPin,
    isLockedOut,
    lockoutRemainingSeconds,
    session,
  } = useSession();

  const [pin, setPin] = useState<string>('');
  const [pinStatus, setPinStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Trigger haptic feedback if available
  const triggerHaptic = () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(25);
      } catch {}
    }
  };

  const handleKeyPress = (digit: string) => {
    if (isLockedOut || pinStatus === 'verifying' || pinStatus === 'success') return;
    if (pin.length < 4) {
      triggerHaptic();
      setPin((prev) => prev + digit);
      setErrorMessage(null);
      setPinStatus('idle');
    }
  };

  const handleBackspace = () => {
    if (isLockedOut || pinStatus === 'verifying' || pinStatus === 'success') return;
    triggerHaptic();
    setPin((prev) => prev.slice(0, -1));
    setErrorMessage(null);
    setPinStatus('idle');
  };

  const handleClear = () => {
    if (isLockedOut || pinStatus === 'verifying' || pinStatus === 'success') return;
    triggerHaptic();
    setPin('');
    setErrorMessage(null);
    setPinStatus('idle');
  };

  // Keyboard physical listeners for accessibility / desktop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLockedOut) return;

      if (e.key >= '0' && e.key <= '9') {
        handleKeyPress(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin, isLockedOut, pinStatus]);

  // Submit automatically on 4th digit (PRD P3-3 & UI/UX Brief)
  useEffect(() => {
    if (pin.length === 4 && pinStatus === 'idle') {
      const submitPin = async () => {
        setPinStatus('verifying');
        // Small 150ms delay per UI/UX brief
        await new Promise((resolve) => setTimeout(resolve, 150));

        const result = await verifyPin(pin);

        if (result.success) {
          setPinStatus('success');
          // Short nominal feedback flash before transition to acquisition/analysis
          setTimeout(() => {
            router.push('/processing');
          }, 350);
        } else {
          setPinStatus('error');
          if (result.locked) {
            setErrorMessage('PIN LOCKED FOR 30 SECONDS');
          } else {
            setErrorMessage(`INVALID PIN · ${result.attemptsLeft} ATTEMPTS LEFT`);
          }
          setPin('');
        }
      };

      submitPin();
    }
  }, [pin, pinStatus, verifyPin, router]);

  // Keypad key definition
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  return (
    <div className="tactical-frame">
      <CommandDeck stepText="STEP 3 / 4" />

      <main
        className="telemetry-canvas"
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          gap: '24px',
          paddingBottom: '24px',
        }}
      >
        {/* Title & Subtitle */}
        <div style={{ textAlign: 'center' }}>
          <h1
            style={{
              fontFamily: 'var(--font-headline)',
              fontSize: '24px',
              fontWeight: 700,
              color: 'var(--text)',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            Inspector Access
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--text-2)',
              letterSpacing: '0.08em',
              marginTop: '4px',
            }}
          >
            ENTER 4-DIGIT AUTHORIZATION PIN
          </p>
        </div>

        {/* Lockout Banner or PIN Slots */}
        {isLockedOut ? (
          <div
            style={{
              width: '100%',
              maxWidth: '360px',
              backgroundColor: 'var(--bg-overlay)',
              border: '2px solid var(--amber)',
              borderRadius: '4px',
              padding: '16px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Lock size={28} color="var(--amber)" />
            <span
              style={{
                fontFamily: 'var(--font-headline)',
                fontSize: '16px',
                fontWeight: 700,
                color: 'var(--amber)',
                letterSpacing: '0.06em',
              }}
            >
              PIN AUTHENTICATION LOCKED
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '32px',
                fontWeight: 700,
                color: 'var(--text)',
              }}
            >
              00:{lockoutRemainingSeconds.toString().padStart(2, '0')}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                color: 'var(--text-2)',
              }}
            >
              3 consecutive invalid attempts. Awaiting cooldown.
            </span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            {/* 4 Digit Slots */}
            <div style={{ display: 'flex', gap: '12px' }}>
              {[0, 1, 2, 3].map((index) => {
                const isFilled = index < pin.length;
                const isActive = index === pin.length && pinStatus === 'idle';

                let borderColor = 'var(--keyline)';
                let glow = 'none';

                if (pinStatus === 'error') {
                  borderColor = 'var(--crimson)';
                  glow = '0 0 10px rgba(239, 68, 68, 0.4)';
                } else if (pinStatus === 'success') {
                  borderColor = 'var(--emerald)';
                  glow = '0 0 10px rgba(16, 185, 129, 0.4)';
                } else if (isActive) {
                  borderColor = 'var(--teal)';
                  glow = '0 0 8px rgba(13, 148, 136, 0.4)';
                }

                return (
                  <div
                    key={index}
                    style={{
                      width: '56px',
                      height: '56px',
                      backgroundColor: 'var(--bg-recessed)',
                      border: `2px solid ${borderColor}`,
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: glow,
                      transition: 'border-color 150ms ease, box-shadow 150ms ease',
                    }}
                  >
                    {isFilled && (
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '32px',
                          color:
                            pinStatus === 'success'
                              ? 'var(--emerald)'
                              : pinStatus === 'error'
                              ? 'var(--crimson)'
                              : 'var(--text)',
                        }}
                      >
                        •
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Error or Status message */}
            <div style={{ minHeight: '20px', textAlign: 'center' }}>
              {errorMessage ? (
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--crimson)',
                    letterSpacing: '0.06em',
                  }}
                >
                  {errorMessage}
                </span>
              ) : pinStatus === 'verifying' ? (
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    color: 'var(--teal)',
                    letterSpacing: '0.06em',
                  }}
                >
                  DECRYPTING EVIDENCE...
                </span>
              ) : (
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    color: 'var(--text-off)',
                    letterSpacing: '0.06em',
                  }}
                >
                  {session?.wrongPinAttempts ? `${3 - session.wrongPinAttempts} ATTEMPTS REMAINING` : '3 ATTEMPTS REMAINING'}
                </span>
              )}
            </div>
          </div>
        )}

        {/* 3x4 Tactical Numeric Matrix */}
        <div className="keypad-grid">
          {keys.map((num) => (
            <button
              key={num}
              type="button"
              className="keypad-key"
              onClick={() => handleKeyPress(num)}
              disabled={isLockedOut || pinStatus === 'verifying'}
            >
              {num}
            </button>
          ))}

          {/* Bottom row: CLR, 0, Backspace */}
          <button
            type="button"
            className="keypad-key key-action"
            onClick={handleClear}
            disabled={isLockedOut || pinStatus === 'verifying'}
            title="Clear all"
          >
            CLR
          </button>

          <button
            type="button"
            className="keypad-key"
            onClick={() => handleKeyPress('0')}
            disabled={isLockedOut || pinStatus === 'verifying'}
          >
            0
          </button>

          <button
            type="button"
            className="keypad-key key-action"
            onClick={handleBackspace}
            disabled={isLockedOut || pinStatus === 'verifying'}
            title="Backspace"
          >
            <Delete size={22} />
          </button>
        </div>

        {/* Security Telemetry Note */}
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--text-off)',
            textAlign: 'center',
            letterSpacing: '0.06em',
          }}
        >
          SECURE OPERATOR ACCESS · ENCRYPTED TELEMETRY
        </div>
      </main>
    </div>
  );
}
