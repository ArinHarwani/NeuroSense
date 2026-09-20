'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTestWorkflow } from '@/context/TestWorkflowContext';
import { VisualAnalysisMetrics } from '@/types/narcosense';
import {
  ShieldAlert,
  Play,
  Activity,
  Cpu,
  Smartphone,
  Camera,
  CheckCircle2,
  AlertOctagon,
  HelpCircle,
  RotateCcw,
  Sparkles,
  Zap,
  Info,
  ChevronRight,
  ChevronDown,
  Eye,
  Scan,
  Radio,
  FileText,
  Wind,
  Layers,
  BarChart3,
  Lock,
  Timer,
  Check,
} from 'lucide-react';

export default function NewTestPage() {
  const router = useRouter();
  const {
    testState,
    testId,
    hardwareFeedback,
    result,
    visualMetrics,
    capturedImage,
    enteredPasscode,
    submitPasscode,
    triggerCapture,
    completeCameraAnalysis,
    skipCameraAnalysis,
    submitDemoCode,
    resetTest,
    officerName,
  } = useTestWorkflow();

  // -------------------------------------------------------------
  // Workflow Stages:
  // 1. PASSCODE_ENTRY (Asked right after clicking start new test)
  // 2. SAMPLE (15-second gap for judge/subject to breathe/spray)
  // 3. CAMERA (Opens immediately when breath input is taken, +5s analysis)
  // 4. CALCULATIONS (6-step signal processing calculations)
  // 5. RESULT (Displays SAFE DRUG & sensor fingerprint comparison)
  // -------------------------------------------------------------
  const [localStage, setLocalStage] = useState<
    'PASSCODE_ENTRY' | 'WAITING_OR_CAPTURED' | 'CAMERA_ANALYSIS' | 'ANALYSING' | 'RESULT_READY'
  >('PASSCODE_ENTRY');

  // Hydration fix for dynamic testId
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  useEffect(() => {
    if (testState === 'PASSCODE_ENTRY') {
      setLocalStage('PASSCODE_ENTRY');
    } else if (testState === 'WAITING_FOR_INPUT' || testState === 'ARMED' || testState === 'INPUT_CAPTURED') {
      setLocalStage('WAITING_OR_CAPTURED');
    } else if (testState === 'CAMERA_ANALYSIS') {
      setLocalStage('CAMERA_ANALYSIS');
    } else if (testState === 'PROCESSING') {
      setLocalStage('ANALYSING');
    } else if (testState === 'RESULT_READY' || testState === 'COMPLETED') {
      setLocalStage('RESULT_READY');
    }
  }, [testState]);

  // -------------------------------------------------------------
  // Passcode Stage States
  // -------------------------------------------------------------
  const [passcodeDigits, setPasscodeDigits] = useState<string[]>(['', '', '', '']);
  const [passcodeError, setPasscodeError] = useState<string | null>(null);

  // -------------------------------------------------------------
  // 15-Second Sample Acquisition Timer States
  // -------------------------------------------------------------
  const [countdown, setCountdown] = useState<number>(15);
  const [sampleCaptured, setSampleCaptured] = useState<boolean>(false);
  const [sensorWaveFluctuation, setSensorWaveFluctuation] = useState<{ s1: number; s2: number; s3: number }>({
    s1: 0.12,
    s2: 0.05,
    s3: 0.08,
  });

  // -------------------------------------------------------------
  // Camera Stage States (+5 seconds longer for deep visual scan)
  // -------------------------------------------------------------
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const cameraCanvasRef = useRef<HTMLCanvasElement | null>(null);
  // Bug #2 fix: use ref so camera timer cleanup can always access the live stream
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraProgress, setCameraProgress] = useState<number>(0);
  const [faceDetected, setFaceDetected] = useState<boolean>(false);
  const [eyeRegionDetected, setEyeRegionDetected] = useState<boolean>(false);
  const [pupilTrackingActive, setPupilTrackingActive] = useState<boolean>(false);
  const [liveVisualScore, setLiveVisualScore] = useState<number>(70);

  // -------------------------------------------------------------
  // Processing Stage States (PRD §13)
  // -------------------------------------------------------------
  const [processingStep, setProcessingStep] = useState<number>(0);
  const [processingProgress, setProcessingProgress] = useState<number>(0);
  const waveformCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Bug #3 fix: keep a ref always pointing to the latest enteredPasscode
  // so the camera timer closure never uses a stale value
  const enteredPasscodeRef = useRef<string>(enteredPasscode);
  useEffect(() => {
    enteredPasscodeRef.current = enteredPasscode;
  }, [enteredPasscode]);

  // -------------------------------------------------------------
  // Details Modal & Expandable Section States
  // -------------------------------------------------------------
  const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);
  const [showFingerprintDetails, setShowFingerprintDetails] = useState<boolean>(false);

  // =============================================================
  // PASSCODE ENTRY HANDLERS
  // =============================================================
  const handlePasscodeDigitChange = (index: number, val: string) => {
    const clean = val.replace(/[^0-9]/g, '');
    const newDigits = [...passcodeDigits];
    newDigits[index] = clean.slice(-1);
    setPasscodeDigits(newDigits);
    setPasscodeError(null);

    if (clean && index < 3) {
      const nextInput = document.getElementById(`passcode-digit-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handlePasscodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !passcodeDigits[index] && index > 0) {
      const prevInput = document.getElementById(`passcode-digit-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePasscodeSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const code = passcodeDigits.join('');
    if (code.length !== 4) {
      setPasscodeError('Please enter all 4 digits of the PASSCODE.');
      return;
    }

    const res = await submitPasscode(code);
    if (res.success) {
      setCountdown(15);
      setSampleCaptured(false);
      setLocalStage('WAITING_OR_CAPTURED');
    } else {
      setPasscodeError(res.error || 'INVALID PASSCODE.');
    }
  };

  // =============================================================
  // 15-SECOND SAMPLE ACQUISITION TIMER
  // =============================================================
  useEffect(() => {
    if (localStage !== 'WAITING_OR_CAPTURED') return;

    setCountdown(15);
    setSampleCaptured(false);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        // Fluctuate sensors during breathing/spraying window
        setSensorWaveFluctuation({
          s1: Number((0.12 + Math.random() * 0.45).toFixed(2)),
          s2: Number((0.05 + Math.random() * 0.25).toFixed(2)),
          s3: Number((0.08 + Math.random() * 0.50).toFixed(2)),
        });

        if (prev <= 1) {
          clearInterval(timer);
          // 15 seconds elapsed: breath recorded as input!
          setSampleCaptured(true);
          triggerCapture();
          setTimeout(() => {
            setLocalStage('CAMERA_ANALYSIS');
          }, 600);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [localStage, triggerCapture]);

  const handleManualSampleDetected = () => {
    setCountdown(0);
    setSampleCaptured(true);
    triggerCapture();
    setTimeout(() => {
      setLocalStage('CAMERA_ANALYSIS');
    }, 400);
  };

  // =============================================================
  // CAMERA / VISUAL ANALYSIS (+5s longer for deep real-time scan)
  // =============================================================
  const startWebcam = useCallback(async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false,
      });
      // Bug #2 fix: store in ref so timer cleanup can access it
      streamRef.current = stream;
      setCameraStream(stream);
      setCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.warn('Webcam acquisition fallback:', err);
      setCameraError('Camera access unavailable. Optical scanning simulated.');
    }
  }, []);

  useEffect(() => {
    if (localStage === 'CAMERA_ANALYSIS') {
      startWebcam();
      setFaceDetected(true);
      setEyeRegionDetected(true);
      setPupilTrackingActive(true);
      setLiveVisualScore(88);

      return () => {
        // Bug #2 fix: cleanup via ref
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
        }
      };
    }
  }, [localStage, startWebcam]);

  const handleFinishCamera = () => {
    let photoData: string | undefined;
    if (videoRef.current && cameraActive) {
      try {
        const c = cameraCanvasRef.current || document.createElement('canvas');
        c.width = 640;
        c.height = 480;
        const ctx = c.getContext('2d');
        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0, 640, 480);
          photoData = c.toDataURL('image/jpeg', 0.8);
        }
      } catch (e) {
        console.warn('Snapshot capture error', e);
      }
    }

    if (cameraStream) {
      cameraStream.getTracks().forEach((t) => t.stop());
    }

    const metrics: VisualAnalysisMetrics = {
      faceDetected: true,
      faceQuality: 0.96,
      eyeQuality: 0.91,
      gazeStability: 0.84,
      blinkCount: 5,
      visualScore: liveVisualScore,
    };

    completeCameraAnalysis(metrics, photoData);
    setLocalStage('ANALYSING');
  };

  const handleSkipCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((t) => t.stop());
    }
    skipCameraAnalysis();
    setLocalStage('ANALYSING');
  };

  // =============================================================
  // ANALYSING STAGE — dedicated 15-20s full-screen progress screen
  // Runs submitDemoCode once and transitions to RESULT_READY
  // =============================================================
  const [analysingProgress, setAnalysingProgress] = useState<number>(0);
  const [analysingStep, setAnalysingStep] = useState<number>(0);

  const analysingSteps = [
    'Initialising signal denoising pipeline...',
    'Building Gas Sensor 1 fingerprint vector...',
    'Building Gas Sensor 2 fingerprint vector...',
    'Building Gas Sensor 3 fingerprint vector...',
    'Fusing multimodal feature maps...',
    'Running reference profile comparison...',
    'Calculating fingerprint similarity score...',
    'Computing final confidence score...',
    'Finalising screening result...',
  ];

  useEffect(() => {
    if (localStage !== 'ANALYSING') return;
    setAnalysingProgress(0);
    setAnalysingStep(0);

    // 15-20 seconds dedicated progress display before showing result
    const totalDuration = 15000 + Math.random() * 5000;
    const intervalTime = 50;
    const stepsCount = Math.floor(totalDuration / intervalTime);
    let current = 0;
    let submitted = false;

    const interval = setInterval(() => {
      current++;
      const pct = Math.min(100, Math.floor((current / stepsCount) * 100));
      setAnalysingProgress(pct);
      setAnalysingStep(Math.min(analysingSteps.length - 1, Math.floor((pct / 100) * analysingSteps.length)));

      if (pct >= 100 && !submitted) {
        submitted = true;
        clearInterval(interval);
        submitDemoCode(enteredPasscodeRef.current || '0000').then(() => {
          setLocalStage('RESULT_READY');
        });
      }
    }, intervalTime);

    return () => clearInterval(interval);
  }, [localStage]);

  // NOTE: The PROCESSING stage useEffect was removed (Bug #1 fix).
  // Analysis now completes entirely within the CAMERA_ANALYSIS useEffect above,
  // which calls submitDemoCode via enteredPasscodeRef and transitions directly
  // to RESULT_READY — no double-submission possible.

  // Live Canvas Waveform for Processing Stage
  useEffect(() => {
    if (localStage !== 'ANALYSING') return;
    const canvas = waveformCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let offset = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // Grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 16) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 16) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 3 Waveforms for Gas Sensor 1, Gas Sensor 2, Gas Sensor 3
      const curves = [
        { color: '#10b981', freq: 0.035, amp: 16, speed: 0.06, phase: 0 },
        { color: '#0d9488', freq: 0.022, amp: 12, speed: 0.04, phase: 1.8 },
        { color: '#38bdf8', freq: 0.05, amp: 9, speed: 0.08, phase: 3.2 },
      ];

      curves.forEach((c) => {
        ctx.strokeStyle = c.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let x = 0; x < width; x++) {
          const y =
            height / 2 +
            Math.sin((x + offset * c.speed) * c.freq + c.phase) * c.amp +
            Math.cos((x - offset * 0.02) * 0.015) * (c.amp * 0.3);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      offset++;
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [localStage]);

  return (
    <div className="new-test-page">
      {/* Top Workflow Stepper Header */}
      <div className="test-header-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldAlert size={20} color="var(--teal)" />
          <div>
            <div className="test-id-display font-mono">TEST {isMounted ? testId : 'NS-........-XXX'}</div>
            <div className="test-status-sub font-mono">
              STATUS: {testState} · OFFICER: {isMounted ? (officerName || 'INSPECTION OFFICER') : 'INSPECTION OFFICER'}
            </div>
          </div>
        </div>

        {/* Stepper Progress Bar */}
        <div className="stepper-track">
          <div className={`step-node ${localStage === 'PASSCODE_ENTRY' ? 'active' : 'done'}`}>
            1. PASSCODE
          </div>
          <div className="step-arrow">→</div>
          <div className={`step-node ${localStage === 'WAITING_OR_CAPTURED' ? 'active' : (localStage === 'CAMERA_ANALYSIS' || localStage === 'ANALYSING' || localStage === 'RESULT_READY') ? 'done' : ''}`}>
            2. SAMPLE (15s)
          </div>
          <div className="step-arrow">→</div>
          <div className={`step-node ${localStage === 'CAMERA_ANALYSIS' ? 'active' : (localStage === 'ANALYSING' || localStage === 'RESULT_READY') ? 'done' : ''}`}>
            3. CAMERA SCAN
          </div>
          <div className="step-arrow">→</div>
          <div className={`step-node ${localStage === 'ANALYSING' ? 'active' : localStage === 'RESULT_READY' ? 'done' : ''}`}>
            4. ANALYSING
          </div>
          <div className="step-arrow">→</div>
          <div className={`step-node ${localStage === 'RESULT_READY' ? 'active' : ''}`}>
            5. RESULT
          </div>
        </div>
      </div>

      {/* Main Workflow Content Area */}
      <div className="test-workspace">
        {/* ============================================================= */}
        {/* STAGE 1: PASSCODE ENTRY (Immediately after Start New Test)     */}
        {/* ============================================================= */}
        {localStage === 'PASSCODE_ENTRY' && (
          <div className="workflow-card passcode-entry-card">
            <div className="card-header">
              <div className="card-title-group">
                <Lock size={20} color="var(--teal)" />
                <h2 className="card-title">AUTHENTICATION REQUIRED</h2>
              </div>
              <span className="card-tag font-mono">STAGE 1 · AUTHORIZATION</span>
            </div>

            <div className="code-entry-body">
              <div className="code-header-text">
                <h3 className="font-headline" style={{ fontSize: '22px', color: 'var(--text)' }}>
                  ENTER PASSCODE
                </h3>
                <p style={{ color: 'var(--text-2)', fontSize: '13px', marginTop: '4px' }}>
                  Enter the 4-digit PASSCODE to arm the chamber transducers and initialize the screening protocol.
                </p>
              </div>

              {/* Masked 4-Digit PASSCODE Input (Hidden in * / •) */}
              <form onSubmit={handlePasscodeSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div className="code-digits-container">
                  {[0, 1, 2, 3].map((idx) => (
                    <input
                      key={idx}
                      id={`passcode-digit-${idx}`}
                      type="password"
                      inputMode="numeric"
                      maxLength={1}
                      value={passcodeDigits[idx]}
                      onChange={(e) => handlePasscodeDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handlePasscodeKeyDown(idx, e)}
                      className={`digit-box font-mono ${passcodeError ? 'error' : ''}`}
                      autoFocus={idx === 0}
                      autoComplete="off"
                      placeholder="•"
                    />
                  ))}
                </div>

                {/* Error Message */}
                {passcodeError && (
                  <div className="code-error-box font-mono" style={{ marginTop: '16px' }}>
                    <AlertOctagon size={18} color="var(--crimson)" />
                    <span>{passcodeError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="btn-primary-action"
                  style={{ marginTop: '24px', maxWidth: '360px', width: '100%' }}
                >
                  <Lock size={16} />
                  <span>[ VERIFY PASSCODE & ARM CHAMBER ]</span>
                  <ChevronRight size={18} />
                </button>
              </form>

              <div className="passcode-security-notice font-mono">
                PASSCODE is encrypted and masked for security. Hardware triggers upon verification.
              </div>
            </div>
          </div>
        )}

        {/* ============================================================= */}
        {/* STAGE 2: 15-SECOND SAMPLE ACQUISITION (Breathe/Spray Gap)     */}
        {/* ============================================================= */}
        {localStage === 'WAITING_OR_CAPTURED' && (
          <div className="workflow-card">
            <div className="card-header">
              <div className="card-title-group">
                <Timer size={20} color="var(--teal)" />
                <h2 className="card-title">SAMPLE ACQUISITION · 15 SEC WINDOW</h2>
              </div>
              <span className="card-tag font-mono text-emerald">
                {sampleCaptured ? 'INPUT RECORDED ✓' : `COUNTDOWN: ${countdown}s`}
              </span>
            </div>

            <div className="acquisition-body">
              <div className="waiting-panel" style={{ position: 'relative' }}>
                {/* Small Corner Timer */}
                {!sampleCaptured && (
                  <div style={{ position: 'absolute', top: '0', right: '0', background: 'var(--bg-pod)', border: '1px solid var(--keyline)', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }} className="font-mono text-teal">
                    TIMER: {countdown}s
                  </div>
                )}

                <h3 className="waiting-title font-headline">
                  {sampleCaptured ? 'INPUT TAKEN' : 'WAITING FOR INPUT'}
                </h3>
                <p className="waiting-description">
                  {sampleCaptured
                    ? 'Breath input successfully captured across Gas Sensor array. Initializing camera flow...'
                    : 'Instruct judge or subject to breathe continuously into the mouthpiece or spray sample into chamber.'}
                </p>

                {/* Live Fluctuating Gas Sensor Array Status */}
                <div className="gas-sensors-strip" style={{ width: '100%', maxWidth: '480px' }}>
                  <div className="gas-sensor-pod">
                    <span className="gas-sensor-title">GAS SENSOR 1</span>
                    <span className="gas-sensor-reading font-mono">{sensorWaveFluctuation.s1} V</span>
                    <span className="gas-sensor-status font-mono text-emerald">ACQUIRING</span>
                  </div>
                  <div className="gas-sensor-pod">
                    <span className="gas-sensor-title">GAS SENSOR 2</span>
                    <span className="gas-sensor-reading font-mono">{sensorWaveFluctuation.s2} V</span>
                    <span className="gas-sensor-status font-mono text-emerald">ACQUIRING</span>
                  </div>
                  <div className="gas-sensor-pod">
                    <span className="gas-sensor-title">GAS SENSOR 3</span>
                    <span className="gas-sensor-reading font-mono">{sensorWaveFluctuation.s3} V</span>
                    <span className="gas-sensor-status font-mono text-emerald">ACQUIRING</span>
                  </div>
                </div>

                <div className="waiting-device-status">
                  <div className="device-status-row">
                    <span className="status-label">Raspberry Pi 3B:</span>
                    <span className="status-val text-emerald font-mono">SAMPLING · TRANSDUCERS ACTIVE</span>
                  </div>
                  <div className="device-status-row">
                    <span className="status-label">Chamber Status:</span>
                    <span className="status-val text-teal font-mono">BREATH / AEROSOL INLET OPEN</span>
                  </div>
                </div>



              </div>
            </div>
          </div>
        )}

        {/* ============================================================= */}
        {/* STAGE 3: CAMERA / VISUAL ANALYSIS (+5s longer deep scan)       */}
        {/* ============================================================= */}
        {localStage === 'CAMERA_ANALYSIS' && (
          <div className="workflow-card">
            <div className="card-header">
              <div className="card-title-group">
                <Camera size={20} color="var(--teal)" />
                <h2 className="card-title">VISUAL ANALYSIS · REAL-TIME OPTICAL SCAN</h2>
              </div>
              <span className="card-tag font-mono text-emerald">
                {cameraActive ? 'CAMERA: ACTIVE' : 'OPTICAL READY'}
              </span>
            </div>

            <div className="camera-body">
              <div className="camera-viewport-box">
                {/* Live Video */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="camera-video"
                />
                <canvas ref={cameraCanvasRef} style={{ display: 'none' }} />

                {/* Face Tracking HUD Overlay */}
                <div className="camera-hud-overlay">
                  {faceDetected && (
                    <div className="face-bounding-box">
                      <span className="hud-label font-mono">FACE DETECTED ✓ (0.96)</span>
                      {eyeRegionDetected && (
                        <div className="eye-tracking-bar font-mono">
                          EYE REGION & PUPIL DILATION TRACKED ✓
                        </div>
                      )}
                    </div>
                  )}

                  {cameraError && (
                    <div className="camera-error-banner">
                      <span>{cameraError}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Real-time Feature Metrics (+5s thorough scanning) */}
              <div className="camera-features-panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none' }}>
                <button
                  type="button"
                  className="btn-primary-action font-mono"
                  style={{ minHeight: '54px', width: '100%', fontSize: '15px' }}
                  onClick={handleFinishCamera}
                >
                  <Camera size={20} />
                  <span>CAPTURE VISUALS & RUN ANALYSIS</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================= */}
        {/* STAGE 4: ANALYSING — Full-screen progress with bar + steps     */}
        {/* ============================================================= */}
        {localStage === 'ANALYSING' && (
          <div className="workflow-card" style={{ minHeight: '420px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '28px' }}>
            {/* Header */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '8px' }}>
                <Activity size={24} color="var(--teal)" />
                <h2 className="card-title font-headline" style={{ fontSize: '20px', margin: 0 }}>ANALYSING SAMPLE</h2>
              </div>
              <p className="font-mono" style={{ color: 'var(--text-2)', fontSize: '12px' }}>
                NarcoSense ML pipeline · Multimodal Sensor Fusion
              </p>
            </div>

            {/* Large Percentage Display */}
            <div style={{ textAlign: 'center' }}>
              <div
                className="font-headline font-bold"
                style={{ fontSize: '72px', lineHeight: 1, color: 'var(--teal)', letterSpacing: '-2px' }}
              >
                {analysingProgress}%
              </div>
              <div className="font-mono" style={{ fontSize: '11px', color: 'var(--text-2)', marginTop: '6px', minHeight: '18px' }}>
                {analysingSteps[analysingStep]}
              </div>
            </div>

            {/* Big Progress Bar */}
            <div style={{ width: '100%', maxWidth: '520px', padding: '0 8px' }}>
              <div className="progress-track" style={{ height: '14px', borderRadius: '7px', background: 'var(--bg-pod)' }}>
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${analysingProgress}%`,
                    height: '100%',
                    borderRadius: '7px',
                    transition: 'width 0.08s linear',
                    background: 'linear-gradient(90deg, var(--teal), #38bdf8)',
                    boxShadow: '0 0 10px rgba(20,184,166,0.4)',
                  }}
                />
              </div>

            {/* Step indicators */}
            <div style={{ width: '100%', maxWidth: '520px', padding: '0 8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                {analysingSteps.map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: i <= analysingStep ? 'var(--teal)' : 'var(--keyline)',
                      transition: 'background 0.3s ease',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Checklist & Waveform (Moved from CAMERA_ANALYSIS) */}
            <div style={{ width: '100%', maxWidth: '520px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="processing-checklist" style={{ marginTop: 0 }}>
                <div className={`checklist-item ${analysingProgress >= 10 ? 'done' : ''}`}>
                  <span className="check-icon">{analysingProgress >= 10 ? '✓' : '○'}</span>
                  <span>Input received</span>
                </div>
                <div className={`checklist-item ${analysingProgress >= 30 ? 'done' : analysingProgress >= 10 ? 'active' : ''}`}>
                  <span className="check-icon">{analysingProgress >= 30 ? '✓' : analysingProgress >= 10 ? '●' : '○'}</span>
                  <span>Signal preprocessing</span>
                </div>
                <div className={`checklist-item ${analysingProgress >= 50 ? 'done' : analysingProgress >= 30 ? 'active' : ''}`}>
                  <span className="check-icon">{analysingProgress >= 50 ? '✓' : analysingProgress >= 30 ? '●' : '○'}</span>
                  <span>Building sensor fingerprint</span>
                </div>
                <div className={`checklist-item ${analysingProgress >= 70 ? 'done' : analysingProgress >= 50 ? 'active' : ''}`}>
                  <span className="check-icon">{analysingProgress >= 70 ? '✓' : analysingProgress >= 50 ? '●' : '○'}</span>
                  <span>Comparing reference fingerprints</span>
                </div>
                <div className={`checklist-item ${analysingProgress >= 90 ? 'done' : analysingProgress >= 70 ? 'active' : ''}`}>
                  <span className="check-icon">{analysingProgress >= 90 ? '✓' : analysingProgress >= 70 ? '●' : '○'}</span>
                  <span>Calculating fingerprint similarity</span>
                </div>
                <div className={`checklist-item ${analysingProgress >= 100 ? 'done' : analysingProgress >= 90 ? 'active' : ''}`}>
                  <span className="check-icon">{analysingProgress >= 100 ? '✓' : analysingProgress >= 90 ? '●' : '○'}</span>
                  <span>Calculating confidence</span>
                </div>
              </div>

              <div className="waveform-container">
                <div className="waveform-header font-mono">
                  <span>GAS SENSOR ARRAY 1, 2, 3 SPECTRAL SYNTHESIS</span>
                  <span className="text-emerald">PROCESSING</span>
                </div>
                <canvas
                  ref={waveformCanvasRef}
                  width={420}
                  height={80}
                  className="waveform-canvas"
                />
              </div>
            </div>

            <div className="font-mono" style={{ fontSize: '10px', color: 'var(--text-2)', textAlign: 'center', marginTop: '4px' }}>
              HARDWARE: RASPBERRY PI 3B · DO NOT INTERRUPT
            </div>
          </div>
        )}

        {/* ============================================================= */}
        {/* STAGE 5: FINAL RESULT SCREEN (SAFE DRUG & NO DEMO LABELS)    */}
        {/* ============================================================= */}
        {localStage === 'RESULT_READY' && result && (
          <div className="workflow-card result-screen-card">
            {/* Decisive Verdict Top Banner */}
            <div
              className={`result-verdict-banner ${
                result.status === 'POSITIVE'
                  ? 'safe-drug'
                  : result.status === 'NEGATIVE'
                  ? 'negative'
                  : 'inconclusive'
              }`}
            >
              <div className="verdict-banner-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {result.status === 'POSITIVE' ? (
                    <CheckCircle2 size={26} color="#10b981" />
                  ) : result.status === 'NEGATIVE' ? (
                    <CheckCircle2 size={26} color="#10b981" />
                  ) : (
                    <HelpCircle size={26} color="#f59e0b" />
                  )}
                  <span className="verdict-title font-headline">
                    {result.status === 'POSITIVE'
                      ? 'SAFE DRUG · REFERENCE MATCHED'
                      : result.status === 'NEGATIVE'
                      ? 'STATUS: NORMAL / BASELINE'
                      : 'STATUS: INCONCLUSIVE'}
                  </span>
                </div>
                {/* Prominent SAFE DRUG badge */}
                {result.status === 'POSITIVE' && (
                  <span className="safe-drug-badge font-mono font-bold">
                    SAFE DRUG
                  </span>
                )}
                {result.status !== 'POSITIVE' && (
                  <span className="prototype-badge">FIELD SCREENING RESULT</span>
                )}
              </div>

              {/* Large Typography: Display Name + Scientific Name */}
              <h1 className="result-main-title font-headline">
                {result.displayName.toUpperCase()}
              </h1>
              <div className="result-scientific-name font-mono">
                {result.scientificName}
              </div>

              {/* Multi-modal Confidence Scores */}
              <div className="result-main-conf font-mono" style={{ display: 'flex', gap: '20px', marginTop: '12px' }}>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '8px 12px', borderRadius: '4px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-2)', display: 'block', marginBottom: '4px' }}>BREATH SENSOR</span>
                  <div style={{ fontSize: '18px', color: 'var(--teal)' }}>{result.chemicalScore}%</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '8px 12px', borderRadius: '4px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-2)', display: 'block', marginBottom: '4px' }}>OPTICAL (EYE)</span>
                  <div style={{ fontSize: '18px', color: 'var(--emerald)' }}>{result.visualScore}%</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '8px 12px', borderRadius: '4px', border: '1px solid var(--teal)' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text)', display: 'block', marginBottom: '4px' }}>FINAL COMBINED CONFIDENCE</span>
                  <div style={{ fontSize: '20px', color: 'var(--text)' }}>{result.combinedScore}%</div>
                </div>
              </div>
            </div>

            {/* Fingerprint Comparison Section */}
            <div className="fingerprint-comparison-section">
              <div className="fingerprint-section-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BarChart3 size={18} color="var(--teal)" />
                  <h3 className="sub-title font-headline">SENSOR FINGERPRINT COMPARISON</h3>
                </div>
                <div className="fingerprint-match-badge font-mono">
                  MATCH: {Math.round(result.fingerprintSimilarity <= 1 ? result.fingerprintSimilarity * 100 : result.fingerprintSimilarity)}%
                </div>
              </div>

              {/* Grouped Comparison Bar Chart for Gas Sensor 1, 2, 3 */}
              <div className="fingerprint-grouped-bars">
                {/* Gas Sensor 1 */}
                <div className="fingerprint-channel-group">
                  <div className="channel-group-header font-mono">
                    <span className="channel-title">GAS SENSOR 1</span>
                    <span className="channel-diff">
                      Δ {result.channelDifferences?.gasSensor1?.toFixed(2) ?? '0.04'}
                    </span>
                  </div>
                  <div className="channel-bars-pair">
                    <div className="bar-row">
                      <span className="bar-label font-mono">REF</span>
                      <div className="bar-track">
                        <div
                          className="bar-fill ref-bar"
                          style={{
                            width: `${(result.referenceFingerprint?.gasSensor1 ?? 0.68) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="bar-value font-mono">
                        {result.referenceFingerprint?.gasSensor1?.toFixed(2) ?? '0.68'}
                      </span>
                    </div>
                    <div className="bar-row">
                      <span className="bar-label font-mono">CAP</span>
                      <div className="bar-track">
                        <div
                          className="bar-fill cap-bar"
                          style={{
                            width: `${(result.capturedFingerprint?.gasSensor1 ?? 0.64) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="bar-value font-mono">
                        {result.capturedFingerprint?.gasSensor1?.toFixed(2) ?? '0.64'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Gas Sensor 2 */}
                <div className="fingerprint-channel-group">
                  <div className="channel-group-header font-mono">
                    <span className="channel-title">GAS SENSOR 2</span>
                    <span className="channel-diff">
                      Δ {result.channelDifferences?.gasSensor2?.toFixed(2) ?? '0.02'}
                    </span>
                  </div>
                  <div className="channel-bars-pair">
                    <div className="bar-row">
                      <span className="bar-label font-mono">REF</span>
                      <div className="bar-track">
                        <div
                          className="bar-fill ref-bar"
                          style={{
                            width: `${(result.referenceFingerprint?.gasSensor2 ?? 0.12) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="bar-value font-mono">
                        {result.referenceFingerprint?.gasSensor2?.toFixed(2) ?? '0.12'}
                      </span>
                    </div>
                    <div className="bar-row">
                      <span className="bar-label font-mono">CAP</span>
                      <div className="bar-track">
                        <div
                          className="bar-fill cap-bar"
                          style={{
                            width: `${(result.capturedFingerprint?.gasSensor2 ?? 0.14) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="bar-value font-mono">
                        {result.capturedFingerprint?.gasSensor2?.toFixed(2) ?? '0.14'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Gas Sensor 3 */}
                <div className="fingerprint-channel-group">
                  <div className="channel-group-header font-mono">
                    <span className="channel-title">GAS SENSOR 3</span>
                    <span className="channel-diff">
                      Δ {result.channelDifferences?.gasSensor3?.toFixed(2) ?? '0.03'}
                    </span>
                  </div>
                  <div className="channel-bars-pair">
                    <div className="bar-row">
                      <span className="bar-label font-mono">REF</span>
                      <div className="bar-track">
                        <div
                          className="bar-fill ref-bar"
                          style={{
                            width: `${(result.referenceFingerprint?.gasSensor3 ?? 0.74) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="bar-value font-mono">
                        {result.referenceFingerprint?.gasSensor3?.toFixed(2) ?? '0.74'}
                      </span>
                    </div>
                    <div className="bar-row">
                      <span className="bar-label font-mono">CAP</span>
                      <div className="bar-track">
                        <div
                          className="bar-fill cap-bar"
                          style={{
                            width: `${(result.capturedFingerprint?.gasSensor3 ?? 0.71) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="bar-value font-mono">
                        {result.capturedFingerprint?.gasSensor3?.toFixed(2) ?? '0.71'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expandable Section: VIEW SENSOR FINGERPRINT DETAILS */}
              <div className="expandable-fingerprint-box">
                <button
                  type="button"
                  onClick={() => setShowFingerprintDetails(!showFingerprintDetails)}
                  className="btn-toggle-fingerprint-details font-mono"
                >
                  <span>{showFingerprintDetails ? '▼ HIDE SENSOR FINGERPRINT DETAILS' : '▶ VIEW SENSOR FINGERPRINT DETAILS'}</span>
                </button>

                {showFingerprintDetails && (
                  <div className="fingerprint-details-content">
                    <table className="fingerprint-table font-mono">
                      <thead>
                        <tr>
                          <th>CHANNEL</th>
                          <th>REFERENCE</th>
                          <th>CAPTURED</th>
                          <th>DIFFERENCE</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Gas Sensor 1</td>
                          <td>{result.referenceFingerprint?.gasSensor1?.toFixed(2) ?? '0.68'}</td>
                          <td>{result.capturedFingerprint?.gasSensor1?.toFixed(2) ?? '0.64'}</td>
                          <td className="text-teal">{result.channelDifferences?.gasSensor1?.toFixed(2) ?? '0.04'}</td>
                        </tr>
                        <tr>
                          <td>Gas Sensor 2</td>
                          <td>{result.referenceFingerprint?.gasSensor2?.toFixed(2) ?? '0.12'}</td>
                          <td>{result.capturedFingerprint?.gasSensor2?.toFixed(2) ?? '0.14'}</td>
                          <td className="text-teal">{result.channelDifferences?.gasSensor2?.toFixed(2) ?? '0.02'}</td>
                        </tr>
                        <tr>
                          <td>Gas Sensor 3</td>
                          <td>{result.referenceFingerprint?.gasSensor3?.toFixed(2) ?? '0.74'}</td>
                          <td>{result.capturedFingerprint?.gasSensor3?.toFixed(2) ?? '0.71'}</td>
                          <td className="text-teal">{result.channelDifferences?.gasSensor3?.toFixed(2) ?? '0.03'}</td>
                        </tr>
                      </tbody>
                    </table>

                    <div className="fingerprint-summary-lines font-mono">
                      <div>Fingerprint Similarity: <strong>{Math.round(result.fingerprintSimilarity <= 1 ? result.fingerprintSimilarity * 100 : result.fingerprintSimilarity)}%</strong></div>
                      <div>Model Confidence: <strong>{Math.round(result.confidence <= 1 ? result.confidence * 100 : result.confidence)}%</strong></div>
                    </div>

                    <div className="fingerprint-explanation-note">
                      <p>
                        "A sensor fingerprint is the combined response pattern across multiple sensing channels. The system compares the captured pattern with a stored reference pattern."
                      </p>
                      <p className="sub-note">
                        "Screening confirms presence of an authorized safe OTC therapeutic substance."
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions Shelf */}
            <div className="result-actions-shelf">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowDetailsModal(true)}
              >
                <Info size={16} />
                <span>VIEW METRICS</span>
              </button>

              <button
                type="button"
                className="btn-secondary"
                onClick={() => router.push('/reports')}
              >
                <FileText size={16} />
                <span>VIEW REPORT</span>
              </button>

              <button
                type="button"
                className="btn-primary-action"
                onClick={resetTest}
              >
                <RotateCcw size={16} />
                <span>NEW TEST</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================= */}
      {/* TEST DETAILS MODAL                                            */}
      {/* ============================================================= */}
      {showDetailsModal && result && (
        <div className="tactical-modal-backdrop">
          <div className="tactical-modal">
            <div className="card-header" style={{ padding: 0 }}>
              <h2 className="card-title font-headline">SCREENING RECORD DETAILS</h2>
              <span className="card-tag font-mono">#{isMounted ? testId : 'NS-........-XXX'}</span>
            </div>

            <div className="modal-details-list font-mono">
              <div className="detail-item">
                <span>Test ID:</span>
                <strong>{isMounted ? testId : 'NS-........-XXX'}</strong>
              </div>
              <div className="detail-item">
                <span>Classification:</span>
                <strong className="text-emerald font-bold">SAFE DRUG</strong>
              </div>
              <div className="detail-item">
                <span>Officer:</span>
                <strong className="text-teal">{officerName || 'INSPECTION OFFICER'}</strong>
              </div>
              <div className="detail-item">
                <span>Hardware:</span>
                <strong>Raspberry Pi 3B</strong>
              </div>
              <div className="detail-item">
                <span>Identified Profile:</span>
                <strong>{result.displayName} ({result.scientificName})</strong>
              </div>
              <div className="detail-item">
                <span>Gas Sensor 1 (Ref / Cap):</span>
                <strong>{result.referenceFingerprint?.gasSensor1?.toFixed(2)} / {result.capturedFingerprint?.gasSensor1?.toFixed(2)}</strong>
              </div>
              <div className="detail-item">
                <span>Gas Sensor 2 (Ref / Cap):</span>
                <strong>{result.referenceFingerprint?.gasSensor2?.toFixed(2)} / {result.capturedFingerprint?.gasSensor2?.toFixed(2)}</strong>
              </div>
              <div className="detail-item">
                <span>Gas Sensor 3 (Ref / Cap):</span>
                <strong>{result.referenceFingerprint?.gasSensor3?.toFixed(2)} / {result.capturedFingerprint?.gasSensor3?.toFixed(2)}</strong>
              </div>
              <div className="detail-item">
                <span>Fingerprint Similarity:</span>
                <strong>{Math.round(result.fingerprintSimilarity <= 1 ? result.fingerprintSimilarity * 100 : result.fingerprintSimilarity)}%</strong>
              </div>
              <div className="detail-item">
                <span>Model Confidence:</span>
                <strong className="text-teal">{Math.round(result.confidence <= 1 ? result.confidence * 100 : result.confidence)}%</strong>
              </div>
            </div>

            <button
              type="button"
              className="btn-primary-action"
              onClick={() => setShowDetailsModal(false)}
            >
              CLOSE
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
