/**
 * Mock Prisma client for testing
 *
 * Uses vitest-mock-extended to create a deep mock of the Prisma client
 */

import { PrismaClient } from '@/app/generated/prisma/client'
import { beforeEach } from 'vitest'
import { mockDeep, mockReset, DeepMockProxy } from 'vitest-mock-extended'

// Create a deep mock of the Prisma client
export const prismaMock = mockDeep<PrismaClient>() as unknown as DeepMockProxy<PrismaClient>

// Reset the mock before each test to avoid test pollution
beforeEach(() => {
  mockReset(prismaMock)
})
