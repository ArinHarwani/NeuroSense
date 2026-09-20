'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import {
  TestState,
  DemoResult,
  VisualAnalysisMetrics,
  DeviceStatus,
  HardwareFeedback,
  TestRecord,
} from '@/types/narcosense';
import { demoResultService } from '@/services/DemoResultService';
import { saveTestRecord, getAppSettings, saveAppSettings } from '@/services/historyStorage';

interface TestWorkflowContextType {
  testState: TestState;
  testId: string;
  officerName: string;
  badgeId: string;
  isLoggedIn: boolean;
  login: (name: string, badgeId?: string) => void;
  logout: () => void;
  deviceStatus: DeviceStatus;
  hardwareFeedback: HardwareFeedback;
  result: DemoResult | null;
  visualMetrics: VisualAnalysisMetrics | null;
  capturedImage: string | null;
  startNewTest: () => Promise<string>;
  armTest: () => void;
  enteredPasscode: string;
  submitPasscode: (passcode: string) => Promise<{ success: boolean; error?: string }>;
  triggerCapture: () => Promise<void>;
  startAnalysis: () => Promise<void>;
  completeCameraAnalysis: (metrics: VisualAnalysisMetrics, image?: string) => void;
  skipCameraAnalysis: () => void;
  submitDemoCode: (code: string) => Promise<{ success: boolean; error?: string }>;
  resetTest: () => Promise<void>;
  loadResultPreview: (result: DemoResult) => void;
  setCapturedImage: (img: string | null) => void;
}

const TestWorkflowContext = createContext<TestWorkflowContextType | null>(null);

function generateTestId(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const randomNum = Math.floor(1 + Math.random() * 999)
    .toString()
    .padStart(3, '0');
  return `NS-${yyyy}${mm}${dd}-${randomNum}`;
}

export function TestWorkflowProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  const [officerName, setOfficerName] = useState<string>('');
  const [badgeId, setBadgeId] = useState<string>('');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const [testState, setTestState] = useState<TestState>('READY');
  const [testId, setTestId] = useState<string>(generateTestId());
  const [enteredPasscode, setEnteredPasscode] = useState<string>('');
  const [result, setResult] = useState<DemoResult | null>(null);
  const [visualMetrics, setVisualMetrics] = useState<VisualAnalysisMetrics | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  // Load Officer and Settings on mount
  useEffect(() => {
    try {
      const savedOfficer = localStorage.getItem('narcosense_officer_name');
      const savedBadge = localStorage.getItem('narcosense_badge_id');
      if (savedOfficer) {
        setOfficerName(savedOfficer);
        setBadgeId(savedBadge || 'NS-OP-01');
        setIsLoggedIn(true);
      }
    } catch {}

    const settings = getAppSettings();
    void settings; // settings loaded but fastDemo no longer used
  }, []);

  const login = useCallback((name: string, badge = 'NS-OP-01') => {
    setOfficerName(name);
    setBadgeId(badge);
    setIsLoggedIn(true);
    try {
      localStorage.setItem('narcosense_officer_name', name);
      localStorage.setItem('narcosense_badge_id', badge);
    } catch {}
  }, []);

  const logout = useCallback(() => {
    setOfficerName('');
    setBadgeId('');
    setIsLoggedIn(false);
    try {
      localStorage.removeItem('narcosense_officer_name');
      localStorage.removeItem('narcosense_badge_id');
    } catch {}
  }, []);

  const [hardwareFeedback, setHardwareFeedback] = useState<HardwareFeedback>({
    ledActive: false,
    buzzerTriggered: false,
    sensorActive: false,
  });

  const [deviceStatus, setDeviceStatus] = useState<DeviceStatus>({
    raspberryPiConnected: true,
    phoneConnected: true,
    cameraReady: true,
    analysisEngineReady: true,
    hardwareFeedback: {
      ledActive: false,
      buzzerTriggered: false,
      sensorActive: false,
    },
  });


  // Subscribe to SSE events from server for live remote synchronization
  useEffect(() => {
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/test/events');
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.session) {
            const s = data.session;
            setTestId(s.testId);
            setTestState(s.state);
            if (s.hardwareFeedback) {
              setHardwareFeedback(s.hardwareFeedback);
              setDeviceStatus((prev) => ({
                ...prev,
                hardwareFeedback: s.hardwareFeedback,
              }));
            }
            if (s.result) {
              setResult(s.result);
            }
          }
        } catch (e) {
          console.error('Error parsing SSE event', e);
        }
      };
    } catch (e) {
      console.warn('SSE not supported or failed to connect', e);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, []);

  // Web Audio buzzer sound helper
  const playBuzzer = useCallback((freq = 880, duration = 0.15) => {
    if (typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio might be restricted until user gesture
    }
  }, []);

  // Start New Test: Prompt PASSCODE first!
  const startNewTest = useCallback(async (): Promise<string> => {
    const newId = generateTestId();
    setTestId(newId);
    setResult(null);
    setVisualMetrics(null);
    setCapturedImage(null);
    setEnteredPasscode('');
    setHardwareFeedback({
      ledActive: false,
      buzzerTriggered: false,
      sensorActive: false,
    });

    try {
      await fetch('/api/test/start', { method: 'POST' });
    } catch (e) {
      console.warn('Could not post /api/test/start', e);
    }

    // Step 1: Prompt for Passcode
    setTestState('PASSCODE_ENTRY');
    router.push('/new-test');
    return newId;
  }, [router]);

  // Submit Passcode: PASSCODE_ENTRY -> WAITING_FOR_INPUT (15s sample acquisition gap)
  const submitPasscode = useCallback(
    async (passcode: string): Promise<{ success: boolean; error?: string }> => {
      const clean = passcode.trim();
      if (!clean || clean.length !== 4) {
        return { success: false, error: 'Please enter a valid 4-digit PASSCODE.' };
      }

      setEnteredPasscode(clean);
      setTestState('WAITING_FOR_INPUT');

      try {
        await fetch('/api/test/wait', { method: 'POST' });
      } catch (e) {
        console.warn('Could not post /api/test/wait', e);
      }

      return { success: true };
    },
    []
  );

  const armTest = useCallback(() => {
    setTestState('ARMED');
  }, []);

  // Trigger Capture: Sensor input taken -> Camera opens immediately!
  const triggerCapture = useCallback(async () => {
    setHardwareFeedback({
      ledActive: true,
      buzzerTriggered: true,
      sensorActive: true,
    });
    playBuzzer(988, 0.2);

    try {
      await fetch('/api/test/capture', { method: 'POST' });
    } catch (e) {
      console.warn('Could not post /api/test/capture', e);
    }

    // Camera opens immediately when breath is taken/sample recorded
    setTestState('CAMERA_ANALYSIS');
  }, [playBuzzer]);

  // Complete Camera Analysis: CAMERA_ANALYSIS -> PROCESSING (calculations start)
  const completeCameraAnalysis = useCallback(
    (metrics: VisualAnalysisMetrics, image?: string) => {
      setVisualMetrics(metrics);
      if (image) {
        setCapturedImage(image);
      }
      setHardwareFeedback({
        ledActive: false,
        buzzerTriggered: false,
        sensorActive: false,
      });
      // Camera completed -> all calculations / signal processing start!
      setTestState('PROCESSING');
    },
    []
  );

  // Safe Camera Skip -> PROCESSING
  const skipCameraAnalysis = useCallback(() => {
    const fallbackMetrics: VisualAnalysisMetrics = {
      faceDetected: false,
      faceQuality: 0,
      eyeQuality: 0,
      gazeStability: 0,
      blinkCount: 0,
      visualScore: 68,
    };
    setVisualMetrics(fallbackMetrics);
    setHardwareFeedback({
      ledActive: false,
      buzzerTriggered: false,
      sensorActive: false,
    });
    // Camera skipped -> all calculations / signal processing start!
    setTestState('PROCESSING');
  }, []);

  // Start Analysis manually if needed
  const startAnalysis = useCallback(async () => {
    setHardwareFeedback({
      ledActive: false,
      buzzerTriggered: false,
      sensorActive: false,
    });

    try {
      await fetch('/api/test/analyze', { method: 'POST' });
    } catch (e) {
      console.warn('Could not post /api/test/analyze', e);
    }

    setTestState('PROCESSING');
  }, []);

  // Submit Demo Code / Passcode: PROCESSING -> RESULT_READY
  const submitDemoCode = useCallback(
    async (code: string): Promise<{ success: boolean; error?: string }> => {
      try {
        const res = await fetch('/api/test/demo-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ testId, code }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          return {
            success: false,
            error: errData.message || 'INVALID PASSCODE: No reference profile found. [TRY AGAIN]',
          };
        }

        const data = await res.json();
        const demoRes: DemoResult = data.result;

        setResult(demoRes);
        setTestState('RESULT_READY');

        // Save to persistent test history with full sensor fingerprint snapshot & SAFE DRUG status
        const record: TestRecord = {
          testId: testId || generateTestId(),
          timestamp: new Date().toTimeString().slice(0, 5),
          status: demoRes.status,
          confidence: demoRes.confidence,
          fingerprintSimilarity: demoRes.fingerprintSimilarity,
          code: demoRes.code || code,
          displayName: demoRes.displayName || 'Reference Profile',
          scientificName: demoRes.scientificName || 'Chemical Reference',
          referenceFingerprint: demoRes.referenceFingerprint,
          capturedFingerprint: demoRes.capturedFingerprint,
          channelDifferences: demoRes.channelDifferences,
          drugSafetyClassification: demoRes.drugSafetyClassification || 'SAFE DRUG',
          visualScore: visualMetrics?.visualScore || 68,
          combinedScore: demoRes.combinedScore || 70,
          summary: demoRes.summary || 'Screening test completed.',
          mode: 'DEMO',
        };
        saveTestRecord(record);

        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: 'Connection error while communicating with analysis service.',
        };
      }
    },
    [testId, visualMetrics]
  );

  // Reset Test: Return to READY
  const resetTest = useCallback(async () => {
    try {
      await fetch('/api/test/reset', { method: 'POST' });
    } catch (e) {
      console.warn('Could not post /api/test/reset', e);
    }

    setTestState('READY');
    setResult(null);
    setVisualMetrics(null);
    setCapturedImage(null);
    setEnteredPasscode('');
    setHardwareFeedback({
      ledActive: false,
      buzzerTriggered: false,
      sensorActive: false,
    });
    router.push('/');
  }, [router]);

  const loadResultPreview = useCallback((preview: DemoResult) => {
    setResult(preview);
    setTestState('RESULT_READY');
  }, []);

  return (
    <TestWorkflowContext.Provider
      value={{
        testState,
        testId,
        officerName,
        badgeId,
        isLoggedIn,
        login,
        logout,
        deviceStatus,
        hardwareFeedback,
        result,
        visualMetrics,
        capturedImage,
        startNewTest,
        armTest,
        enteredPasscode,
        submitPasscode,
        triggerCapture,
        startAnalysis,
        completeCameraAnalysis,
        skipCameraAnalysis,
        submitDemoCode,
        resetTest,
        loadResultPreview,
        setCapturedImage,
      }}
    >
      {children}
    </TestWorkflowContext.Provider>
  );
}

export function useTestWorkflow() {
  const context = useContext(TestWorkflowContext);
  if (!context) {
    throw new Error('useTestWorkflow must be used within a TestWorkflowProvider');
  }
  return context;
}
