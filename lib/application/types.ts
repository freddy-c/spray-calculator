export const areaTypeOptions = [
  { value: "green", label: "Green" },
  { value: "tee", label: "Tee" },
  { value: "fairway", label: "Fairway" },
  { value: "rough", label: "Rough" },
  { value: "other", label: "Other" },
] as const;

export type AreaType = (typeof areaTypeOptions)[number]["value"];

export type Area = {
  label: string;
  type: AreaType;
  sizeHa: number;
};

export type FormValues = {
  nozzleId: string;
  sprayVolumeLHa: number;
  nozzleSpacingM: number;
  tankSizeL: number;
  speedKmH: number;
  areas: Area[];
};

export type PressureStatus = "ok" | "low" | "high";

export type SprayMetrics = {
  flowPerNozzleLMin: number;
  requiredPressureBar: number;
  speedKmH: number;
  pressureStatus: PressureStatus;
  totalAreaHa: number;
  totalSprayVolumeL: number;
  tanksRequired: number;
};
