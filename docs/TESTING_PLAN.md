# Comprehensive Testing Plan for Next.js Application

> **Generated**: 2025-12-04
> **Project**: Next.js 16 + Prisma + Zod + React Hook Form
> **Status**: Ready for Implementation

---

## Table of Contents

1. [Overview](#overview)
2. [Phase 1: Testing Infrastructure Setup](#phase-1-testing-infrastructure-setup)
3. [Phase 2: Testing Layers](#phase-2-testing-layers-pyramid-approach)
4. [Phase 3: Testing Strategy by Domain](#phase-3-testing-strategy-by-domain)
5. [Phase 4: Testing Best Practices](#phase-4-testing-best-practices--patterns)
6. [Phase 5: Implementation Roadmap](#phase-5-implementation-roadmap)
7. [Phase 6: CI/CD Integration](#phase-6-cicd-integration)
8. [Quick Reference](#quick-reference)

---

## Overview

### Current State
- **No existing tests** (only placeholder files)
- **Tech Stack**: Next.js 16, React 19, Prisma, Zod, React Hook Form, Better Auth
- **Key Features**: Application management, spray calculations, authentication, dynamic forms

### Testing Goals
- **80%+ unit test coverage** for business logic
- **70%+ integration test coverage** for server actions
- **E2E coverage** for critical user flows
- **Overall target**: 75%+ code coverage

### Testing Pyramid Distribution
- **60%** Unit Tests (foundation)
- **25%** Integration Tests (API/hooks)
- **10%** Component Tests (UI)
- **5%** E2E Tests (critical paths)

---

## Phase 1: Testing Infrastructure Setup

### 1.1 Install Testing Dependencies

```bash
# Core testing framework
npm install -D vitest @vitest/ui @vitest/coverage-v8
npm install -D jsdom happy-dom

# React testing utilities
npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event

# E2E testing
npm install -D @playwright/test

# Mocking utilities
npm install -D msw@latest
npm install -D vitest-mock-extended
```

### 1.2 Configuration Files

#### `vitest.config.ts`
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'test/',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        '**/types.ts',
        'components/ui/**', // Shadcn components
        '.next/',
      ],
      thresholds: {
        lines: 75,
        functions: 75,
        branches: 70,
        statements: 75,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
```

#### `vitest.setup.ts`
```typescript
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock environment variables
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test'
process.env.BETTER_AUTH_SECRET = 'test-secret'
process.env.BETTER_AUTH_URL = 'http://localhost:3000'
```

#### `playwright.config.ts`
```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

### 1.3 Update `package.json` Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug"
  }
}
```

### 1.4 Directory Structure

```
/test
├── /factories
│   ├── application.factory.ts
│   ├── user.factory.ts
│   └── product.factory.ts
├── /mocks
│   ├── auth.ts
│   ├── prisma.ts
│   └── handlers.ts
└── test-utils.tsx

/tests
└── /e2e
    ├── auth.spec.ts
    ├── application-lifecycle.spec.ts
    └── form-validation.spec.ts
```

---

## Phase 2: Testing Layers (Pyramid Approach)

### Layer 1: Unit Tests (60% of tests)

#### 2.1.1 Zod Schema Validation Tests

**Priority: HIGH** - Schema validation is critical for data integrity

**Files to create:**
- `/lib/core/auth/__tests__/schemas.test.ts`
- `/lib/domain/application/__tests__/schemas.test.ts`
- `/lib/domain/product/__tests__/schemas.test.ts`

**What to test:**
- Valid inputs pass validation
- Invalid inputs fail with correct error messages
- Edge cases (boundary values, empty strings, special characters)
- Custom refinements (password confirmation, "DELETE" string)
- Type coercion (string to number)

#### 2.1.2 Calculation Logic Tests (CRITICAL)

**Priority: HIGHEST** - Business logic accuracy is essential

**File:** `/lib/domain/application/__tests__/calculations.test.ts`

**What to test:**
- Flow per nozzle calculation accuracy
- Pressure calculation with different k-factors
- Pressure status (ok/low/high) thresholds
- Total area summation across multiple areas
- Tank requirements (ceiling calculation)
- Spray time estimation
- Product totals (soluble vs liquid units)
- Edge cases (zero values, extremely large values)

---

### Layer 2: Integration Tests (25% of tests)

#### 2.2.1 Server Action Tests (CRITICAL)

**Priority: HIGHEST** - Business logic + security

**Files to create:**
- `/lib/domain/application/__tests__/actions.test.ts`
- `/lib/domain/product/__tests__/actions.test.ts`

**What to test:**
- Successful CRUD operations with valid data
- Authorization checks (reject if not authenticated)
- Ownership checks (reject if not user's resource)
- Error handling for invalid inputs
- Cascade deletes work correctly
- Status transitions (DRAFT → SCHEDULED → COMPLETED)
- Revert operations work correctly

**Mock requirements:**
- Mock Prisma client
- Mock Better Auth session

#### 2.2.2 React Hook Tests

**File:** `/hooks/__tests__/useApplicationForm.test.ts`

**What to test:**
- Form initialization in create/edit modes
- Field array operations (append/remove)
- Metrics calculation triggers on value change
- Form submission handler
- Loading states

---

### Layer 3: Component Tests (10% of tests)

#### 2.3.1 Form Component Tests

**Priority: HIGH**

**Files to create:**
- `/components/features/auth/__tests__/LoginForm.test.tsx`
- `/components/features/auth/__tests__/SignupForm.test.tsx`
- `/components/features/application/form/__tests__/ApplicationForm.test.tsx`
- `/components/features/application/form/__tests__/AreaFieldArray.test.tsx`
- `/components/features/application/form/__tests__/ProductFieldArray.test.tsx`

**What to test for ApplicationForm:**
- All fields render with correct default values
- Validation errors display for invalid inputs
- Add area button creates new area field
- Remove area button deletes area (min 1 validation)
- Add/remove products works correctly
- Live calculations update when values change
- Form submission calls correct server action
- Edit mode pre-populates existing data
- Slider inputs work correctly

---

### Layer 4: End-to-End Tests (5% of tests)

#### 2.4.1 Critical User Flows with Playwright

**Priority: HIGH**

**Files to create:**
- `/tests/e2e/auth.spec.ts`
- `/tests/e2e/application-lifecycle.spec.ts`
- `/tests/e2e/form-validation.spec.ts`

**Flows to test:**

**Authentication Flow:**
1. Sign up → Verify email required message
2. Login with valid credentials → Dashboard
3. Logout → Redirect to sign-in
4. Forgot password → Email sent → Reset password

**Application Lifecycle:**
1. Create application → Add areas → Add products → Save
2. View application list → See new application
3. Edit application → Modify values → Save
4. Schedule application → Status changes
5. Complete application → Add operator/weather notes
6. Delete application → Confirm deletion

**Form Validation:**
1. Submit empty form → See all validation errors
2. Invalid spray volume → Error message
3. Remove all areas → "Add area" validation
4. Live calculations update → Values change

---

## Phase 3: Testing Strategy by Domain

### 3.1 Authentication Domain

| Component | Test Type | File | Priority | Effort |
|-----------|-----------|------|----------|--------|
| Login Schema | Unit | `/lib/core/auth/__tests__/schemas.test.ts` | HIGH | 2h |
| Signup Schema | Unit | `/lib/core/auth/__tests__/schemas.test.ts` | HIGH | 2h |
| Password Reset Schema | Unit | `/lib/core/auth/__tests__/schemas.test.ts` | MEDIUM | 1h |
| LoginForm | Component | `/components/features/auth/__tests__/LoginForm.test.tsx` | MEDIUM | 3h |
| SignupForm | Component | `/components/features/auth/__tests__/SignupForm.test.tsx` | MEDIUM | 3h |
| Auth E2E Flow | E2E | `/tests/e2e/auth.spec.ts` | HIGH | 4h |
| **Total** | | | | **15h** |

### 3.2 Application Domain (CORE FEATURE)

| Component | Test Type | File | Priority | Effort |
|-----------|-----------|------|----------|--------|
| Calculations | Unit | `/lib/domain/application/__tests__/calculations.test.ts` | HIGHEST | 6h |
| Application Schema | Unit | `/lib/domain/application/__tests__/schemas.test.ts` | HIGH | 3h |
| Area Schema | Unit | `/lib/domain/application/__tests__/schemas.test.ts` | HIGH | 2h |
| Server Actions | Integration | `/lib/domain/application/__tests__/actions.test.ts` | HIGHEST | 8h |
| ApplicationForm | Component | `/components/features/application/form/__tests__/ApplicationForm.test.tsx` | HIGH | 8h |
| AreaFieldArray | Component | `/components/features/application/form/__tests__/AreaFieldArray.test.tsx` | MEDIUM | 3h |
| ProductFieldArray | Component | `/components/features/application/form/__tests__/ProductFieldArray.test.tsx` | MEDIUM | 3h |
| LiveCalculationsCard | Component | `/components/features/application/form/__tests__/LiveCalculationsCard.test.tsx` | MEDIUM | 2h |
| useApplicationForm | Integration | `/hooks/__tests__/useApplicationForm.test.ts` | HIGH | 4h |
| Application Lifecycle E2E | E2E | `/tests/e2e/application-lifecycle.spec.ts` | HIGH | 6h |
| Form Validation E2E | E2E | `/tests/e2e/form-validation.spec.ts` | MEDIUM | 3h |
| **Total** | | | | **48h** |

### 3.3 Product Domain

| Component | Test Type | File | Priority | Effort |
|-----------|-----------|------|----------|--------|
| Product Schemas | Unit | `/lib/domain/product/__tests__/schemas.test.ts` | MEDIUM | 2h |
| Product Actions | Integration | `/lib/domain/product/__tests__/actions.test.ts` | MEDIUM | 4h |
| ProductCatalog | Component | `/components/features/application/form/__tests__/ProductCatalogDialog.test.tsx` | LOW | 3h |
| CreateProductForm | Component | `/components/features/application/form/__tests__/CreateProductForm.test.tsx` | LOW | 2h |
| **Total** | | | | **11h** |

### 3.4 Total Estimated Effort

| Domain | Hours |
|--------|-------|
| Authentication | 15h |
| Application | 48h |
| Product | 11h |
| Infrastructure Setup | 8h |
| **TOTAL** | **82h (~2 weeks)** |

---

## Phase 4: Testing Best Practices & Patterns

### 4.1 Test Data Factories

Create `/test/factories/` directory with reusable factory functions:

**`application.factory.ts`** - Generate valid application test data
**`user.factory.ts`** - Generate user test data
**`product.factory.ts`** - Generate product test data

Example:
```typescript
export const createMockApplication = (overrides = {}) => ({
  id: 'app-123',
  name: 'Test Application',
  userId: 'user-123',
  status: 'DRAFT',
  nozzleId: 'syngenta-025-xc',
  sprayVolumeLHa: 300,
  areas: [createMockArea()],
  products: [],
  ...overrides
})
```

### 4.2 Custom Test Utilities

Create `/test/test-utils.tsx`:

```typescript
import { render } from '@testing-library/react'
import { Toaster } from 'sonner'

export const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <>
      {ui}
      <Toaster />
    </>
  )
}

export * from '@testing-library/react'
export { renderWithProviders as render }
```

### 4.3 Mock Strategy

**Auth Mocks:**
```typescript
// /test/mocks/auth.ts
export const mockSession = {
  user: { id: 'user-123', email: 'test@example.com', name: 'Test User' },
  session: { token: 'mock-token' }
}

export const mockAuth = {
  api: {
    getSession: vi.fn(() => Promise.resolve(mockSession))
  }
}
```

**Prisma Mocks:**
```typescript
// /test/mocks/prisma.ts
import { PrismaClient } from '@prisma/client'
import { mockDeep, mockReset } from 'vitest-mock-extended'

export const prismaMock = mockDeep<PrismaClient>()

beforeEach(() => {
  mockReset(prismaMock)
})
```

### 4.4 Coverage Goals

| Test Type | Target Coverage |
|-----------|----------------|
| Unit Tests | 80%+ |
| Integration Tests | 70%+ |
| E2E Tests | Critical paths only |
| **Overall** | **75%+** |

### 4.5 Testing Principles

1. **Test Behavior, Not Implementation**
   - Test what the user sees/does, not internal state
   - Avoid testing implementation details

2. **Follow the Testing Trophy**
   - More integration tests than unit tests
   - Fewer E2E tests (slow and brittle)

3. **Write Tests That Catch Real Bugs**
   - Focus on business logic and user flows
   - Don't test framework code or libraries

4. **Keep Tests Fast**
   - Mock external dependencies (DB, API calls)
   - Run unit tests in parallel
   - Use test database for integration tests

5. **Make Tests Readable**
   - Use descriptive test names
   - Arrange-Act-Assert pattern
   - One assertion per test (when possible)

---

## Phase 5: Implementation Roadmap

### Week 1: Setup & Foundation (40 hours)

#### Day 1-2: Infrastructure Setup (16h)
- Install all testing dependencies
- Create Vitest configuration
- Create Playwright configuration
- Set up test utilities and custom render functions
- Create mock files (auth, Prisma)
- Create test data factories
- Set up test scripts in package.json
- Test the setup with a simple test

#### Day 3-5: Calculation & Schema Tests (24h)
- Write comprehensive calculation tests (HIGHEST ROI)
  - Flow calculation
  - Pressure calculation
  - Pressure status detection
  - Total area summation
  - Spray volume calculation
  - Tanks required
  - Spray time
  - Product totals
  - Edge cases
- Write authentication schema tests
- Write application schema tests
- Write product schema tests

### Week 2: Server Action Tests (40 hours)

#### Day 6-7: Application Action Tests (16h)
- Test createApplication
- Test getApplications
- Test getApplication
- Test updateApplication
- Test deleteApplication
- Test authorization checks for all actions

#### Day 8-9: Status Transition Tests (16h)
- Test scheduleApplication
- Test completeApplication
- Test revertToDraft
- Test revertToScheduled
- Test edge cases and validation

#### Day 10: Product Action Tests (8h)
- Test getProducts (public + private filtering)
- Test createCustomProduct
- Test authorization

### Week 3: Component Tests (40 hours)

#### Day 11-12: Auth Component Tests (16h)
- Test LoginForm
- Test SignupForm
- Test ForgotPasswordForm
- Test ResetPasswordForm
- Test DeleteAccountForm

#### Day 13-15: Application Form Tests (24h)
- Test ApplicationForm (create mode)
- Test ApplicationForm (edit mode)
- Test AreaFieldArray
- Test ProductFieldArray
- Test LiveCalculationsCard
- Test form validation
- Test form submission

### Week 4: Integration & E2E Tests + CI/CD (40 hours)

#### Day 16-17: Hook Integration Tests (16h)
- Test useApplicationForm hook
- Test form state management
- Test field array operations
- Test calculations integration

#### Day 18-19: E2E Tests (16h)
- Write authentication E2E tests
- Write application lifecycle E2E tests
- Write form validation E2E tests
- Test critical user paths

#### Day 20: CI/CD & Documentation (8h)
- Set up GitHub Actions workflow
- Configure coverage reporting
- Add coverage badges to README
- Document testing practices
- Create test maintenance guide

### Summary

| Week | Focus | Hours | Key Deliverables |
|------|-------|-------|------------------|
| 1 | Setup & Foundation | 40h | Infrastructure, calculations, schemas |
| 2 | Server Actions | 40h | All CRUD + status transitions |
| 3 | Component Tests | 40h | Forms, field arrays, validation |
| 4 | Integration & E2E | 40h | Hooks, E2E flows, CI/CD |
| **TOTAL** | | **160h** | **Complete test suite** |

---

## Phase 6: CI/CD Integration

### GitHub Actions Workflow

Create `.github/workflows/test.yml`:

```yaml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    name: Run Tests
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run Prisma migrations
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test

      - name: Run unit and integration tests
        run: npm run test:coverage
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test
          BETTER_AUTH_SECRET: test-secret
          BETTER_AUTH_URL: http://localhost:3000

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
          fail_ci_if_error: true

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Build application
        run: npm run build
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test

      - name: Run E2E tests
        run: npm run test:e2e
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test
          BETTER_AUTH_SECRET: test-secret
          BETTER_AUTH_URL: http://localhost:3000

      - name: Upload Playwright report
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

---

## Quick Reference

### Common Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with UI
npm test:ui

# Run with coverage
npm test:coverage

# Run specific test file
npm test calculations.test.ts

# Run tests matching pattern
npm test -- application

# Run E2E tests
npm test:e2e

# Run E2E tests in UI mode
npm test:e2e:ui

# Run E2E tests in debug mode
npm test:e2e:debug

# Run single E2E test
npm test:e2e auth.spec.ts
```

### Test File Naming Conventions

- Unit tests: `*.test.ts`
- Component tests: `*.test.tsx`
- E2E tests: `*.spec.ts`

### Test Structure (AAA Pattern)

```typescript
it('should do something', () => {
  // Arrange - Set up test data
  const input = { ... }

  // Act - Perform action
  const result = myFunction(input)

  // Assert - Verify result
  expect(result).toBe(expected)
})
```

### Useful Testing Library Queries

```typescript
// Prefer these (accessibility-friendly)
screen.getByRole('button', { name: /submit/i })
screen.getByLabelText(/email/i)
screen.getByText(/hello world/i)

// Avoid these
screen.getByTestId('submit-button')
container.querySelector('.button')
```

### Mock Patterns

```typescript
// Mock function
const mockFn = vi.fn()
mockFn.mockReturnValue('value')
mockFn.mockResolvedValue('async value')

// Mock module
vi.mock('@/lib/auth', () => ({
  auth: mockAuth
}))

// Spy on function
const spy = vi.spyOn(object, 'method')
expect(spy).toHaveBeenCalledWith(arg)
```

---

## Next Steps

1. **Review and approve this plan**
2. **Set up testing infrastructure** (Week 1, Day 1-2)
3. **Start with calculation tests** (highest ROI)
4. **Iterate through the roadmap**
5. **Maintain >75% coverage going forward**

---

## Maintenance & Best Practices

### After Implementation

1. Run tests before every commit
2. Keep coverage above 75%
3. Update tests when refactoring
4. Add tests for new features
5. Review test failures in CI immediately

### Red Flags to Avoid

- Skipping tests with `.skip()` without a reason
- Mocking too much (test real behavior)
- Testing implementation details
- Flaky tests (fix or remove)
- Slow tests (>100ms for unit tests)

### Resources

- [Testing Library Docs](https://testing-library.com/)
- [Vitest Docs](https://vitest.dev/)
- [Playwright Docs](https://playwright.dev/)
- [Kent C. Dodds Testing Blog](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Generated with Claude Code**
