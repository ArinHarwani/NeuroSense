import {
  DemoResult,
  AnalysisProvider,
  AnalysisInput,
  AnalysisResult,
} from '@/types/narcosense';
import { demoFingerprintAnalysisProvider } from './DemoFingerprintAnalysisProvider';

export class DemoResultService implements AnalysisProvider {
  /**
   * Retrieves a demonstration result by its 4-digit code using the DemoFingerprintAnalysisProvider.
   * Returns null if the code is invalid or unknown.
   */
  public async getResultByCode(code: string): Promise<DemoResult | null> {
    try {
      const res = await demoFingerprintAnalysisProvider.analyze('MOCK-TEST', { testId: 'MOCK-TEST', code });
      return res;
    } catch {
      return null;
    }
  }

  /**
   * Computes the combined multimodal score given chemical and visual scores.
   * Formula: chemicalScore * 0.70 + visualScore * 0.30
   */
  public calculateCombinedScore(chemicalScore: number, visualScore: number): number {
    const chemicalWeight = 0.7;
    const visualWeight = 0.3;
    return Math.round(chemicalScore * chemicalWeight + visualScore * visualWeight);
  }

  /**
   * Implements the AnalysisProvider interface for future modular replacement
   * by an MLAnalysisProvider.
   */
  public async analyze(testId: string, input: AnalysisInput): Promise<AnalysisResult> {
    return demoFingerprintAnalysisProvider.analyze(testId, input);
  }

  /**
   * Returns all configured demo codes and their basic metadata.
   */
  public getAllDemoResults(): DemoResult[] {
    const profiles = demoFingerprintAnalysisProvider.getAllProfiles();
    return profiles.map((p) => ({
      code: p.code,
      demoCode: p.code,
      displayName: p.displayName,
      scientificName: p.scientificName,
      title: p.displayName,
      status: p.code === '9999' ? 'NEGATIVE' : p.code === '9000' ? 'INCONCLUSIVE' : 'POSITIVE',
      confidence: 0.75,
      fingerprintSimilarity: 0.76,
      referenceFingerprint: p.fingerprint,
      capturedFingerprint: p.fingerprint,
      channelDifferences: { gasSensor1: 0.02, gasSensor2: 0.02, gasSensor3: 0.02 },
      chemicalScore: 75,
      visualScore: 68,
      combinedScore: 73,
      modelVersion: 'DEMO-FINGERPRINT-1.0',
      mode: 'DEMO',
    }));
  }
}

export const demoResultService = new DemoResultService();
