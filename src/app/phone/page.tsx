'use client';

import React, { useState, useEffect } from 'react';
import { Smartphone, Play, Activity, Cpu, RotateCcw, Check, Radio } from 'lucide-react';

export default function PhoneRemotePage() {
  const [testId, setTestId] = useState<string>('CONNECTING...');
  const [testState, setTestState] = useState<string>('READY');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Poll or SSE to keep state synced
  useEffect(() => {
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/test/events');
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.session) {
            setTestId(data.session.testId);
            setTestState(data.session.state);
          }
        } catch {}
      };
    } catch {
      // Fallback polling
      const poll = async () => {
        try {
          const res = await fetch('/api/test/state');
          if (res.ok) {
            const s = await res.json();
            setTestId(s.testId);
            setTestState(s.state);
          }
        } catch {}
      };
      poll();
      const interval = setInterval(poll, 1500);
      return () => clearInterval(interval);
    }

    return () => {
      if (eventSource) eventSource.close();
    };
  }, []);

  const triggerAction = async (endpoint: string, actionName: string) => {
    setIsProcessing(true);
    setActionFeedback(`Sending ${actionName}...`);
    try {
      const res = await fetch(endpoint, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.status) setTestState(data.status);
        if (data.testId) setTestId(data.testId);
        setActionFeedback(`${actionName} SENT ✓`);
      } else {
        setActionFeedback(`Error sending ${actionName}`);
      }
    } catch {
      setActionFeedback(`Network error`);
    }
    setIsProcessing(false);
    setTimeout(() => setActionFeedback(null), 2500);
  };

  return (
    <div className="phone-remote-container">
      {/* Phone Header */}
      <div className="phone-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Smartphone size={20} color="var(--teal)" />
          <span className="font-headline font-bold" style={{ fontSize: '15px', color: 'var(--text)' }}>
            NARCOSENSE REMOTE
          </span>
        </div>
        <div className="phone-status-indicator">
          <span className="beacon-dot emerald" />
          <span className="font-mono text-xs text-emerald font-bold">CONNECTED</span>
        </div>
      </div>

      {/* Test Telemetry Pod */}
      <div className="phone-telemetry-card">
        <span className="phone-card-label font-mono">ACTIVE TEST SESSION</span>
        <div className="phone-test-id font-mono font-bold text-teal">{testId}</div>
        <div className="phone-state-badge font-mono">
          STATUS: {testState}
        </div>
      </div>

      {/* Action Buttons Matrix (PRD §12: ARM, CAPTURE, START_ANALYSIS, RESET) */}
      <div className="phone-buttons-grid">
        {/* ARM */}
        <button
          type="button"
          className="phone-btn arm"
          onClick={() => triggerAction('/api/test/start', 'ARM TEST')}
          disabled={isProcessing}
        >
          <Play size={22} />
          <span>ARM (NEW TEST)</span>
        </button>

        {/* CAPTURE */}
        <button
          type="button"
          className="phone-btn capture"
          onClick={() => triggerAction('/api/test/capture', 'CAPTURE SAMPLE')}
          disabled={isProcessing}
        >
          <Activity size={24} />
          <span>CAPTURE SAMPLE</span>
        </button>

        {/* START ANALYSIS */}
        <button
          type="button"
          className="phone-btn analyze"
          onClick={() => triggerAction('/api/test/analyze', 'START ANALYSIS')}
          disabled={isProcessing}
        >
          <Cpu size={22} />
          <span>START ANALYSIS</span>
        </button>

        {/* RESET */}
        <button
          type="button"
          className="phone-btn reset"
          onClick={() => triggerAction('/api/test/reset', 'RESET')}
          disabled={isProcessing}
        >
          <RotateCcw size={20} />
          <span>RESET SESSION</span>
        </button>
      </div>

      {/* Feedback Bar */}
      {actionFeedback && (
        <div className="phone-feedback-bar font-mono">
          <Check size={16} />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* Instructions Footer */}
      <div className="phone-footer-notes font-mono">
        <span>BLE / RPi LINK: ACTIVE</span>
        <span>LATENCY: &lt;500ms</span>
      </div>
    </div>
  );
}
