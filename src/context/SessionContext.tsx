'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { SessionStatus, ScenarioData, TestSession } from '@/types/session';
import { getResult } from '@/services/resultProvider';
import { storeSessionImage, getSessionImage, clearSessionImage } from '@/services/imageStorage';

interface SessionContextType {
  session: TestSession | null;
  startSession: () => string;
  saveCapturedImage: (dataUrl: string) => Promise<void>;
  verifyPin: (pin: string) => Promise<{ success: boolean; attemptsLeft: number; locked: boolean }>;
  lockResults: () => void;
  resetSession: () => Promise<void>;
  lockoutRemainingSeconds: number;
  isLockedOut: boolean;
  imageDataUrl: string | null;
  autoLockSeconds: number;
  resetAutoLockTimer: () => void;
}

const SessionContext = createContext<SessionContextType | null>(null);

function generateSessionId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let randomPart = '';
  for (let i = 0; i < 4; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `NS-${randomPart}`;
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [session, setSession] = useState<TestSession | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [lockoutRemainingSeconds, setLockoutRemainingSeconds] = useState<number>(0);
  const [autoLockSeconds, setAutoLockSeconds] = useState<number>(60);

  // Countdown timer for PIN lockout (30 seconds after 3 wrong attempts)
  useEffect(() => {
    if (!session?.lockoutUntil) {
      setLockoutRemainingSeconds(0);
      return;
    }

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((session.lockoutUntil! - Date.now()) / 1000));
      setLockoutRemainingSeconds(remaining);
      if (remaining <= 0) {
        setSession((prev) => (prev ? { ...prev, lockoutUntil: undefined, wrongPinAttempts: 0 } : null));
      }
    }, 500);

    return () => clearInterval(interval);
  }, [session?.lockoutUntil]);

  // 60-second inactivity auto-lock for results page
  const resetAutoLockTimer = useCallback(() => {
    setAutoLockSeconds(60);
  }, []);

  useEffect(() => {
    if (pathname !== '/results' || session?.status !== 'UNLOCKED') {
      return;
    }

    const interval = setInterval(() => {
      setAutoLockSeconds((prev) => {
        if (prev <= 1) {
          // Lock and route back to PIN
          router.replace('/pin');
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    const onUserActivity = () => {
      setAutoLockSeconds(60);
    };

    window.addEventListener('pointerdown', onUserActivity);
    window.addEventListener('keydown', onUserActivity);
    window.addEventListener('touchstart', onUserActivity);

    return () => {
      clearInterval(interval);
      window.removeEventListener('pointerdown', onUserActivity);
      window.removeEventListener('keydown', onUserActivity);
      window.removeEventListener('touchstart', onUserActivity);
    };
  }, [pathname, session?.status, router]);

  // Route Guards per PRD Section 4 & 5
  // Route guards: each page can only be opened if the previous step is done.
  // Opening any other URL directly redirects to Page 1.
  useEffect(() => {
    if (!pathname) return;

    // Normalizing paths
    if (pathname === '/' || pathname === '/confirm') {
      return;
    }

    if (pathname === '/camera') {
      if (!session || (session.status !== 'INPUT_CONFIRMED' && session.status !== 'IMAGE_CAPTURED')) {
        router.replace('/');
      }
      return;
    }

    if (pathname === '/pin') {
      if (!session || (session.status !== 'IMAGE_CAPTURED' && session.status !== 'UNLOCKED')) {
        router.replace('/');
      }
      return;
    }

    if (pathname === '/results') {
      if (!session || session.status !== 'UNLOCKED') {
        router.replace('/');
      }
      return;
    }
  }, [pathname, session, router]);

  const startSession = useCallback((): string => {
    const newId = generateSessionId();
    const newSession: TestSession = {
      sessionId: newId,
      status: 'INPUT_CONFIRMED',
      createdAt: Date.now(),
      wrongPinAttempts: 0,
    };
    setSession(newSession);
    setImageDataUrl(null);
    setAutoLockSeconds(60);
    return newId;
  }, []);

  const saveCapturedImage = useCallback(
    async (dataUrl: string): Promise<void> => {
      if (!session) throw new Error('No active session');
      await storeSessionImage(session.sessionId, dataUrl);
      setImageDataUrl(dataUrl);
      setSession((prev) => (prev ? { ...prev, status: 'IMAGE_CAPTURED' } : null));
    },
    [session]
  );

  const verifyPin = useCallback(
    async (pin: string): Promise<{ success: boolean; attemptsLeft: number; locked: boolean }> => {
      if (!session) {
        return { success: false, attemptsLeft: 0, locked: false };
      }

      // If currently locked out
      if (session.lockoutUntil && Date.now() < session.lockoutUntil) {
        return { success: false, attemptsLeft: 0, locked: true };
      }

      const result = await getResult(session.sessionId, pin);

      if (result) {
        // Load stored image from IndexedDB if not in memory
        if (!imageDataUrl) {
          const loadedImg = await getSessionImage(session.sessionId);
          if (loadedImg) setImageDataUrl(loadedImg);
        }

        setSession((prev) =>
          prev
            ? {
                ...prev,
                status: 'UNLOCKED',
                pinEntered: pin,
                result,
                wrongPinAttempts: 0,
                lockoutUntil: undefined,
              }
            : null
        );
        setAutoLockSeconds(60);
        return { success: true, attemptsLeft: 3, locked: false };
      } else {
        const nextAttempts = session.wrongPinAttempts + 1;
        const attemptsLeft = Math.max(0, 3 - nextAttempts);
        const shouldLock = nextAttempts >= 3;
        const lockoutUntil = shouldLock ? Date.now() + 30000 : undefined;

        setSession((prev) =>
          prev
            ? {
                ...prev,
                wrongPinAttempts: shouldLock ? 3 : nextAttempts,
                lockoutUntil,
              }
            : null
        );

        return {
          success: false,
          attemptsLeft,
          locked: shouldLock,
        };
      }
    },
    [session, imageDataUrl]
  );

  const lockResults = useCallback(() => {
    if (session) {
      // Revert status to IMAGE_CAPTURED so PIN is required to view results again
      setSession((prev) =>
        prev
          ? {
              ...prev,
              status: 'IMAGE_CAPTURED',
              pinEntered: undefined,
            }
          : null
      );
      router.replace('/pin');
    }
  }, [session, router]);

  const resetSession = useCallback(async () => {
    if (session) {
      await clearSessionImage(session.sessionId);
    }
    setSession(null);
    setImageDataUrl(null);
    setAutoLockSeconds(60);
    setLockoutRemainingSeconds(0);
    router.replace('/');
  }, [session, router]);

  return (
    <SessionContext.Provider
      value={{
        session,
        startSession,
        saveCapturedImage,
        verifyPin,
        lockResults,
        resetSession,
        lockoutRemainingSeconds,
        isLockedOut: lockoutRemainingSeconds > 0,
        imageDataUrl,
        autoLockSeconds,
        resetAutoLockTimer,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
