import { useCallback, useEffect, useState } from 'react'
import Button from '../components/Button'
import ClickCount from '../components/ClickCount'
import styles from '../styles/home.module.css'

import { useMemo } from "react"
import { calculateSpray } from '../lib/sprayCalc'

function SprayResults() {
  const { K, solutions } = useMemo(() => calculateSpray(), [])

  return (
    <section>
      <h2>Sprayer calculation results</h2>
      <p><strong>K-factor:</strong> {K.toFixed(4)}</p>

      <table>
        <thead>
          <tr>
            <th>Speed (km/h)</th>
            <th>Pressure (bar)</th>
            <th>Nozzle Output (L/min)</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {solutions.map((s) => (
            <tr key={s.speedKmH}>
              <td>{s.speedKmH}</td>
              <td>{s.pressureBar.toFixed(1)}</td>
              <td>{s.nozzleOutputLMin.toFixed(3)}</td>
              <td>{s.inOptimum ? "✅ in optimum" : "⚠️ outside optimum"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

function throwError() {
  console.log(
    // The function body() is not defined
    document.body()
  )
}

function Home() {
  const [count, setCount] = useState(0)
  const increment = useCallback(() => {
    setCount((v) => v + 1)
  }, [setCount])

  useEffect(() => {
    const r = setInterval(() => {
      increment()
    }, 1000)

    return () => {
      clearInterval(r)
    }
  }, [increment])

  return (
    <main className={styles.main}>
      <h1>Fast Refresh Demo</h1>
      <p>
        Fast Refresh is a Next.js feature that gives you instantaneous feedback
        on edits made to your React components, without ever losing component
        state.
      </p>
      <hr className={styles.hr} />
      <div>
        <p>
          Auto incrementing value. The counter won't reset after edits or if
          there are errors.
        </p>
        <p>Current value: {count}</p>
      </div>
      <hr className={styles.hr} />
      <div>
        <p>Component with state.</p>
        <ClickCount />
      </div>
      <hr className={styles.hr} />
      <div>
        <p>
          The button below will throw 2 errors. You'll see the error overlay to
          let you know about the errors but it won't break the page or reset
          your state.
        </p>
        <Button
          onClick={(e) => {
            setTimeout(() => document.parentNode(), 0)
            throwError()
          }}
        >
          Throw an Error
        </Button>
      </div>
      <hr className={styles.hr} />
      <SprayResults />
    </main>
  )
}

export default Home
