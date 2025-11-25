// Convenience helper kept for quick manual testing.
import { buildSprayScenario, DEFAULT_ABSOLUTE_BOUNDS, DEFAULT_SPRAYER } from "./services/sprayScenario";

export function calculateSpray() {
  return buildSprayScenario({
    nozzleId: "teejet-aixr11004",
    sprayVolumeLHa: 300,
    speedKmH: 5,
    sprayer: DEFAULT_SPRAYER,
    absolute: DEFAULT_ABSOLUTE_BOUNDS,
  });
}
