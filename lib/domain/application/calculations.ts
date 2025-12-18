import { nozzleCatalog } from "@/lib/data/nozzle-catalog";
import type { ApplicationDetail, PressureStatus, SprayMetrics } from "./types";
import type { ProductTotal } from "@/lib/domain/product/types";
import { PRODUCT_TYPE_TOTAL_UNITS } from "@/lib/domain/product/types";

export function calculateSprayMetrics(values: ApplicationDetail): SprayMetrics {
  const sprayVolume = values.sprayVolumeLHa;
  const nozzleSpacing = values.nozzleSpacingM;
  const speedKmH = values.speedKmH;
  const nozzleCount = values.nozzleCount;

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

  const tanksRequired = totalSprayVolumeL / values.tankSizeL;

  // spray time calculation (lower bound estimate)
  // sprayer width (m) = nozzle spacing (m) × nozzle count
  // area covered per hour (ha) = sprayer width (m) × speed (km/h) × 1000 (m/km) / 10000 (m²/ha)
  // simplified: area covered per hour (ha) = sprayer width (m) × speed (km/h) / 10
  const sprayerWidthM = nozzleSpacing * nozzleCount;
  const areaCoveredPerHourHa = (sprayerWidthM * speedKmH) / 10;
  const sprayTimeHours = areaCoveredPerHourHa > 0 ? totalAreaHa / areaCoveredPerHourHa : 0;
  const sprayTimeMinutes = sprayTimeHours * 60;

  // product totals
  const productTotals: ProductTotal[] = values.products.map((product) => {
    const totalAmount = totalAreaHa * product.ratePerHa;
    const unit = PRODUCT_TYPE_TOTAL_UNITS[product.productType];
    return {
      productId: product.productId,
      productName: product.productName,
      productType: product.productType,
      ratePerHa: product.ratePerHa,
      totalAmount,
      unit,
    };
  });

  return {
    flowPerNozzleLMin,
    requiredPressureBar,
    speedKmH,
    pressureStatus,
    totalAreaHa,
    totalSprayVolumeL,
    tanksRequired,
    sprayTimeMinutes,
    productTotals,
  };
}
