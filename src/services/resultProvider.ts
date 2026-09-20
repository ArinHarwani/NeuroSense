import scenarios from '@/config/scenarios.json';
import { ScenarioData } from '@/types/session';

/**
 * Result Provider Interface.
 *
 * Current implementation: Config-driven mock based on operator PIN.
 * Future implementation: Pluggable hardware bridge to ESP32 sensor array
 * and machine learning inference API without altering UI consumers.
 */
export async function getResult(sessionId: string, pin: string): Promise<ScenarioData | null> {
  // Simulated asynchronous latency representing gas sensor signature processing
  await new Promise((resolve) => setTimeout(resolve, 120));

  const scenarioMap = scenarios as Record<string, ScenarioData>;
  const matched = scenarioMap[pin];

  if (!matched) {
    return null;
  }

  // Return a cloned copy so the consumer cannot mutate config
  return JSON.parse(JSON.stringify(matched)) as ScenarioData;
}
