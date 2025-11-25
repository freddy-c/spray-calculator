import styles from '../styles/home.module.css'

import { useMemo, useState } from "react"
import { calculateSpray } from '../lib/sprayCalc'
import { computeSolutionForSpeed } from '../lib/solver/sprayTradeoffs'

function SprayResults() {
  const {
    nozzle,
    sprayer,
    absolute,
    solutions,
    sprayVolumeLHa
  } = useMemo(() => calculateSpray(), []);

  const [selectedSpeed, setSelectedSpeed] = useState(
    () => solutions[0]?.speedKmH ?? absolute.vMin
  );

  const clampSpeed = (value) => {
    if (Number.isNaN(value)) return selectedSpeed;
    return Math.min(absolute.vMax, Math.max(absolute.vMin, value));
  };

  const selectedSolution = useMemo(
    () => computeSolutionForSpeed(
      selectedSpeed,
      sprayVolumeLHa,
      nozzle,
      sprayer,
      absolute
    ),
    [selectedSpeed, sprayVolumeLHa, nozzle, sprayer, absolute]
  );

  const isSyngenta = nozzle.brand === "syngenta";
  const isTeeJet = nozzle.brand === "teejet";

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
      <p>
        <strong>Nozzle:</strong> {nozzle.name}{" "}
        <span style={{ fontSize: "0.85em", color: "#666" }}>
          ({nozzle.brand})
        </span>
      </p>
      <p>
        <strong>Spray Volume (L/ha):</strong> {sprayVolumeLHa}
      </p>

      <div style={{ margin: "16px 0" }}>
        <label htmlFor="speed-selector" style={{ display: "block", marginBottom: 6 }}>
          Forward speed (km/h)
        </label>
        <div style={{ display: "flex", gap: 12, alignItems: "center", maxWidth: 480 }}>
          <input
            id="speed-selector"
            type="range"
            min={absolute.vMin}
            max={absolute.vMax}
            step="0.1"
            value={selectedSpeed}
            onChange={(e) => setSelectedSpeed(clampSpeed(parseFloat(e.target.value)))}
            style={{ flex: 1 }}
          />
          <input
            type="number"
            min={absolute.vMin}
            max={absolute.vMax}
            step="0.1"
            value={selectedSpeed}
            onChange={(e) => setSelectedSpeed(clampSpeed(Number(e.target.value)))}
            style={{ width: 80 }}
          />
        </div>
      </div>

      <div style={{ padding: "12px 14px", border: "1px solid #e5e5e5", borderRadius: 8, marginBottom: 20 }}>
        {selectedSolution ? (
          <>
            <p style={{ margin: "4px 0" }}>
              <strong>Pressure:</strong> {selectedSolution.pressureBar.toFixed(1)} bar
              {" "}
              <span style={{ color: "#666" }}>
                (recommended {nozzle.pressureMinBar}–{nozzle.pressureMaxBar} bar)
              </span>
            </p>
            <p style={{ margin: "4px 0" }}>
              <strong>Nozzle output:</strong> {selectedSolution.nozzleOutputLMin.toFixed(3)} L/min
            </p>
            {isSyngenta && (
              <p style={{ margin: "4px 0" }}>
                <strong>Syngenta optimum window:</strong>{" "}
                {selectedSolution.inOptimum ? "Yes" : "No"}
              </p>
            )}
            {isTeeJet && (
              <p style={{ margin: "4px 0" }}>
                <strong>Droplet class:</strong>{" "}
                {selectedSolution.dropletClass ?? "n/a"}
              </p>
            )}
            <p style={{ margin: "4px 0" }}>
              <strong>Status:</strong>{" "}
              {statusFor(selectedSolution).emoji} {statusFor(selectedSolution).text}
            </p>
          </>
        ) : (
          <p style={{ margin: 0 }}>
            Selected speed results in pressure outside allowed range ({absolute.pMin}-{absolute.pMax} bar).
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
          {solutions.map((s) => {
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
