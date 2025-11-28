export type NozzleSpec = {
  id: string;
  label: string;
  brand: string;
  kFactor: number;
  minPressureBar: number;
  maxPressureBar: number;
};

export const nozzleCatalog: Record<string, NozzleSpec> = {
  "syngenta-025-xc": {
    id: "syngenta-025-xc",
    label: "Syngenta 025 XC",
    brand: "syngenta",
    kFactor: 0.577,
    minPressureBar: 1,
    maxPressureBar: 4,
  },
  "syngenta-04-xc": {
    id: "syngenta-04-xc",
    label: "Syngenta 04 XC",
    brand: "syngenta",
    kFactor: 0.924,
    minPressureBar: 1,
    maxPressureBar: 4,
  },
  "syngenta-08-xc": {
    id: "syngenta-08-xc",
    label: "Syngenta 08 XC",
    brand: "syngenta",
    kFactor: 1.848,
    minPressureBar: 1,
    maxPressureBar: 4,
  },
  "teejet-aixr11004": {
    id: "teejet-aixr11004",
    label: "TeeJet AIXR11004",
    brand: "teejet",
    kFactor: 0.91,
    minPressureBar: 1,
    maxPressureBar: 6,
  },
  "teejet-xrc11004": {
    id: "teejet-xrc11004",
    label: "TeeJet XRC11004",
    brand: "teejet",
    kFactor: 0.91,
    minPressureBar: 1,
    maxPressureBar: 6,
  },
};
