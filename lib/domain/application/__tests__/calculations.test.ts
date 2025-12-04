import { describe, it, expect } from 'vitest'
import { calculateSprayMetrics } from '../calculations'

describe('calculateSprayMetrics', () => {
  const baseInput = {
    name: 'Test Application',
    nozzleId: 'syngenta-025-xc',
    sprayVolumeLHa: 300,
    nozzleSpacingM: 0.5,
    nozzleCount: 11,
    tankSizeL: 400,
    speedKmH: 5,
    areas: [
      { label: 'Green 1', type: 'green' as const, sizeHa: 5 },
    ],
    products: [],
  }

  describe('flow per nozzle calculation', () => {
    it('calculates correct flow rate for Syngenta 025-XC nozzle', () => {
      const metrics = calculateSprayMetrics(baseInput)

      // Flow = (sprayVolume * speed * nozzleSpacing) / 600
      // Flow = (300 * 5 * 0.5) / 600 = 1.25 L/min
      expect(metrics.flowPerNozzleLMin).toBeCloseTo(1.25)
    })

    it('calculates correct flow rate for TeeJet AIXR11004 nozzle', () => {
      const metrics = calculateSprayMetrics({
        ...baseInput,
        nozzleId: 'teejet-aixr11004',
      })

      // Flow = (sprayVolume * speed * nozzleSpacing) / 600
      // Flow = (300 * 5 * 0.5) / 600 = 1.25 L/min
      expect(metrics.flowPerNozzleLMin).toBeCloseTo(1.25)
    })

    it('calculates correct required pressure for Syngenta 025-XC nozzle', () => {
      const metrics = calculateSprayMetrics({
        ...baseInput,
        speedKmH: 4,
        sprayVolumeLHa: 274,
      })

      // Required Pressure = (sprayVolume * speed * nozzleSpacing / (600 * kFactor))^2
      // kFactor for Syngenta 025-XC = 0.65
      // Required Pressure = (274 * 4 * 0.5 / (600 * 0.65))^2 = ~2.5 bar
      expect(metrics.requiredPressureBar).toBeCloseTo(2.5, 1)
    })

    it('calculates correct required pressure for TeeJet AIXR11004 nozzle', () => {
      const metrics = calculateSprayMetrics({
        ...baseInput,
        nozzleId: 'teejet-aixr11004',
        speedKmH: 4,
        nozzleSpacingM: 0.5,
        sprayVolumeLHa: 300,
      })

      // Required Pressure = (sprayVolume * speed * nozzleSpacing / (600 * kFactor))^2
      // kFactor for TeeJet AIXR11004 = 0.91
      // Required Pressure = (300 * 4 * 0.5 / (600 * 0.91))^2 = ~1.21 bar
      expect(metrics.requiredPressureBar).toBeCloseTo(1.2, 1)
    })

    it('determines pressure status as "ok" within range', () => {
      const metrics = calculateSprayMetrics({
        ...baseInput,
        speedKmH: 4,
        sprayVolumeLHa: 274,
      })
      expect(metrics.pressureStatus).toBe('ok')
    })

    it('determines pressure status as "low" below minimum', () => {
      const metrics = calculateSprayMetrics({
        ...baseInput,
        speedKmH: 3,
        sprayVolumeLHa: 150,
      })
      expect(metrics.pressureStatus).toBe('low')
    })

    it('determines pressure status as "high" above maximum', () => {
      const metrics = calculateSprayMetrics({
        ...baseInput,
        speedKmH: 10,
        sprayVolumeLHa: 500,
      })

      // This should yield a high required pressure
      // Required Pressure = (sprayVolume * speed * nozzleSpacing / (600 * kFactor))^2
      // kFactor for Syngenta 025-XC = 0.577
      // Required Pressure = (500 * 10 * 0.5 / (600 * 0.577))^2 = ~52.1 bar
      // 52.1 bar is above max pressure of 4 bar
      expect(metrics.pressureStatus).toBe('high')
    })

    it('increases flow when spray volume increases', () => {
      const metrics1 = calculateSprayMetrics(baseInput)
      const metrics2 = calculateSprayMetrics({
        ...baseInput,
        sprayVolumeLHa: 400,
      })

      expect(metrics2.flowPerNozzleLMin).toBeGreaterThan(metrics1.flowPerNozzleLMin)
    })

    it('increases flow when speed increases', () => {
      const metrics1 = calculateSprayMetrics(baseInput)
      const metrics2 = calculateSprayMetrics({
        ...baseInput,
        speedKmH: 10,
      })

      expect(metrics2.flowPerNozzleLMin).toBeGreaterThan(metrics1.flowPerNozzleLMin)
    })
  })

  describe('total area calculation', () => {
    it('calculates total area from single area', () => {
      const metrics = calculateSprayMetrics(baseInput)
      expect(metrics.totalAreaHa).toBe(5)
    })

    it('sums multiple areas correctly', () => {
      const metrics = calculateSprayMetrics({
        ...baseInput,
        areas: [
          { label: 'Green 1', type: 'green', sizeHa: 5 },
          { label: 'Green 2', type: 'green', sizeHa: 3 },
          { label: 'Tee 1', type: 'tee', sizeHa: 2.5 },
        ],
      })

      expect(metrics.totalAreaHa).toBe(10.5)
    })

    it('handles zero area', () => {
      const metrics = calculateSprayMetrics({
        ...baseInput,
        areas: [{ label: 'Green 1', type: 'green', sizeHa: 0 }],
      })

      expect(metrics.totalAreaHa).toBe(0)
    })
  })

  describe('spray volume calculation', () => {
    it('calculates total spray volume needed', () => {
      const metrics = calculateSprayMetrics(baseInput)

      // Total = sprayVolumeLHa * totalAreaHa
      // Total = 300 * 5 = 1500 L
      expect(metrics.totalSprayVolumeL).toBe(1500)
    })
  })

  describe('spray time calculation', () => {
    it('calculates spray time in minutes', () => {
      const metrics = calculateSprayMetrics(baseInput)

      // Sprayer width = nozzleSpacing * nozzleCount = 0.5 * 11 = 5.5 m
      // Area covered per hour = (sprayerWidth * speed) / 10 = (5.5 * 5) / 10 = 2.75 ha/h
      // Spray time hours = totalAreaHa / areaCoveredPerHour = 5 / 2.75 = 1.818 h
      // Spray time minutes = 1.818 * 60 = 109.09 minutes
      expect(metrics.sprayTimeMinutes).toBeCloseTo(109.09, 2)
    })
  })

  describe('tanks required calculation', () => {
    it('calculates tanks required', () => {
      const metrics = calculateSprayMetrics({
        ...baseInput,
        areas: [{ label: 'Green 1', type: 'green', sizeHa: 5 }],
        tankSizeL: 400,
        sprayVolumeLHa: 300,
      })

      // Total volume = 300 * 5 = 1500 L
      // Tanks = 1500 / 400 = 3.75
      expect(metrics.tanksRequired).toBe(3.75)
    })

    it('rounds up partial tanks', () => {
      const metrics = calculateSprayMetrics({
        ...baseInput,
        areas: [{ label: 'Green 1', type: 'green', sizeHa: 1 }],
        tankSizeL: 400,
        sprayVolumeLHa: 300,
      })

      // Total volume = 300 * 1 = 300 L
      // Tanks = 300 / 400 = 0.75
      expect(metrics.tanksRequired).toBe(0.75)
    })
  })

  describe('product totals calculation', () => {
    it('calculates product totals in correct units', () => {
      const metrics = calculateSprayMetrics({
        ...baseInput,
        areas: [{ label: 'Green 1', type: 'green', sizeHa: 5 }],
        products: [
          {
            productId: 'prod-1',
            productName: 'Soluble Product',
            productType: 'SOLUBLE',
            ratePerHa: 2,
          },
          {
            productId: 'prod-2',
            productName: 'Liquid Product',
            productType: 'LIQUID',
            ratePerHa: 3,
          },
        ],
      })

      expect(metrics.productTotals).toHaveLength(2)

      // Soluble: 2 kg/ha * 5 ha = 10 kg
      expect(metrics.productTotals[0]).toEqual({
        productId: 'prod-1',
        productName: 'Soluble Product',
        productType: 'SOLUBLE',
        ratePerHa: 2,
        totalAmount: 10,
        unit: 'kg',
      })

      // Liquid: 3 L/ha * 5 ha = 15 L
      expect(metrics.productTotals[1]).toEqual({
        productId: 'prod-2',
        productName: 'Liquid Product',
        productType: 'LIQUID',
        ratePerHa: 3,
        totalAmount: 15,
        unit: 'L',
      })
    })

    it('handles empty products array', () => {
      const metrics = calculateSprayMetrics(baseInput)
      expect(metrics.productTotals).toEqual([])
    })
  })

  describe('return value structure', () => {
    it('returns all required properties', () => {
      const metrics = calculateSprayMetrics(baseInput)

      expect(metrics).toHaveProperty('flowPerNozzleLMin')
      expect(metrics).toHaveProperty('requiredPressureBar')
      expect(metrics).toHaveProperty('speedKmH')
      expect(metrics).toHaveProperty('pressureStatus')
      expect(metrics).toHaveProperty('totalAreaHa')
      expect(metrics).toHaveProperty('totalSprayVolumeL')
      expect(metrics).toHaveProperty('tanksRequired')
      expect(metrics).toHaveProperty('sprayTimeMinutes')
      expect(metrics).toHaveProperty('productTotals')
    })
  })
})
