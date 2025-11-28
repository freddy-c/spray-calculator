import { nozzleCatalog } from "@/lib/data/nozzle-catalog";
import type { FormValues, PressureStatus, SprayMetrics } from "./types";

export function calculateSprayMetrics(values: FormValues): SprayMetrics {
  const sprayVolume = values.sprayVolumeLHa;
  const nozzleSpacing = values.nozzleSpacingM;
  const speedKmH = values.speedKmH;

  const nozzle = nozzleCatalog[values.nozzleId];

  // nozzle related calculations
  const flowPerNozzleLMin = (sprayVolume * speedKmH * nozzleSpacing) / 600;
  const requiredPressureBar = Math.pow(sprayVolume * speedKmH * nozzleSpacing / (600 * nozzle.kFactor), 2);

  const pressureStatus: PressureStatus =
    requiredPressureBar < nozzle.minPressureBar
      ? "low"
      : requiredPressureBar > nozzle.maxPressureBar
        ? "high"
        : "ok";

  // area / tank-related
  const totalAreaHa = values.areas.reduce(
    (sum, area) => sum + (Number.isFinite(area.sizeHa) ? area.sizeHa : 0),
    0
  );

  const totalSprayVolumeL = totalAreaHa * sprayVolume;

  const tanksRequired =
    totalSprayVolumeL > 0 && values.tankSizeL > 0
      ? Math.ceil(totalSprayVolumeL / values.tankSizeL)
      : 0;

  return {
    flowPerNozzleLMin,
    requiredPressureBar,
    speedKmH,
    pressureStatus,
    totalAreaHa,
    totalSprayVolumeL,
    tanksRequired,
  };
}
