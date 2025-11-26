import styles from '../styles/home.module.css'

import { useMemo } from "react"
import { useForm, Controller } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { NOZZLE_PRESETS } from "../lib/data/nozzlePresets"
import {
  buildSprayScenario,
  DEFAULT_ABSOLUTE_BOUNDS,
  DEFAULT_SPRAYER,
} from "../lib/services/sprayScenario"

function SprayResults() {
  const defaultNozzleId = NOZZLE_PRESETS[0]?.id ?? "";

  const formSchema = useMemo(() => z.object({
    nozzleId: z.string().min(1, "Select a nozzle"),
    sprayVolumeLHa: z.coerce.number()
      .positive("Spray volume must be greater than 0"),
    nozzleSpacingM: z.coerce.number()
      .positive("Nozzle spacing must be greater than 0")
      .lt(10, "Nozzle spacing must be less than 10m"),
    tankSizeL: z.coerce.number()
      .positive("Tank size must be greater than 0"),
    speedKmH: z.coerce.number()
      .gte(DEFAULT_ABSOLUTE_BOUNDS.vMin, `Min ${DEFAULT_ABSOLUTE_BOUNDS.vMin} km/h`)
      .lte(DEFAULT_ABSOLUTE_BOUNDS.vMax, `Max ${DEFAULT_ABSOLUTE_BOUNDS.vMax} km/h`),
  }), []);

  const { control, watch, formState: { errors, isValid } } = useForm({
    defaultValues: {
      nozzleId: defaultNozzleId,
      sprayVolumeLHa: 300,
      nozzleSpacingM: DEFAULT_SPRAYER.nozzleSpacingM,
      tankSizeL: DEFAULT_SPRAYER.tankSizeL,
      speedKmH: 5,
    },
    resolver: zodResolver(formSchema),
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const formValues = watch();

  const scenario = useMemo(() => {
    // Only build when the form is valid
    if (!isValid) return undefined;

    const {
      nozzleId,
      sprayVolumeLHa,
      nozzleSpacingM,
      tankSizeL,
      speedKmH,
    } = formValues;

    return buildSprayScenario({
      nozzleId,
      sprayVolumeLHa,
      speedKmH,
      sprayer: {
        nozzleSpacingM,
        tankSizeL,
      },
      absolute: DEFAULT_ABSOLUTE_BOUNDS,
    });
  }, [
    isValid,
    formValues.nozzleId,
    formValues.sprayVolumeLHa,
    formValues.nozzleSpacingM,
    formValues.tankSizeL,
    formValues.speedKmH,
  ]);

  const isSyngenta = scenario?.nozzle.brand === "syngenta";
  const isTeeJet = scenario?.nozzle.brand === "teejet";

  const statusFor = (solution) => {
    if (!solution) {
      return { emoji: "❌", text: "Outside allowed pressure bounds" };
    }

    if (isSyngenta) {
      if (solution.inOptimum) {
        return { emoji: "✅", text: "In Syngenta optimum window" };
      }
      if (solution.withinRecommendedPressure) {
        return { emoji: "⚠️", text: "In pressure range, outside optimum" };
      }
      return { emoji: "❌", text: "Outside recommended pressure" };
    }

    if (isTeeJet) {
      if (solution.withinRecommendedPressure) {
        return { emoji: "✅", text: "In recommended pressure range" };
      }
      return { emoji: "⚠️", text: "Outside recommended pressure" };
    }

    return solution.withinRecommendedPressure
      ? { emoji: "✅", text: "In recommended pressure range" }
      : { emoji: "⚠️", text: "Outside recommended pressure" };
  };

  return (
    <section>
      <h2>Sprayer Calculator</h2>

      <form style={{ marginBottom: 20, display: "grid", gap: 12, maxWidth: 520 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span>Nozzle</span>
          <Controller
            control={control}
            name="nozzleId"
            render={({ field }) => (
              <select {...field}>
                {NOZZLE_PRESETS.map((n) => (
                  <option key={n.id} value={n.id}>{n.name} ({n.brand})</option>
                ))}
              </select>
            )}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Spray volume (L/ha)</span>
          <Controller
            control={control}
            name="sprayVolumeLHa"
            render={({ field }) => (
              <input
                type="number"
                min="0"
                step="10"
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
              />
            )}
          />
          {errors.sprayVolumeLHa && (
            <span style={{ color: "red", fontSize: 12 }}>{errors.sprayVolumeLHa.message}</span>
          )}
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Nozzle spacing (m)</span>
          <Controller
            control={control}
            name="nozzleSpacingM"
            render={({ field }) => (
              <input
                type="number"
                min="0"
                step="0.01"
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
              />
            )}
          />
          {errors.nozzleSpacingM && (
            <span style={{ color: "red", fontSize: 12 }}>{errors.nozzleSpacingM.message}</span>
          )}
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Tank size (L)</span>
          <Controller
            control={control}
            name="tankSizeL"
            render={({ field }) => (
              <input
                type="number"
                min="0"
                step="10"
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
              />
            )}
          />
          {errors.tankSizeL && (
            <span style={{ color: "red", fontSize: 12 }}>{errors.tankSizeL.message}</span>
          )}
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Forward speed (km/h)</span>
          <Controller
            control={control}
            name="speedKmH"
            render={({ field }) => (
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <input
                  type="range"
                  min={(scenario?.absolute ?? DEFAULT_ABSOLUTE_BOUNDS).vMin}
                  max={(scenario?.absolute ?? DEFAULT_ABSOLUTE_BOUNDS).vMax}
                  step="0.1"
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  style={{ flex: 1 }}
                />
                <input
                  type="number"
                  min={(scenario?.absolute ?? DEFAULT_ABSOLUTE_BOUNDS).vMin}
                  max={(scenario?.absolute ?? DEFAULT_ABSOLUTE_BOUNDS).vMax}
                  step="0.1"
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  style={{ width: 90 }}
                />
              </div>
            )}
          />
          {errors.speedKmH && (
            <span style={{ color: "red", fontSize: 12 }}>{errors.speedKmH.message}</span>
          )}
        </label>
      </form>

      {!scenario && (
        <p style={{ marginTop: 8 }}>Select a nozzle and enter spray volume to see results.</p>
      )}

      {scenario && (
        <>
          <p>
            <strong>Nozzle:</strong> {scenario.nozzle.name}{" "}
            <span style={{ fontSize: "0.85em", color: "#666" }}>
              ({scenario.nozzle.brand})
            </span>
          </p>
          <p>
            <strong>Spray Volume (L/ha):</strong> {scenario.sprayVolumeLHa}
          </p>

          <div style={{ padding: "12px 14px", border: "1px solid #e5e5e5", borderRadius: 8, marginBottom: 20 }}>
            {scenario.selectedSolution ? (
              <>
                <p style={{ margin: "4px 0" }}>
                  <strong>Pressure:</strong> {scenario.selectedSolution.pressureBar.toFixed(1)} bar{" "}
                  <span style={{ color: "#666" }}>
                    (recommended {scenario.nozzle.pressureMinBar}-{scenario.nozzle.pressureMaxBar} bar)
                  </span>
                </p>
                <p style={{ margin: "4px 0" }}>
                  <strong>Nozzle output:</strong> {scenario.selectedSolution.nozzleOutputLMin.toFixed(3)} L/min
                </p>
                {isSyngenta && (
                  <p style={{ margin: "4px 0" }}>
                    <strong>Syngenta optimum window:</strong>{" "}
                    {scenario.selectedSolution.inOptimum ? "Yes" : "No"}
                  </p>
                )}
                {isTeeJet && (
                  <p style={{ margin: "4px 0" }}>
                    <strong>Droplet class:</strong>{" "}
                    {scenario.selectedSolution.dropletClass ?? "n/a"}
                  </p>
                )}
                <p style={{ margin: "4px 0" }}>
                  <strong>Status:</strong>{" "}
                  {statusFor(scenario.selectedSolution).emoji} {statusFor(scenario.selectedSolution).text}
                </p>
              </>
            ) : (
              <p style={{ margin: 0 }}>
                Selected speed results in pressure outside allowed range ({(scenario.absolute ?? DEFAULT_ABSOLUTE_BOUNDS).pMin}-{(scenario.absolute ?? DEFAULT_ABSOLUTE_BOUNDS).pMax} bar).
              </p>
            )}
          </div>
        </>
      )}
    </section>
  );
}

function Home() {
  return (
    <main className={styles.main}>
      <SprayResults />
    </main>
  )
}

export default Home
