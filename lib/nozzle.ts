export interface Nozzle {
  name: string;          // e.g. "Syngenta XC 025"
  kFactor: number;       // L/min / sqrt(bar)

  // Recommended / “optimum” operating ranges
  optSpeedMinKmH: number;  // e.g. 3
  optSpeedMaxKmH: number;  // e.g. 5
  optPressureMinBar: number; // e.g. 2
  optPressureMaxBar: number; // e.g. 3
}

export function kFromRef(qRefLMin: number, pRefBar: number): number {
  return qRefLMin / Math.sqrt(pRefBar);
}
