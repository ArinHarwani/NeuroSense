'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/context/SessionContext';
import { CommandDeck } from '@/components/CommandDeck';
import { Check, Volume2, VolumeX, FastForward, Activity, Radio, Cpu } from 'lucide-react';

export default function ProcessingPage() {
  const router = useRouter();
  const { session } = useSession();

  // Current stage: 2 for Sample Acquisition, 3 for AI Analysis
  const [currentStage, setCurrentStage] = useState<2 | 3>(2);

  // Stage 2 state
  const [acquisitionProgress, setAcquisitionProgress] = useState<number>(0);
  const [inputCaptured, setInputCaptured] = useState<boolean>(false);

  // Stage 3 state (AI Analysis checklist steps)
  const [analysisStep, setAnalysisStep] = useState<number>(0);

  // Sound enabled
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Waveform canvas ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Web Audio buzzer beep
  const playBuzzerBeep = useCallback((freq = 880, duration = 0.12) => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio context might be restricted before user gesture
    }
  }, [soundEnabled]);

  // Initial buzzer beep on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      playBuzzerBeep(784, 0.15);
    }, 200);
    return () => clearTimeout(timer);
  }, [playBuzzerBeep]);

  // Stage 2: Signal Acquisition Progress (0% -> 87% -> 100% over ~4.5s)
  useEffect(() => {
    if (currentStage !== 2) return;

    const startTime = Date.now();
    const duration = 4500; // 4.5 seconds

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.floor((elapsed / duration) * 100));
      setAcquisitionProgress(pct);

      if (pct >= 87 && !inputCaptured) {
        setInputCaptured(true);
        playBuzzerBeep(988, 0.1);
      }

      if (pct >= 100) {
        clearInterval(interval);
        // Automatically transition to Stage 3 after brief pause
        setTimeout(() => {
          advanceToStage3();
        }, 800);
      }
    }, 60);

    return () => clearInterval(interval);
  }, [currentStage, inputCaptured, playBuzzerBeep]);

  // Advance to Stage 3 (called manually by teammate via [ ANALYZE ] or auto)
  const advanceToStage3 = useCallback(() => {
    if (currentStage === 3) return;
    setCurrentStage(3);
    playBuzzerBeep(1174, 0.12);
  }, [currentStage, playBuzzerBeep]);

  // Stage 3: Step-by-step checklist sequence
  useEffect(() => {
    if (currentStage !== 3) return;

    // Step 1: Input received ✓ (immediate)
    setAnalysisStep(1);

    // Step 2: Pre-processing ✓ (+1.4s)
    const t2 = setTimeout(() => {
      setAnalysisStep(2);
      playBuzzerBeep(659, 0.08);
    }, 1400);

    // Step 3: Noise filtering ✓ (+2.8s)
    const t3 = setTimeout(() => {
      setAnalysisStep(3);
      playBuzzerBeep(740, 0.08);
    }, 2800);

    // Step 4: Feature extraction ✓ (+4.2s)
    const t4 = setTimeout(() => {
      setAnalysisStep(4);
      playBuzzerBeep(830, 0.08);
    }, 4200);

    // Step 5: Pattern matching... (+5.4s)
    const t5 = setTimeout(() => {
      setAnalysisStep(5);
    }, 5400);

    // Final: Complete and navigate to Results (+6.8s)
    const t6 = setTimeout(() => {
      setAnalysisStep(6);
      playBuzzerBeep(1046, 0.2);
      setTimeout(() => {
        router.replace('/results');
      }, 500);
    }, 6800);

    return () => {
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
    };
  }, [currentStage, router, playBuzzerBeep]);

  // Skip directly to results for quick testing
  const handleSkip = () => {
    router.replace('/results');
  };

  // Live Canvas Waveform for Stage 3 "Demo Mode Reference Profile"
  useEffect(() => {
    if (currentStage !== 3) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let offset = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // Grid background
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      const gridSize = 16;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw 3 simulated spectral sensor curves
      const channels = [
        { color: '#10b981', freq: 0.04, amp: 18, speed: 0.08, phase: 0 },
        { color: '#0d9488', freq: 0.025, amp: 14, speed: 0.05, phase: 1.5 },
        { color: '#38bdf8', freq: 0.055, amp: 10, speed: 0.1, phase: 3.0 },
      ];

      channels.forEach((ch) => {
        ctx.strokeStyle = ch.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();

        for (let x = 0; x < width; x++) {
          const y =
            height / 2 +
            Math.sin((x + offset * ch.speed) * ch.freq + ch.phase) * ch.amp +
            Math.cos((x - offset * 0.03) * 0.02) * (ch.amp * 0.4);

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      });

      offset += 1;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [currentStage]);

  // Helper to render ASCII-like progress bar: [||||||||||░░░]
  const renderAsciiProgressBar = (percentage: number) => {
    const totalBars = 20;
    const filledBars = Math.round((percentage / 100) * totalBars);
    const filled = '█'.repeat(filledBars);
    const empty = '░'.repeat(Math.max(0, totalBars - filledBars));
    return `[${filled}${empty}] ${percentage}%`;
  };

  return (
    <div className="tactical-frame">
      {/* Pinned Command Deck */}
      <header className="command-deck" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontFamily: 'var(--font-headline)',
              fontSize: '15px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              color: 'var(--text)',
            }}
          >
            NARCOSENSE
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              padding: '2px 6px',
              borderRadius: '4px',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              color: '#10b981',
              fontWeight: 600,
            }}
          >
            STAGE {currentStage} / 4
          </span>
        </div>

        {/* Presenter Tools: Mute + Skip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Mute buzzer sound' : 'Unmute buzzer sound'}
            style={{
              background: 'transparent',
              border: 'none',
              color: soundEnabled ? '#10b981' : 'var(--text-off)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '4px',
            }}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          <button
            type="button"
            onClick={handleSkip}
            title="Fast forward to results"
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid var(--keyline)',
              borderRadius: '4px',
              color: 'var(--text-2)',
              fontSize: '10px',
              fontFamily: 'var(--font-mono)',
              padding: '4px 8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <FastForward size={12} />
            SKIP
          </button>
        </div>
      </header>

      {/* Main Telemetry Canvas */}
      <main
        className="telemetry-canvas"
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          gap: '16px',
          padding: '20px 16px',
        }}
      >
        {/* ================================================================= */}
        {/* STAGE 2 — SAMPLE ACQUISITION (Image 3)                            */}
        {/* ================================================================= */}
        {currentStage === 2 && (
          <div
            style={{
              width: '100%',
              maxWidth: '440px',
              backgroundColor: '#0c1017',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '16px',
              padding: '24px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
              boxShadow: '0 10px 35px rgba(0, 0, 0, 0.7)',
            }}
          >
            {/* Header */}
            <div>
              <div
                style={{
                  color: 'rgba(255, 255, 255, 0.25)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  userSelect: 'none',
                }}
              >
                ------------------------------------------------------------
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '14px',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  color: 'var(--text)',
                  margin: '6px 0',
                }}
              >
                SAMPLE ACQUISITION
              </div>
              <div
                style={{
                  color: 'rgba(255, 255, 255, 0.25)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  userSelect: 'none',
                }}
              >
                ------------------------------------------------------------
              </div>
            </div>

            {/* Breath/sample input status */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
                color: 'var(--text)',
              }}
            >
              <span>Breath/sample input received</span>
              <span style={{ color: '#10b981', fontWeight: 700 }}>✓</span>
            </div>

            {/* Sensor chamber status */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  color: 'var(--text-2)',
                  letterSpacing: '0.04em',
                }}
              >
                Sensor chamber:
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#10b981',
                    boxShadow: '0 0 10px #10b981',
                    animation: 'beaconPulse 1.2s infinite ease-in-out',
                  }}
                />
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '14px',
                    fontWeight: 700,
                    color: '#10b981',
                    letterSpacing: '0.08em',
                  }}
                >
                  ACTIVE
                </span>
              </div>
            </div>

            {/* Signal acquisition progress */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  color: 'var(--text-2)',
                  letterSpacing: '0.04em',
                }}
              >
                Signal acquisition:
              </span>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '14px',
                  color: '#10b981',
                  letterSpacing: '0.04em',
                  backgroundColor: 'rgba(0, 0, 0, 0.4)',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1px solid var(--keyline)',
                }}
              >
                {renderAsciiProgressBar(acquisitionProgress)}
              </div>
            </div>

            {/* Status */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  color: 'var(--text-2)',
                  letterSpacing: '0.04em',
                }}
              >
                Status:
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '14px',
                  fontWeight: 700,
                  color: inputCaptured ? '#10b981' : 'var(--amber)',
                  letterSpacing: '0.08em',
                }}
              >
                {inputCaptured ? 'INPUT CAPTURED' : 'ACQUIRING GAS SAMPLE...'}
              </span>
            </div>

            {/* Teammate trigger button [ ANALYZE ] per slide instructions */}
            <button
              type="button"
              className="btn-primary"
              onClick={advanceToStage3}
              style={{
                width: '100%',
                height: '50px',
                fontFamily: 'var(--font-mono)',
                fontSize: '14px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                borderRadius: '8px',
                marginTop: '6px',
                backgroundColor: inputCaptured ? 'var(--teal)' : 'var(--bg-pod)',
                color: inputCaptured ? '#020617' : 'var(--text-2)',
                borderColor: inputCaptured ? 'var(--teal-glow)' : 'var(--keyline)',
                transition: 'all 200ms ease',
              }}
            >
              [ ANALYZE ]
            </button>
          </div>
        )}

        {/* ================================================================= */}
        {/* STAGE 3 — PROCESSING / AI ANALYSIS (Image 2)                      */}
        {/* ================================================================= */}
        {currentStage === 3 && (
          <div
            style={{
              width: '100%',
              maxWidth: '440px',
              backgroundColor: '#0c1017',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '16px',
              padding: '24px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
              boxShadow: '0 10px 35px rgba(0, 0, 0, 0.7)',
            }}
          >
            {/* Header */}
            <div>
              <div
                style={{
                  color: 'rgba(255, 255, 255, 0.25)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  userSelect: 'none',
                }}
              >
                ------------------------------------------------------------
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '14px',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  color: 'var(--text)',
                  margin: '6px 0',
                }}
              >
                AI ANALYSIS
              </div>
              <div
                style={{
                  color: 'rgba(255, 255, 255, 0.25)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  userSelect: 'none',
                }}
              >
                ------------------------------------------------------------
              </div>
            </div>

            {/* Checklist items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Step 1: Input received */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '13px',
                  color: analysisStep >= 1 ? 'var(--text)' : 'var(--text-off)',
                }}
              >
                <span>Input received</span>
                {analysisStep >= 1 && <span style={{ color: '#10b981', fontWeight: 700 }}>✓</span>}
              </div>

              {/* Step 2: Pre-processing */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '13px',
                  color: analysisStep >= 2 ? 'var(--text)' : 'var(--text-off)',
                }}
              >
                <span>Pre-processing</span>
                {analysisStep >= 2 ? (
                  <span style={{ color: '#10b981', fontWeight: 700 }}>✓</span>
                ) : analysisStep === 1 ? (
                  <span style={{ color: 'var(--amber)', fontSize: '11px' }}>PROCESSING...</span>
                ) : null}
              </div>

              {/* Step 3: Noise filtering */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '13px',
                  color: analysisStep >= 3 ? 'var(--text)' : 'var(--text-off)',
                }}
              >
                <span>Noise filtering</span>
                {analysisStep >= 3 ? (
                  <span style={{ color: '#10b981', fontWeight: 700 }}>✓</span>
                ) : analysisStep === 2 ? (
                  <span style={{ color: 'var(--amber)', fontSize: '11px' }}>FILTERING...</span>
                ) : null}
              </div>

              {/* Step 4: Feature extraction */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '13px',
                  color: analysisStep >= 4 ? 'var(--text)' : 'var(--text-off)',
                }}
              >
                <span>Feature extraction</span>
                {analysisStep >= 4 ? (
                  <span style={{ color: '#10b981', fontWeight: 700 }}>✓</span>
                ) : analysisStep === 3 ? (
                  <span style={{ color: 'var(--amber)', fontSize: '11px' }}>EXTRACTING...</span>
                ) : null}
              </div>

              {/* Step 5: Pattern matching... */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '13px',
                  color: analysisStep >= 5 ? 'var(--text)' : 'var(--text-off)',
                }}
              >
                <span>Pattern matching...</span>
                {analysisStep >= 6 ? (
                  <span style={{ color: '#10b981', fontWeight: 700 }}>✓</span>
                ) : analysisStep >= 5 ? (
                  <span style={{ color: '#10b981', fontSize: '11px' }}>MATCHING...</span>
                ) : null}
              </div>
            </div>

            {/* Live Waveform: Demo Mode reference profile per slide note */}
            <div
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid var(--keyline)',
                borderRadius: '8px',
                padding: '10px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    color: '#38bdf8',
                    letterSpacing: '0.06em',
                  }}
                >
                  REFERENCE SPECTRAL PROFILE
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    color: '#10b981',
                  }}
                >
                  LIVE
                </span>
              </div>
              <canvas
                ref={canvasRef}
                width={360}
                height={70}
                style={{
                  width: '100%',
                  height: '70px',
                  display: 'block',
                  borderRadius: '4px',
                }}
              />
            </div>

            {/* Please wait status */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                color: 'var(--text-2)',
              }}
            >
              <div
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                  boxShadow: '0 0 8px #10b981',
                  animation: 'beaconPulse 1s infinite ease-in-out',
                }}
              />
              <span>Please wait... synthesizing gas chromatography match</span>
            </div>
          </div>
        )}

        {/* Tactical Sub-pod Hardware Telemetry */}
        <div
          style={{
            width: '100%',
            maxWidth: '440px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px',
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-recessed)',
              border: '1px solid var(--keyline)',
              borderRadius: '6px',
              padding: '8px 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
            }}
          >
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-off)' }}>
              BLE LINK
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: '#10b981',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <Radio size={12} />
              RPi-4B CONNECTED
            </span>
          </div>

          <div
            style={{
              backgroundColor: 'var(--bg-recessed)',
              border: '1px solid var(--keyline)',
              borderRadius: '6px',
              padding: '8px 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
            }}
          >
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-off)' }}>
              RPi STATUS
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: '#10b981',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <Cpu size={12} />
              LED ON · BUZZER BEEP
            </span>
          </div>
        </div>
      </main>

      {/* Action Shelf Status */}
      <footer className="action-shelf" style={{ justifyContent: 'space-between', padding: '0 16px' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-2)' }}>
          TOTAL SEQUENCE: ~12s
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#10b981' }}>
          {currentStage === 2 ? 'ACQUIRING TRANSDUCER SIGNALS' : 'SPECTRAL PATTERN INFERENCE'}
        </span>
      </footer>
    </div>
  );
}
