/**
 * Factory functions for creating mock product data in tests
 * These match the Prisma Product model
 */

import { ProductType } from '@prisma/client'

export const createMockProduct = (overrides: Record<string, any> = {}) => ({
  id: 'cmino1fmf00004r4pydqq3zce',
  name: 'H2Pro TriSmart',
  type: 'LIQUID' as ProductType,
  isPublic: false,
  userId: '568DvL52siByrA1iEV8K7UmFleXAOc9w',
  createdAt: new Date('2025-12-01T21:33:11.895Z'),
  updatedAt: new Date('2025-12-01T21:33:11.895Z'),
  ...overrides,
})

export const createMockPublicProduct = (overrides: Record<string, any> = {}) => ({
  ...createMockProduct(),
  id: 'public-prod-123abc',
  name: 'Public Test Product',
  isPublic: true,
  userId: null,
  ...overrides,
})

export const createMockSolubleProduct = (overrides: Record<string, any> = {}) => ({
  ...createMockProduct(),
  id: 'soluble-prod-456def',
  name: 'Soluble Test Product',
  type: 'SOLUBLE' as ProductType,
  ...overrides,
})