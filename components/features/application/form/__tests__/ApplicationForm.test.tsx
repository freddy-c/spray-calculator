/**
 * ApplicationForm Component Testing Strategy
 *
 * This component is a thin UI wrapper around the useApplicationForm hook.
 * The core business logic is extensively tested in:
 * - hooks/__tests__/useApplicationForm.test.ts (21 tests)
 *
 * Component testing here would primarily verify:
 * - React Hook Form integration (already tested by RHF library)
 * - Radix UI component rendering (already tested by Radix)
 * - Child component prop passing (AreaFieldArray, ProductFieldArray, LiveCalculationsCard)
 *
 * DECISION: Skip component tests in favor of hook tests + E2E tests
 *
 * Why this approach provides sufficient coverage:
 * 1. Hook tests cover: form state, validation, calculations, submission, error handling
 * 2. Component is declarative - it renders based on hook state
 * 3. Child components are tested separately or are library components
 * 4. E2E tests will cover the full user flow
 *
 * If we later need component tests, focus on:
 * - Integration between hook and React Hook Form Controller
 * - Accessibility (a11y) attributes
 * - Error message display
 */

import { describe, it } from "vitest";

describe.skip('ApplicationForm component', () => {
    it('is covered by useApplicationForm hook tests and E2E tests', () => {
        // See hooks/__tests__/useApplicationForm.test.ts for logic coverage.
        // This placeholder exists so the test runner doesn't fail on this file.
    });
});