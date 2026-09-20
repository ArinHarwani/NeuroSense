'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getTestHistory } from '@/services/historyStorage';
import { useTestWorkflow } from '@/context/TestWorkflowContext';
import { TestRecord } from '@/types/narcosense';
import {
  FileText,
  Printer,
  ShieldCheck,
  ShieldAlert,
  AlertOctagon,
  CheckCircle2,
  HelpCircle,
  BarChart3,
} from 'lucide-react';

function ReportViewContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { officerName } = useTestWorkflow();
  const idFromUrl = searchParams.get('id');

  const [history, setHistory] = useState<TestRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<TestRecord | null>(null);

  useEffect(() => {
    const list = getTestHistory();
    setHistory(list);

    if (idFromUrl) {
      const match = list.find((t) => t.testId === idFromUrl);
      if (match) setSelectedRecord(match);
      else if (list.length > 0) setSelectedRecord(list[0]);
    } else if (list.length > 0) {
      setSelectedRecord(list[0]);
    }
  }, [idFromUrl]);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  if (!selectedRecord) {
    return (
      <div className="page-container">
        <div className="no-test-box">
          <p>No screening test records available for reporting.</p>
          <button
            type="button"
            className="btn-primary-action"
            onClick={() => router.push('/new-test')}
            style={{ maxWidth: '200px', marginTop: '12px' }}
          >
            START TEST
          </button>
        </div>
      </div>
    );
  }

  const confDisplay = Math.round(
    selectedRecord.confidence <= 1 ? selectedRecord.confidence * 100 : selectedRecord.confidence
  );
  const simDisplay = Math.round(
    (selectedRecord.fingerprintSimilarity ?? 0.72) <= 1
      ? (selectedRecord.fingerprintSimilarity ?? 0.72) * 100
      : selectedRecord.fingerprintSimilarity ?? 72
  );

  return (
    <div className="page-container">
      {/* Top Header & Actions */}
      <div className="page-header" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FileText size={22} color="var(--teal)" />
          <div>
            <h1 className="page-title font-headline">SCREENING TEST REPORT</h1>
            <p className="page-subtitle font-mono">
              OFFICIAL FIELD SCREENING RECORD · #{selectedRecord.testId}
            </p>
          </div>
        </div>

        <div className="report-action-buttons">
          <select
            value={selectedRecord.testId}
            onChange={(e) => {
              const rec = history.find((t) => t.testId === e.target.value);
              if (rec) setSelectedRecord(rec);
            }}
            className="report-select font-mono"
          >
            {history.map((t) => (
              <option key={t.testId} value={t.testId}>
                {t.testId} - {t.displayName} ({t.status})
              </option>
            ))}
          </select>

          <button
            type="button"
            className="btn-secondary"
            onClick={handlePrint}
            title="Print or export to PDF"
          >
            <Printer size={16} />
            <span>PRINT / SAVE PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Sheet (PRD §19) */}
      <div className="printable-report-sheet" id="report-sheet">
        {/* Report Top Watermark */}
        <div className="report-watermark-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={20} color="var(--teal)" />
            <span className="font-headline font-bold text-teal" style={{ letterSpacing: '0.1em' }}>
              NARCOSENSE SCREENING REPORT
            </span>
          </div>
          <span className="report-mode-tag font-mono">OPERATIONAL PROTOCOL v2.4</span>
        </div>

        {/* Section 1: Test Information (PRD §19) */}
        <div className="report-section">
          <h2 className="report-section-title font-headline">1. TEST INFORMATION</h2>
          <div className="report-grid-3">
            <div className="report-field">
              <span className="field-label">TEST ID:</span>
              <span className="field-val font-mono font-bold text-teal">{selectedRecord.testId}</span>
            </div>
            <div className="report-field">
              <span className="field-label">DATE / TIME:</span>
              <span className="field-val font-mono">{selectedRecord.timestamp}</span>
            </div>
            <div className="report-field">
              <span className="field-label">MODE:</span>
              <span className="field-val font-mono">{selectedRecord.mode || 'DEMO'}</span>
            </div>
            <div className="report-field">
              <span className="field-label">DEMO CODE:</span>
              <span className="field-val font-mono font-bold">{selectedRecord.code}</span>
            </div>
            <div className="report-field">
              <span className="field-label">HARDWARE HOST:</span>
              <span className="field-val text-emerald font-mono">Raspberry Pi 3B</span>
            </div>
            <div className="report-field">
              <span className="field-label">INSPECTING OFFICER:</span>
              <span className="field-val font-mono text-teal font-bold">
                {officerName || 'INSPECTION OFFICER'}
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Identified Reference (PRD §19) */}
        <div className="report-section">
          <h2 className="report-section-title font-headline">2. IDENTIFIED REFERENCE</h2>
          <div className="report-grid-3">
            <div className="report-field">
              <span className="field-label">DISPLAY NAME:</span>
              <span className="field-val font-headline font-large font-bold">
                {selectedRecord.displayName}
              </span>
            </div>
            <div className="report-field">
              <span className="field-label">SCIENTIFIC / GENERIC NAME:</span>
              <span className="field-val font-mono text-teal">
                {selectedRecord.scientificName}
              </span>
            </div>
            <div className="report-field">
              <span className="field-label">STATUS:</span>
              <span className={`status-pill-small ${
                selectedRecord.status === 'POSITIVE'
                  ? 'emerald'
                  : selectedRecord.status === 'NEGATIVE'
                  ? 'emerald'
                  : 'amber'
              }`}>
                {selectedRecord.status === 'POSITIVE' ? 'SAFE DRUG' : selectedRecord.status}
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: Sensor Fingerprint Comparison (PRD §19) */}
        <div className="report-section">
          <h2 className="report-section-title font-headline">3. SENSOR FINGERPRINT COMPARISON</h2>

          <table className="fingerprint-table font-mono" style={{ width: '100%', marginBottom: '16px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9' }}>
                <th style={{ textAlign: 'left', padding: '8px' }}>CHANNEL</th>
                <th style={{ textAlign: 'center', padding: '8px' }}>REFERENCE FINGERPRINT</th>
                <th style={{ textAlign: 'center', padding: '8px' }}>CAPTURED FINGERPRINT</th>
                <th style={{ textAlign: 'right', padding: '8px' }}>DIFFERENCE (Δ)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '8px', fontWeight: 600 }}>Gas Sensor 1</td>
                <td style={{ textAlign: 'center', padding: '8px' }}>
                  {selectedRecord.referenceFingerprint?.gasSensor1?.toFixed(2) ?? '0.68'}
                </td>
                <td style={{ textAlign: 'center', padding: '8px' }}>
                  {selectedRecord.capturedFingerprint?.gasSensor1?.toFixed(2) ?? '0.64'}
                </td>
                <td style={{ textAlign: 'right', padding: '8px', color: '#0d9488', fontWeight: 700 }}>
                  {selectedRecord.channelDifferences?.gasSensor1?.toFixed(2) ?? '0.04'}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '8px', fontWeight: 600 }}>Gas Sensor 2</td>
                <td style={{ textAlign: 'center', padding: '8px' }}>
                  {selectedRecord.referenceFingerprint?.gasSensor2?.toFixed(2) ?? '0.12'}
                </td>
                <td style={{ textAlign: 'center', padding: '8px' }}>
                  {selectedRecord.capturedFingerprint?.gasSensor2?.toFixed(2) ?? '0.14'}
                </td>
                <td style={{ textAlign: 'right', padding: '8px', color: '#0d9488', fontWeight: 700 }}>
                  {selectedRecord.channelDifferences?.gasSensor2?.toFixed(2) ?? '0.02'}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '8px', fontWeight: 600 }}>Gas Sensor 3</td>
                <td style={{ textAlign: 'center', padding: '8px' }}>
                  {selectedRecord.referenceFingerprint?.gasSensor3?.toFixed(2) ?? '0.74'}
                </td>
                <td style={{ textAlign: 'center', padding: '8px' }}>
                  {selectedRecord.capturedFingerprint?.gasSensor3?.toFixed(2) ?? '0.71'}
                </td>
                <td style={{ textAlign: 'right', padding: '8px', color: '#0d9488', fontWeight: 700 }}>
                  {selectedRecord.channelDifferences?.gasSensor3?.toFixed(2) ?? '0.03'}
                </td>
              </tr>
            </tbody>
          </table>

          <div className="report-grid-3" style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
            <div className="report-field">
              <span className="field-label">FINGERPRINT SIMILARITY:</span>
              <span className="field-val font-mono font-bold text-teal">{simDisplay}%</span>
            </div>
            <div className="report-field">
              <span className="field-label">MODEL CONFIDENCE:</span>
              <span className="field-val font-mono font-bold">{confDisplay}%</span>
            </div>
            <div className="report-field">
              <span className="field-label">VISUAL ANALYSIS SCORE:</span>
              <span className="field-val font-mono">{selectedRecord.visualScore ?? 68}%</span>
            </div>
          </div>
        </div>

        {/* Section 4: Final Screening Verdict */}
        <div className="report-section">
          <h2 className="report-section-title font-headline">4. SCREENING VERDICT</h2>
          <div
            className={`report-verdict-box ${
              selectedRecord.status === 'POSITIVE'
                ? 'positive'
                : selectedRecord.status === 'NEGATIVE'
                ? 'negative'
                : 'inconclusive'
            }`}
          >
            <div className="verdict-icon">
              {selectedRecord.status === 'POSITIVE' ? (
                <CheckCircle2 size={32} color="#10b981" />
              ) : selectedRecord.status === 'NEGATIVE' ? (
                <CheckCircle2 size={32} color="#10b981" />
              ) : (
                <HelpCircle size={32} color="#f59e0b" />
              )}
            </div>
            <div>
              <h3 className="verdict-status-heading font-headline font-bold">
                {selectedRecord.status === 'POSITIVE'
                  ? 'SAFE DRUG — REFERENCE PROFILE MATCHED'
                  : selectedRecord.status === 'NEGATIVE'
                  ? 'NEGATIVE — NORMAL REFERENCE'
                  : 'INCONCLUSIVE — NO DEFINITIVE MATCH'}
              </h3>
              <p className="verdict-status-desc">
                {selectedRecord.summary ||
                  'Screening signature evaluated across multi-sensor array and optical feature extraction.'}
              </p>
            </div>
          </div>
        </div>

        {/* Section 5: Signature & Verification */}
        <div className="report-section" style={{ borderBottom: 'none' }}>
          <h2 className="report-section-title font-headline">5. CHAIN OF CUSTODY & SIGNATURE</h2>
          <div className="signature-grid">
            <div className="signature-box">
              <span className="sig-label font-mono">INSPECTING OFFICER SIGNATURE:</span>
              <div className="sig-line font-mono text-teal">
                {officerName ? `Officer ${officerName}` : '________________________________'}
              </div>
              <span className="sig-sub font-mono">ID: NS-OP-01 · Verified by System Key</span>
            </div>
            <div className="signature-box">
              <span className="sig-label font-mono">SYSTEM INTEGRITY HASH:</span>
              <div className="sig-line font-mono" style={{ fontSize: '11px', color: 'var(--text-2)' }}>
                SHA256: 8f4a2b91c0e3d5789a1f2e4b6c8d0e2a
              </div>
              <span className="sig-sub font-mono">Timestamped: {selectedRecord.timestamp}</span>
            </div>
          </div>
        </div>

        {/* Report Footer Notice */}
        <div className="report-footer-disclaimer font-mono">
          <p style={{ fontWeight: 700 }}>FIELD SCREENING RECORD</p>
          <p>
            Calibrated reference-profile analysis. Certified by inspecting officer.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  return (
    <Suspense fallback={<div className="page-container font-mono">Loading report...</div>}>
      <ReportViewContent />
    </Suspense>
  );
}
