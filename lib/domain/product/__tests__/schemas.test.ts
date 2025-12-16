import { describe, it, expect } from 'vitest'
import {
  productTypeSchema,
  createProductSchema,
  applicationProductFieldSchema,
  productCatalogFilterSchema,
} from '../schemas'
import { ProductType } from '../types'

describe('Product Schemas', () => {
  describe('productTypeSchema', () => {
    it('accepts SOLUBLE product type', () => {
      const result = productTypeSchema.safeParse('SOLUBLE')
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toBe('SOLUBLE')
      }
    })

    it('accepts LIQUID product type', () => {
      const result = productTypeSchema.safeParse('LIQUID')
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toBe('LIQUID')
      }
    })

    it('rejects invalid product type', () => {
      const result = productTypeSchema.safeParse('INVALID')
      expect(result.success).toBe(false)
    })

    it('rejects empty string', () => {
      const result = productTypeSchema.safeParse('')
      expect(result.success).toBe(false)
    })

    it('rejects lowercase product type', () => {
      const result = productTypeSchema.safeParse('soluble')
      expect(result.success).toBe(false)
    })

    it('accepts ProductType enum values', () => {
      const result1 = productTypeSchema.safeParse(ProductType.SOLUBLE)
      const result2 = productTypeSchema.safeParse(ProductType.LIQUID)

      expect(result1.success).toBe(true)
      expect(result2.success).toBe(true)
    })
  })

  describe('createProductSchema', () => {
    const validProduct = {
      name: 'Test Product',
      type: 'SOLUBLE' as const,
    }

    it('accepts valid product data', () => {
      const result = createProductSchema.safeParse(validProduct)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.name).toBe('Test Product')
        expect(result.data.type).toBe('SOLUBLE')
      }
    })

    it('accepts SOLUBLE type', () => {
      const product = {
        name: 'Soluble Product',
        type: 'SOLUBLE' as const,
      }

      const result = createProductSchema.safeParse(product)
      expect(result.success).toBe(true)
    })

    it('accepts LIQUID type', () => {
      const product = {
        name: 'Liquid Product',
        type: 'LIQUID' as const,
      }

      const result = createProductSchema.safeParse(product)
      expect(result.success).toBe(true)
    })

    it('accepts ProductType enum values', () => {
      const product = {
        name: 'Test Product',
        type: ProductType.SOLUBLE,
      }

      const result = createProductSchema.safeParse(product)
      expect(result.success).toBe(true)
    })

    describe('name validation', () => {
      it('rejects empty name', () => {
        const product = {
          ...validProduct,
          name: '',
        }

        const result = createProductSchema.safeParse(product)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('required')
        }
      })

      it('rejects name exceeding max length', () => {
        const product = {
          ...validProduct,
          name: 'a'.repeat(101),
        }

        const result = createProductSchema.safeParse(product)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('less than 100 characters')
        }
      })

      it('accepts name at max length', () => {
        const product = {
          ...validProduct,
          name: 'a'.repeat(100),
        }

        const result = createProductSchema.safeParse(product)
        expect(result.success).toBe(true)
      })

      it('accepts name with special characters', () => {
        const product = {
          ...validProduct,
          name: 'Product-123 (Test) & Co.',
        }

        const result = createProductSchema.safeParse(product)
        expect(result.success).toBe(true)
      })

      it('accepts name with spaces', () => {
        const product = {
          ...validProduct,
          name: 'Test Product Name',
        }

        const result = createProductSchema.safeParse(product)
        expect(result.success).toBe(true)
      })

      it('accepts single character name', () => {
        const product = {
          ...validProduct,
          name: 'A',
        }

        const result = createProductSchema.safeParse(product)
        expect(result.success).toBe(true)
      })
    })

    describe('type validation', () => {
      it('rejects invalid product type', () => {
        const product = {
          name: 'Test Product',
          type: 'INVALID',
        }

        const result = createProductSchema.safeParse(product)
        expect(result.success).toBe(false)
      })

      it('rejects missing type', () => {
        const product = {
          name: 'Test Product',
        }

        const result = createProductSchema.safeParse(product)
        expect(result.success).toBe(false)
      })

      it('rejects null type', () => {
        const product = {
          name: 'Test Product',
          type: null,
        }

        const result = createProductSchema.safeParse(product)
        expect(result.success).toBe(false)
      })
    })
  })

  describe('applicationProductFieldSchema', () => {
    const validProductField = {
      productId: 'prod-123',
      productName: 'Test Product',
      productType: 'SOLUBLE' as const,
      ratePerHa: 2.5,
    }

    it('accepts valid application product field', () => {
      const result = applicationProductFieldSchema.safeParse(validProductField)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(validProductField)
      }
    })

    it('coerces string rate to number', () => {
      const productField = {
        ...validProductField,
        ratePerHa: '2.5',
      }

      const result = applicationProductFieldSchema.safeParse(productField)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.ratePerHa).toBe(2.5)
        expect(typeof result.data.ratePerHa).toBe('number')
      }
    })

    it('accepts SOLUBLE product type', () => {
      const productField = {
        ...validProductField,
        productType: 'SOLUBLE' as const,
      }

      const result = applicationProductFieldSchema.safeParse(productField)
      expect(result.success).toBe(true)
    })

    it('accepts LIQUID product type', () => {
      const productField = {
        ...validProductField,
        productType: 'LIQUID' as const,
      }

      const result = applicationProductFieldSchema.safeParse(productField)
      expect(result.success).toBe(true)
    })

    it('accepts ProductType enum values', () => {
      const productField = {
        ...validProductField,
        productType: ProductType.SOLUBLE,
      }

      const result = applicationProductFieldSchema.safeParse(productField)
      expect(result.success).toBe(true)
    })

    describe('productId validation', () => {
      it('rejects empty productId', () => {
        const productField = {
          ...validProductField,
          productId: '',
        }

        const result = applicationProductFieldSchema.safeParse(productField)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('required')
        }
      })

      it('rejects missing productId', () => {
        const productField = {
          productName: 'Test Product',
          productType: 'SOLUBLE' as const,
          ratePerHa: 2.5,
        }

        const result = applicationProductFieldSchema.safeParse(productField)
        expect(result.success).toBe(false)
      })
    })

    describe('ratePerHa validation', () => {
      it('rejects zero rate', () => {
        const productField = {
          ...validProductField,
          ratePerHa: 0,
        }

        const result = applicationProductFieldSchema.safeParse(productField)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('positive')
        }
      })

      it('rejects negative rate', () => {
        const productField = {
          ...validProductField,
          ratePerHa: -2.5,
        }

        const result = applicationProductFieldSchema.safeParse(productField)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('positive')
        }
      })

      it('rejects rate exceeding maximum', () => {
        const productField = {
          ...validProductField,
          ratePerHa: 1001,
        }

        const result = applicationProductFieldSchema.safeParse(productField)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('less than 1000')
        }
      })

      it('accepts rate at maximum', () => {
        const productField = {
          ...validProductField,
          ratePerHa: 1000,
        }

        const result = applicationProductFieldSchema.safeParse(productField)
        expect(result.success).toBe(true)
      })

      it('accepts very small positive rate', () => {
        const productField = {
          ...validProductField,
          ratePerHa: 0.001,
        }

        const result = applicationProductFieldSchema.safeParse(productField)
        expect(result.success).toBe(true)
      })

      it('accepts decimal rate', () => {
        const productField = {
          ...validProductField,
          ratePerHa: 12.345,
        }

        const result = applicationProductFieldSchema.safeParse(productField)
        expect(result.success).toBe(true)
      })
    })

    describe('productType validation', () => {
      it('rejects invalid product type', () => {
        const productField = {
          ...validProductField,
          productType: 'INVALID',
        }

        const result = applicationProductFieldSchema.safeParse(productField)
        expect(result.success).toBe(false)
      })

      it('rejects missing product type', () => {
        const productField = {
          productId: 'prod-123',
          productName: 'Test Product',
          ratePerHa: 2.5,
        }

        const result = applicationProductFieldSchema.safeParse(productField)
        expect(result.success).toBe(false)
      })
    })
  })

  describe('productCatalogFilterSchema', () => {
    it('accepts valid filter with "all" type', () => {
      const filter = {
        searchQuery: 'test',
        typeFilter: 'all' as const,
      }

      const result = productCatalogFilterSchema.safeParse(filter)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(filter)
      }
    })

    it('accepts filter with SOLUBLE type', () => {
      const filter = {
        searchQuery: 'test',
        typeFilter: 'SOLUBLE' as const,
      }

      const result = productCatalogFilterSchema.safeParse(filter)
      expect(result.success).toBe(true)
    })

    it('accepts filter with LIQUID type', () => {
      const filter = {
        searchQuery: 'test',
        typeFilter: 'LIQUID' as const,
      }

      const result = productCatalogFilterSchema.safeParse(filter)
      expect(result.success).toBe(true)
    })

    it('accepts filter with ProductType enum values', () => {
      const filter = {
        searchQuery: 'test',
        typeFilter: ProductType.SOLUBLE,
      }

      const result = productCatalogFilterSchema.safeParse(filter)
      expect(result.success).toBe(true)
    })

    it('accepts empty search query', () => {
      const filter = {
        searchQuery: '',
        typeFilter: 'all' as const,
      }

      const result = productCatalogFilterSchema.safeParse(filter)
      expect(result.success).toBe(true)
    })

    it('accepts search query with special characters', () => {
      const filter = {
        searchQuery: 'product-123 (test)',
        typeFilter: 'all' as const,
      }

      const result = productCatalogFilterSchema.safeParse(filter)
      expect(result.success).toBe(true)
    })

    it('rejects invalid typeFilter', () => {
      const filter = {
        searchQuery: 'test',
        typeFilter: 'INVALID',
      }

      const result = productCatalogFilterSchema.safeParse(filter)
      expect(result.success).toBe(false)
    })

    it('rejects missing searchQuery', () => {
      const filter = {
        typeFilter: 'all',
      }

      const result = productCatalogFilterSchema.safeParse(filter)
      expect(result.success).toBe(false)
    })

    it('rejects missing typeFilter', () => {
      const filter = {
        searchQuery: 'test',
      }

      const result = productCatalogFilterSchema.safeParse(filter)
      expect(result.success).toBe(false)
    })
  })
})
