import { describe, it, expect } from 'vitest'
import {
  Platform,
  ListingCondition,
  ListingCategory,
  ListingColor,
  PackageSize,
  conditionMapping,
  categoryMapping,
  colorMapping,
  packageSizeMapping,
} from '~/types/listing'

describe('Platform Mappings', () => {
  const allPlatforms = Object.values(Platform)
  const allConditions = Object.values(ListingCondition)
  const allCategories = Object.values(ListingCategory)
  const allColors = Object.values(ListingColor)
  const allPackageSizes = Object.values(PackageSize)

  describe('conditionMapping', () => {
    it('should have mappings for all conditions', () => {
      const mappedConditions = Object.keys(conditionMapping)
      expect(mappedConditions.sort()).toEqual(allConditions.sort())
    })

    it('should have all platforms for each condition', () => {
      for (const condition of allConditions) {
        const platformMappings = conditionMapping[condition]
        expect(platformMappings, `Missing mapping for condition: ${condition}`).toBeDefined()

        for (const platform of allPlatforms) {
          expect(
            platformMappings[platform],
            `Missing ${platform} mapping for condition: ${condition}`
          ).toBeDefined()
          expect(
            platformMappings[platform].length,
            `Empty ${platform} mapping for condition: ${condition}`
          ).toBeGreaterThan(0)
        }
      }
    })

    it('should have non-empty string values', () => {
      for (const condition of allConditions) {
        for (const platform of allPlatforms) {
          const value = conditionMapping[condition][platform]
          expect(typeof value).toBe('string')
          expect(value.trim().length).toBeGreaterThan(0)
        }
      }
    })
  })

  describe('categoryMapping', () => {
    it('should have mappings for all categories', () => {
      const mappedCategories = Object.keys(categoryMapping)
      expect(mappedCategories.sort()).toEqual(allCategories.sort())
    })

    it('should have all platforms for each category', () => {
      for (const category of allCategories) {
        const platformMappings = categoryMapping[category]
        expect(platformMappings, `Missing mapping for category: ${category}`).toBeDefined()

        for (const platform of allPlatforms) {
          expect(
            platformMappings[platform],
            `Missing ${platform} mapping for category: ${category}`
          ).toBeDefined()
          expect(
            platformMappings[platform].length,
            `Empty ${platform} mapping for category: ${category}`
          ).toBeGreaterThan(0)
        }
      }
    })

    it('should have non-empty string values', () => {
      for (const category of allCategories) {
        for (const platform of allPlatforms) {
          const value = categoryMapping[category][platform]
          expect(typeof value).toBe('string')
          expect(value.trim().length).toBeGreaterThan(0)
        }
      }
    })
  })

  describe('colorMapping', () => {
    it('should have mappings for all colors', () => {
      const mappedColors = Object.keys(colorMapping)
      expect(mappedColors.sort()).toEqual(allColors.sort())
    })

    it('should have all platforms for each color', () => {
      for (const color of allColors) {
        const platformMappings = colorMapping[color]
        expect(platformMappings, `Missing mapping for color: ${color}`).toBeDefined()

        for (const platform of allPlatforms) {
          expect(
            platformMappings[platform],
            `Missing ${platform} mapping for color: ${color}`
          ).toBeDefined()
          expect(
            platformMappings[platform].length,
            `Empty ${platform} mapping for color: ${color}`
          ).toBeGreaterThan(0)
        }
      }
    })

    it('should have non-empty string values', () => {
      for (const color of allColors) {
        for (const platform of allPlatforms) {
          const value = colorMapping[color][platform]
          expect(typeof value).toBe('string')
          expect(value.trim().length).toBeGreaterThan(0)
        }
      }
    })
  })

  describe('packageSizeMapping', () => {
    it('should have mappings for all package sizes', () => {
      const mappedSizes = Object.keys(packageSizeMapping)
      expect(mappedSizes.sort()).toEqual(allPackageSizes.sort())
    })

    it('should have all platforms for each package size', () => {
      for (const size of allPackageSizes) {
        const platformMappings = packageSizeMapping[size]
        expect(platformMappings, `Missing mapping for size: ${size}`).toBeDefined()

        for (const platform of allPlatforms) {
          expect(
            platformMappings[platform],
            `Missing ${platform} mapping for size: ${size}`
          ).toBeDefined()
          expect(
            platformMappings[platform].length,
            `Empty ${platform} mapping for size: ${size}`
          ).toBeGreaterThan(0)
        }
      }
    })

    it('should have non-empty string values', () => {
      for (const size of allPackageSizes) {
        for (const platform of allPlatforms) {
          const value = packageSizeMapping[size][platform]
          expect(typeof value).toBe('string')
          expect(value.trim().length).toBeGreaterThan(0)
        }
      }
    })
  })

  describe('mapping consistency', () => {
    it('conditionMapping should cover all 6 conditions x 4 platforms = 24 values', () => {
      let count = 0
      for (const condition of allConditions) {
        for (const platform of allPlatforms) {
          if (conditionMapping[condition]?.[platform]) count++
        }
      }
      expect(count).toBe(6 * 4) // 6 conditions × 4 platforms
    })

    it('categoryMapping should cover all 9 categories x 4 platforms = 36 values', () => {
      let count = 0
      for (const category of allCategories) {
        for (const platform of allPlatforms) {
          if (categoryMapping[category]?.[platform]) count++
        }
      }
      expect(count).toBe(9 * 4) // 9 categories × 4 platforms
    })

    it('colorMapping should cover all 14 colors x 4 platforms = 56 values', () => {
      let count = 0
      for (const color of allColors) {
        for (const platform of allPlatforms) {
          if (colorMapping[color]?.[platform]) count++
        }
      }
      expect(count).toBe(14 * 4) // 14 colors × 4 platforms
    })

    it('packageSizeMapping should cover all 3 sizes x 4 platforms = 12 values', () => {
      let count = 0
      for (const size of allPackageSizes) {
        for (const platform of allPlatforms) {
          if (packageSizeMapping[size]?.[platform]) count++
        }
      }
      expect(count).toBe(3 * 4) // 3 sizes × 4 platforms
    })
  })
})
