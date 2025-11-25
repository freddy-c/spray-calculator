import { NOZZLE_PRESETS } from "../data/nozzlePresets";
import { computeSolutionForSpeed, computeSolutions, SpraySolution, AbsoluteBounds } from "../solver/sprayTradeoffs";
import { Sprayer } from "../types/sprayer";
import { Nozzle } from "../types/nozzle";

export const NOZZLE_PRESET_MAP: Record<string, Nozzle> = Object.fromEntries(
  NOZZLE_PRESETS.map((nozzle) => [nozzle.id, nozzle]),
);

export const DEFAULT_SPRAYER: Sprayer = {
  nozzleSpacingM: 0.5,
  tankSizeL: 400,
};

export const DEFAULT_ABSOLUTE_BOUNDS: AbsoluteBounds = {
  vMin: 1,
  vMax: 12,
  pMin: 1,
  pMax: 6,
};

export interface ScenarioInput {
  nozzleId: string;
  sprayVolumeLHa: number;
  speedKmH: number;
  sprayer?: Sprayer;
  absolute?: AbsoluteBounds;
}

export interface SprayScenario {
  nozzle: Nozzle;
  sprayer: Sprayer;
  absolute: AbsoluteBounds;
  solutions: SpraySolution[];
  sprayVolumeLHa: number;
  selectedSolution?: SpraySolution;
}

export function buildSprayScenario(input: ScenarioInput): SprayScenario | undefined {
  const nozzle = NOZZLE_PRESET_MAP[input.nozzleId];
  if (!nozzle) return undefined;

  const sprayer = input.sprayer ?? DEFAULT_SPRAYER;
  const absolute = input.absolute ?? DEFAULT_ABSOLUTE_BOUNDS;

  const solutions = computeSolutions(
    input.sprayVolumeLHa,
    nozzle,
    sprayer,
    absolute,
  );

  const selectedSolution = computeSolutionForSpeed(
    input.speedKmH,
    input.sprayVolumeLHa,
    nozzle,
    sprayer,
    absolute,
  );

  return {
    nozzle,
    sprayer,
    absolute,
    solutions,
    sprayVolumeLHa: input.sprayVolumeLHa,
    selectedSolution,
  };
}
