// lib/sprayCalc.ts
import { kFromRef } from "./types/nozzle"
import { NOZZLE_PRESETS } from "./data/nozzlePresets"
import { Sprayer } from "./types/sprayer"
import { AbsoluteBounds, computeSolutions } from "./solver/sprayTradeoffs"

export function calculateSpray() {
  const nozzle = NOZZLE_PRESETS.find(p => p.id === "teejet-aixr11004");
  if (!nozzle) throw new Error("Preset not found");

  const sprayVolumeLHa = 300; // L/ha

  const sprayer: Sprayer = {
    nozzleSpacingM: 0.5, // 50 cm spacing
    tankSizeL: 400,
  }

  const absolute: AbsoluteBounds = {
    vMin: 3,
    vMax: 8, // we only consider integer speeds 3..8 km/h
    pMin: 1,
    pMax: 4,
  }

  const solutions = computeSolutions(sprayVolumeLHa, nozzle, sprayer, absolute);

  return { nozzle, solutions, sprayVolumeLHa }
}
