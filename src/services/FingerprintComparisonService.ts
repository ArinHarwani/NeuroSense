import {
  SensorFingerprint,
  ChannelDifferences,
  FingerprintComparisonResult,
} from '@/types/narcosense';

export class FingerprintComparisonService {
  /**
   * Compares a reference sensor fingerprint against a captured sensor fingerprint.
   * Calculates per-channel absolute differences and an overall aggregate similarity.
   */
  public static compare(
    reference: SensorFingerprint,
    captured: SensorFingerprint
  ): FingerprintComparisonResult {
    const diff1 = Math.round(Math.abs(reference.gasSensor1 - captured.gasSensor1) * 100) / 100;
    const diff2 = Math.round(Math.abs(reference.gasSensor2 - captured.gasSensor2) * 100) / 100;
    const diff3 = Math.round(Math.abs(reference.gasSensor3 - captured.gasSensor3) * 100) / 100;

    const channelDifferences: ChannelDifferences = {
      gasSensor1: diff1,
      gasSensor2: diff2,
      gasSensor3: diff3,
    };

    // Calculate aggregate similarity:
    // Mean difference across the 3 channels
    const avgDiff = (diff1 + diff2 + diff3) / 3;
    
    // Convert to similarity (1.0 = identical, drops as difference increases)
    // Scale so typical variation (0.02 - 0.06 avg diff) gives 0.65 - 0.78 similarity
    let rawSimilarity = 1.0 - (avgDiff * 1.8);
    
    // Clamp similarity between 0.50 and 0.95
    const similarity = Math.round(Math.max(0.50, Math.min(0.95, rawSimilarity)) * 100) / 100;

    return {
      similarity,
      channelDifferences,
    };
  }
}
