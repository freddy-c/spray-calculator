
/**
 * Required pressure to hit the target volume at speed v (km/h)
 * using K-factor.
 * V = (600 K sqrt(P)) / (v w)
 */
export function pressureForSpeed(
    vKmH: number,
    targetRateLHa: number,
    nozzleSpacingM: number,
    nozzleKFactor: number,
): number {
    const numerator = targetRateLHa * vKmH * nozzleSpacingM;
    const denominator = 600 * nozzleKFactor;

    const sqrtP = numerator / denominator;
    const p = sqrtP * sqrtP;

    return p;
}