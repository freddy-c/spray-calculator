import { kFromRef, type Nozzle } from "./nozzle";

export const NOZZLE_PRESETS: Nozzle[] = [
    {
        name: "Syngenta 025 XC",
        kFactor: kFromRef(0.577, 1),
        optSpeedMinKmH: 3,
        optSpeedMaxKmH: 5,
        optPressureMinBar: 2,
        optPressureMaxBar: 3,
    },
    {
        name: "Syngenta 04 XC",
        kFactor: kFromRef(0.924, 1),
        optSpeedMinKmH: 3,
        optSpeedMaxKmH: 8,
        optPressureMinBar: 2,
        optPressureMaxBar: 3,
    },
    {
        name: "Syngenta 08 XC",
        kFactor: kFromRef(1.848, 1),
        optSpeedMinKmH: 3,
        optSpeedMaxKmH: 8,
        optPressureMinBar: 2,
        optPressureMaxBar: 3.5,
    },
]