'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/context/SessionContext';
import { CommandDeck } from '@/components/CommandDeck';
import { ActionShelf } from '@/components/ActionShelf';
import { TelemetryPod } from '@/components/TelemetryPod';
import { RangeBar } from '@/components/RangeBar';
import { GasProfileBars } from '@/components/GasProfileBars';
import { ConfirmModal } from '@/components/ConfirmModal';
import { getSessionImage } from '@/services/imageStorage';
import { AlertOctagon, CheckCircle2, Lock, PlusCircle, ShieldCheck } from 'lucide-react';

export default function ResultsPage() {
  const router = useRouter();
  const {
    session,
    lockResults,
    resetSession,
    autoLockSeconds,
    imageDataUrl,
  } = useSession();

  const [currentImage, setCurrentImage] = useState<string | null>(imageDataUrl);
  const [isResetModalOpen, setIsResetModalOpen] = useState<boolean>(false);

  // Load image from storage if not directly cached
  useEffect(() => {
    if (!currentImage && session?.sessionId) {
      getSessionImage(session.sessionId).then((img) => {
        if (img) setCurrentImage(img);
      });
    }
  }, [currentImage, session?.sessionId]);

  const result = session?.result;

  if (!session || !result) {
    return (
      <div className="tactical-frame">
        <CommandDeck title="NARCOSENSE" />
        <main className="telemetry-canvas" style={{ justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-2)' }}>
            AUTHENTICATING SESSION...
          </div>
        </main>
      </div>
    );
  }

  const isIllegal = result.legality === 'ILLEGAL';
  const isNoDrugs =
    result.substance.toLowerCase().includes('no drugs') ||
    result.substance.toLowerCase().includes('clean') ||
    result.substance.toLowerCase().includes('negative');
  const formattedDate = new Date(session.createdAt).toLocaleDateString();
  const formattedTime = new Date(session.createdAt).toLocaleTimeString();

  return (
    <div className="tactical-frame wide-layout">
      {/* Pinned Command Deck with Inspector Name and Auto-lock countdown */}
      <CommandDeck
        inspectorName={result.inspector_name}
        sessionId={session.sessionId}
        countdownSeconds={autoLockSeconds}
      />

      {/* Edge-to-Edge Decisive Verdict Banner (0px radius) */}
      <section
        className={`verdict-banner ${isIllegal ? 'verdict-illegal' : 'verdict-legal'}`}
        aria-live="polite"
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isIllegal ? (
              <>
                <span className="beacon-dot" />
                <AlertOctagon size={20} color="#ffffff" />
                <span
                  style={{
                    fontFamily: 'var(--font-headline)',
                    fontSize: '18px',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                  }}
                >
                  ILLEGAL VERDICT
                </span>
              </>
            ) : isNoDrugs ? (
              <>
                <CheckCircle2 size={20} color="#ffffff" />
                <span
                  style={{
                    fontFamily: 'var(--font-headline)',
                    fontSize: '18px',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                  }}
                >
                  NEGATIVE · NO DRUGS DETECTED
                </span>
              </>
            ) : (
              <>
                <CheckCircle2 size={20} color="#ffffff" />
                <span
                  style={{
                    fontFamily: 'var(--font-headline)',
                    fontSize: '18px',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                  }}
                >
                  LEGAL CLEARANCE
                </span>
              </>
            )}
          </div>

          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '15px',
              fontWeight: 700,
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              padding: '3px 10px',
              borderRadius: '3px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            {result.confidence_score || result.confidence_min}% CONF
          </span>
        </div>

        {/* Substance Name on Banner for Instant Recognition */}
        <div
          style={{
            fontFamily: 'var(--font-headline)',
            fontSize: '24px',
            lineHeight: '28px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.02em',
            marginTop: '2px',
          }}
        >
          {result.substance}
        </div>
      </section>

      {/* Telemetry Canvas - Responsive Stack (1 column mobile, 2 columns tablet) */}
      <main className="telemetry-canvas">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '14px',
            width: '100%',
          }}
        >
          {/* Left Column (or Stack Item 1 & 2) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Captured Image Pod */}
            <TelemetryPod
              label="CAPTURED IMAGE"
              subLabel={`#${session.sessionId} · ${formattedTime}`}
            >
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '210px',
                  backgroundColor: 'var(--bg-recessed)',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  border: '1px solid var(--keyline)',
                }}
              >
                {currentImage ? (
                  <img
                    src={currentImage}
                    alt="Captured test subject evidence"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '12px',
                      color: 'var(--text-off)',
                    }}
                  >
                    NO IMAGE CAPTURED
                  </div>
                )}

                {/* Evidence Overlay */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '8px',
                    left: '8px',
                    backgroundColor: 'rgba(2, 6, 23, 0.85)',
                    padding: '3px 8px',
                    borderRadius: '2px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    color: 'var(--text-2)',
                    border: '1px solid var(--keyline)',
                  }}
                >
                  TIMESTAMP: {formattedDate} {formattedTime}
                </div>
              </div>
            </TelemetryPod>

            {/* Gas Sensor Array Telemetry Pod */}
            <TelemetryPod
              label="GAS SENSOR ARRAY"
              subLabel="MULTI-CHANNEL TELEMETRY"
            >
              <GasProfileBars profile={result.gas_profile} />
            </TelemetryPod>
          </div>

          {/* Right Column (or Stack Item 3 & 4) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Predicted Substance Pod */}
            <TelemetryPod label="PREDICTED SUBSTANCE">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div
                  style={{
                    fontFamily: 'var(--font-headline)',
                    fontSize: '22px',
                    fontWeight: 700,
                    color: 'var(--text)',
                  }}
                >
                  {result.substance}
                </div>

                <div
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '14px',
                    color: 'var(--text-2)',
                  }}
                >
                  {result.category}
                </div>

                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginTop: '8px',
                    padding: '4px 8px',
                    backgroundColor: 'var(--bg-recessed)',
                    borderRadius: '3px',
                    border: '1px solid var(--keyline)',
                    width: 'fit-content',
                  }}
                >
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: isIllegal ? 'var(--crimson)' : 'var(--emerald)',
                    }}
                  />
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: isIllegal ? 'var(--crimson)' : 'var(--emerald)',
                      letterSpacing: '0.04em',
                    }}
                  >
                    STATUS: {isNoDrugs ? 'CLEAN / NEGATIVE' : result.legality}
                  </span>
                </div>
              </div>
            </TelemetryPod>

            {/* Confidence Score & Range Pod */}
            <TelemetryPod label="CONFIDENCE SCORE">
              <RangeBar
                min={result.confidence_min}
                max={result.confidence_max}
                score={result.confidence_score}
              />
            </TelemetryPod>

            {/* Forensic Chain of Custody & Verification Pod */}
            <div
              style={{
                backgroundColor: 'rgba(13, 148, 136, 0.08)',
                border: '1px solid var(--keyline)',
                borderRadius: '4px',
                padding: '12px 14px',
                display: 'flex',
                gap: '10px',
                alignItems: 'center',
              }}
            >
              <ShieldCheck size={20} color="var(--teal)" style={{ flexShrink: 0 }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-headline)',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: 'var(--text)',
                    letterSpacing: '0.04em',
                  }}
                >
                  FORENSIC CLASSIFICATION VERIFIED
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    color: 'var(--text-2)',
                    lineHeight: '1.4',
                  }}
                >
                  Gas spectrometry signature certified · Session evidence locked
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Action Shelf */}
      <ActionShelf>
        <button
          type="button"
          className="btn-secondary"
          onClick={lockResults}
          title="Immediately lock results screen"
        >
          <Lock size={16} /> LOCK NOW
        </button>

        <button
          type="button"
          className="btn-primary"
          onClick={() => setIsResetModalOpen(true)}
        >
          <PlusCircle size={18} /> NEW TEST
        </button>
      </ActionShelf>

      {/* Confirmation Modal for Resetting Session */}
      <ConfirmModal
        isOpen={isResetModalOpen}
        title="CLEAR RESULT & START NEW TEST?"
        message="This will purge in-memory evidence, image blobs, and sensor readouts from the current screening session and return to Step 1."
        confirmText="CLEAR & START"
        cancelText="CANCEL"
        variant="amber"
        onConfirm={async () => {
          setIsResetModalOpen(false);
          await resetSession();
        }}
        onCancel={() => setIsResetModalOpen(false)}
      />
    </div>
  );
}
