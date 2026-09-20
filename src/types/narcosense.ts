export type TestState =
  | 'READY'
  | 'PASSCODE_ENTRY'
  | 'ARMED'
  | 'WAITING_FOR_INPUT'
  | 'INPUT_CAPTURED'
  | 'CAMERA_ANALYSIS'
  | 'PROCESSING'
  | 'CODE_ENTRY'
  | 'RESULT_READY'
  | 'COMPLETED'
  | 'RESET'
  | 'ERROR';

export type ResultStatus = 'POSITIVE' | 'NEGATIVE' | 'INCONCLUSIVE';

export interface SensorFingerprint {
  gasSensor1: number; // 0.00 to 1.00
  gasSensor2: number; // 0.00 to 1.00
  gasSensor3: number; // 0.00 to 1.00
}

export interface ChannelDifferences {
  gasSensor1: number;
  gasSensor2: number;
  gasSensor3: number;
}

export interface FingerprintComparisonResult {
  similarity: number; // 0.00 to 1.00
  channelDifferences: ChannelDifferences;
}

export interface DemoProfile {
  code: string;
  displayName: string;
  scientificName: string;
  fingerprint: SensorFingerprint;
  variance?: SensorFingerprint;
  active: boolean;
  isSafeDrug?: boolean;
}

export interface ProbabilityDistribution {
  [patternName: string]: number;
}

export interface DemoResult {
  testId?: string;
  code: string;
  demoCode?: string;
  displayName: string;
  scientificName: string;
  title?: string;
  status: ResultStatus;
  confidence: number;
  visualConfidence?: number;
  fingerprintSimilarity: number;
  referenceFingerprint: SensorFingerprint;
  capturedFingerprint: SensorFingerprint;
  channelDifferences: ChannelDifferences;
  drugSafetyClassification?: string;
  chemicalScore?: number;
  visualScore?: number;
  combinedScore?: number;
  probabilities?: ProbabilityDistribution;
  summary?: string;
  explanation?: string;
  modelVersion: string;
  mode: 'DEMO' | 'LIVE';
}

export interface VisualAnalysisMetrics {
  faceDetected: boolean;
  faceQuality: number;
  eyeQuality: number;
  gazeStability: number;
  blinkCount: number;
  visualScore?: number;
}

export interface TestRecord {
  testId: string;
  timestamp: string; // ISO or formatted
  status: ResultStatus;
  confidence: number;
  fingerprintSimilarity: number;
  code: string;
  displayName: string;
  scientificName: string;
  title?: string;
  referenceFingerprint: SensorFingerprint;
  capturedFingerprint: SensorFingerprint;
  channelDifferences: ChannelDifferences;
  drugSafetyClassification?: string;
  chemicalScore?: number;
  visualScore?: number;
  combinedScore?: number;
  summary?: string;
  mode: 'DEMO' | 'LIVE';
}

export interface HardwareFeedback {
  ledActive: boolean;
  buzzerTriggered: boolean;
  sensorActive: boolean;
}

export interface DeviceStatus {
  raspberryPiConnected: boolean;
  phoneConnected: boolean;
  cameraReady: boolean;
  analysisEngineReady: boolean;
  hardwareFeedback: HardwareFeedback;
}

export interface AnalysisInput {
  testId: string;
  code?: string;
  visualMetrics?: VisualAnalysisMetrics;
  chemicalSignature?: number[];
}

export interface AnalysisResult extends DemoResult {
  completedAt: number;
}

export interface AnalysisProvider {
  analyze(testId: string, input: AnalysisInput): Promise<AnalysisResult>;
}
