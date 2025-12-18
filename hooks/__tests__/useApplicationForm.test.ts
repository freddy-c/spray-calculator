import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useApplicationForm } from '../useApplicationForm'
import { toast } from 'sonner'
import type { AreaListItem } from '@/lib/domain/area'

// Mock dependencies
vi.mock('@/lib/domain/application/actions', () => ({
  createApplication: vi.fn(),
  updateApplication: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  usePathname: () => '/dashboard',
}))

import { createApplication, updateApplication } from '@/lib/domain/application/actions'

// Mock area data
const mockAvailableAreas: AreaListItem[] = [
  { id: 'area-1', name: 'Greens', type: 'GREEN', sizeHa: 1, createdAt: new Date(), updatedAt: new Date() },
  { id: 'area-2', name: 'Tee Box 1', type: 'TEE', sizeHa: 0.5, createdAt: new Date(), updatedAt: new Date() },
]

describe('useApplicationForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('initialization', () => {
    it('should initialize with default values in create mode', () => {
      const { result } = renderHook(() => useApplicationForm({ availableAreas: mockAvailableAreas }))

      expect(result.current.form.getValues()).toMatchObject({
        name: '',
        nozzleId: 'syngenta-025-xc',
        sprayVolumeLHa: 300,
        nozzleSpacingM: 0.5,
        nozzleCount: 40,
        tankSizeL: 400,
        speedKmH: 5,
        areas: [],
        products: [],
      })
    })

    it('should initialize with custom initial values', () => {
      const { result } = renderHook(() =>
        useApplicationForm({
          initialValues: {
            name: 'Custom Application',
            sprayVolumeLHa: 400,
          },
          availableAreas: mockAvailableAreas,
        })
      )

      const values = result.current.form.getValues()
      expect(values.name).toBe('Custom Application')
      expect(values.sprayVolumeLHa).toBe(400)
    })

    it('should initialize in edit mode with applicationId', () => {
      const { result } = renderHook(() =>
        useApplicationForm({
          mode: 'edit',
          applicationId: 'app-123',
          initialValues: {
            name: 'Existing Application',
          },
          availableAreas: mockAvailableAreas,
        })
      )

      expect(result.current.form.getValues().name).toBe('Existing Application')
    })
  })

  describe('area field array operations', () => {
    it('should add new area to field array', () => {
      const { result } = renderHook(() => useApplicationForm({ availableAreas: mockAvailableAreas }))

      act(() => {
        result.current.appendArea({
          areaId: 'area-2',
        })
      })

      expect(result.current.areaFields).toHaveLength(1)
      expect(result.current.form.getValues().areas[0]).toMatchObject({
        areaId: 'area-2',
      })
    })

    it('should remove area from field array', () => {
      const { result } = renderHook(() => useApplicationForm({ availableAreas: mockAvailableAreas }))

      act(() => {
        result.current.appendArea({
          areaId: 'area-1',
        })
      })

      expect(result.current.areaFields).toHaveLength(1)

      act(() => {
        result.current.removeArea(0)
      })

      expect(result.current.areaFields).toHaveLength(0)
    })

    it('should preserve existing areas when adding new one', () => {
      const { result } = renderHook(() => useApplicationForm({
        availableAreas: mockAvailableAreas,
        initialValues: {
          areas: [{ areaId: 'area-1' }]
        }
      }))

      const firstArea = result.current.form.getValues().areas[0]

      act(() => {
        result.current.appendArea({
          areaId: 'area-2',
        })
      })

      expect(result.current.form.getValues().areas[0]).toEqual(firstArea)
      expect(result.current.areaFields).toHaveLength(2)
    })
  })

  describe('product field array operations', () => {
    it('should add new product to field array', () => {
      const { result } = renderHook(() => useApplicationForm())

      act(() => {
        result.current.appendProduct({
          productId: 'prod-123',
          productName: 'Test Product',
          productType: 'SOLUBLE',
          ratePerHa: 2.5,
        })
      })

      expect(result.current.productFields).toHaveLength(1)
      expect(result.current.form.getValues().products[0]).toMatchObject({
        productId: 'prod-123',
        productName: 'Test Product',
        productType: 'SOLUBLE',
        ratePerHa: 2.5,
      })
    })

    it('should remove product from field array', () => {
      const { result } = renderHook(() => useApplicationForm())

      act(() => {
        result.current.appendProduct({
          productId: 'prod-123',
          productName: 'Test Product',
          productType: 'SOLUBLE',
          ratePerHa: 2.5,
        })
      })

      expect(result.current.productFields).toHaveLength(1)

      act(() => {
        result.current.removeProduct(0)
      })

      expect(result.current.productFields).toHaveLength(0)
    })
  })

  describe('live calculations', () => {
    it('should calculate metrics when form has valid values', () => {
      const { result } = renderHook(() => useApplicationForm({
        initialValues: { name: 'Test App' } // Name is required for valid form
      }))

      expect(result.current.metrics).not.toBeNull()
      expect(result.current.metrics).toHaveProperty('flowPerNozzleLMin')
      expect(result.current.metrics).toHaveProperty('totalAreaHa')
      expect(result.current.metrics).toHaveProperty('totalSprayVolumeL')
    })

    it('should return null metrics when form values are invalid', async () => {
      const { result } = renderHook(() => useApplicationForm())

      act(() => {
        result.current.form.setValue('speedKmH', 1) // Invalid: below min of 3
      })

      await waitFor(() => {
        expect(result.current.metrics).toBeNull()
      })
    })

    it('should update metrics when form values change', async () => {
      const { result } = renderHook(() => useApplicationForm({
        initialValues: { name: 'Test App' }
      }))

      const initialTotalArea = result.current.metrics?.totalAreaHa

      act(() => {
        result.current.appendArea({
          label: 'Green 2',
          type: 'green',
          sizeHa: 0.5,
        })
      })

      await waitFor(() => {
        expect(result.current.metrics?.totalAreaHa).toBeGreaterThan(initialTotalArea!)
      })
    })

    it('should recalculate metrics when area size changes', async () => {
      const { result } = renderHook(() => useApplicationForm({
        initialValues: { name: 'Test App' }
      }))

      const initialTotalArea = result.current.metrics?.totalAreaHa

      act(() => {
        result.current.form.setValue('areas.0.sizeHa', 5)
      })

      await waitFor(() => {
        expect(result.current.metrics?.totalAreaHa).toBe(5)
        expect(result.current.metrics?.totalAreaHa).not.toBe(initialTotalArea)
      })
    })
  })

  describe('form submission - create mode', () => {
    it('should call createApplication with form data', async () => {
      vi.mocked(createApplication).mockResolvedValue({
        success: true,
        data: { id: 'new-app-id' },
      })

      const { result } = renderHook(() => useApplicationForm())

      act(() => {
        result.current.form.setValue('name', 'Test Application')
      })

      await act(async () => {
        await result.current.onSubmit()
      })

      expect(createApplication).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test Application',
        })
      )
      expect(toast.success).toHaveBeenCalledWith('Application saved successfully')
    })

    it('should show error toast when creation fails', async () => {
      vi.mocked(createApplication).mockResolvedValue({
        success: false,
        error: 'Database error',
      })

      const { result } = renderHook(() => useApplicationForm())

      act(() => {
        result.current.form.setValue('name', 'Test Application')
      })

      await act(async () => {
        await result.current.onSubmit()
      })

      expect(toast.error).toHaveBeenCalledWith('Database error')
    })

    it('should call onSuccess callback after successful creation', async () => {
      const onSuccess = vi.fn()

      vi.mocked(createApplication).mockResolvedValue({
        success: true,
        data: { id: 'new-app-id' },
      })

      const { result } = renderHook(() => useApplicationForm({ onSuccess }))

      act(() => {
        result.current.form.setValue('name', 'Test Application')
      })

      await act(async () => {
        await result.current.onSubmit()
      })

      expect(onSuccess).toHaveBeenCalled()
    })
  })

  describe('form submission - edit mode', () => {
    it('should call updateApplication with applicationId and form data', async () => {
      vi.mocked(updateApplication).mockResolvedValue({
        success: true,
        data: { id: 'app-123' },
      })

      const { result } = renderHook(() =>
        useApplicationForm({
          mode: 'edit',
          applicationId: 'app-123',
          initialValues: {
            name: 'Original Name',
          },
        })
      )

      act(() => {
        result.current.form.setValue('name', 'Updated Name')
      })

      await act(async () => {
        await result.current.onSubmit()
      })

      expect(updateApplication).toHaveBeenCalledWith(
        'app-123',
        expect.objectContaining({
          name: 'Updated Name',
        })
      )
      expect(toast.success).toHaveBeenCalledWith('Application updated successfully')
    })

    it('should show error when updating without applicationId', async () => {
      const { result } = renderHook(() =>
        useApplicationForm({
          mode: 'edit',
          applicationId: undefined as any,
          initialValues: { name: 'Test' },
        })
      )

      act(() => {
        result.current.form.setValue('name', 'Updated Name')
      })

      await act(async () => {
        await result.current.onSubmit()
      })

      expect(toast.error).toHaveBeenCalledWith('Unable to update: missing application ID')
      expect(updateApplication).not.toHaveBeenCalled()
    })

    it('should call onSuccess callback after successful update', async () => {
      const onSuccess = vi.fn()

      vi.mocked(updateApplication).mockResolvedValue({
        success: true,
        data: { id: 'app-123' },
      })

      const { result } = renderHook(() =>
        useApplicationForm({
          mode: 'edit',
          applicationId: 'app-123',
          initialValues: {},
          onSuccess,
        })
      )

      act(() => {
        result.current.form.setValue('name', 'Updated Name')
      })

      await act(async () => {
        await result.current.onSubmit()
      })

      expect(onSuccess).toHaveBeenCalled()
    })
  })

  describe('form validation', () => {
    it('should validate required name field', async () => {
      const { result } = renderHook(() => useApplicationForm())

      act(() => {
        result.current.form.setValue('name', '')
      })

      await act(async () => {
        await result.current.form.trigger('name')
      })

      expect(result.current.form.formState.errors.name).toBeDefined()
    })

    it('should validate speed is within range', async () => {
      const { result } = renderHook(() => useApplicationForm())

      act(() => {
        result.current.form.setValue('speedKmH', 15) // Above max of 12
      })

      await act(async () => {
        await result.current.form.trigger('speedKmH')
      })

      expect(result.current.form.formState.errors.speedKmH).toBeDefined()
    })

    it('should validate at least one area is required', async () => {
      const { result } = renderHook(() => useApplicationForm())

      act(() => {
        result.current.removeArea(0) // Remove the default area
      })

      await act(async () => {
        await result.current.form.trigger('areas')
      })

      expect(result.current.form.formState.errors.areas).toBeDefined()
    })
  })
})
