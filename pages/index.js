import styles from '../styles/home.module.css'

import { useMemo, useEffect } from "react"
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
    sprayVolumeLHa: z.string()
      .min(1, "Spray volume is required")
      .refine(
        (val) => {
          const num = Number(val);
          return !Number.isNaN(num) && num > 0;
        },
        { message: "Enter a spray volume greater than 0" },
      ),
    speedKmH: z.preprocess(
      (val) => val === "" ? undefined : val,
      z.coerce.number()
        .min(DEFAULT_ABSOLUTE_BOUNDS.vMin, `Min ${DEFAULT_ABSOLUTE_BOUNDS.vMin} km/h`)
        .max(DEFAULT_ABSOLUTE_BOUNDS.vMax, `Max ${DEFAULT_ABSOLUTE_BOUNDS.vMax} km/h`),
    ),
  }), []);

  const { control, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      nozzleId: defaultNozzleId,
      sprayVolumeLHa: "300",
      speedKmH: 5,
    },
    resolver: zodResolver(formSchema),
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const formValues = watch();

  const scenario = useMemo(
    () => {
      if (errors.speedKmH || errors.sprayVolumeLHa) return undefined;
      if (!formValues.nozzleId || !formValues.sprayVolumeLHa) return undefined;
      const sprayVolume = Number(formValues.sprayVolumeLHa);
      if (Number.isNaN(sprayVolume) || sprayVolume <= 0) return undefined;
      const speedVal = typeof formValues.speedKmH === "number"
        ? formValues.speedKmH
        : Number(formValues.speedKmH);
      if (Number.isNaN(speedVal)) return undefined;

      return buildSprayScenario({
        nozzleId: formValues.nozzleId,
        sprayVolumeLHa: sprayVolume,
        speedKmH: speedVal,
        sprayer: DEFAULT_SPRAYER,
        absolute: DEFAULT_ABSOLUTE_BOUNDS,
      });
    },
    [formValues.nozzleId, formValues.sprayVolumeLHa, formValues.speedKmH, errors.speedKmH, errors.sprayVolumeLHa],
  );

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
                  value={field.value === "" ? (scenario?.absolute ?? DEFAULT_ABSOLUTE_BOUNDS).vMin : field.value}
                  onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                  style={{ flex: 1 }}
                />
                <input
                  type="number"
                  min={(scenario?.absolute ?? DEFAULT_ABSOLUTE_BOUNDS).vMin}
                  max={(scenario?.absolute ?? DEFAULT_ABSOLUTE_BOUNDS).vMax}
                  step="0.1"
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
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

          {/* <table>
            <thead>
              <tr>
                <th>Speed (km/h)</th>
                <th>Pressure (bar)</th>
                <th>Nozzle Output (L/min)</th>
                {isTeeJet && <th>Droplet class</th>}
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {scenario.solutions.map((s) => {
                const { emoji, text } = statusFor(s);

                return (
                  <tr key={s.speedKmH}>
                    <td>{s.speedKmH}</td>
                    <td>{s.pressureBar.toFixed(1)}</td>
                    <td>{s.nozzleOutputLMin.toFixed(3)}</td>
                    {isTeeJet && (
                      <td>
                        {s.dropletClass
                          ? s.dropletClass
                          : <span style={{ color: "#999" }}>n/a</span>}
                      </td>
                    )}
                    <td>
                      {emoji} {text}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table> */}
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
