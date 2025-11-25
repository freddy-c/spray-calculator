import styles from '../styles/home.module.css'

import { useMemo } from "react"
import { calculateSpray } from '../lib/sprayCalc'

function SprayResults() {
  const { nozzle, solutions, sprayVolumeLHa } = useMemo(() => calculateSpray(), []);

  const isSyngenta = nozzle.brand === "syngenta";
  const isTeeJet = nozzle.brand === "teejet";

  return (
    <section>
      <h2>Sprayer calculation results</h2>
      <p>
        <strong>Nozzle:</strong> {nozzle.name}{" "}
        <span style={{ fontSize: "0.85em", color: "#666" }}>
          ({nozzle.brand})
        </span>
      </p>
      <p>
        <strong>Spray Volume (L/ha):</strong> {sprayVolumeLHa}
      </p>
      <table>
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
            let statusText = "";
            let statusEmoji = "";

            if (isSyngenta) {
              if (s.inOptimum) {
                statusEmoji = "✅";
                statusText = "In Syngenta optimum window";
              } else if (s.withinRecommendedPressure) {
                statusEmoji = "⚠️";
                statusText = "In pressure range, outside optimum";
              } else {
                statusEmoji = "❌";
                statusText = "Outside recommended pressure";
              }
            } else if (isTeeJet) {
              if (s.withinRecommendedPressure) {
                statusEmoji = "✅";
                statusText = "In recommended pressure range";
              } else {
                statusEmoji = "⚠️";
                statusText = "Outside recommended pressure";
              }
            } else {
              // generic nozzle fallback
              statusEmoji = s.withinRecommendedPressure ? "✅" : "⚠️";
              statusText = s.withinRecommendedPressure
                ? "In recommended pressure range"
                : "Outside recommended pressure";
            }

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
                  {statusEmoji} {statusText}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
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
