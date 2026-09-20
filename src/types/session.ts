export type SessionStatus =
  | 'IDLE'
  | 'INPUT_CONFIRMED'
  | 'IMAGE_CAPTURED'
  | 'UNLOCKED'
  | 'COMPLETE';

export type LegalityType = 'LEGAL' | 'ILLEGAL' | 'REGULATED';

export interface GasProfile {
  mq135: number;
  mq3: number;
  mq138: number;
  bme680_voc: number;
  temperature_c: number;
  humidity_pct: number;
}

export interface ScenarioData {
  inspector_name: string;
  substance: string;
  category: string;
  legality: LegalityType;
  confidence_min: number;
  confidence_max: number;
  gas_profile: GasProfile;
}

export interface TestSession {
  sessionId: string;
  status: SessionStatus;
  createdAt: number;
  imageBlobUrl?: string;
  pinEntered?: string;
  result?: ScenarioData;
  wrongPinAttempts: number;
  lockoutUntil?: number;
}
