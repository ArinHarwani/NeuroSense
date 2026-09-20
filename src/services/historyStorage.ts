import { TestRecord } from '@/types/narcosense';

const STORAGE_KEY_TESTS = 'narcosense_tests_history_v3';
const STORAGE_KEY_SETTINGS = 'narcosense_settings';

export interface AppSettings {
  applicationName: string;
  demoMode: boolean;
  fastDemo: boolean;
  confidenceThreshold: number;
  displayThreshold: number;
  cameraEnabled: boolean;
  selectedCameraId: string;
  defaultDemoCode: string;
}

const DEFAULT_SETTINGS: AppSettings = {
  applicationName: 'NarcoSense',
  demoMode: true,
  fastDemo: false,
  confidenceThreshold: 70,
  displayThreshold: 50,
  cameraEnabled: true,
  selectedCameraId: 'default',
  defaultDemoCode: '0001',
};

// Initial realistic seed history per PRD §18
const SEED_HISTORY: TestRecord[] = [
  {
    testId: 'NS-20260920-001',
    timestamp: '19:42',
    status: 'POSITIVE',
    confidence: 0.71,
    fingerprintSimilarity: 0.72,
    code: '0001',
    displayName: 'Paracetamol',
    scientificName: 'Acetaminophen',
    referenceFingerprint: {
      gasSensor1: 0.68,
      gasSensor2: 0.12,
      gasSensor3: 0.74,
    },
    capturedFingerprint: {
      gasSensor1: 0.64,
      gasSensor2: 0.14,
      gasSensor3: 0.71,
    },
    channelDifferences: {
      gasSensor1: 0.04,
      gasSensor2: 0.02,
      gasSensor3: 0.03,
    },
    // Bug #4 fix: include all score fields so dashboard renders correctly
    chemicalScore: 72,
    visualScore: 68,
    combinedScore: 71,
    drugSafetyClassification: 'SAFE DRUG',
    summary: 'REFERENCE PROFILE MATCHED: PARACETAMOL',
    mode: 'DEMO',
  },
  {
    testId: 'NS-20260920-002',
    timestamp: '19:46',
    status: 'POSITIVE',
    confidence: 0.76,
    fingerprintSimilarity: 0.78,
    code: '0003',
    displayName: 'Aspirin',
    scientificName: 'Acetylsalicylic acid',
    referenceFingerprint: {
      gasSensor1: 0.59,
      gasSensor2: 0.14,
      gasSensor3: 0.67,
    },
    capturedFingerprint: {
      gasSensor1: 0.57,
      gasSensor2: 0.16,
      gasSensor3: 0.64,
    },
    channelDifferences: {
      gasSensor1: 0.02,
      gasSensor2: 0.02,
      gasSensor3: 0.03,
    },
    chemicalScore: 78,
    visualScore: 72,
    combinedScore: 76,
    drugSafetyClassification: 'SAFE DRUG',
    summary: 'REFERENCE PROFILE MATCHED: ASPIRIN',
    mode: 'DEMO',
  },
  {
    testId: 'NS-20260920-003',
    timestamp: '19:49',
    status: 'NEGATIVE',
    confidence: 0.67,
    fingerprintSimilarity: 0.65,
    code: '9999',
    displayName: 'Normal',
    scientificName: 'Normal Reference',
    referenceFingerprint: {
      gasSensor1: 0.06,
      gasSensor2: 0.05,
      gasSensor3: 0.06,
    },
    capturedFingerprint: {
      gasSensor1: 0.07,
      gasSensor2: 0.04,
      gasSensor3: 0.07,
    },
    channelDifferences: {
      gasSensor1: 0.01,
      gasSensor2: 0.01,
      gasSensor3: 0.01,
    },
    chemicalScore: 65,
    visualScore: 84,
    combinedScore: 71,
    drugSafetyClassification: 'BASELINE / NORMAL',
    summary: 'NORMAL / NO TARGET REFERENCE MATCH',
    mode: 'DEMO',
  },
];

export function getTestHistory(): TestRecord[] {
  if (typeof window === 'undefined') {

    return SEED_HISTORY;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY_TESTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_TESTS, JSON.stringify(SEED_HISTORY));
      return SEED_HISTORY;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Could not read tests history from localStorage', e);
    return SEED_HISTORY;
  }
}

export function saveTestRecord(record: TestRecord): void {
  if (typeof window === 'undefined') return;

  try {
    const history = getTestHistory();
    // Prepend new record so latest test is at top
    const updated = [record, ...history.filter((t) => t.testId !== record.testId)];
    localStorage.setItem(STORAGE_KEY_TESTS, JSON.stringify(updated));
  } catch (e) {
    console.warn('Could not save test to localStorage', e);
  }
}

export function clearTestHistory(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY_TESTS);
  } catch (e) {
    console.warn('Could not clear tests history from localStorage', e);
  }
}

export function getTodayStats(): {
  total: number;
  positive: number;
  negative: number;
  inconclusive: number;
  avgConfidence: number;
} {
  const history = getTestHistory();
  const total = history.length;
  if (total === 0) {
    return { total: 0, positive: 0, negative: 0, inconclusive: 0, avgConfidence: 0 };
  }

  let positive = 0;
  let negative = 0;
  let inconclusive = 0;
  let sumConfidence = 0;

  history.forEach((t) => {
    if (t.status === 'POSITIVE') positive++;
    else if (t.status === 'NEGATIVE') negative++;
    else inconclusive++;
    const confVal = t.confidence <= 1 ? t.confidence * 100 : t.confidence;
    sumConfidence += confVal;
  });

  return {
    total,
    positive,
    negative,
    inconclusive,
    avgConfidence: Math.round(sumConfidence / total),
  };
}

export function getAppSettings(): AppSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;

  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveAppSettings(settings: Partial<AppSettings>): void {
  if (typeof window === 'undefined') return;

  try {
    const current = getAppSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(updated));
  } catch (e) {
    console.error('Could not save app settings', e);
  }
}
