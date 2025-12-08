# E2E Testing Refactor Plan

## Current State Analysis

### What You Have Now
- **1 E2E test file**: [test/e2e/application-lifecycle.spec.ts](../test/e2e/application-lifecycle.spec.ts)
  - Only implements Step 1 (creation) out of 7 planned steps
  - Tests low-level calculation details (should be in unit tests)
  - Uses `test.describe.serial()` for sequential execution
  - Very long (162 lines) for a single user action

- **Strong unit test coverage**:
  - ✅ [lib/domain/application/__tests__/calculations.test.ts](../lib/domain/application/__tests__/calculations.test.ts) - Calculation logic
  - ✅ [hooks/__tests__/useApplicationForm.test.ts](../hooks/__tests__/useApplicationForm.test.ts) - Hook logic (21 tests)
  - ✅ [lib/domain/application/__tests__/schemas.test.ts](../lib/domain/application/__tests__/schemas.test.ts) - Schema validation
  - ✅ [lib/domain/application/__tests__/actions.test.ts](../lib/domain/application/__tests__/actions.test.ts) - Server actions

### Problems to Address
1. **Over-testing at E2E level** - Testing calculation formulas like "5.34 bar" belongs in unit tests
2. **Brittle tests** - Exact text matching breaks easily
3. **Incomplete lifecycle** - Missing steps 2-7 despite the file name
4. **Serial execution** - Slow, interdependent tests
5. **Poor separation of concerns** - E2E tests overlap with unit test responsibilities

---

## Recommended Testing Strategy

### Testing Pyramid Distribution

```
        /\
       /  \        E2E (Playwright)
      / E2E\       - Critical user journeys
     /______\      - Happy paths + key edge cases
    /        \
   / Integ.   \    Integration (Vitest)
  /____________\   - Component + hook integration
 /              \  - API route testing
/   Unit Tests  \  Unit (Vitest)
/________________\ - Business logic, calculations, validation
```

### What to Test Where

#### Unit Tests (Vitest) ✅ Already Good
- ✅ Calculation formulas
- ✅ Schema validation
- ✅ Hook logic
- ✅ Server action logic
- ✅ Utility functions

#### E2E Tests (Playwright) ⚠️ Needs Refactoring
Focus on **user-facing behavior**, not implementation:
- User can create application
- User can view applications list
- User can edit application
- User can change status (Draft → Scheduled → Completed)
- User can delete application
- Form validation prevents invalid submission

---

## Refactoring Plan

### Phase 1: Simplify Existing Test ✂️

**File**: `test/e2e/application-lifecycle.spec.ts`

**Changes**:
1. Remove calculation assertions (5.34 bar, flow rates, etc.) - already tested in unit tests
2. Simplify to verify form submission works end-to-end
3. Focus on user-visible outcomes, not intermediate calculations
4. Remove serial execution (`test.describe.serial()`)
5. Make test independent (create its own data, don't share state)

**Before** (162 lines):
```typescript
test.describe.serial('Application Lifecycle', () => {
  let createdApplicationId: string | null = null

  test('Step 1: Create...', async ({ page }) => {
    // 150+ lines testing every calculation detail
    await expect(page.getByText('5.34 bar')).toBeVisible()
    // etc...
  })
})
```

**After** (~40 lines):
```typescript
test('User can create application with areas and products', async ({ page }) => {
  await page.goto('/dashboard/applications/new')

  // Fill minimal required fields
  await page.getByLabel('Application name').fill('E2E Test App')
  await page.getByLabel('Label').fill('Green 1')
  await page.getByLabel('Size (ha)').fill('5.0')

  // Add a product
  await page.getByRole('button', { name: 'Add Product' }).click()
  await page.getByRole('button', { name: 'Select' }).first().click()
  await page.getByLabel('Application Rate').fill('25')

  await page.getByRole('button', { name: 'Save Application' }).click()

  // Verify success
  await expect(page.getByText(/saved successfully/i)).toBeVisible()
})
```

### Phase 2: Add Missing Lifecycle Tests 🆕

Create **independent** tests for each user journey:

#### New Test File: `test/e2e/application-crud.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('Application Management', () => {
  test('User can view applications in dashboard', async ({ page }) => {
    await page.goto('/dashboard')

    // Verify table renders
    await expect(page.getByRole('table')).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Name' })).toBeVisible()
  })

  test('User can create new application', async ({ page }) => {
    await page.goto('/dashboard/applications/new')

    await page.getByLabel('Application name').fill('New Test Application')
    await page.getByLabel('Label').fill('Test Area')
    await page.getByLabel('Size (ha)').fill('2.5')

    await page.getByRole('button', { name: 'Save Application' }).click()

    await expect(page.getByText(/saved successfully/i)).toBeVisible()
  })

  test('User can view application details', async ({ page }) => {
    // Create test data first
    await page.goto('/dashboard/applications/new')
    await page.getByLabel('Application name').fill('Detail Test App')
    await page.getByLabel('Label').fill('Area 1')
    await page.getByLabel('Size (ha)').fill('3.0')
    await page.getByRole('button', { name: 'Save Application' }).click()

    // Navigate to dashboard
    await page.goto('/dashboard')

    // Click on the application
    await page.getByRole('link', { name: 'Detail Test App' }).click()

    // Verify details page
    await expect(page.getByText('Detail Test App')).toBeVisible()
    await expect(page.getByText('Area 1')).toBeVisible()
  })

  test('User can edit application', async ({ page }) => {
    // Create test data
    await page.goto('/dashboard/applications/new')
    await page.getByLabel('Application name').fill('Edit Test App')
    await page.getByLabel('Label').fill('Original Area')
    await page.getByLabel('Size (ha)').fill('1.0')
    await page.getByRole('button', { name: 'Save Application' }).click()

    // Navigate to edit page
    await page.goto('/dashboard')
    await page.getByRole('button', { name: 'Actions' }).first().click()
    await page.getByRole('menuitem', { name: 'Edit' }).click()

    // Edit the application
    await page.getByLabel('Application name').fill('Edited Application')
    await page.getByRole('button', { name: 'Save Changes' }).click()

    await expect(page.getByText(/updated successfully/i)).toBeVisible()
  })

  test('User can delete application', async ({ page }) => {
    // Create test data
    await page.goto('/dashboard/applications/new')
    await page.getByLabel('Application name').fill('Delete Me')
    await page.getByLabel('Label').fill('Area')
    await page.getByLabel('Size (ha)').fill('1.0')
    await page.getByRole('button', { name: 'Save Application' }).click()

    // Navigate to dashboard
    await page.goto('/dashboard')

    // Delete the application
    await page.getByRole('button', { name: 'Actions' }).first().click()
    await page.getByRole('menuitem', { name: 'Delete' }).click()
    await page.getByRole('button', { name: 'Confirm' }).click()

    await expect(page.getByText(/deleted successfully/i)).toBeVisible()
  })
})
```

#### New Test File: `test/e2e/application-status.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('Application Status Management', () => {
  test('User can schedule a draft application', async ({ page }) => {
    // Create draft application
    await page.goto('/dashboard/applications/new')
    await page.getByLabel('Application name').fill('Schedule Test')
    await page.getByLabel('Label').fill('Area')
    await page.getByLabel('Size (ha)').fill('1.0')
    await page.getByRole('button', { name: 'Save Application' }).click()

    // Schedule it
    await page.goto('/dashboard')
    await page.getByRole('button', { name: 'Actions' }).first().click()
    await page.getByRole('menuitem', { name: 'Schedule' }).click()

    // Fill schedule form
    await page.getByLabel('Scheduled Date').fill('2025-12-25')
    await page.getByRole('button', { name: 'Schedule' }).click()

    await expect(page.getByText(/scheduled successfully/i)).toBeVisible()
    await expect(page.getByText('Scheduled')).toBeVisible()
  })

  test('User can complete a scheduled application', async ({ page }) => {
    // Create and schedule application
    await page.goto('/dashboard/applications/new')
    await page.getByLabel('Application name').fill('Complete Test')
    await page.getByLabel('Label').fill('Area')
    await page.getByLabel('Size (ha)').fill('1.0')
    await page.getByRole('button', { name: 'Save Application' }).click()

    await page.goto('/dashboard')
    await page.getByRole('button', { name: 'Actions' }).first().click()
    await page.getByRole('menuitem', { name: 'Schedule' }).click()
    await page.getByLabel('Scheduled Date').fill('2025-12-25')
    await page.getByRole('button', { name: 'Schedule' }).click()

    // Mark as complete
    await page.getByRole('button', { name: 'Actions' }).first().click()
    await page.getByRole('menuitem', { name: 'Complete' }).click()

    await page.getByLabel('Completed Date').fill('2025-12-26')
    await page.getByRole('button', { name: 'Complete' }).click()

    await expect(page.getByText(/completed successfully/i)).toBeVisible()
    await expect(page.getByText('Completed')).toBeVisible()
  })

  test('User can revert completed application to scheduled', async ({ page }) => {
    // Create, schedule, and complete
    await page.goto('/dashboard/applications/new')
    await page.getByLabel('Application name').fill('Revert Test')
    await page.getByLabel('Label').fill('Area')
    await page.getByLabel('Size (ha)').fill('1.0')
    await page.getByRole('button', { name: 'Save Application' }).click()

    await page.goto('/dashboard')
    await page.getByRole('button', { name: 'Actions' }).first().click()
    await page.getByRole('menuitem', { name: 'Schedule' }).click()
    await page.getByLabel('Scheduled Date').fill('2025-12-25')
    await page.getByRole('button', { name: 'Schedule' }).click()

    await page.getByRole('button', { name: 'Actions' }).first().click()
    await page.getByRole('menuitem', { name: 'Complete' }).click()
    await page.getByLabel('Completed Date').fill('2025-12-26')
    await page.getByRole('button', { name: 'Complete' }).click()

    // Revert to scheduled
    await page.getByRole('button', { name: 'Actions' }).first().click()
    await page.getByRole('menuitem', { name: 'Revert to Scheduled' }).click()

    await expect(page.getByText('Scheduled')).toBeVisible()
  })
})
```

#### New Test File: `test/e2e/application-form-validation.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('Application Form Validation', () => {
  test('Prevents submission with empty name', async ({ page }) => {
    await page.goto('/dashboard/applications/new')

    // Don't fill application name
    await page.getByLabel('Label').fill('Area')
    await page.getByLabel('Size (ha)').fill('1.0')

    await page.getByRole('button', { name: 'Save Application' }).click()

    // Should show validation error
    await expect(page.getByText(/name.*required/i)).toBeVisible()
  })

  test('Prevents submission with invalid area size', async ({ page }) => {
    await page.goto('/dashboard/applications/new')

    await page.getByLabel('Application name').fill('Test')
    await page.getByLabel('Size (ha)').fill('-5')

    await page.getByRole('button', { name: 'Save Application' }).click()

    await expect(page.getByText(/must be positive/i)).toBeVisible()
  })

  test('Requires at least one area', async ({ page }) => {
    await page.goto('/dashboard/applications/new')

    await page.getByLabel('Application name').fill('Test')

    // Remove the default area
    await page.getByRole('button', { name: 'Remove Area' }).click()

    await page.getByRole('button', { name: 'Save Application' }).click()

    await expect(page.getByText(/at least one area/i)).toBeVisible()
  })
})
```

### Phase 3: Test Data Strategy 🗄️

Each test should be **independent**. Two approaches:

#### Option A: Create Data Per Test (Recommended)
- Each test creates its own application
- No shared state between tests
- Tests can run in parallel
- Easier to understand and debug

```typescript
test('User can edit application', async ({ page }) => {
  // Create test data inline
  await page.goto('/dashboard/applications/new')
  await page.getByLabel('Application name').fill('Edit Test')
  // ... submit

  // Then test editing
  await page.goto('/dashboard')
  // ... rest of test
})
```

#### Option B: Test Fixtures (Alternative)
Use Playwright fixtures for reusable test data:

```typescript
// test/e2e/fixtures.ts
import { test as base } from '@playwright/test'

export const test = base.extend({
  testApplication: async ({ page }, use) => {
    // Create a test application
    await page.goto('/dashboard/applications/new')
    await page.getByLabel('Application name').fill('Fixture App')
    await page.getByLabel('Label').fill('Area')
    await page.getByLabel('Size (ha)').fill('1.0')
    await page.getByRole('button', { name: 'Save' }).click()

    await use({ name: 'Fixture App' })

    // Cleanup (optional)
  },
})

// In tests:
test('Edit application', async ({ page, testApplication }) => {
  // testApplication is already created
  await page.goto('/dashboard')
  // ...
})
```

**Recommendation**: Start with **Option A** (inline data creation) for simplicity.

---

## Implementation Checklist

### Step 1: Refactor Existing Test ✂️
- [ ] Remove calculation detail assertions
- [ ] Remove `test.describe.serial()`
- [ ] Simplify to ~40 lines focusing on form submission
- [ ] Make test independent (don't store `createdApplicationId`)
- [ ] Update test name to match actual scope

### Step 2: Add CRUD Tests 🆕
- [ ] Create `test/e2e/application-crud.spec.ts`
- [ ] Implement "view applications" test
- [ ] Implement "create application" test
- [ ] Implement "view details" test
- [ ] Implement "edit application" test
- [ ] Implement "delete application" test

### Step 3: Add Status Management Tests 🆕
- [ ] Create `test/e2e/application-status.spec.ts`
- [ ] Implement "schedule application" test
- [ ] Implement "complete application" test
- [ ] Implement "revert to scheduled" test
- [ ] Implement "revert to draft" test

### Step 4: Add Validation Tests 🆕
- [ ] Create `test/e2e/application-form-validation.spec.ts`
- [ ] Test empty name validation
- [ ] Test invalid area size validation
- [ ] Test minimum area requirement
- [ ] Test product validation (if applicable)

### Step 5: Update Configuration ⚙️
- [ ] Verify `fullyParallel: true` in playwright.config.ts (already set ✅)
- [ ] Consider organizing tests with tags for selective running
- [ ] Update CI/CD to run new test files

### Step 6: Documentation 📝
- [ ] Document testing strategy in README
- [ ] Add comments explaining test independence
- [ ] Update contributing guidelines with testing best practices

---

## Best Practices Going Forward

### DO ✅
- **Focus on user behavior** - "User can create application" not "Form calculates 5.34 bar"
- **Keep tests independent** - Each test creates its own data
- **Use flexible assertions** - Match patterns like `/saved successfully/i` instead of exact text
- **Test critical paths** - Happy path + key error cases
- **Run tests in parallel** - Faster CI/CD

### DON'T ❌
- **Don't test implementation details** - Calculation formulas belong in unit tests
- **Don't share state** - No `test.describe.serial()` or shared variables
- **Don't assert exact values** - Brittle and couples to business logic
- **Don't over-test** - E2E tests are expensive, focus on integration
- **Don't duplicate unit tests** - If it's tested in Vitest, trust it

---

## Migration Path

### Week 1: Foundation
1. Refactor existing test (Step 1)
2. Add CRUD tests (Step 2)
3. Verify all tests pass independently

### Week 2: Completion
4. Add status management tests (Step 3)
5. Add validation tests (Step 4)
6. Update documentation (Step 6)

### Week 3: Polish
7. Review test coverage
8. Optimize test performance
9. Add missing edge cases if needed

---

## Expected Outcomes

### Before Refactoring
- 1 E2E test file
- 162 lines testing only creation
- Serial execution (slow)
- Tests low-level calculations
- Incomplete lifecycle coverage

### After Refactoring
- 4 E2E test files (~400 lines total)
- Complete lifecycle coverage (create, read, update, delete, status changes)
- Parallel execution (fast)
- Focused on user journeys
- Clear separation: E2E tests behavior, unit tests logic

### Test Execution Time
- **Before**: ~90 seconds (serial, 1 test)
- **After**: ~30-45 seconds (parallel, ~15 tests across 3 browsers)

---

## Questions to Resolve

Before implementing, clarify:

1. **Edit Flow**: How do users access the edit page? Via:
   - Dashboard actions menu?
   - Detail page "Edit" button?
   - Both?

2. **Status Transitions**: Which status transitions are allowed?
   - Draft → Scheduled ✓
   - Scheduled → Completed ✓
   - Completed → Scheduled ✓ (revert)
   - Draft → Completed? (skip scheduling?)

3. **Validation Messages**: Are validation messages consistent?
   - Check actual error message text for assertions
   - Ensure they're user-friendly for E2E matching

4. **Test Data Cleanup**: Should tests clean up created data?
   - Leave data (faster tests, easier debugging)
   - Clean up (cleaner database, but slower)
   - Use test database (recommended)

5. **CI Environment**: Running in CI?
   - Ensure test database is isolated
   - Configure proper timeouts
   - Consider visual regression testing

---

## Summary

Your current E2E test is **too detailed** and **incomplete**. The plan above:

1. **Simplifies** the existing test to focus on user behavior
2. **Completes** the lifecycle with independent tests for each feature
3. **Separates concerns** - E2E for integration, unit tests for logic
4. **Enables parallelism** - Faster test execution
5. **Improves maintainability** - Each test is independent and focused

This approach follows industry best practices and leverages your already-strong unit test coverage.
