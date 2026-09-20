'use client';

import React, { useState, useEffect } from 'react';
import { getAppSettings, saveAppSettings, AppSettings } from '@/services/historyStorage';
import { useTestWorkflow } from '@/context/TestWorkflowContext';
import { DemoProfile } from '@/types/narcosense';
import defaultProfilesData from '@/config/demo-profiles.json';
import {
  Settings,
  Save,
  Check,
  Cpu,
  Camera,
  Layers,
  Plus,
  Edit2,
  CheckCircle2,
  XCircle,
  AlertOctagon,
  Shield,
  Smartphone,
  Radio,
} from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'device' | 'camera' | 'profiles'>('general');

  const [settings, setSettings] = useState<AppSettings>({
    applicationName: 'NarcoSense',
    demoMode: true,
    confidenceThreshold: 70,
    displayThreshold: 50,
    cameraEnabled: true,
    selectedCameraId: 'default',
    defaultDemoCode: '0001',
  });
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Demo Profiles States (PRD §4 & §5)
  const [profiles, setProfiles] = useState<DemoProfile[]>(
    defaultProfilesData.profiles as DemoProfile[]
  );
  const [editingProfile, setEditingProfile] = useState<DemoProfile | null>(null);
  const [isNewProfile, setIsNewProfile] = useState<boolean>(false);
  const [profileFormError, setProfileFormError] = useState<string | null>(null);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const s = getAppSettings();
    setSettings(s);

    // Fetch profiles from API
    fetch('/api/profiles')
      .then((res) => res.json())
      .then((data) => {
        if (data.profiles && Array.isArray(data.profiles)) {
          setProfiles(data.profiles);
        }
      })
      .catch(() => {});
  }, []);

  const handleSaveSettings = () => {
    saveAppSettings(settings);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  // -------------------------------------------------------------
  // Demo Profile Handlers (PRD §5)
  // -------------------------------------------------------------
  const handleOpenAddProfile = () => {
    setIsNewProfile(true);
    setEditingProfile({
      code: '',
      displayName: '',
      scientificName: '',
      fingerprint: {
        gasSensor1: 0.5,
        gasSensor2: 0.5,
        gasSensor3: 0.5,
      },
      active: true,
    });
    setProfileFormError(null);
  };

  const handleOpenEditProfile = (p: DemoProfile) => {
    setIsNewProfile(false);
    setEditingProfile(JSON.parse(JSON.stringify(p)));
    setProfileFormError(null);
  };

  const handleToggleProfileActive = async (p: DemoProfile) => {
    const updated = profiles.map((item) =>
      item.code === p.code ? { ...item, active: !item.active } : item
    );
    setProfiles(updated);

    try {
      await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profiles: updated }),
      });
    } catch {
      console.warn('Could not save updated profile active state to server');
    }
  };

  const handleSaveProfileForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProfile) return;

    // Validation
    const code = editingProfile.code.trim();
    const displayName = editingProfile.displayName.trim();
    const scientificName = editingProfile.scientificName.trim();

    if (!code || !displayName || !scientificName) {
      setProfileFormError('Reference Code, Display Name, and Scientific Name are required.');
      return;
    }

    if (isNewProfile && profiles.some((p) => p.code === code)) {
      setProfileFormError('Reference Code must be unique. A profile with this code already exists.');
      return;
    }

    const { gasSensor1, gasSensor2, gasSensor3 } = editingProfile.fingerprint;
    if (
      isNaN(gasSensor1) || gasSensor1 < 0 || gasSensor1 > 1 ||
      isNaN(gasSensor2) || gasSensor2 < 0 || gasSensor2 > 1 ||
      isNaN(gasSensor3) || gasSensor3 < 0 || gasSensor3 > 1
    ) {
      setProfileFormError('Gas Sensor 1, 2, and 3 values must be between 0.00 and 1.00.');
      return;
    }

    const profileToSave: DemoProfile = {
      code,
      displayName,
      scientificName,
      fingerprint: {
        gasSensor1: Number(gasSensor1.toFixed(2)),
        gasSensor2: Number(gasSensor2.toFixed(2)),
        gasSensor3: Number(gasSensor3.toFixed(2)),
      },
      active: editingProfile.active,
    };

    let updatedList: DemoProfile[];
    if (isNewProfile) {
      updatedList = [...profiles, profileToSave];
    } else {
      updatedList = profiles.map((p) => (p.code === code ? profileToSave : p));
    }

    setProfiles(updatedList);
    setEditingProfile(null);
    setProfileFormError(null);
    setProfileSuccessMsg(`Profile [${code}] saved successfully.`);
    setTimeout(() => setProfileSuccessMsg(null), 2500);

    try {
      await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profiles: updatedList }),
      });
    } catch {
      console.warn('Could not persist profiles list to API');
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Settings size={22} color="var(--teal)" />
          <div>
            <h1 className="page-title font-headline">SYSTEM SETTINGS</h1>
            <p className="page-subtitle">
              Configure screening parameters, operational thresholds, camera, and reference profiles.
            </p>
          </div>
        </div>

        {activeTab !== 'profiles' && (
          <button
            type="button"
            className="btn-primary-action"
            onClick={handleSaveSettings}
            style={{ maxWidth: '180px' }}
          >
            {savedSuccess ? <Check size={16} /> : <Save size={16} />}
            <span>{savedSuccess ? 'SAVED!' : 'SAVE SETTINGS'}</span>
          </button>
        )}
      </div>

      {/* Settings Navigation Tabs (PRD §4) */}
      <div className="settings-nav-tabs">
        <button
          type="button"
          onClick={() => setActiveTab('general')}
          className={`settings-tab-btn font-mono ${activeTab === 'general' ? 'active' : ''}`}
        >
          <Settings size={15} />
          <span>GENERAL</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('device')}
          className={`settings-tab-btn font-mono ${activeTab === 'device' ? 'active' : ''}`}
        >
          <Cpu size={15} />
          <span>DEVICE</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('camera')}
          className={`settings-tab-btn font-mono ${activeTab === 'camera' ? 'active' : ''}`}
        >
          <Camera size={15} />
          <span>CAMERA</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('profiles')}
          className={`settings-tab-btn font-mono ${activeTab === 'profiles' ? 'active' : ''}`}
        >
          <Layers size={15} />
          <span>REFERENCE PROFILES</span>
        </button>
      </div>

      {/* TAB 1: GENERAL */}
      {activeTab === 'general' && (
        <div className="settings-grid">
          <div className="dashboard-card">
            <h2 className="card-title font-headline" style={{ marginBottom: '16px' }}>
              GENERAL CONFIGURATION
            </h2>

            <div className="settings-field-group">
              <label className="field-label">APPLICATION NAME</label>
              <input
                type="text"
                value={settings.applicationName}
                onChange={(e) => setSettings({ ...settings, applicationName: e.target.value })}
                className="settings-input"
              />
            </div>

            <div className="settings-toggle-row">
              <div>
                <span className="toggle-label font-headline">OPERATIONAL MODE</span>
                <span className="toggle-sub">Standard automated field screening profile.</span>
              </div>
              <input
                type="checkbox"
                checked={true}
                disabled
                className="settings-checkbox"
              />
            </div>


          </div>

          <div className="dashboard-card">
            <h2 className="card-title font-headline" style={{ marginBottom: '16px' }}>
              SCREENING THRESHOLDS
            </h2>

            <div className="settings-field-group">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label className="field-label">CONFIDENCE THRESHOLD (MINIMUM)</label>
                <span className="font-mono text-teal">{settings.confidenceThreshold}%</span>
              </div>
              <input
                type="range"
                min={50}
                max={95}
                value={settings.confidenceThreshold}
                onChange={(e) =>
                  setSettings({ ...settings, confidenceThreshold: Number(e.target.value) })
                }
                className="settings-range"
              />
            </div>

            <div className="settings-field-group" style={{ marginTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label className="field-label">DISPLAY THRESHOLD</label>
                <span className="font-mono text-teal">{settings.displayThreshold}%</span>
              </div>
              <input
                type="range"
                min={30}
                max={80}
                value={settings.displayThreshold}
                onChange={(e) =>
                  setSettings({ ...settings, displayThreshold: Number(e.target.value) })
                }
                className="settings-range"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DEVICE */}
      {activeTab === 'device' && (
        <div className="settings-grid">
          <div className="dashboard-card">
            <h2 className="card-title font-headline" style={{ marginBottom: '16px' }}>
              EMBEDDED HARDWARE INTERFACE
            </h2>
            <div className="device-status-item">
              <div>
                <span className="font-headline font-bold">Raspberry Pi 3B Controller</span>
                <p style={{ color: 'var(--text-2)', fontSize: '12px' }}>
                  Connected via BLE (BLE-RPi3B) on GPIO peripheral bus.
                </p>
              </div>
              <span className="status-badge connected font-mono">OK</span>
            </div>
            <div className="device-status-item" style={{ marginTop: '12px' }}>
              <div>
                <span className="font-headline font-bold">Gas Sensor Array (1, 2, 3)</span>
                <p style={{ color: 'var(--text-2)', fontSize: '12px' }}>
                  Gas Sensor 1, Gas Sensor 2, Gas Sensor 3 calibrated on ADC channels.
                </p>
              </div>
              <span className="status-badge connected font-mono">NOMINAL</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CAMERA */}
      {activeTab === 'camera' && (
        <div className="settings-grid">
          <div className="dashboard-card">
            <h2 className="card-title font-headline" style={{ marginBottom: '16px' }}>
              OPTICAL & OCULAR CAMERA
            </h2>
            <div className="settings-toggle-row">
              <div>
                <span className="toggle-label font-headline">ENABLE INTEGRATED CAMERA</span>
                <span className="toggle-sub">
                  Captures visual indicators (gaze stability, eye tracking, blink rate).
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.cameraEnabled}
                onChange={(e) => setSettings({ ...settings, cameraEnabled: e.target.checked })}
                className="settings-checkbox"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DEMO PROFILES (PRD §4 & §5) */}
      {activeTab === 'profiles' && (
        <div className="demo-profiles-container">
          <div className="profiles-header-row">
            <div>
              <h2 className="card-title font-headline">REFERENCE PROFILES REGISTRY</h2>
              <p className="page-subtitle">
                Configured sensor fingerprint reference profiles for field screening.
              </p>
            </div>

            <button
              type="button"
              className="btn-primary-action"
              onClick={handleOpenAddProfile}
              style={{ maxWidth: '180px' }}
            >
              <Plus size={16} />
              <span>ADD PROFILE</span>
            </button>
          </div>

          {profileSuccessMsg && (
            <div className="profile-success-banner font-mono">
              <CheckCircle2 size={16} color="var(--emerald)" />
              <span>{profileSuccessMsg}</span>
            </div>
          )}

          {/* Profiles Table (PRD §4) */}
          <div className="table-wrapper" style={{ marginTop: '16px' }}>
            <table className="tactical-table font-mono">
              <thead>
                <tr>
                  <th>DISPLAY NAME</th>
                  <th>SCIENTIFIC / GENERIC NAME</th>
                  <th>GAS SENSOR 1</th>
                  <th>GAS SENSOR 2</th>
                  <th>GAS SENSOR 3</th>
                  <th>ACTIVE</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((p) => (
                  <tr key={p.code} style={{ opacity: p.active ? 1 : 0.55 }}>
                    <td>{p.displayName}</td>
                    <td style={{ color: 'var(--text-2)' }}>{p.scientificName}</td>
                    <td>{p.fingerprint?.gasSensor1?.toFixed(2) ?? '0.50'}</td>
                    <td>{p.fingerprint?.gasSensor2?.toFixed(2) ?? '0.50'}</td>
                    <td>{p.fingerprint?.gasSensor3?.toFixed(2) ?? '0.50'}</td>
                    <td>
                      <span className={`badge ${p.active ? 'positive' : 'inconclusive'}`}>
                        {p.active ? 'YES' : 'NO'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => handleOpenEditProfile(p)}
                          className="btn-table-action"
                          title="Edit profile"
                        >
                          <Edit2 size={13} />
                          <span>EDIT</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleProfileActive(p)}
                          className="btn-table-action"
                          title={p.active ? 'Deactivate profile' : 'Activate profile'}
                        >
                          {p.active ? <XCircle size={13} color="var(--amber)" /> : <CheckCircle2 size={13} color="var(--emerald)" />}
                          <span>{p.active ? 'DEACTIVATE' : 'ACTIVATE'}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="table-footer-notice font-mono">
            * Note: These values are editable reference data and must not be represented as validated sensor measurements. Inactive profiles cannot be selected for new tests. Historical tests retain their original profile snapshot.
          </p>

          {/* Add / Edit Profile Modal Form (PRD §5) */}
          {editingProfile && (
            <div className="tactical-modal-backdrop">
              <div className="tactical-modal" style={{ maxWidth: '520px' }}>
                <div className="card-header" style={{ padding: 0 }}>
                  <h2 className="card-title font-headline">
                    {isNewProfile ? 'ADD REFERENCE PROFILE' : `EDIT PROFILE [****]`}
                  </h2>
                  <span className="card-tag font-mono">PRD §5</span>
                </div>

                <form onSubmit={handleSaveProfileForm} className="profile-edit-form">
                  <div className="settings-field-group">
                    <label className="field-label font-mono">REFERENCE CODE *</label>
                    <input
                      type="password"
                      maxLength={4}
                      value={editingProfile.code}
                      onChange={(e) =>
                        setEditingProfile({ ...editingProfile, code: e.target.value })
                      }
                      disabled={!isNewProfile}
                      placeholder="e.g. 0006"
                      className="settings-input font-mono"
                      required
                    />
                  </div>

                  <div className="settings-field-group">
                    <label className="field-label font-mono">DISPLAY NAME *</label>
                    <input
                      type="text"
                      value={editingProfile.displayName}
                      onChange={(e) =>
                        setEditingProfile({ ...editingProfile, displayName: e.target.value })
                      }
                      placeholder="e.g. Paracetamol"
                      className="settings-input"
                      required
                    />
                  </div>

                  <div className="settings-field-group">
                    <label className="field-label font-mono">SCIENTIFIC / GENERIC NAME *</label>
                    <input
                      type="text"
                      value={editingProfile.scientificName}
                      onChange={(e) =>
                        setEditingProfile({ ...editingProfile, scientificName: e.target.value })
                      }
                      placeholder="e.g. Acetaminophen"
                      className="settings-input"
                      required
                    />
                  </div>

                  <div className="fingerprint-inputs-box">
                    <span className="field-label font-mono" style={{ color: 'var(--teal-light)' }}>
                      REFERENCE FINGERPRINT (0.00 – 1.00)
                    </span>

                    <div className="fingerprint-inputs-grid">
                      <div className="settings-field-group">
                        <label className="field-label font-mono">GAS SENSOR 1</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="1"
                          value={editingProfile.fingerprint.gasSensor1}
                          onChange={(e) =>
                            setEditingProfile({
                              ...editingProfile,
                              fingerprint: {
                                ...editingProfile.fingerprint,
                                gasSensor1: parseFloat(e.target.value) || 0,
                              },
                            })
                          }
                          className="settings-input font-mono"
                          required
                        />
                      </div>

                      <div className="settings-field-group">
                        <label className="field-label font-mono">GAS SENSOR 2</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="1"
                          value={editingProfile.fingerprint.gasSensor2}
                          onChange={(e) =>
                            setEditingProfile({
                              ...editingProfile,
                              fingerprint: {
                                ...editingProfile.fingerprint,
                                gasSensor2: parseFloat(e.target.value) || 0,
                              },
                            })
                          }
                          className="settings-input font-mono"
                          required
                        />
                      </div>

                      <div className="settings-field-group">
                        <label className="field-label font-mono">GAS SENSOR 3</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="1"
                          value={editingProfile.fingerprint.gasSensor3}
                          onChange={(e) =>
                            setEditingProfile({
                              ...editingProfile,
                              fingerprint: {
                                ...editingProfile.fingerprint,
                                gasSensor3: parseFloat(e.target.value) || 0,
                              },
                            })
                          }
                          className="settings-input font-mono"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="settings-toggle-row">
                    <div>
                      <span className="toggle-label font-headline">ACTIVE PROFILE</span>
                      <span className="toggle-sub">Available for operator selection in test screening.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={editingProfile.active}
                      onChange={(e) =>
                        setEditingProfile({ ...editingProfile, active: e.target.checked })
                      }
                      className="settings-checkbox"
                    />
                  </div>

                  {profileFormError && (
                    <div className="code-error-box font-mono">
                      <AlertOctagon size={16} color="var(--crimson)" />
                      <span>{profileFormError}</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setEditingProfile(null)}
                      style={{ flex: 1 }}
                    >
                      CANCEL
                    </button>
                    <button
                      type="submit"
                      className="btn-primary-action"
                      style={{ flex: 1 }}
                    >
                      <Save size={16} />
                      <span>SAVE PROFILE</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
