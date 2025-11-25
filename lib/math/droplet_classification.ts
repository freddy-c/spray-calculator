import { DropletClass, TeeJetNozzle } from "../types/nozzle";

export function getDropletClassForPressure(
  nozzle: TeeJetNozzle,
  pressureBar: number
): DropletClass | undefined {
  const { dropletBands } = nozzle;

  for (let i = 0; i < dropletBands.length; i++) {
    const band = dropletBands[i];
    const isLast = i === dropletBands.length - 1;

    const lowerOk = pressureBar >= band.fromBar;
    const upperOk = isLast ? pressureBar <= band.toBar : pressureBar < band.toBar;

    if (lowerOk && upperOk) {
      return band.dropletClass;
    }
  }

  return undefined;
}