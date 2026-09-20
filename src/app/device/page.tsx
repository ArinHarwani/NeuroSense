'use client';

import React from 'react';
import { useTestWorkflow } from '@/context/TestWorkflowContext';
import {
  Cpu,
  Smartphone,
  Camera,
  Activity,
  Zap,
  Wind,
} from 'lucide-react';

export default function DevicePage() {
  const { hardwareFeedback } = useTestWorkflow();

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Cpu size={22} color="var(--teal)" />
          <div>
            <h1 className="page-title font-headline">DEVICE & SENSOR STATUS</h1>
            <p className="page-subtitle font-mono">
              REAL-TIME HARDWARE & SENSOR ARRAY TELEMETRY
            </p>
          </div>
        </div>
      </div>

      {/* Main Status Grid */}
      <div className="device-status-grid">
        {/* Raspberry Pi 3B */}
        <div className="device-status-card">
          <div className="device-card-top">
            <Cpu size={28} color="var(--teal)" />
            <span className="status-badge green font-mono">CONNECTED</span>
          </div>
          <h2 className="device-name font-headline">Raspberry Pi 3B</h2>
          <p className="device-desc">
            Primary embedded microcontroller host running BLE peripheral and sensor acquisition interface.
          </p>
          <div className="device-meta-row font-mono">
            <span>LINK: BLE-RPi3B</span>
            <span>LATENCY: 12ms</span>
          </div>
        </div>

        {/* Phone Remote */}
        <div className="device-status-card">
          <div className="device-card-top">
            <Smartphone size={28} color="var(--teal)" />
            <span className="status-badge green font-mono">CONNECTED</span>
          </div>
          <h2 className="device-name font-headline">Phone Remote</h2>
          <p className="device-desc">
            Operator handheld controller for Arm, Capture, and Reset operational triggers.
          </p>
          <div className="device-meta-row font-mono">
            <span>LINK: ACTIVE</span>
            <span>SYNC: REAL-TIME</span>
          </div>
        </div>

        {/* Gas Sensor 1 */}
        <div className="device-status-card">
          <div className="device-card-top">
            <Wind size={28} color="var(--teal)" />
            <span className="status-badge green font-mono">ACTIVE</span>
          </div>
          <h2 className="device-name font-headline">Gas Sensor 1 (MQ-2)</h2>
          <p className="device-desc">
            Electrochemical transducer configured for general hydrocarbons, combustible vapors, and combustion signatures.
          </p>
          <div className="device-meta-row font-mono">
            <span>READING: 0.42 V</span>
            <span>STATUS: CALIBRATED</span>
          </div>
        </div>

        {/* Gas Sensor 2 */}
        <div className="device-status-card">
          <div className="device-card-top">
            <Wind size={28} color="var(--teal)" />
            <span className="status-badge green font-mono">ACTIVE</span>
          </div>
          <h2 className="device-name font-headline">Gas Sensor 2 (MQ-3)</h2>
          <p className="device-desc">
            High-sensitivity ethanol, alcohol vapor, and volatile organic compound detector.
          </p>
          <div className="device-meta-row font-mono">
            <span>READING: 0.18 V</span>
            <span>STATUS: CALIBRATED</span>
          </div>
        </div>

        {/* Gas Sensor 3 */}
        <div className="device-status-card">
          <div className="device-card-top">
            <Wind size={28} color="var(--teal)" />
            <span className="status-badge green font-mono">ACTIVE</span>
          </div>
          <h2 className="device-name font-headline">Gas Sensor 3 (BME680)</h2>
          <p className="device-desc">
            Solid-state environmental VOC, barometric pressure, temperature, and relative humidity sensor.
          </p>
          <div className="device-meta-row font-mono">
            <span>READING: 0.51 V</span>
            <span>STATUS: CALIBRATED</span>
          </div>
        </div>

        {/* Camera Module */}
        <div className="device-status-card">
          <div className="device-card-top">
            <Camera size={28} color="var(--teal)" />
            <span className="status-badge green font-mono">READY</span>
          </div>
          <h2 className="device-name font-headline">Camera Module</h2>
          <p className="device-desc">
            Optical sensor array for facial geometry analysis and ocular micro-feature estimation.
          </p>
          <div className="device-meta-row font-mono">
            <span>RESOLUTION: 720P HD</span>
            <span>FPS: 30</span>
          </div>
        </div>

        {/* Physical Feedback */}
        <div className="device-status-card">
          <div className="device-card-top">
            <Zap size={28} color="var(--amber)" />
            <span className="status-badge green font-mono">READY</span>
          </div>
          <h2 className="device-name font-headline">Physical Feedback</h2>
          <p className="device-desc">
            Visual indicator LED and audible buzzer providing instant confirmation during sample capture.
          </p>
          <div className="device-meta-row font-mono">
            <span>
              LED: {hardwareFeedback.ledActive ? 'ACTIVE' : 'READY'}
            </span>
            <span>
              BUZZER: {hardwareFeedback.buzzerTriggered ? 'ACTIVE' : 'READY'}
            </span>
          </div>
        </div>

        {/* Software Platform */}
        <div className="device-status-card">
          <div className="device-card-top">
            <Activity size={28} color="var(--teal)" />
            <span className="status-badge green font-mono">RUNNING</span>
          </div>
          <h2 className="device-name font-headline">Software Platform</h2>
          <p className="device-desc">
            Next.js runtime with multimodal synthesis and reference classification engine.
          </p>
          <div className="device-meta-row font-mono">
            <span>SYSTEM: OPERATIONAL</span>
            <span>BUILD: v2.4</span>
          </div>
        </div>
      </div>
    </div>
  );
}
