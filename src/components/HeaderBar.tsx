'use client';

import React, { useState, useEffect } from 'react';
import { useTestWorkflow } from '@/context/TestWorkflowContext';
import { Camera, Cpu, Smartphone, User, LogOut } from 'lucide-react';

export function HeaderBar() {
  const { officerName, badgeId, logout } = useTestWorkflow();
  const [time, setTime] = useState<string>('--:--:--');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toTimeString().split(' ')[0] || now.toLocaleTimeString());
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="app-header">
      {/* Left Info: Officer & Time */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {officerName && (
          <div className="header-officer-pill">
            <User size={13} color="var(--teal)" />
            <span className="font-mono" style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text)' }}>
              OFFICER: {officerName}
            </span>
            <span className="badge-tag font-mono">{badgeId || 'NS-OP-01'}</span>
            <button
              type="button"
              onClick={logout}
              className="btn-switch-officer"
              title="Switch inspecting officer"
            >
              <LogOut size={11} />
            </button>
          </div>
        )}

        <div className="header-time-pill font-mono">
          <span style={{ color: 'var(--text-2)', fontSize: '11px' }}>TIME:</span>
          <span style={{ color: 'var(--text)', fontWeight: 600 }}>{time}</span>
        </div>
      </div>

      {/* Right Hardware Status Pills */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div className="header-device-pills">
          <div className="device-pill" title="Raspberry Pi 3B Connected">
            <Cpu size={13} color="var(--teal)" />
            <span>RPI-3B: OK</span>
          </div>
          <div className="device-pill" title="Camera Ready">
            <Camera size={13} color="var(--teal)" />
            <span>CAM: READY</span>
          </div>
        </div>
      </div>
    </header>
  );
}
