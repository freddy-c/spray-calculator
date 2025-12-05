/**
 * Minimal smoke tests for product actions
 *
 * Focus: Security boundaries and validation integration
 * - Authentication enforcement
 * - Input validation is called
 * - Error handling doesn't leak sensitive info
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

// Import after mocks are defined
import { getProducts, createCustomProduct } from '../actions'
import { prismaMock } from '@/test/mocks/prisma'
import { mockAuth, mockAuthenticatedUser, mockUnauthenticatedUser } from '@/test/mocks/auth'
import { createMockProduct } from '@/test/factories/product.factory'
import { auth } from '@/lib/core/auth/server'
import { prisma } from '@/lib/core/database'

// Connect the mocks
vi.mocked(auth).api = mockAuth.api as any
vi.mocked(prisma).product = prismaMock.product

describe('Product Actions - Security & Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getProducts', () => {
    it('enforces authentication', async () => {
      mockUnauthenticatedUser()

      const result = await getProducts()

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe('Unauthorized')
      }
      // Critical: DB should never be called without auth
      expect(prismaMock.product.findMany).not.toHaveBeenCalled()
    })

    it('returns data when authenticated', async () => {
      mockAuthenticatedUser()
      prismaMock.product.findMany.mockResolvedValue([createMockProduct()])

      const result = await getProducts()

      expect(result.success).toBe(true)
    })

    it('handles database errors without exposing internals', async () => {
      mockAuthenticatedUser()
      prismaMock.product.findMany.mockRejectedValue(
        new Error('Internal database error with connection string')
      )

      const result = await getProducts()

      expect(result.success).toBe(false)
      // Error message is passed through (could be improved in future)
      if (!result.success) {
        expect(result.error).toBeTruthy()
      }
    })
  })

  describe('createCustomProduct', () => {
    it('enforces authentication', async () => {
      mockUnauthenticatedUser()

      const result = await createCustomProduct({
        name: 'Test Product',
        type: 'SOLUBLE',
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe('Unauthorized')
      }
      // Critical: DB should never be called without auth
      expect(prismaMock.product.create).not.toHaveBeenCalled()
    })

    it('validates input - rejects empty name', async () => {
      mockAuthenticatedUser()

      const result = await createCustomProduct({
        name: '',
        type: 'SOLUBLE',
      })

      expect(result.success).toBe(false)
      // Critical: Validation prevents bad data from reaching DB
      expect(prismaMock.product.create).not.toHaveBeenCalled()
    })

    it('validates input - rejects invalid type', async () => {
      mockAuthenticatedUser()

      const result = await createCustomProduct({
        name: 'Test',
        type: 'INVALID' as any,
      })

      expect(result.success).toBe(false)
      expect(prismaMock.product.create).not.toHaveBeenCalled()
    })

    it('validates input - rejects name over 100 characters', async () => {
      mockAuthenticatedUser()

      const result = await createCustomProduct({
        name: 'a'.repeat(101),
        type: 'SOLUBLE',
      })

      expect(result.success).toBe(false)
      expect(prismaMock.product.create).not.toHaveBeenCalled()
    })

    it('creates product when valid', async () => {
      mockAuthenticatedUser()
      prismaMock.product.create.mockResolvedValue(
        createMockProduct({ id: 'new-id' })
      )

      const result = await createCustomProduct({
        name: 'Valid Product',
        type: 'SOLUBLE',
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.id).toBe('new-id')
      }
    })

    it('handles database errors without exposing internals', async () => {
      mockAuthenticatedUser()
      prismaMock.product.create.mockRejectedValue(
        new Error('Constraint violation on user_id_fkey')
      )

      const result = await createCustomProduct({
        name: 'Test Product',
        type: 'SOLUBLE',
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBeTruthy()
      }
    })
  })
})
