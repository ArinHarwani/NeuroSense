'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTestWorkflow } from '@/context/TestWorkflowContext';
import { getTodayStats, getTestHistory } from '@/services/historyStorage';
import { TestRecord } from '@/types/narcosense';
import {
  Play,
  Cpu,
  Smartphone,
  Camera,
  Activity,
  CheckCircle2,
  AlertOctagon,
  HelpCircle,
  Clock,
  ArrowUpRight,
  ShieldAlert,
  Wind,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { startNewTest, deviceStatus, officerName } = useTestWorkflow();

  const [stats, setStats] = useState({
    total: 12,
    positive: 5,
    negative: 4,
    inconclusive: 3,
    avgConfidence: 81,
  });

  const [lastTest, setLastTest] = useState<TestRecord | null>(null);
  const [currentDate, setCurrentDate] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const s = getTodayStats();
    setStats(s);

    const history = getTestHistory();
    if (history.length > 0) {
      setLastTest(history[0]);
    }

    const now = new Date();
    setCurrentDate(now.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }));
    setCurrentTime(now.toTimeString().split(' ')[0] || now.toLocaleTimeString());

    const interval = setInterval(() => {
      const t = new Date();
      setCurrentTime(t.toTimeString().split(' ')[0] || t.toLocaleTimeString());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleStartTest = async () => {
    await startNewTest();
  };

  return (
    <div className="dashboard-container">
      {/* Top Banner / Hero */}
      <div className="dashboard-hero">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="beacon-dot" />
            <span>AI-ASSISTED BREATH SCREENING PLATFORM</span>
          </div>
          <h1 className="hero-title">NARCOSENSE</h1>
          <p className="hero-subtitle">
            Multimodal chemical and visual field screening platform. Dual-sensor chromatography combined with ocular micro-feature classification.
          </p>

          <div className="hero-actions">
            <button
              type="button"
              className="btn-start-hero"
              onClick={handleStartTest}
              id="start-new-test-btn"
            >
              <Play size={20} fill="#020617" />
              <span>[ START NEW TEST ]</span>
            </button>
            <div className="hero-mode-pill font-mono">
              <span className="mode-dot" />
              <span>SYSTEM: <strong>OPERATIONAL</strong></span>
            </div>
          </div>
        </div>

        {/* Date & Time Widget */}
        <div className="hero-telemetry">
          <div className="telemetry-box">
            <span className="telemetry-label">INSPECTING OFFICER</span>
            <span className="telemetry-value font-mono text-teal">
              {officerName || 'AUTHENTICATED OPERATOR'}
            </span>
          </div>
          <div className="telemetry-box">
            <span className="telemetry-label">SYSTEM CLOCK</span>
            <span className="telemetry-value font-mono font-large">{currentTime || '19:42:00'}</span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="dashboard-grid">
        {/* Left Column: System Status & Hardware Telemetry */}
        <div className="dashboard-card">
          <div className="card-header">
            <div className="card-title-group">
              <Cpu size={18} color="var(--teal)" />
              <h2 className="card-title">SYSTEM STATUS</h2>
            </div>
            <span className="card-tag ready">ALL NOMINAL</span>
          </div>

          <div className="system-status-list">
            <div className="status-item">
              <div className="status-info">
                <span className="status-dot green" />
                <span className="status-name">Raspberry Pi 3B</span>
              </div>
              <span className="status-badge green font-mono">CONNECTED</span>
            </div>

            <div className="status-item">
              <div className="status-info">
                <span className="status-dot green" />
                <span className="status-name">Phone Remote</span>
              </div>
              <span className="status-badge green font-mono">CONNECTED</span>
            </div>

            {/* Gas Sensor 1, 2, 3 - corrected sensor model names per hardware spec */}
            <div className="status-item">
              <div className="status-info">
                <span className="status-dot green" />
                <span className="status-name">Gas Sensor 1 (MQ-138 Organic Vapor)</span>
              </div>
              <span className="status-badge green font-mono">ACTIVE · 0.42 V</span>
            </div>

            <div className="status-item">
              <div className="status-info">
                <span className="status-dot green" />
                <span className="status-name">Gas Sensor 2 (MQ-3 Alcohol/Ethanol)</span>
              </div>
              <span className="status-badge green font-mono">ACTIVE · 0.18 V</span>
            </div>

            <div className="status-item">
              <div className="status-info">
                <span className="status-dot green" />
                <span className="status-name">Gas Sensor 3 (BME680 VOC/Environment)</span>
              </div>
              <span className="status-badge green font-mono">ACTIVE · 0.51 V</span>
            </div>

            <div className="status-item">
              <div className="status-info">
                <span className="status-dot green" />
                <span className="status-name">Camera Module</span>
              </div>
              <span className="status-badge green font-mono">READY</span>
            </div>

            <div className="status-item">
              <div className="status-info">
                <span className="status-dot green" />
                <span className="status-name">Analysis Engine</span>
              </div>
              <span className="status-badge green font-mono">READY</span>
            </div>
          </div>

          {/* Hardware Notice */}
          <div className="hardware-notice">
            <Activity size={14} color="var(--teal)" />
            <span>Hardware event triggers: Physical LED & Buzzer verify sample acquisition.</span>
          </div>
        </div>

        {/* Right Column: Today's Statistics */}
        <div className="dashboard-card">
          <div className="card-header">
            <div className="card-title-group">
              <Activity size={18} color="var(--teal)" />
              <h2 className="card-title">TODAY&apos;S SCREENING STATISTICS</h2>
            </div>
            <span className="card-tag font-mono">SESSION METRICS</span>
          </div>

          <div className="stats-grid">
            <div className="stat-pod">
              <span className="stat-label">TOTAL TESTS</span>
              <span className="stat-number font-mono">{stats.total}</span>
              <span className="stat-sub">Screenings completed</span>
            </div>

            <div className="stat-pod positive">
              <span className="stat-label">POSITIVE</span>
              <span className="stat-number font-mono text-crimson">{stats.positive}</span>
              <span className="stat-sub">Reference matched</span>
            </div>

            <div className="stat-pod negative">
              <span className="stat-label">NEGATIVE</span>
              <span className="stat-number font-mono text-emerald">{stats.negative}</span>
              <span className="stat-sub">Clean baseline</span>
            </div>

            <div className="stat-pod inconclusive">
              <span className="stat-label">INCONCLUSIVE</span>
              <span className="stat-number font-mono text-amber">{stats.inconclusive}</span>
              <span className="stat-sub">Low confidence</span>
            </div>
          </div>

          {/* Average Confidence Bar */}
          <div className="avg-conf-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span className="stat-label">AVERAGE MODEL CONFIDENCE</span>
              <span className="font-mono text-teal font-bold">{stats.avgConfidence}%</span>
            </div>
            <div className="progress-track">
              <div
                className="progress-bar-fill"
                style={{ width: `${stats.avgConfidence}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Latest Result & Operational Protocol */}
      <div className="dashboard-bottom-grid">
        {/* Latest Result Card */}
        <div className="dashboard-card">
          <div className="card-header">
            <div className="card-title-group">
              <Clock size={18} color="var(--teal)" />
              <h2 className="card-title">LATEST TEST RESULT</h2>
            </div>
            {lastTest && (
              <span className="card-tag font-mono">#{lastTest.testId}</span>
            )}
          </div>

          {lastTest ? (
            <div className="latest-result-box">
              <div className="result-top-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {lastTest.status === 'POSITIVE' ? (
                    <AlertOctagon size={24} color="var(--crimson)" />
                  ) : lastTest.status === 'NEGATIVE' ? (
                    <CheckCircle2 size={24} color="var(--emerald)" />
                  ) : (
                    <HelpCircle size={24} color="var(--amber)" />
                  )}
                  <div>
                    <h3 className="result-pattern-title">{lastTest.displayName || lastTest.title}</h3>
                    <span className="result-timestamp font-mono">
                      Recorded at {lastTest.timestamp} · Reference Code {lastTest.code}
                    </span>
                  </div>
                </div>

                <div
                  className={`result-status-pill ${
                    lastTest.status === 'POSITIVE'
                      ? 'crimson'
                      : lastTest.status === 'NEGATIVE'
                      ? 'emerald'
                      : 'amber'
                  }`}
                >
                  {lastTest.status}
                </div>
              </div>

              {/* Score Breakdown Pills */}
              <div className="score-breakdown-row">
                <div className="score-mini-pod">
                  <span className="score-mini-label">BREATH SENSOR SCORE</span>
                  {/* Bug #5 fix: fallback for seed records that lack chemicalScore */}
                  <span className="score-mini-val font-mono">{lastTest.chemicalScore ?? '--'}%</span>
                </div>
                <div className="score-mini-pod">
                  <span className="score-mini-label">OPTICAL SCORE</span>
                  <span className="score-mini-val font-mono">{lastTest.visualScore ?? '--'}%</span>
                </div>
                <div className="score-mini-pod highlight">
                  <span className="score-mini-label">COMBINED CONFIDENCE</span>
                  <span className="score-mini-val font-mono">{lastTest.combinedScore ?? Math.round(lastTest.confidence <= 1 ? lastTest.confidence * 100 : lastTest.confidence)}%</span>
                </div>
              </div>

              <div className="result-footer-row">
                <span className="field-screening-tag font-mono">FIELD SCREENING VERDICT</span>
                <button
                  type="button"
                  onClick={() => router.push('/reports')}
                  className="btn-view-report"
                >
                  <span>View Full Report</span>
                  <ArrowUpRight size={14} />
                </button>
              </div>
            </div>
          ) : (
            <div className="no-test-box">
              <span>No tests recorded yet today.</span>
            </div>
          )}
        </div>

        {/* Operational Test Flow */}
        <div className="dashboard-card guide-card">
          <div className="card-header">
            <div className="card-title-group">
              <ShieldAlert size={18} color="var(--teal)" />
              <h2 className="card-title">OPERATIONAL TEST FLOW</h2>
            </div>
          </div>

          <div className="flow-steps-list">
            <div className="flow-step-item">
              <span className="flow-num">1</span>
              <div>
                <strong>Start Test:</strong> System arms and generates unique Test ID (<code>NS-YYYYMMDD-###</code>).
              </div>
            </div>
            <div className="flow-step-item">
              <span className="flow-num">2</span>
              <div>
                <strong>Sample Acquisition:</strong> Subject breathes; operator triggers capture from phone; Raspberry Pi 3B activates physical feedback.
              </div>
            </div>
            <div className="flow-step-item">
              <span className="flow-num">3</span>
              <div>
                <strong>Analysis Sequence:</strong> 7-step signal processing + live camera face & eye feature analysis.
              </div>
            </div>
            <div className="flow-step-item">
              <span className="flow-num">4</span>
              <div>
                <strong>Passcode Entry:</strong> Operator enters substance passcode (<code>0001</code> Paracetamol, <code>0003</code> Aspirin, <code>0004</code> Caffeine, <code>9999</code> Normal, <code>9000</code> Inconclusive).
              </div>
            </div>
            <div className="flow-step-item">
              <span className="flow-num">5</span>
              <div>
                <strong>Multimodal Verdict:</strong> Decisive verdict combining Gas Sensors (1, 2, 3) and visual feature scores.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
