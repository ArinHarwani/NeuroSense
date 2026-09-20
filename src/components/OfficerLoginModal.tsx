'use client';

import React, { useState } from 'react';
import { useTestWorkflow } from '@/context/TestWorkflowContext';
import { ShieldAlert, UserCheck, Shield, ChevronRight } from 'lucide-react';

export function OfficerLoginModal() {
  const { isLoggedIn, login, officerName } = useTestWorkflow();
  const [nameInput, setNameInput] = useState<string>('');
  const [badgeInput, setBadgeInput] = useState<string>('NS-OP-01');
  const [error, setError] = useState<string | null>(null);

  if (isLoggedIn) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) {
      setError('Please enter the inspecting officer name.');
      return;
    }
    login(nameInput.trim(), badgeInput.trim() || 'NS-OP-01');
  };

  return (
    <div className="login-modal-backdrop">
      <div className="login-modal-card">
        {/* Header */}
        <div className="login-header">
          <div className="login-icon-ring">
            <ShieldAlert size={36} color="var(--teal)" />
          </div>
          <h1 className="login-brand font-headline">NARCOSENSE</h1>
          <span className="login-sub font-mono">AI-ASSISTED BREATH SCREENING PLATFORM</span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-form-title font-headline">
            OFFICER AUTHENTICATION
          </div>
          <p className="login-form-desc">
            Enter your credentials to initialize operational screening sessions and chain of custody.
          </p>

          <div className="login-field-group">
            <label className="login-label font-mono">INSPECTING OFFICER NAME *</label>
            <input
              type="text"
              placeholder="e.g. Officer Harshit / Inspector R. Sharma"
              value={nameInput}
              onChange={(e) => {
                setNameInput(e.target.value);
                setError(null);
              }}
              className="login-input"
              autoFocus
            />
          </div>

          <div className="login-field-group">
            <label className="login-label font-mono">OPERATOR / BADGE ID</label>
            <input
              type="text"
              placeholder="e.g. NS-8492"
              value={badgeInput}
              onChange={(e) => setBadgeInput(e.target.value)}
              className="login-input font-mono"
            />
          </div>

          {error && (
            <div className="login-error font-mono">
              <span>{error}</span>
            </div>
          )}

          <button type="submit" className="login-btn font-headline">
            <UserCheck size={18} />
            <span>[ AUTHENTICATE & ACCESS SYSTEM ]</span>
            <ChevronRight size={18} />
          </button>
        </form>

        <div className="login-footer font-mono">
          <span>HARDWARE: RASPBERRY PI 3B</span>
          <span>SYSTEM READY</span>
        </div>
      </div>
    </div>
  );
}
