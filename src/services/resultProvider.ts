import scenarios from '@/config/scenarios.json';
import { ScenarioData } from '@/types/session';

/**
 * Result Provider Interface.
 *
 * Current implementation: Config-driven mock based on operator PIN.
 * Generates dynamic variable confidence scores within [confidence_min, confidence_max]
 * on each test run so repeated tests yield realistic variations (e.g. 70%, 78%, 80%).
 *
 * Future implementation: Pluggable hardware bridge to ESP32 sensor array
 * and machine learning inference API without altering UI consumers.
 */
export async function getResult(sessionId: string, pin: string): Promise<ScenarioData | null> {
  // Simulated asynchronous latency representing gas sensor signature processing
  await new Promise((resolve) => setTimeout(resolve, 150));

  const scenarioMap = scenarios as Record<string, ScenarioData>;
  const matched = scenarioMap[pin];

  if (!matched) {
    return null;
  }

  // Clone scenario data
  const result = JSON.parse(JSON.stringify(matched)) as ScenarioData;

  const min = result.confidence_min;
  const max = result.confidence_max;

  // Generate dynamic variable confidence score within the scenario range
  const randomScore = Math.floor(Math.random() * (max - min + 1)) + min;
  result.confidence_score = randomScore;

  // Add subtle realistic variations to gas profile readings (±0.02)
  const jitter = (val: number, delta = 0.02) => {
    const v = val + (Math.random() * delta * 2 - delta);
    return Math.max(0.05, Math.min(0.99, Number(v.toFixed(2))));
  };

  result.gas_profile = {
    mq135: jitter(result.gas_profile.mq135),
    mq3: jitter(result.gas_profile.mq3),
    mq138: jitter(result.gas_profile.mq138),
    bme680_voc: jitter(result.gas_profile.bme680_voc),
    temperature_c: Number((result.gas_profile.temperature_c + (Math.random() * 0.8 - 0.4)).toFixed(1)),
    humidity_pct: Math.round(result.gas_profile.humidity_pct + (Math.random() * 4 - 2)),
  };

  return result;
}
