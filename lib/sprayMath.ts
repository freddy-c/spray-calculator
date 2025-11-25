import type { Nozzle } from "./nozzle";
import type { Sprayer } from "./sprayer";

export interface TradeoffInputs {
  targetRateLHa: number;  // V_target
  nozzle: Nozzle;
  sprayer: Sprayer;
}

export interface AbsoluteBounds {
    vMin: number;
    vMax: number;
    pMin: number;
    pMax: number;
}

export interface IntegerSpeedSolution {
    speedKmH: number;
    pressureBar: number;
    nozzleOutputLMin: number;
    inOptimum: boolean;
    cost: number;
}

/**
 * Required pressure to hit the target volume at speed v (km/h)
 * using K-factor.
 * V = (600 K sqrt(P)) / (v w)
 */
export function pressureForSpeed(
  vKmH: number,
  inputs: TradeoffInputs
): number {
  const { targetRateLHa, nozzle, sprayer } = inputs;
  const { kFactor } = nozzle;
  const { nozzleSpacingM } = sprayer;

  const numerator = targetRateLHa * vKmH * nozzleSpacingM;
  const denominator = 600 * kFactor;

  const sqrtP = numerator / denominator;
  const p = sqrtP * sqrtP;

  return p;
}


export function computeIntegerSpeedSolutions(
    inputs: TradeoffInputs,
    absolute: AbsoluteBounds,
): IntegerSpeedSolution[] {
    const { nozzle, sprayer, targetRateLHa } = inputs;
    const {
        optSpeedMinKmH: vOptMin,
        optSpeedMaxKmH: vOptMax,
        optPressureMinBar: pOptMin,
        optPressureMaxBar: pOptMax,
    } = nozzle;

    const searchVMin = absolute.vMin
    const searchVMax = absolute.vMax

    const candidates: IntegerSpeedSolution[] = [];

    for (let v = searchVMin; v <= searchVMax; v++) {
        const pRaw = pressureForSpeed(v, inputs)
        const p = Math.round(pRaw * 10) / 10;
        
        // discard if pressure is outside absolute bounds
        if (p < absolute.pMin || p > absolute.pMax) continue;

        // nozzle output at this (rounded) pressure: Q = K * sqrt(P)
        const qRaw = nozzle.kFactor * Math.sqrt(pRaw);
        const q = Math.round(qRaw * 1000) / 1000; // L/min, 2 dp

        const inOpt =
            v >= vOptMin &&
            v <= vOptMax &&
            p >= pOptMin &&
            p <= pOptMax;

        const speedPenalty = v < vOptMin ? vOptMin - v : v > vOptMax ? v - vOptMax : 0;
        const pressurePenalty = p < pOptMin ? pOptMin - p : p > pOptMax ? p - pOptMax : 0;

        const speedSpan = Math.max(vOptMax - vOptMin, 1);
        const pressureSpan = Math.max(pOptMax - pOptMin, 1);

        const speedPenaltyNorm = speedPenalty / speedSpan;
        const pressurePenaltyNorm = pressurePenalty / pressureSpan;

        const cost = speedPenaltyNorm + pressurePenaltyNorm

        candidates.push({
            speedKmH: v,
            pressureBar: p,
            nozzleOutputLMin: q,
            inOptimum: inOpt,
            cost,
        });
    }

    return candidates
}