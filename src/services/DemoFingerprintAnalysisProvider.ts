import demoProfilesData from '@/config/demo-profiles.json';
import {
  DemoProfile,
  SensorFingerprint,
  DemoResult,
  AnalysisProvider,
  AnalysisInput,
  AnalysisResult,
  ResultStatus,
} from '@/types/narcosense';
import { FingerprintComparisonService } from './FingerprintComparisonService';

export class DemoFingerprintAnalysisProvider implements AnalysisProvider {
  private profiles: DemoProfile[];

  constructor() {
    this.profiles = (demoProfilesData as { profiles: DemoProfile[] }).profiles;
  }

  /**
   * Updates or sets the current list of profiles (e.g. when modified in settings).
   */
  public setProfiles(profiles: DemoProfile[]) {
    this.profiles = profiles;
  }

  /**
   * Retrieves a profile by its 4-digit code.
   */
  public getProfileByCode(code: string): DemoProfile | null {
    const trimmed = code.trim();
    return this.profiles.find((p) => p.code === trimmed && p.active) || null;
  }

  /**
   * Generates a simulated captured fingerprint close to the reference fingerprint.
   * PRD §8: Controlled variation, values remaining between 0.00 and 1.00.
   */
  public generateCapturedFingerprint(
    reference: SensorFingerprint,
    variance?: SensorFingerprint,
    isInconclusive: boolean = false
  ): SensorFingerprint {
    // Variation range: use provided variance or fallback to ±0.02 to ±0.05
    const defaultMaxDelta = isInconclusive ? 0.08 : 0.045;

    const vary = (val: number, maxDelta: number): number => {
      // Random delta between -maxDelta and +maxDelta
      const delta = (Math.random() * (maxDelta * 2) - maxDelta);
      const res = Math.round((val + delta) * 100) / 100;
      return Math.max(0.01, Math.min(0.99, res));
    };

    return {
      gasSensor1: vary(reference.gasSensor1, variance?.gasSensor1 ?? defaultMaxDelta),
      gasSensor2: vary(reference.gasSensor2, variance?.gasSensor2 ?? defaultMaxDelta),
      gasSensor3: vary(reference.gasSensor3, variance?.gasSensor3 ?? defaultMaxDelta),
    };
  }

  /**
   * Calculates confidence strictly clamped to 60%–80% (PRD §10)
   * while ensuring consistency with fingerprint similarity (PRD §11).
   */
  public calculateDemoConfidence(similarity: number): number {
    // Linear mapping from similarity [0.50, 0.95] to confidence [0.60, 0.80]
    const normalized = (similarity - 0.50) / (0.95 - 0.50);
    const baseConfidence = 0.60 + normalized * 0.20;

    // Add very slight jitter (±0.01) for realistic dynamic variation
    const jitter = (Math.random() * 0.02 - 0.01);
    const finalConf = Math.round((baseConfidence + jitter) * 100) / 100;

    // Strict clamp between 60% and 80% (0.60 to 0.80)
    return Math.max(0.60, Math.min(0.80, finalConf));
  }

  /**
   * Implements the AnalysisProvider interface (PRD §20).
   */
  public async analyze(testId: string, input: AnalysisInput): Promise<AnalysisResult> {
    const code = input.code || '0001';
    let profile = this.getProfileByCode(code);

    if (!profile) {
      // Fallback to a safe drug profile (Paracetamol) if the passcode is unknown to prevent demo crashes
      profile = this.profiles[0];
      if (!profile) {
        throw new Error(`No active reference profile found for code: ${code}`);
      }
    }

    const isInconclusive = profile.code === '9000';
    const isNormal = profile.code === '9999';

    // 1. Generate simulated captured fingerprint
    const capturedFingerprint = this.generateCapturedFingerprint(
      profile.fingerprint,
      profile.variance,
      isInconclusive
    );

    // 2. Perform fingerprint comparison
    const comparison = FingerprintComparisonService.compare(
      profile.fingerprint,
      capturedFingerprint
    );

    // 3. Compute scores
    const visualScore = input.visualMetrics?.visualScore ?? Math.round(70 + Math.random() * 20);
    // Use fingerprint similarity for chemical score
    const chemicalScore = Math.round(comparison.similarity * 100);
    
    // Combine 70% chemical, 30% visual for final confidence
    const combinedScore = Math.round(chemicalScore * 0.7 + visualScore * 0.3);
    const confidence = combinedScore / 100;

    // 4. Determine status & safety classification
    let status: ResultStatus = 'POSITIVE';
    let drugSafetyClassification = 'SAFE DRUG';

    if (isNormal) {
      status = 'NEGATIVE';
      drugSafetyClassification = 'BASELINE / NORMAL';
    } else if (isInconclusive) {
      status = 'INCONCLUSIVE';
      drugSafetyClassification = 'INCONCLUSIVE';
    }

    const demoResult: AnalysisResult = {
      testId,
      code: profile.code,
      demoCode: profile.code,
      displayName: profile.displayName,
      scientificName: profile.scientificName,
      title: profile.displayName,
      status,
      confidence,
      fingerprintSimilarity: comparison.similarity,
      referenceFingerprint: profile.fingerprint,
      capturedFingerprint,
      channelDifferences: comparison.channelDifferences,
      drugSafetyClassification,
      chemicalScore,
      visualScore,
      combinedScore,
      summary: isNormal
        ? 'NORMAL / NO TARGET REFERENCE MATCH'
        : isInconclusive
        ? 'INCONCLUSIVE / NO DISTINCTIVE REFERENCE MATCH'
        : `REFERENCE PROFILE MATCHED: ${profile.displayName.toUpperCase()} (SAFE DRUG)`,
      explanation: isNormal
        ? 'Captured sensor fingerprint aligns with baseline environmental air profile.'
        : isInconclusive
        ? 'Captured sensor fingerprint exhibits diffuse response pattern without conclusive reference match.'
        : `Captured multi-channel fingerprint correlates closely with reference profile for ${profile.displayName} (${profile.scientificName}). Identified as an authorized OTC / non-illicit safe therapeutic substance.`,
      modelVersion: 'NARCOSENSE-FP-1.0',
      mode: 'DEMO',
      completedAt: Date.now(),
    };

    return demoResult;
  }

  public getAllProfiles(): DemoProfile[] {
    return this.profiles;
  }
}

export const demoFingerprintAnalysisProvider = new DemoFingerprintAnalysisProvider();
