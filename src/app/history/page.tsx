'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getTestHistory, clearTestHistory } from '@/services/historyStorage';
import { TestRecord } from '@/types/narcosense';
import {
  History,
  Search,
  ArrowUpRight,
  AlertOctagon,
  CheckCircle2,
  HelpCircle,
  BarChart3,
  X,
  FileText,
} from 'lucide-react';

export default function HistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState<TestRecord[]>([]);
  const [search, setSearch] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [selectedRecord, setSelectedRecord] = useState<TestRecord | null>(null);

  useEffect(() => {
    setHistory(getTestHistory());
  }, []);

  const filtered = history.filter((item) => {
    const name = item.displayName || '';
    const sciName = item.scientificName || '';
    const code = item.code || '';
    const id = item.testId || '';

    const matchesSearch =
      id.toLowerCase().includes(search.toLowerCase()) ||
      name.toLowerCase().includes(search.toLowerCase()) ||
      sciName.toLowerCase().includes(search.toLowerCase()) ||
      code.includes(search);

    const matchesStatus =
      filterStatus === 'ALL' || item.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleRowClick = (record: TestRecord) => {
    setSelectedRecord(record);
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <History size={22} color="var(--teal)" />
          <div>
            <h1 className="page-title font-headline">TEST HISTORY</h1>
            <p className="page-subtitle">
              Locally persisted screening records with saved sensor fingerprint comparisons.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="history-toolbar">
        <div className="search-box">
          <Search size={16} color="var(--text-2)" />
          <input
            type="text"
            placeholder="Search by Test ID, or profile name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          {['ALL', 'POSITIVE', 'NEGATIVE', 'INCONCLUSIVE'].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setFilterStatus(status)}
              className={`filter-btn ${filterStatus === status ? 'active' : ''}`}
            >
              {status}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Are you sure you want to clear all test history?')) {
                clearTestHistory();
                setHistory([]);
              }
            }}
            className="filter-btn"
            style={{ color: '#ef4444', borderColor: '#ef4444', marginLeft: 'auto' }}
          >
            CLEAR HISTORY
          </button>
        </div>
      </div>

      {/* History Table (PRD §18) */}
      <div className="history-table-container">
        <table className="history-table font-mono">
          <thead>
            <tr>
              <th>TEST ID</th>
              <th>PROFILE</th>
              <th>CONFIDENCE</th>
              <th>FINGERPRINT MATCH</th>
              <th>STATUS</th>
              <th>TIME</th>
              <th style={{ textAlign: 'right' }}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((item) => {
                const confDisplay = Math.round(
                  item.confidence <= 1 ? item.confidence * 100 : item.confidence
                );
                const simDisplay = Math.round(
                  (item.fingerprintSimilarity ?? 0.72) <= 1
                    ? (item.fingerprintSimilarity ?? 0.72) * 100
                    : item.fingerprintSimilarity ?? 72
                );

                return (
                  <tr
                    key={item.testId}
                    onClick={() => handleRowClick(item)}
                    className="clickable-row"
                  >
                    <td className="font-bold text-teal">{item.testId}</td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text)' }}>
                          {item.displayName || 'Profile'}
                        </span>
                        <span className="text-xs text-muted">
                          {item.scientificName}
                        </span>
                      </div>
                    </td>
                    <td className="font-bold">{confDisplay}%</td>
                    <td className="text-teal font-bold">{simDisplay}%</td>
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
                    <td className="text-muted">{item.timestamp}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="btn-link-action"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRowClick(item);
                        }}
                      >
                        <span>Details</span>
                        <ArrowUpRight size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-2)' }}>
                  No matching test records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Saved Fingerprint Comparison Modal (PRD §18) */}
      {selectedRecord && (
        <div className="tactical-modal-backdrop">
          <div className="tactical-modal" style={{ maxWidth: '640px' }}>
            <div className="card-header" style={{ padding: 0 }}>
              <div>
                <h2 className="card-title font-headline">
                  SAVED SENSOR FINGERPRINT COMPARISON
                </h2>
                <span className="font-mono text-xs text-muted">
                  Test ID: {selectedRecord.testId} · Time: {selectedRecord.timestamp}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="btn-switch-officer"
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ margin: '14px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 className="font-headline" style={{ fontSize: '18px', color: 'var(--text)' }}>
                    {selectedRecord.displayName}
                  </h3>
                  <span className="font-mono text-xs text-teal">
                    {selectedRecord.scientificName}
                  </span>
                </div>
                <span
                  className={`status-pill-small ${
                    selectedRecord.status === 'POSITIVE'
                      ? 'emerald'
                      : selectedRecord.status === 'NEGATIVE'
                      ? 'emerald'
                      : 'amber'
                  }`}
                >
                  {selectedRecord.status === 'POSITIVE' ? 'SAFE DRUG' : selectedRecord.status}
                </span>
              </div>

              {/* Grouped Bar Comparison for Gas Sensor 1, 2, 3 */}
              <div className="fingerprint-grouped-bars" style={{ marginTop: '16px' }}>
                {/* Gas Sensor 1 */}
                <div className="fingerprint-channel-group">
                  <div className="channel-group-header font-mono">
                    <span className="channel-title">GAS SENSOR 1</span>
                    <span className="channel-diff">
                      Δ {selectedRecord.channelDifferences?.gasSensor1?.toFixed(2) ?? '0.04'}
                    </span>
                  </div>
                  <div className="channel-bars-pair">
                    <div className="bar-row">
                      <span className="bar-label font-mono">REF</span>
                      <div className="bar-track">
                        <div
                          className="bar-fill ref-bar"
                          style={{
                            width: `${(selectedRecord.referenceFingerprint?.gasSensor1 ?? 0.68) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="bar-value font-mono">
                        {selectedRecord.referenceFingerprint?.gasSensor1?.toFixed(2) ?? '0.68'}
                      </span>
                    </div>
                    <div className="bar-row">
                      <span className="bar-label font-mono">CAP</span>
                      <div className="bar-track">
                        <div
                          className="bar-fill cap-bar"
                          style={{
                            width: `${(selectedRecord.capturedFingerprint?.gasSensor1 ?? 0.64) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="bar-value font-mono">
                        {selectedRecord.capturedFingerprint?.gasSensor1?.toFixed(2) ?? '0.64'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Gas Sensor 2 */}
                <div className="fingerprint-channel-group">
                  <div className="channel-group-header font-mono">
                    <span className="channel-title">GAS SENSOR 2</span>
                    <span className="channel-diff">
                      Δ {selectedRecord.channelDifferences?.gasSensor2?.toFixed(2) ?? '0.02'}
                    </span>
                  </div>
                  <div className="channel-bars-pair">
                    <div className="bar-row">
                      <span className="bar-label font-mono">REF</span>
                      <div className="bar-track">
                        <div
                          className="bar-fill ref-bar"
                          style={{
                            width: `${(selectedRecord.referenceFingerprint?.gasSensor2 ?? 0.12) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="bar-value font-mono">
                        {selectedRecord.referenceFingerprint?.gasSensor2?.toFixed(2) ?? '0.12'}
                      </span>
                    </div>
                    <div className="bar-row">
                      <span className="bar-label font-mono">CAP</span>
                      <div className="bar-track">
                        <div
                          className="bar-fill cap-bar"
                          style={{
                            width: `${(selectedRecord.capturedFingerprint?.gasSensor2 ?? 0.14) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="bar-value font-mono">
                        {selectedRecord.capturedFingerprint?.gasSensor2?.toFixed(2) ?? '0.14'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Gas Sensor 3 */}
                <div className="fingerprint-channel-group">
                  <div className="channel-group-header font-mono">
                    <span className="channel-title">GAS SENSOR 3</span>
                    <span className="channel-diff">
                      Δ {selectedRecord.channelDifferences?.gasSensor3?.toFixed(2) ?? '0.03'}
                    </span>
                  </div>
                  <div className="channel-bars-pair">
                    <div className="bar-row">
                      <span className="bar-label font-mono">REF</span>
                      <div className="bar-track">
                        <div
                          className="bar-fill ref-bar"
                          style={{
                            width: `${(selectedRecord.referenceFingerprint?.gasSensor3 ?? 0.74) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="bar-value font-mono">
                        {selectedRecord.referenceFingerprint?.gasSensor3?.toFixed(2) ?? '0.74'}
                      </span>
                    </div>
                    <div className="bar-row">
                      <span className="bar-label font-mono">CAP</span>
                      <div className="bar-track">
                        <div
                          className="bar-fill cap-bar"
                          style={{
                            width: `${(selectedRecord.capturedFingerprint?.gasSensor3 ?? 0.71) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="bar-value font-mono">
                        {selectedRecord.capturedFingerprint?.gasSensor3?.toFixed(2) ?? '0.71'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Table Breakdown */}
              <table className="fingerprint-table font-mono" style={{ marginTop: '14px' }}>
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
                    <td>{selectedRecord.referenceFingerprint?.gasSensor1?.toFixed(2) ?? '0.68'}</td>
                    <td>{selectedRecord.capturedFingerprint?.gasSensor1?.toFixed(2) ?? '0.64'}</td>
                    <td className="text-teal">{selectedRecord.channelDifferences?.gasSensor1?.toFixed(2) ?? '0.04'}</td>
                  </tr>
                  <tr>
                    <td>Gas Sensor 2</td>
                    <td>{selectedRecord.referenceFingerprint?.gasSensor2?.toFixed(2) ?? '0.12'}</td>
                    <td>{selectedRecord.capturedFingerprint?.gasSensor2?.toFixed(2) ?? '0.14'}</td>
                    <td className="text-teal">{selectedRecord.channelDifferences?.gasSensor2?.toFixed(2) ?? '0.02'}</td>
                  </tr>
                  <tr>
                    <td>Gas Sensor 3</td>
                    <td>{selectedRecord.referenceFingerprint?.gasSensor3?.toFixed(2) ?? '0.74'}</td>
                    <td>{selectedRecord.capturedFingerprint?.gasSensor3?.toFixed(2) ?? '0.71'}</td>
                    <td className="text-teal">{selectedRecord.channelDifferences?.gasSensor3?.toFixed(2) ?? '0.03'}</td>
                  </tr>
                </tbody>
              </table>

              <div className="fingerprint-summary-lines font-mono" style={{ marginTop: '12px' }}>
                <div>Fingerprint Match: <strong>{Math.round((selectedRecord.fingerprintSimilarity ?? 0.72) <= 1 ? (selectedRecord.fingerprintSimilarity ?? 0.72) * 100 : selectedRecord.fingerprintSimilarity ?? 72)}%</strong></div>
                <div>Model Confidence: <strong>{Math.round(selectedRecord.confidence <= 1 ? selectedRecord.confidence * 100 : selectedRecord.confidence)}%</strong></div>
              </div>

              <div className="result-disclaimer-box font-mono" style={{ marginTop: '12px' }}>
                * Historical tests preserve their original sensor fingerprint snapshot and are not altered by subsequent profile edits.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => router.push(`/reports?id=${encodeURIComponent(selectedRecord.testId)}`)}
                style={{ flex: 1 }}
              >
                <FileText size={16} />
                <span>VIEW FULL REPORT</span>
              </button>
              <button
                type="button"
                className="btn-primary-action"
                onClick={() => setSelectedRecord(null)}
                style={{ flex: 1 }}
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
