import { test, expect } from '@playwright/test'
import { resetDatabase, seedApplication } from '../support/db-setup'

/**
 * Application Status Change E2E Tests
 *
 * Tests the complete application status workflow:
 * - DRAFT → SCHEDULED → COMPLETED
 * - Reverting to DRAFT from any status
 * - Updating status details
 *
 * These tests were designed using the Playwright MCP server to explore
 * and understand the application's status change functionality.
 */

test.describe('Application Status Changes', () => {
  // Clean up all test user's applications after each test
  test.afterEach(async () => {
    await resetDatabase()
  })

  test.describe('Status Transitions: Draft → Scheduled', () => {
    test('User can change application status from Draft to Scheduled', async ({ page }) => {
      // Seed a DRAFT application
      const appId = await seedApplication({
        name: 'Status Test - Draft to Scheduled',
        status: 'DRAFT',
        areas: [
          { label: 'Test Green', type: 'green', sizeHa: 2.5 }
        ]
      })

      // Navigate to application detail page
      await page.goto(`/dashboard/applications/${appId}`)

      // Verify current status is Draft
      await expect(page.getByRole('button', { name: 'Draft' })).toBeVisible()

      // Open the status dropdown
      await page.getByRole('button', { name: 'Draft' }).click()

      // Verify all status options are visible
      await expect(page.getByRole('menuitem', { name: /^Draft/ })).toBeVisible()
      await expect(page.getByRole('menuitem', { name: /^Scheduled/ })).toBeVisible()
      await expect(page.getByRole('menuitem', { name: /^Completed/ })).toBeVisible()

      // Click on "Scheduled" status
      await page.getByRole('menuitem', { name: /^Scheduled/ }).click()

      // Schedule dialog should open
      await expect(page.getByRole('dialog', { name: 'Schedule Application' })).toBeVisible()
      await expect(page.getByText('Set when this application will be performed.')).toBeVisible()

      // Fill in the scheduled date (7 days from now)
      const scheduledDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      const dateString = scheduledDate.toISOString().split('T')[0]

      await page.getByLabel('Scheduled Date').fill(dateString)

      // Submit the schedule form
      await page.getByRole('button', { name: 'Schedule' }).click()

      // Verify success toast message
      await expect(page.getByText(/scheduled successfully/i)).toBeVisible()

      // Verify status button now shows "Scheduled"
      await expect(page.getByRole('button', { name: 'Scheduled' })).toBeVisible()

      // Verify the scheduled date is displayed
      await expect(page.getByText(/Scheduled:/)).toBeVisible()
    })

    test('User can update scheduled date for already scheduled application', async ({ page }) => {
      // Seed a SCHEDULED application
      const appId = await seedApplication({
        name: 'Status Test - Update Scheduled Date',
        status: 'SCHEDULED',
        areas: [
          { label: 'Test Fairway', type: 'fairway', sizeHa: 5.0 }
        ]
      })

      await page.goto(`/dashboard/applications/${appId}`)

      // Open the status dropdown and click on Scheduled again (to update)
      await page.getByRole('button', { name: 'Scheduled' }).click()
      await page.getByRole('menuitem', { name: /^Scheduled/ }).click()

      // Dialog should open to update the date
      await expect(page.getByRole('dialog', { name: 'Schedule Application' })).toBeVisible()

      // Change the scheduled date
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      
      const dateString = nextWeek.toISOString().split('T')[0]

      await page.getByLabel('Scheduled Date').fill(dateString)
      await page.getByRole('button', { name: 'Schedule' }).click()

      // Verify success
      await expect(page.getByText(/scheduled successfully/i)).toBeVisible()
    })

    test('User can cancel scheduling', async ({ page }) => {
      const appId = await seedApplication({
        name: 'Status Test - Cancel Schedule',
        status: 'DRAFT',
        areas: [
          { label: 'Test Area', type: 'green', sizeHa: 1.0 }
        ]
      })

      await page.goto(`/dashboard/applications/${appId}`)

      // Open schedule dialog
      await page.getByRole('button', { name: 'Draft' }).click()
      await page.getByRole('menuitem', { name: /^Scheduled/ }).click()
      await expect(page.getByRole('dialog', { name: 'Schedule Application' })).toBeVisible()

      // Click Cancel
      await page.getByRole('button', { name: 'Cancel' }).click()

      // Dialog should close and status should remain Draft
      await expect(page.getByRole('dialog', { name: 'Schedule Application' })).not.toBeVisible()
      await expect(page.getByRole('button', { name: 'Draft' })).toBeVisible()
    })
  })

  test.describe('Status Transitions: Scheduled → Completed', () => {
    test('User can change application status from Scheduled to Completed', async ({ page }) => {
      // Seed a SCHEDULED application
      const appId = await seedApplication({
        name: 'Status Test - Scheduled to Completed',
        status: 'SCHEDULED',
        areas: [
          { label: 'Test Tee', type: 'tee', sizeHa: 0.8 }
        ]
      })

      await page.goto(`/dashboard/applications/${appId}`)

      // Verify current status is Scheduled
      await expect(page.getByRole('button', { name: 'Scheduled' })).toBeVisible()

      // Open the status dropdown and click Completed
      await page.getByRole('button', { name: 'Scheduled' }).click()
      await page.getByRole('menuitem', { name: /^Completed/ }).click()

      // Complete dialog should open
      await expect(page.getByRole('dialog', { name: 'Complete Application' })).toBeVisible()
      await expect(page.getByText('Record the completion details for this application.')).toBeVisible()

      // Fill in completion details
      const today = new Date().toISOString().split('T')[0]
      await page.getByLabel('Completed Date *').fill(today)
      await page.getByLabel('Operator').fill('John Smith')
      await page.getByLabel('Weather Conditions').fill('Sunny, 22°C, light breeze')
      await page.getByLabel('Notes').fill('Application completed successfully. No issues encountered.')

      // Submit the completion form
      await page.getByRole('button', { name: 'Complete' }).click()

      // Verify success toast message
      await expect(page.getByText(/completed successfully/i)).toBeVisible()

      // Verify status button now shows "Completed"
      await expect(page.getByRole('button', { name: 'Completed' })).toBeVisible()

      // Verify the completed date is displayed
      await expect(page.getByText(/Completed:/)).toBeVisible()

      // Verify the "Completion Details" card is displayed
      await expect(page.getByText('Completion Details')).toBeVisible()
      await expect(page.getByText('John Smith')).toBeVisible()
      await expect(page.getByText('Sunny, 22°C, light breeze')).toBeVisible()
      await expect(page.getByText('Application completed successfully. No issues encountered.')).toBeVisible()
    })

    test('User can update completion details for already completed application', async ({ page }) => {
      const appId = await seedApplication({
        name: 'Status Test - Update Completion',
        status: 'COMPLETED',
        areas: [
          { label: 'Test Area', type: 'green', sizeHa: 1.0 }
        ]
      })

      await page.goto(`/dashboard/applications/${appId}`)

      // Open status dropdown and click Completed again (to update)
      await page.getByRole('button', { name: 'Completed' }).click()
      await page.getByRole('menuitem', { name: /^Completed/ }).click()

      // Dialog should open to update completion details
      await expect(page.getByRole('dialog', { name: 'Complete Application' })).toBeVisible()

      await page.getByLabel('Completed Date *').fill(new Date().toISOString().split('T')[0])

      // Update details
      await page.getByLabel('Operator').fill('Jane Doe')
      await page.getByLabel('Weather Conditions').fill('Cloudy, 18°C')
      await page.getByRole('button', { name: 'Complete' }).click()

      // Verify success
      await expect(page.getByText(/completed successfully/i)).toBeVisible()

      // Verify updated details are shown
      await expect(page.getByText('Jane Doe')).toBeVisible()
      await expect(page.getByText('Cloudy, 18°C')).toBeVisible()
    })

    test.describe('Status Transitions: Draft → Completed (Skip Scheduled)', () => {
      test('User can change application status directly from Draft to Completed', async ({ page }) => {
        const appId = await seedApplication({
          name: 'Status Test - Draft to Completed',
          status: 'DRAFT',
          areas: [
            { label: 'Test Rough', type: 'rough', sizeHa: 3.0 }
          ]
        })

        await page.goto(`/dashboard/applications/${appId}`)

        // Open the status dropdown and click Completed directly
        await page.getByRole('button', { name: 'Draft' }).click()
        await page.getByRole('menuitem', { name: /^Completed/ }).click()

        // Complete dialog should open
        await expect(page.getByRole('dialog', { name: 'Complete Application' })).toBeVisible()

        // Fill in completion details
        const today = new Date().toISOString().split('T')[0]
        await page.getByLabel('Completed Date *').fill(today)
        await page.getByLabel('Operator').fill('Sarah Johnson')

        // Submit
        await page.getByRole('button', { name: 'Complete' }).click()

        // Verify status changed directly to Completed
        await expect(page.getByText(/completed successfully/i)).toBeVisible()
        await expect(page.getByRole('button', { name: 'Completed' })).toBeVisible()
      })
    })

    test.describe('Reverting to Draft', () => {
      test('User can revert application from Scheduled to Draft', async ({ page }) => {
        const appId = await seedApplication({
          name: 'Status Test - Revert Scheduled to Draft',
          status: 'SCHEDULED',
          areas: [
            { label: 'Test Area', type: 'green', sizeHa: 1.5 }
          ]
        })

        await page.goto(`/dashboard/applications/${appId}`)

        // Verify current status is Scheduled
        await expect(page.getByRole('button', { name: 'Scheduled' })).toBeVisible()

        // Open the status dropdown and click Draft
        await page.getByRole('button', { name: 'Scheduled' }).click()
        await page.getByRole('menuitem', { name: /^Draft/ }).click()

        // Confirmation dialog should appear
        await expect(page.getByRole('alertdialog')).toBeVisible()

        // Confirm the revert action
        await page.getByRole('button', { name: 'Revert to Draft' }).click()

        // Verify success
        await expect(page.getByText(/reverted to draft/i)).toBeVisible()
        await expect(page.getByRole('button', { name: 'Draft' })).toBeVisible()

        // Scheduled date should no longer be visible
        await expect(page.getByText(/Scheduled:/)).not.toBeVisible()
      })

      test('User can revert application from Completed to Draft', async ({ page }) => {
        const appId = await seedApplication({
          name: 'Status Test - Revert Completed to Draft',
          status: 'COMPLETED',
          areas: [
            { label: 'Test Area', type: 'green', sizeHa: 2.0 }
          ]
        })

        await page.goto(`/dashboard/applications/${appId}`)

        // Verify current status is Completed
        await expect(page.getByRole('button', { name: 'Completed' })).toBeVisible()

        // Open the status dropdown and click Draft
        await page.getByRole('button', { name: 'Completed' }).click()
        await page.getByRole('menuitem', { name: /^Draft/ }).click()

        // Confirmation dialog should appear with warning about clearing completion details
        await expect(page.getByRole('alertdialog')).toBeVisible()

        // Confirm the revert action
        await page.getByRole('button', { name: 'Revert to Draft' }).click()

        // Verify success
        await expect(page.getByText(/reverted to draft/i)).toBeVisible()
        await expect(page.getByRole('button', { name: 'Draft' })).toBeVisible()

        // Completion details card should no longer be visible
        await expect(page.getByText('Completion Details')).not.toBeVisible()
      })

      test('User can cancel reverting to draft', async ({ page }) => {
        const appId = await seedApplication({
          name: 'Status Test - Cancel Revert',
          status: 'SCHEDULED',
          areas: [
            { label: 'Test Area', type: 'green', sizeHa: 1.0 }
          ]
        })

        await page.goto(`/dashboard/applications/${appId}`)

        // Open revert dialog
        await page.getByRole('button', { name: 'Scheduled' }).click()
        await page.getByRole('menuitem', { name: /^Draft/ }).click()

        // Confirmation dialog should appear
        await expect(page.getByRole('alertdialog')).toBeVisible()

        // Click Cancel
        await page.getByRole('button', { name: 'Cancel' }).click()

        // Dialog should close and status should remain Scheduled
        await expect(page.getByRole('alertdialog')).not.toBeVisible()
        await expect(page.getByRole('button', { name: 'Scheduled' })).toBeVisible()
      })
    })
  })

  test.describe('Status Filtering in Dashboard', () => {
    // TODO: Dashboard filtering not yet implemented - all tabs show all applications
    test.skip('User can filter applications by status in dashboard tabs', async ({ page }) => {
      // Seed multiple applications with different statuses
      await seedApplication({
        name: 'Filter Test - Draft 1',
        status: 'DRAFT',
        areas: [{ label: 'Area 1', type: 'green', sizeHa: 1.0 }]
      })

      await seedApplication({
        name: 'Filter Test - Scheduled 1',
        status: 'SCHEDULED',
        areas: [{ label: 'Area 2', type: 'green', sizeHa: 2.0 }]
      })

      await seedApplication({
        name: 'Filter Test - Completed 1',
        status: 'COMPLETED',
        areas: [{ label: 'Area 3', type: 'green', sizeHa: 3.0 }]
      })

      await page.goto('/dashboard')

      // Click on Draft tab
      await page.getByRole('tab', { name: 'Draft' }).click()
      await expect(page.getByRole('link', { name: 'Filter Test - Draft 1' })).toBeVisible()
      await expect(page.getByRole('link', { name: 'Filter Test - Scheduled 1' })).not.toBeVisible()

      // Click on Scheduled tab
      await page.getByRole('tab', { name: 'Scheduled' }).click()
      await expect(page.getByRole('link', { name: 'Filter Test - Scheduled 1' })).toBeVisible()
      await expect(page.getByRole('link', { name: 'Filter Test - Draft 1' })).not.toBeVisible()

      // Click on Completed tab
      await page.getByRole('tab', { name: 'Completed' }).click()
      await expect(page.getByRole('link', { name: 'Filter Test - Completed 1' })).toBeVisible()
      await expect(page.getByRole('link', { name: 'Filter Test - Draft 1' })).not.toBeVisible()

      // Click on All tab
      await page.getByRole('tab', { name: 'All' }).click()
      await expect(page.getByRole('link', { name: 'Filter Test - Draft 1' })).toBeVisible()
      await expect(page.getByRole('link', { name: 'Filter Test - Scheduled 1' })).toBeVisible()
      await expect(page.getByRole('link', { name: 'Filter Test - Completed 1' })).toBeVisible()
    })
  })

  test.describe('Status Change Persistence', () => {
    test('Status changes persist after page refresh', async ({ page }) => {
      const appId = await seedApplication({
        name: 'Persistence Test',
        status: 'DRAFT',
        areas: [{ label: 'Test Area', type: 'green', sizeHa: 1.0 }]
      })

      await page.goto(`/dashboard/applications/${appId}`)

      // Change status to Scheduled
      await page.getByRole('button', { name: 'Draft' }).click()
      await page.getByRole('menuitem', { name: /^Scheduled/ }).click()

      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      await page.getByLabel('Scheduled Date').fill(tomorrow.toISOString().split('T')[0])
      await page.getByRole('button', { name: 'Schedule' }).click()

      await expect(page.getByText(/scheduled successfully/i)).toBeVisible()

      // Refresh the page
      await page.reload()

      // Status should still be Scheduled
      await expect(page.getByRole('button', { name: 'Scheduled' })).toBeVisible()
      await expect(page.getByText(/Scheduled:/)).toBeVisible()
    })

    // TODO: Dashboard tab filtering not yet implemented
    test.skip('Status changes are reflected in dashboard list', async ({ page }) => {
      const appId = await seedApplication({
        name: 'Dashboard Sync Test',
        status: 'DRAFT',
        areas: [{ label: 'Test Area', type: 'green', sizeHa: 1.0 }]
      })

      // Change status on detail page
      await page.goto(`/dashboard/applications/${appId}`)
      await page.getByRole('button', { name: 'Draft' }).click()
      await page.getByRole('menuitem', { name: /^Scheduled/ }).click()

      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      await page.getByLabel('Scheduled Date').fill(tomorrow.toISOString().split('T')[0])
      await page.getByRole('button', { name: 'Schedule' }).click()

      await expect(page.getByText(/scheduled successfully/i)).toBeVisible()

      // Navigate to dashboard
      await page.goto('/dashboard')

      // Check that the application now appears in Scheduled tab
      await page.getByRole('tab', { name: 'Scheduled' }).click()
      await expect(page.getByRole('link', { name: 'Dashboard Sync Test' })).toBeVisible()

      // And does not appear in Draft tab
      await page.getByRole('tab', { name: 'Draft' }).click()
      await expect(page.getByRole('link', { name: 'Dashboard Sync Test' })).not.toBeVisible()
    })
  })
})
