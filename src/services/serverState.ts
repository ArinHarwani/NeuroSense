import { TestState, DemoResult } from '@/types/narcosense';
import { demoResultService } from '@/services/DemoResultService';

export interface ServerTestSession {
  testId: string;
  state: TestState;
  updatedAt: number;
  result?: DemoResult | null;
  code?: string;
  hardwareFeedback: {
    ledActive: boolean;
    buzzerTriggered: boolean;
    sensorActive: boolean;
  };
}

function generateNewTestId(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const randomNum = Math.floor(1 + Math.random() * 999)
    .toString()
    .padStart(3, '0');
  return `NS-${yyyy}${mm}${dd}-${randomNum}`;
}

// Global server singleton in memory (survives hot reloads in Next.js development)
declare global {
  // eslint-disable-next-line no-var
  var __narcosense_server_state: ServerTestSession | undefined;
}

if (!global.__narcosense_server_state) {
  global.__narcosense_server_state = {
    testId: generateNewTestId(),
    state: 'READY',
    updatedAt: Date.now(),
    hardwareFeedback: {
      ledActive: false,
      buzzerTriggered: false,
      sensorActive: false,
    },
  };
}

export const serverSession = global.__narcosense_server_state;

// Subscribers for SSE live events
type Listener = (session: ServerTestSession) => void;
declare global {
  // eslint-disable-next-line no-var
  var __narcosense_listeners: Set<Listener> | undefined;
}
if (!global.__narcosense_listeners) {
  global.__narcosense_listeners = new Set();
}
export const listeners = global.__narcosense_listeners;

export function notifyListeners() {
  serverSession.updatedAt = Date.now();
  listeners.forEach((fn) => {
    try {
      fn(serverSession);
    } catch {
      listeners.delete(fn);
    }
  });
}

export function startNewServerTest(): ServerTestSession {
  serverSession.testId = generateNewTestId();
  serverSession.state = 'PASSCODE_ENTRY';
  serverSession.result = null;
  serverSession.code = undefined;
  serverSession.hardwareFeedback = {
    ledActive: false,
    buzzerTriggered: false,
    sensorActive: false,
  };
  notifyListeners();
  return serverSession;
}

export function waitServerInput(): ServerTestSession {
  serverSession.state = 'WAITING_FOR_INPUT';
  notifyListeners();
  return serverSession;
}

export function captureServerInput(): ServerTestSession {
  serverSession.state = 'INPUT_CAPTURED';
  serverSession.hardwareFeedback = {
    ledActive: true,
    buzzerTriggered: true,
    sensorActive: true,
  };
  notifyListeners();
  return serverSession;
}

export function analyzeServerTest(): ServerTestSession {
  serverSession.state = 'PROCESSING';
  notifyListeners();
  return serverSession;
}

export async function submitServerDemoCode(code: string): Promise<ServerTestSession> {
  const res = await demoResultService.getResultByCode(code);
  if (!res) {
    throw new Error('INVALID_DEMO_CODE');
  }

  serverSession.code = code;
  serverSession.result = res;
  serverSession.state = 'RESULT_READY';
  serverSession.hardwareFeedback = {
    ledActive: false,
    buzzerTriggered: false,
    sensorActive: false,
  };
  notifyListeners();
  return serverSession;
}

export function resetServerSession(): ServerTestSession {
  serverSession.state = 'READY';
  serverSession.result = null;
  serverSession.code = undefined;
  serverSession.hardwareFeedback = {
    ledActive: false,
    buzzerTriggered: false,
    sensorActive: false,
  };
  notifyListeners();
  return serverSession;
}
