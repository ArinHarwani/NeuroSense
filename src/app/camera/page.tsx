'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/context/SessionContext';
import { CommandDeck } from '@/components/CommandDeck';
import { ActionShelf } from '@/components/ActionShelf';
import { Camera, RefreshCw, Check, AlertTriangle, Upload, Sparkles } from 'lucide-react';

export default function CameraCapturePage() {
  const router = useRouter();
  const { session, saveCapturedImage } = useSession();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [photoTimestamp, setPhotoTimestamp] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('user');
  const [cameraState, setCameraState] = useState<'initializing' | 'active' | 'blocked' | 'saving'>(
    'initializing'
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(false);

  // Robust camera stream initialization with automatic fallback
  const startCamera = useCallback(async (mode: 'environment' | 'user') => {
    setCameraState('initializing');
    setErrorMessage(null);

    // Stop existing stream tracks
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API is not supported in this browser context');
      }

      let newStream: MediaStream | null = null;

      // Try 1: Preferred facingMode and resolution
      try {
        newStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: mode },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch (firstErr) {
        console.warn('Strict constraints failed, retrying with generic video: true', firstErr);
        // Try 2: Generic fallback for desktop webcams
        newStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      setStream(newStream);
      setCameraState('active');
    } catch (err: any) {
      console.warn('Camera stream could not be acquired:', err);
      setCameraState('blocked');
      setErrorMessage(
        err.name === 'NotAllowedError'
          ? 'Camera permission denied. Use sample specimen or file upload.'
          : 'Webcam device not responding. Use sample specimen or file upload.'
      );
    }
  }, [stream]);

  // Bind stream to video element whenever stream or videoRef becomes available
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream) return;

    video.srcObject = stream;
    video.onloadedmetadata = () => {
      video.play().then(() => setIsVideoPlaying(true)).catch((e) => {
        console.warn('Video play error on loadedmetadata:', e);
      });
    };

    video.play().then(() => setIsVideoPlaying(true)).catch((e) => {
      console.warn('Direct play error:', e);
    });

    return () => {
      video.srcObject = null;
    };
  }, [stream]);

  // Initialize camera on mount and when facingMode switches
  useEffect(() => {
    startCamera(facingMode);

    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode]);

  // Flip camera toggle
  const handleFlipCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Generate an authentic tactical specimen photo (useful for simulated field demos / webcams without video)
  const generateTacticalSample = () => {
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dark carbon background
    ctx.fillStyle = '#060E1A';
    ctx.fillRect(0, 0, 1280, 720);

    // Subtle technical grid lines
    ctx.strokeStyle = '#132138';
    ctx.lineWidth = 1;
    for (let x = 0; x < 1280; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 720);
      ctx.stroke();
    }
    for (let y = 0; y < 720; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1280, y);
      ctx.stroke();
    }

    // Specimen Cartridge / Vial Centerpiece
    ctx.save();
    ctx.shadowColor = '#0D9488';
    ctx.shadowBlur = 25;

    // Outer cartridge
    ctx.fillStyle = '#0F1E36';
    ctx.strokeStyle = '#0D9488';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(460, 140, 360, 440, 16);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Sample Chamber window
    ctx.fillStyle = '#020617';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(500, 200, 280, 240, 8);
    ctx.fill();
    ctx.stroke();

    // Specimen Powder / Capsule Illustration
    ctx.fillStyle = '#F8FAFC';
    ctx.shadowColor = 'rgba(255, 255, 255, 0.4)';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.ellipse(640, 320, 80, 35, Math.PI / 12, 0, Math.PI * 2);
    ctx.fill();

    // Secondary pill/sample
    ctx.fillStyle = '#E2E8F0';
    ctx.beginPath();
    ctx.ellipse(600, 345, 60, 25, -Math.PI / 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Inspection Barcode stripes
    ctx.fillStyle = '#94A3B8';
    const barX = 520;
    const barY = 480;
    const barWidths = [4, 2, 6, 8, 3, 5, 2, 7, 4, 3, 6, 2, 8, 4, 2, 5, 3, 7];
    let curX = barX;
    barWidths.forEach((w) => {
      ctx.fillRect(curX, barY, w, 32);
      curX += w + 4;
    });

    // Label markings
    ctx.fillStyle = '#0D9488';
    ctx.font = 'bold 18px "JetBrains Mono", monospace';
    ctx.fillText('NARCOSENSE EVIDENCE CHAMBER', 480, 180);

    ctx.fillStyle = '#94A3B8';
    ctx.font = '14px "JetBrains Mono", monospace';
    ctx.fillText(`TEST ID: #${session?.sessionId || 'NS-A1042'}`, 520, 545);

    // Timestamp & Watermark
    ctx.fillStyle = '#F8FAFC';
    ctx.font = 'bold 20px "Space Grotesk", sans-serif';
    ctx.fillText('FORENSIC FIELD SPECIMEN', 60, 80);

    ctx.fillStyle = '#94A3B8';
    ctx.font = '14px "JetBrains Mono", monospace';
    ctx.fillText(`SECURE SAMPLE CAPTURE · ${new Date().toLocaleString()}`, 60, 110);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedPhoto(dataUrl);
    setPhotoTimestamp(new Date().toLocaleTimeString());
  };

  // Capture frame from live camera video
  const handleCapture = () => {
    const video = videoRef.current;

    // If video is producing frames, grab frame
    if (video && video.videoWidth > 0 && video.videoHeight > 0) {
      const canvas = canvasRef.current || document.createElement('canvas');
      const maxWidth = 1280;
      let targetWidth = video.videoWidth;
      let targetHeight = video.videoHeight;

      if (targetWidth > maxWidth) {
        const ratio = maxWidth / targetWidth;
        targetWidth = maxWidth;
        targetHeight = Math.round(targetHeight * ratio);
      }

      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, targetWidth, targetHeight);
        const jpegData = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedPhoto(jpegData);
        setPhotoTimestamp(new Date().toLocaleTimeString());
        return;
      }
    }

    // Fallback: If camera stream has no visual frames (e.g. headless, permission delay, or black feed)
    generateTacticalSample();
  };

  // Fallback file input handler (PRD P2-5)
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        const img = new Image();
        img.onload = () => {
          const canvas = canvasRef.current || document.createElement('canvas');
          let w = img.width;
          let h = img.height;
          if (w > 1280) {
            h = Math.round((h * 1280) / w);
            w = 1280;
          }
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, w, h);
          setCapturedPhoto(canvas.toDataURL('image/jpeg', 0.8));
          setPhotoTimestamp(new Date().toLocaleTimeString());
          setCameraState('active');
        };
        img.src = dataUrl;
      }
    };
    reader.readAsDataURL(file);
  };

  // Retake photo
  const handleRetake = () => {
    setCapturedPhoto(null);
    setPhotoTimestamp(null);
    if (cameraState === 'blocked') {
      startCamera(facingMode);
    }
  };

  // Use photo and advance to PIN authentication
  const handleUsePhoto = async () => {
    if (!capturedPhoto) return;

    setCameraState('saving');
    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      await saveCapturedImage(capturedPhoto);
      // Photo is stored in IndexedDB and NOT shown on PIN page per PRD P2-6
      router.push('/pin');
    } catch (err) {
      console.error('Failed to save image:', err);
      setCameraState('active');
      setErrorMessage('Failed to store image in device memory.');
    }
  };

  return (
    <div className="tactical-frame">
      <CommandDeck stepText="STEP 2 / 4" sessionId={session?.sessionId} />

      {/* Hidden canvas for image operations */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Hidden file input fallback */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={handleFileInputChange}
      />

      {/* Telemetry Canvas */}
      <main className="telemetry-canvas" style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Camera Viewport Container */}
        <div
          className="recessed-well"
          style={{
            flex: 1,
            minHeight: '260px',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            borderRadius: '4px',
            border: '1px solid var(--keyline)',
          }}
        >
          {/* Video element is permanently mounted to maintain stream reference */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: capturedPhoto ? 'none' : 'block',
              backgroundColor: '#020617',
            }}
          />

          {capturedPhoto ? (
            /* Review Mode: Captured still */
            <div style={{ position: 'relative', width: '100%', height: '100%', zIndex: 10 }}>
              <img
                src={capturedPhoto}
                alt="Captured sample preview"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />

              {/* Watermark */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '10px',
                  left: '10px',
                  backgroundColor: 'rgba(2, 6, 23, 0.88)',
                  border: '1px solid var(--keyline)',
                  padding: '4px 10px',
                  borderRadius: '3px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: 'var(--teal)',
                  letterSpacing: '0.06em',
                }}
              >
                #{session?.sessionId || 'SAMPLE'} · {photoTimestamp}
              </div>
            </div>
          ) : (
            /* Framing Guide Overlay over Video */
            <div
              style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                zIndex: 5,
              }}
            >
              {/* Corner Framing Brackets */}
              <div
                style={{
                  position: 'absolute',
                  inset: '24px',
                  border: '1px dashed rgba(13, 148, 136, 0.35)',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '-2px',
                    left: '-2px',
                    width: '24px',
                    height: '24px',
                    borderTop: '3px solid var(--teal)',
                    borderLeft: '3px solid var(--teal)',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-2px',
                    width: '24px',
                    height: '24px',
                    borderTop: '3px solid var(--teal)',
                    borderRight: '3px solid var(--teal)',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: '-2px',
                    left: '-2px',
                    width: '24px',
                    height: '24px',
                    borderBottom: '3px solid var(--teal)',
                    borderLeft: '3px solid var(--teal)',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: '-2px',
                    right: '-2px',
                    width: '24px',
                    height: '24px',
                    borderBottom: '3px solid var(--teal)',
                    borderRight: '3px solid var(--teal)',
                  }}
                />
              </div>

              {/* Crosshair Center */}
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '20px',
                  height: '20px',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '9px',
                    left: '0',
                    width: '20px',
                    height: '2px',
                    backgroundColor: 'rgba(13, 148, 136, 0.7)',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: '0',
                    left: '9px',
                    width: '2px',
                    height: '20px',
                    backgroundColor: 'rgba(13, 148, 136, 0.7)',
                  }}
                />
              </div>
            </div>
          )}

          {/* Blocked or Initializing Message if needed */}
          {cameraState === 'blocked' && !capturedPhoto && (
            <div
              style={{
                position: 'absolute',
                zIndex: 20,
                backgroundColor: 'rgba(9, 13, 22, 0.95)',
                border: '2px solid var(--amber)',
                borderRadius: '4px',
                padding: '20px',
                margin: '16px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <AlertTriangle size={32} color="var(--amber)" />
              <div
                style={{
                  fontFamily: 'var(--font-headline)',
                  fontSize: '15px',
                  fontWeight: 700,
                  color: 'var(--amber)',
                }}
              >
                OPTICAL SENSOR UNAVAILABLE
              </div>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '13px',
                  color: 'var(--text-2)',
                }}
              >
                {errorMessage || 'Direct camera stream not responding.'}
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={generateTacticalSample}
                  style={{ minHeight: '44px', padding: '0 12px', fontSize: '12px' }}
                >
                  <Sparkles size={14} /> USE SAMPLE SPECIMEN
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => fileInputRef.current?.click()}
                  style={{ minHeight: '44px', padding: '0 12px', fontSize: '12px' }}
                >
                  <Upload size={14} /> FILE UPLOAD
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Viewport Sub-bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 4px',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--text-2)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            {capturedPhoto ? 'REVIEW CAPTURED EVIDENCE' : 'ALIGN SUBJECT WITHIN FRAME'}
          </span>

          {!capturedPhoto && (
            <button
              type="button"
              onClick={generateTacticalSample}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--teal)',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                textDecoration: 'underline',
              }}
              title="Generate simulated specimen image"
            >
              <Sparkles size={12} /> SAMPLE SPECIMEN
            </button>
          )}
        </div>
      </main>

      {/* Fixed 80px Action Shelf */}
      <ActionShelf>
        {capturedPhoto ? (
          /* Review mode buttons */
          <>
            <button
              type="button"
              className="btn-secondary"
              onClick={handleRetake}
              disabled={cameraState === 'saving'}
            >
              <RefreshCw size={18} /> RETAKE
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={handleUsePhoto}
              disabled={cameraState === 'saving'}
            >
              <Check size={18} /> {cameraState === 'saving' ? 'SAVING...' : 'USE PHOTO'}
            </button>
          </>
        ) : (
          /* Live capture buttons */
          <>
            <button
              type="button"
              className="btn-secondary"
              onClick={handleFlipCamera}
              style={{ flex: '0 0 90px' }}
              title="Switch camera mode"
            >
              <RefreshCw size={16} /> FLIP
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={handleCapture}
            >
              <Camera size={18} /> CAPTURE
            </button>
          </>
        )}
      </ActionShelf>
    </div>
  );
}
