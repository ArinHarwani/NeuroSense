'use client';

import React from 'react';
import { useTestWorkflow } from '@/context/TestWorkflowContext';
import { demoResultService } from '@/services/DemoResultService';
import { DemoResult } from '@/types/narcosense';
import { Sliders, Zap, Eye, CheckCircle2, AlertOctagon, HelpCircle, ArrowUpRight } from 'lucide-react';

export default function ReferenceProfilesPage() {
  const { fastDemo, toggleFastDemo, loadResultPreview } = useTestWorkflow();
  const scenarios = demoResultService.getAllDemoResults();

  const handlePreview = (item: DemoResult) => {
    loadResultPreview(item);
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Sliders size={22} color="var(--teal)" />
          <div>
            <h1 className="page-title font-headline">REFERENCE PROFILES REGISTRY</h1>
            <p className="page-subtitle">
              Operational reference profile inspection, calibration data, and rapid mode configuration.
            </p>
          </div>
        </div>

        {/* Rapid Mode Toggle Button */}
        <button
          type="button"
          onClick={toggleFastDemo}
          className={`fast-demo-btn ${fastDemo ? 'active' : ''}`}
          style={{ minHeight: '44px', padding: '0 16px' }}
        >
          <Zap size={16} />
          <span>RAPID TEST MODE: {fastDemo ? 'ENABLED (1-2s)' : 'DISABLED (NORMAL)'}</span>
        </button>
      </div>

      {/* Scenarios Table */}
      <div className="dashboard-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="card-header" style={{ padding: '16px 20px', borderBottom: '1px solid var(--keyline)' }}>
          <h2 className="card-title font-headline">CONFIGURED REFERENCE PROFILES</h2>
          <span className="card-tag font-mono">CALIBRATION REGISTRY</span>
        </div>

        <table className="history-table">
          <thead>
            <tr>
              <th>REFERENCE CODE</th>
              <th>REFERENCE PATTERN</th>
              <th>STATUS</th>
              <th>CONFIDENCE</th>
              <th>MULTIMODAL (COMBINED)</th>
              <th style={{ textAlign: 'right' }}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {scenarios.map((item) => (
              <tr
                key={item.code}
                onClick={() => handlePreview(item)}
                className="clickable-row"
              >
                <td className="font-mono font-bold text-teal" style={{ fontSize: '15px' }}>
                  {item.code}
                </td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text)' }}>
                      {item.title}
                    </span>
                    <span className="text-xs text-muted">
                      {item.summary}
                    </span>
                  </div>
                </td>
                <td>
                  <span
                    className={`status-pill-small ${
                      item.status === 'POSITIVE'
                        ? 'crimson'
                        : item.status === 'NEGATIVE'
                        ? 'emerald'
                        : 'amber'
                    }`}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="font-mono font-bold">{item.confidence}%</td>
                <td className="font-mono text-teal font-bold">{item.combinedScore}%</td>
                <td style={{ textAlign: 'right' }}>
                  <button
                    type="button"
                    className="btn-primary-action"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePreview(item);
                    }}
                    style={{
                      height: '36px',
                      minHeight: '36px',
                      padding: '0 12px',
                      fontSize: '12px',
                      display: 'inline-flex',
                    }}
                  >
                    <Eye size={14} />
                    <span>LOAD PROFILE</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Guide Card */}
      <div className="test-bench-card" style={{ marginTop: '20px' }}>
        <h3 className="font-headline font-bold text-teal" style={{ marginBottom: '8px' }}>
          OPERATIONAL REFERENCE GUIDE
        </h3>
        <ol style={{ paddingLeft: '20px', color: 'var(--text-2)', fontSize: '13px', lineHeight: '1.8' }}>
          <li>
            <strong>Standard Flow:</strong> Start a test from the Dashboard, collect breath sample across Gas Sensors 1, 2, and 3, trigger capture via button or phone, complete signal synthesis and optical feature tracking, then input reference code <code>1001</code> (Positive), <code>9999</code> (Negative), or <code>9000</code> (Inconclusive).
          </li>
          <li>
            <strong>Rapid Mode:</strong> Enable Rapid Mode to shorten signal processing and optical analysis to 1–2 seconds for quick field tests.
          </li>
          <li>
            <strong>Direct Profile Load:</strong> Click &quot;LOAD PROFILE&quot; above to immediately inspect that pattern profile&apos;s probability distribution.
          </li>
        </ol>
      </div>
    </div>
  );
}
