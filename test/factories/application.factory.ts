/**
 * Factory functions for creating mock application data in tests
 * These match the Prisma Application, ApplicationArea, and ApplicationProduct models
 */

import { ApplicationStatus } from '@/lib/domain/application/types'

export const createMockApplication = (overrides: Record<string, any> = {}) => ({
  id: 'cmiogvhgo0003fs4pi0dol119',
  name: 'Test Application',
  userId: '568DvL52siByrA1iEV8K7UmFleXAOc9w',
  status: 'DRAFT' as ApplicationStatus,
  nozzleId: 'syngenta-025-xc',
  sprayVolumeLHa: 300,
  nozzleSpacingM: 0.5,
  nozzleCount: 40,
  tankSizeL: 400,
  speedKmH: 5,
  scheduledDate: null,
  completedDate: null,
  operator: null,
  weatherConditions: null,
  notes: null,
  createdAt: new Date('2025-12-02T11:00:23.204Z'),
  updatedAt: new Date('2025-12-02T23:44:13.003Z'),
  ...overrides,
})

export const createMockApplicationArea = (overrides: Record<string, any> = {}) => ({
  id: 'cmiogvhhb0004fs4pncbxe9p7',
  applicationId: 'cmiogvhgo0003fs4pi0dol119',
  label: 'Green 1',
  type: 'green',
  sizeHa: 5,
  order: 0,
  ...overrides,
})

export const createMockApplicationProduct = (overrides: Record<string, any> = {}) => ({
  id: 'cmiogvhhk0005fs4p46khzz3b',
  applicationId: 'cmiogvhgo0003fs4pi0dol119',
  productId: 'cmino1fmf00004r4pydqq3zce',
  ratePerHa: 2.5,
  order: 0,
  ...overrides,
})

/**
 * Create a complete application with areas and products
 */
export const createMockApplicationWithRelations = (overrides: Record<string, any> = {}) => {
  const application = createMockApplication(overrides.application)

  return {
    ...application,
    areas: overrides.areas || [
      createMockApplicationArea({ applicationId: application.id }),
    ],
    applicationProducts: overrides.applicationProducts || [],
  }
}