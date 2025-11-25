import { getDropletClassForPressure } from "../math/droplet_classification";
import { pressureForSpeed } from "../math/pressure";
import { Sprayer } from "../types/sprayer";
import { DropletClass, Nozzle, SyngentaNozzle, TeeJetNozzle } from "../types/nozzle";

export interface AbsoluteBounds {
    vMin: number;
    vMax: number;
    pMin: number;
    pMax: number;
}

export interface SpraySolution {
    speedKmH: number;
    pressureBar: number;
    nozzleOutputLMin: number;
    inOptimum: boolean;
    withinRecommendedPressure: boolean;
    dropletClass?: DropletClass;
}

export function computeSolutions(
    targetRateLHa: number,
    nozzle: Nozzle,
    sprayer: Sprayer,
    absolute: AbsoluteBounds,
): SpraySolution[] {
    const searchVMin = absolute.vMin
    const searchVMax = absolute.vMax

    const candidates: SpraySolution[] = [];

    // Brand-specific parameters
    const hasSyngentaOptimum = nozzle.brand === "syngenta";
    const vOptMin = hasSyngentaOptimum
        ? (nozzle as SyngentaNozzle).optSpeedMinKmH
        : absolute.vMin; // fallback if needed
    const vOptMax = hasSyngentaOptimum
        ? (nozzle as SyngentaNozzle).optSpeedMaxKmH
        : absolute.vMax;
    const pOptMin = hasSyngentaOptimum
        ? (nozzle as SyngentaNozzle).optPressureMinBar
        : nozzle.pressureMinBar;
    const pOptMax = hasSyngentaOptimum
        ? (nozzle as SyngentaNozzle).optPressureMaxBar
        : nozzle.pressureMaxBar;

    for (let v = searchVMin; v <= searchVMax; v++) {
        const pRaw = pressureForSpeed(
            v, targetRateLHa,
            sprayer.nozzleSpacingM,
            nozzle.kFactor,
        )
        const p = Math.round(pRaw * 10) / 10;
        
        // discard if pressure is outside absolute bounds
        if (p < absolute.pMin || p > absolute.pMax) continue;

        // nozzle output at this (rounded) pressure: Q = K * sqrt(P)
        const qRaw = nozzle.kFactor * Math.sqrt(pRaw);
        const q = Math.round(qRaw * 1000) / 1000; // L/min, 2 dp

            const withinRecommendedPressure = p >= nozzle.pressureMinBar && p <= nozzle.pressureMaxBar;


        const inOptimum =
            hasSyngentaOptimum &&
            v >= vOptMin &&
            v <= vOptMax &&
            p >= pOptMin &&
            p <= pOptMax;

        let dropletClass: DropletClass | undefined;
        if (nozzle.brand === "teejet") {
            dropletClass = getDropletClassForPressure(
            nozzle as TeeJetNozzle,
            p
            );
        }

        candidates.push({
            speedKmH: v,
            pressureBar: p,
            nozzleOutputLMin: q,
            inOptimum: inOptimum,
            withinRecommendedPressure: withinRecommendedPressure,
            dropletClass: dropletClass,
        });
    }

    return candidates
}