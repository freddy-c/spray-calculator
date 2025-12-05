import { describe, it, expect } from 'vitest'
import {
  areaSchema,
  createApplicationSchema,
  scheduleApplicationSchema,
  completeApplicationSchema,
} from '../schemas'
import type { ZodError } from 'zod'

describe('Application Schemas', () => {
  describe('areaSchema', () => {
    it('accepts valid area data', () => {
      const validArea = {
        label: 'Green 1',
        type: 'green',
        sizeHa: 5,
      }

      const result = areaSchema.safeParse(validArea)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(validArea)
      }
    })

    it('accepts all valid area types', () => {
      const areaTypes = ['green', 'tee', 'fairway', 'rough', 'other']

      areaTypes.forEach((type) => {
        const area = {
          label: `Test ${type}`,
          type,
          sizeHa: 5,
        }
        const result = areaSchema.safeParse(area)
        expect(result.success).toBe(true)
      })
    })

    it('coerces string numbers to numbers', () => {
      const area = {
        label: 'Green 1',
        type: 'green',
        sizeHa: '5.5',
      }

      const result = areaSchema.safeParse(area)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.sizeHa).toBe(5.5)
        expect(typeof result.data.sizeHa).toBe('number')
      }
    })

    describe('validation errors', () => {
      it('rejects empty label', () => {
        const area = {
          label: '',
          type: 'green',
          sizeHa: 5,
        }

        const result = areaSchema.safeParse(area)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Label is required')
        }
      })

      it('rejects invalid area type', () => {
        const area = {
          label: 'Green 1',
          type: 'invalid',
          sizeHa: 5,
        }

        const result = areaSchema.safeParse(area)
        expect(result.success).toBe(false)
      })

      it('rejects zero size', () => {
        const area = {
          label: 'Green 1',
          type: 'green',
          sizeHa: 0,
        }

        const result = areaSchema.safeParse(area)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('greater than 0')
        }
      })

      it('rejects negative size', () => {
        const area = {
          label: 'Green 1',
          type: 'green',
          sizeHa: -5,
        }

        const result = areaSchema.safeParse(area)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('greater than 0')
        }
      })

      it('rejects size exceeding maximum', () => {
        const area = {
          label: 'Green 1',
          type: 'green',
          sizeHa: 1001,
        }

        const result = areaSchema.safeParse(area)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('too large')
        }
      })
    })
  })

  describe('createApplicationSchema', () => {
    const validApplication = {
      name: 'Test Application',
      nozzleId: 'syngenta-025-xc',
      sprayVolumeLHa: 300,
      nozzleSpacingM: 0.5,
      nozzleCount: 11,
      tankSizeL: 400,
      speedKmH: 5,
      areas: [
        { label: 'Green 1', type: 'green', sizeHa: 5 },
      ],
      products: [],
    }

    it('accepts valid application data', () => {
      const result = createApplicationSchema.safeParse(validApplication)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.name).toBe('Test Application')
      }
    })

    it('coerces numeric string values to numbers', () => {
      const application = {
        ...validApplication,
        sprayVolumeLHa: '300',
        nozzleSpacingM: '0.5',
        nozzleCount: '11',
        tankSizeL: '400',
        speedKmH: '5',
      }

      const result = createApplicationSchema.safeParse(application)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(typeof result.data.sprayVolumeLHa).toBe('number')
        expect(typeof result.data.nozzleSpacingM).toBe('number')
        expect(typeof result.data.nozzleCount).toBe('number')
        expect(typeof result.data.tankSizeL).toBe('number')
        expect(typeof result.data.speedKmH).toBe('number')
      }
    })

    it('accepts application with products', () => {
      const application = {
        ...validApplication,
        products: [
          {
            productId: 'prod-1',
            productName: 'Test Product',
            productType: 'SOLUBLE',
            ratePerHa: 2.5,
          },
        ],
      }

      const result = createApplicationSchema.safeParse(application)
      expect(result.success).toBe(true)
    })

    it('accepts application with multiple areas', () => {
      const application = {
        ...validApplication,
        areas: [
          { label: 'Green 1', type: 'green', sizeHa: 5 },
          { label: 'Green 2', type: 'green', sizeHa: 3 },
          { label: 'Tee 1', type: 'tee', sizeHa: 2 },
        ],
      }

      const result = createApplicationSchema.safeParse(application)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.areas).toHaveLength(3)
      }
    })

    describe('name validation', () => {
      it('rejects empty name', () => {
        const application = {
          ...validApplication,
          name: '',
        }

        const result = createApplicationSchema.safeParse(application)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('required')
        }
      })

      it('rejects name exceeding max length', () => {
        const application = {
          ...validApplication,
          name: 'a'.repeat(101),
        }

        const result = createApplicationSchema.safeParse(application)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('too long')
        }
      })

      it('accepts name at max length', () => {
        const application = {
          ...validApplication,
          name: 'a'.repeat(100),
        }

        const result = createApplicationSchema.safeParse(application)
        expect(result.success).toBe(true)
      })
    })

    describe('nozzleId validation', () => {
      it('rejects empty nozzleId', () => {
        const application = {
          ...validApplication,
          nozzleId: '',
        }

        const result = createApplicationSchema.safeParse(application)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('Select a nozzle')
        }
      })
    })

    describe('sprayVolumeLHa validation', () => {
      it('rejects zero spray volume', () => {
        const application = {
          ...validApplication,
          sprayVolumeLHa: 0,
        }

        const result = createApplicationSchema.safeParse(application)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('greater than 0')
        }
      })

      it('rejects negative spray volume', () => {
        const application = {
          ...validApplication,
          sprayVolumeLHa: -100,
        }

        const result = createApplicationSchema.safeParse(application)
        expect(result.success).toBe(false)
      })

      it('accepts decimal spray volume', () => {
        const application = {
          ...validApplication,
          sprayVolumeLHa: 274.5,
        }

        const result = createApplicationSchema.safeParse(application)
        expect(result.success).toBe(true)
      })
    })

    describe('nozzleSpacingM validation', () => {
      it('rejects zero nozzle spacing', () => {
        const application = {
          ...validApplication,
          nozzleSpacingM: 0,
        }

        const result = createApplicationSchema.safeParse(application)
        expect(result.success).toBe(false)
      })

      it('rejects nozzle spacing >= 10', () => {
        const application = {
          ...validApplication,
          nozzleSpacingM: 10,
        }

        const result = createApplicationSchema.safeParse(application)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('less than 10m')
        }
      })

      it('accepts nozzle spacing just under 10', () => {
        const application = {
          ...validApplication,
          nozzleSpacingM: 9.99,
        }

        const result = createApplicationSchema.safeParse(application)
        expect(result.success).toBe(true)
      })
    })

    describe('nozzleCount validation', () => {
      it('rejects zero nozzle count', () => {
        const application = {
          ...validApplication,
          nozzleCount: 0,
        }

        const result = createApplicationSchema.safeParse(application)
        expect(result.success).toBe(false)
      })

      it('rejects negative nozzle count', () => {
        const application = {
          ...validApplication,
          nozzleCount: -5,
        }

        const result = createApplicationSchema.safeParse(application)
        expect(result.success).toBe(false)
      })

      it('rejects decimal nozzle count', () => {
        const application = {
          ...validApplication,
          nozzleCount: 10.5,
        }

        const result = createApplicationSchema.safeParse(application)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('whole number')
        }
      })

      it('rejects nozzle count exceeding maximum', () => {
        const application = {
          ...validApplication,
          nozzleCount: 201,
        }

        const result = createApplicationSchema.safeParse(application)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('too large')
        }
      })

      it('accepts nozzle count at maximum', () => {
        const application = {
          ...validApplication,
          nozzleCount: 200,
        }

        const result = createApplicationSchema.safeParse(application)
        expect(result.success).toBe(true)
      })
    })

    describe('tankSizeL validation', () => {
      it('rejects zero tank size', () => {
        const application = {
          ...validApplication,
          tankSizeL: 0,
        }

        const result = createApplicationSchema.safeParse(application)
        expect(result.success).toBe(false)
      })

      it('rejects negative tank size', () => {
        const application = {
          ...validApplication,
          tankSizeL: -100,
        }

        const result = createApplicationSchema.safeParse(application)
        expect(result.success).toBe(false)
      })
    })

    describe('speedKmH validation', () => {
      it('rejects speed below minimum (3 km/h)', () => {
        const application = {
          ...validApplication,
          speedKmH: 2.9,
        }

        const result = createApplicationSchema.safeParse(application)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('Min 3 km/h')
        }
      })

      it('accepts speed at minimum (3 km/h)', () => {
        const application = {
          ...validApplication,
          speedKmH: 3,
        }

        const result = createApplicationSchema.safeParse(application)
        expect(result.success).toBe(true)
      })

      it('rejects speed above maximum (12 km/h)', () => {
        const application = {
          ...validApplication,
          speedKmH: 12.1,
        }

        const result = createApplicationSchema.safeParse(application)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('Max 12 km/h')
        }
      })

      it('accepts speed at maximum (12 km/h)', () => {
        const application = {
          ...validApplication,
          speedKmH: 12,
        }

        const result = createApplicationSchema.safeParse(application)
        expect(result.success).toBe(true)
      })
    })

    describe('areas validation', () => {
      it('rejects empty areas array', () => {
        const application = {
          ...validApplication,
          areas: [],
        }

        const result = createApplicationSchema.safeParse(application)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('at least one area')
        }
      })

      it('rejects invalid area in array', () => {
        const application = {
          ...validApplication,
          areas: [
            { label: 'Green 1', type: 'green', sizeHa: 5 },
            { label: '', type: 'green', sizeHa: 3 }, // Invalid: empty label
          ],
        }

        const result = createApplicationSchema.safeParse(application)
        expect(result.success).toBe(false)
      })
    })

    describe('products validation', () => {
      it('accepts empty products array', () => {
        const application = {
          ...validApplication,
          products: [],
        }

        const result = createApplicationSchema.safeParse(application)
        expect(result.success).toBe(true)
      })

      it('rejects invalid product in array', () => {
        const application = {
          ...validApplication,
          products: [
            {
              productId: '',
              productName: 'Test',
              productType: 'SOLUBLE',
              ratePerHa: 2,
            },
          ],
        }

        const result = createApplicationSchema.safeParse(application)
        expect(result.success).toBe(false)
      })
    })
  })

  describe('scheduleApplicationSchema', () => {
    it('accepts valid scheduled date', () => {
      const data = {
        scheduledDate: '2025-12-25',
      }

      const result = scheduleApplicationSchema.safeParse(data)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.scheduledDate).toBe('2025-12-25')
      }
    })

    it('rejects empty scheduled date', () => {
      const data = {
        scheduledDate: '',
      }

      const result = scheduleApplicationSchema.safeParse(data)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('required')
      }
    })

    it('rejects missing scheduled date', () => {
      const data = {}

      const result = scheduleApplicationSchema.safeParse(data)
      expect(result.success).toBe(false)
    })
  })

  describe('completeApplicationSchema', () => {
    it('accepts valid completion data with all fields', () => {
      const data = {
        completedDate: '2025-12-25',
        operator: 'John Doe',
        weatherConditions: 'Sunny, 22°C, light wind',
        notes: 'Application completed successfully',
      }

      const result = completeApplicationSchema.safeParse(data)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(data)
      }
    })

    it('accepts completion data with only required fields', () => {
      const data = {
        completedDate: '2025-12-25',
      }

      const result = completeApplicationSchema.safeParse(data)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.completedDate).toBe('2025-12-25')
        expect(result.data.operator).toBeUndefined()
        expect(result.data.weatherConditions).toBeUndefined()
        expect(result.data.notes).toBeUndefined()
      }
    })

    it('accepts completion data with empty optional fields', () => {
      const data = {
        completedDate: '2025-12-25',
        operator: '',
        weatherConditions: '',
        notes: '',
      }

      const result = completeApplicationSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('rejects empty completed date', () => {
      const data = {
        completedDate: '',
      }

      const result = completeApplicationSchema.safeParse(data)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('required')
      }
    })

    it('rejects missing completed date', () => {
      const data = {
        operator: 'John Doe',
      }

      const result = completeApplicationSchema.safeParse(data)
      expect(result.success).toBe(false)
    })
  })
})
