import { kFromRef, Nozzle } from "../types/nozzle";

export const NOZZLE_PRESETS: Nozzle[] = [
    {
        brand: "syngenta",
        id: "syngenta-025-xc",
        pressureMinBar: 1,
        pressureMaxBar: 4,
        name: "Syngenta 025 XC",
        kFactor: kFromRef(0.577, 1),
        optSpeedMinKmH: 3,
        optSpeedMaxKmH: 5,
        optPressureMinBar: 2,
        optPressureMaxBar: 3,
    },
    {
        brand: "syngenta",
        id: "syngenta-04-xc",
        pressureMinBar: 1,
        pressureMaxBar: 4,
        name: "Syngenta 04 XC",
        kFactor: kFromRef(0.924, 1),
        optSpeedMinKmH: 3,
        optSpeedMaxKmH: 8,
        optPressureMinBar: 2,
        optPressureMaxBar: 3,
    },
    {
        brand: "syngenta",
        id: "syngenta-08-xc",
        pressureMinBar: 1,
        pressureMaxBar: 4,
        name: "Syngenta 08 XC",
        kFactor: kFromRef(1.848, 1),
        optSpeedMinKmH: 3,
        optSpeedMaxKmH: 8,
        optPressureMinBar: 2,
        optPressureMaxBar: 3.5,
    },
    {
        brand: "teejet",
        id: "teejet-aixr11004",
        pressureMinBar: 1,
        pressureMaxBar: 6,
        name: "TeeJet AIXR11004",
        kFactor: kFromRef(0.91, 1),
        dropletBands: [
            { dropletClass: "XC", fromBar: 1, toBar: 2 },
            { dropletClass: "VC", fromBar: 2, toBar: 3 },
            { dropletClass: "C", fromBar: 3, toBar: 4 },
            { dropletClass: "C", fromBar: 4, toBar: 5 },
            { dropletClass: "M", fromBar: 5, toBar: 6 },
        ]
    },
    {
        brand: "teejet",
        id: "teejet-xrc11004",
        pressureMinBar: 1,
        pressureMaxBar: 4,
        name: "TeeJet XRC11004",
        kFactor: kFromRef(0.91, 1),
        dropletBands: [
            { dropletClass: "M", fromBar: 1, toBar: 1.5 },
            { dropletClass: "M", fromBar: 1.5, toBar: 2 },
            { dropletClass: "M", fromBar: 2, toBar: 3 },
            { dropletClass: "M", fromBar: 3, toBar: 4 },
        ]
    }
]