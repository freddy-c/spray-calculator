export type NozzleBrand = "syngenta" | "teejet";

export interface BaseNozzle {
  id: string;           // e.g. "syngenta_xc_025"
  name: string;          // e.g. "Syngenta XC 025"
  brand: NozzleBrand;   // e.g. "syngenta"
  kFactor: number;       // L/min / sqrt(bar)
  pressureMinBar: number; // e.g. 1
  pressureMaxBar: number; // e.g. 5
}

export interface SyngentaNozzle extends BaseNozzle {
  brand: "syngenta";
  
  optSpeedMinKmH: number;
  optSpeedMaxKmH: number;
  optPressureMinBar: number;
  optPressureMaxBar: number;
}

export type DropletClass =
  | "XF" // extremely fine
  | "VF"  // very fine
  | "F" // fine
  | "M" // medium
  | "C" // coarse
  | "VC" // very coarse
  | "XC" // extremely coarse
  | "UC"; // ultra coarse

export interface DropletBand {
  fromBar: number;
  toBar: number;
  dropletClass: DropletClass;
}

export interface TeeJetNozzle extends BaseNozzle {
  brand: "teejet";

  dropletBands: DropletBand[];
}

export type Nozzle = SyngentaNozzle | TeeJetNozzle;

export function kFromRef(qRefLMin: number, pRefBar: number): number {
  return qRefLMin / Math.sqrt(pRefBar);
}
