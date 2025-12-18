/**
 * Minimal smoke tests for application actions
 *
 * Focus: Security boundaries, validation integration, and business logic
 * - Authentication enforcement
 * - Input validation is called
 * - Product ID validation logic (CUID format + accessibility check)
 * - Total area calculation
 * - Error handling
 *
 * NOT testing: Detailed Prisma query parameters (that's testing mocks)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock dependencies BEFORE importing the module under test
vi.mock('@/lib/core/auth/server')
vi.mock('@/lib/core/database')
vi.mock('next/headers', () => ({
  headers: vi.fn(() => Promise.resolve(new Headers())),
}))
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

// Import after mocks are defined
import { createApplication, getApplications } from '../actions'
import { prismaMock } from '@/test/mocks/prisma'
import { mockAuth, mockAuthenticatedUser, mockUnauthenticatedUser } from '@/test/mocks/auth'
import { createMockProduct } from '@/test/factories/product.factory'
import { auth } from '@/lib/core/auth/server'
import { prisma } from '@/lib/core/database'

// Connect the mocks
vi.mocked(auth).api = mockAuth.api as any
vi.mocked(prisma).application = prismaMock.application
vi.mocked(prisma).product = prismaMock.product
vi.mocked(prisma).$transaction = prismaMock.$transaction

describe('Application Actions - Security & Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createApplication', () => {
    const validApplicationData = {
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

    it('enforces authentication', async () => {
      mockUnauthenticatedUser()

      const result = await createApplication(validApplicationData)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe('Unauthorized')
      }
      expect(prismaMock.application.create).not.toHaveBeenCalled()
    })

    it('validates input - rejects empty name', async () => {
      mockAuthenticatedUser()

      const result = await createApplication({
        ...validApplicationData,
        name: '',
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain('Invalid form data')
      }
      expect(prismaMock.application.create).not.toHaveBeenCalled()
    })

    it('validates input - rejects invalid speed', async () => {
      mockAuthenticatedUser()

      const result = await createApplication({
        ...validApplicationData,
        speedKmH: 2,
      })

      expect(result.success).toBe(false)
      expect(prismaMock.application.create).not.toHaveBeenCalled()
    })

    it('validates input - rejects empty areas array', async () => {
      mockAuthenticatedUser()

      const result = await createApplication({
        ...validApplicationData,
        areas: [],
      })

      expect(result.success).toBe(false)
      expect(prismaMock.application.create).not.toHaveBeenCalled()
    })

    it('validates product IDs - rejects invalid CUID format', async () => {
      mockAuthenticatedUser()

      const result = await createApplication({
        ...validApplicationData,
        products: [
          {
            productId: 'invalid-id',
            productName: 'Test',
            productType: 'SOLUBLE',
            ratePerHa: 2,
          },
        ],
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain('Invalid product ID format')
      }
      expect(prismaMock.application.create).not.toHaveBeenCalled()
    })

    it('validates product IDs - rejects inaccessible products', async () => {
      mockAuthenticatedUser({ id: 'user-123' })

      prismaMock.product.findMany.mockResolvedValue([])

      const result = await createApplication({
        ...validApplicationData,
        products: [
          {
            productId: 'clwh3zj5l0000v8g4h6j7k8l9',
            productName: 'Test',
            productType: 'SOLUBLE',
            ratePerHa: 2,
          },
        ],
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain('not found or not accessible')
      }
      expect(prismaMock.application.create).not.toHaveBeenCalled()
    })

    it('allows valid products (public or user-owned)', async () => {
      mockAuthenticatedUser({ id: 'user-123' })

      const validProductId = 'clwh3zj5l0000v8g4h6j7k8l9'

      prismaMock.product.findMany.mockResolvedValue([
        createMockProduct({ id: validProductId }),
      ])

      prismaMock.application.create.mockResolvedValue({
        id: 'new-app-id',
      } as any)

      const result = await createApplication({
        ...validApplicationData,
        products: [
          {
            productId: validProductId,
            productName: 'Test',
            productType: 'SOLUBLE',
            ratePerHa: 2,
          },
        ],
      })

      expect(result.success).toBe(true)

      // Verify security filter
      expect(prismaMock.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { isPublic: true },
              { userId: 'user-123' },
            ],
          }),
        })
      )
    })

    it('creates application when valid', async () => {
      mockAuthenticatedUser()
      prismaMock.application.create.mockResolvedValue({
        id: 'new-app-id',
      } as any)

      const result = await createApplication(validApplicationData)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.id).toBe('new-app-id')
      }
    })

    it('handles database errors gracefully', async () => {
      mockAuthenticatedUser()
      prismaMock.application.create.mockRejectedValue(
        new Error('Database error')
      )

      const result = await createApplication(validApplicationData)

      expect(result.success).toBe(false)
    })
  })

  describe('getApplications', () => {
    it('enforces authentication', async () => {
      mockUnauthenticatedUser()

      const result = await getApplications()

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe('Unauthorized')
      }
    })

    it('returns paginated result structure', async () => {
      mockAuthenticatedUser()

      const mockApplications = [
        {
          id: 'app-1',
          name: 'Test App',
          status: 'DRAFT',
          scheduledDate: null,
          completedDate: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          areas: [{ id: 'area-1', sizeHa: 5 }],
        } as any,
      ]

      prismaMock.$transaction.mockResolvedValue([1, mockApplications])

      const result = await getApplications()

      expect(result.success).toBe(true)
      if (result.success) {
        // Verify structure contains pagination data
        expect(result.data).toHaveProperty('data')
        expect(result.data).toHaveProperty('pageCount')
        expect(result.data).toHaveProperty('totalCount')
        expect(Array.isArray(result.data.data)).toBe(true)
      }
    })

    it('calculates total area - single area', async () => {
      mockAuthenticatedUser()

      const mockApplications = [
        {
          id: 'app-1',
          name: 'Test App',
          status: 'DRAFT',
          scheduledDate: null,
          completedDate: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          areas: [
            { id: 'area-1', sizeHa: 5 },
          ],
        } as any,
      ]

      prismaMock.$transaction.mockResolvedValue([1, mockApplications])

      const result = await getApplications()

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.data[0].totalAreaHa).toBe(5)
      }
    })

    it('calculates total area - multiple areas', async () => {
      mockAuthenticatedUser()

      const mockApplications = [
        {
          id: 'app-1',
          name: 'Test App',
          status: 'DRAFT',
          scheduledDate: null,
          completedDate: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          areas: [
            { id: 'area-1', sizeHa: 5 },
            { id: 'area-2', sizeHa: 3 },
            { id: 'area-3', sizeHa: 2.5 },
          ],
        } as any,
      ]

      prismaMock.$transaction.mockResolvedValue([1, mockApplications])

      const result = await getApplications()

      expect(result.success).toBe(true)
      if (result.success) {
        // Critical business logic test: sum of all areas
        expect(result.data.data[0].totalAreaHa).toBe(10.5)
      }
    })

    it('calculates page count correctly', async () => {
      mockAuthenticatedUser()

      // Test various pagination scenarios
      const scenarios = [
        { totalCount: 25, pageSize: 10, expectedPages: 3 },
        { totalCount: 30, pageSize: 10, expectedPages: 3 },
        { totalCount: 31, pageSize: 10, expectedPages: 4 },
        { totalCount: 5, pageSize: 10, expectedPages: 1 },
        { totalCount: 0, pageSize: 10, expectedPages: 0 },
      ]

      for (const scenario of scenarios) {
        prismaMock.$transaction.mockResolvedValue([scenario.totalCount, []])

        const result = await getApplications({ pageSize: scenario.pageSize })

        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.pageCount).toBe(scenario.expectedPages)
          expect(result.data.totalCount).toBe(scenario.totalCount)
        }
      }
    })

    it('handles database errors gracefully', async () => {
      mockAuthenticatedUser()
      prismaMock.$transaction.mockRejectedValue(
        new Error('Database error')
      )

      const result = await getApplications()

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBeTruthy()
      }
    })
  })
})
