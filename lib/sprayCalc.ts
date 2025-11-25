// lib/sprayCalc.ts
import { kFromRef, Nozzle } from "./nozzle"
import { NOZZLE_PRESETS } from "./nozzleTypes"
import { Sprayer } from "./sprayer"
import { AbsoluteBounds, computeIntegerSpeedSolutions, TradeoffInputs } from "./sprayMath"

export function calculateSpray() {
  const qRef = 0.924
  const pRef = 1
  const K = kFromRef(qRef, pRef)

  const nozzle = NOZZLE_PRESETS.find(p => p.name === "Syngenta 025 XC");
  if (!nozzle) throw new Error("Preset not found");

  const sprayer: Sprayer = {
    nozzleSpacingM: 0.5, // 50 cm spacing
    tankSizeL: 400,
  }

  const inputs: TradeoffInputs = {
    targetRateLHa: 250, // want 300 L/ha water volume
    nozzle,
    sprayer,
  }

  const absolute: AbsoluteBounds = {
    vMin: 3,
    vMax: 8, // we only consider integer speeds 3..8 km/h
    pMin: 1,
    pMax: 4,
  }

  const solutions = computeIntegerSpeedSolutions(inputs, absolute)

  return { K, solutions, nozzle, sprayer, inputs, absolute }
}
