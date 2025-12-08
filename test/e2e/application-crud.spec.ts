import { test, expect } from '@playwright/test'
import { resetDatabase, seedApplication } from '../support/db-setup'

/**
 * Application CRUD E2E Tests
 *
 * Tests the complete Create, Read, Update, Delete lifecycle for applications.
 * Database is cleaned after each test to ensure isolation.
 */

test.describe('Application CRUD Operations', () => {
  // Clean up all test user's applications after each test
  // This cascades to ApplicationArea and ApplicationProduct due to onDelete: Cascade
  test.afterEach(async () => {
    await resetDatabase()
  })

  test('User can view applications in dashboard', async ({ page }) => {
    // Create a test application first so the table renders
    await page.goto('/dashboard/applications/new')
    await page.getByRole('textbox', { name: 'Application name' }).fill('Test Application')
    await page.getByRole('textbox', { name: 'Label' }).fill('Test Area')
    await page.getByRole('spinbutton', { name: 'Size (ha)' }).fill('1.0')
    await page.getByRole('button', { name: 'Save Application' }).click()

    // Navigate to dashboard
    await page.goto('/dashboard')

    // Verify the applications table is visible
    await expect(page.getByRole('table')).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Name' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Status' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Total Area (ha)' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Last Updated' })).toBeVisible()

    // Verify tab navigation exists
    await expect(page.getByRole('tab', { name: 'All' })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'Draft' })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'Scheduled' })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'Completed' })).toBeVisible()
  })

  test('User can create a new application', async ({ page }) => {
    await page.goto('/dashboard/applications/new')

    // Fill in the application form
    await page.getByRole('textbox', { name: 'Application name' }).fill('CRUD Test - Create')
    await page.getByRole('textbox', { name: 'Label' }).fill('Test Area')
    await page.getByRole('spinbutton', { name: 'Size (ha)' }).fill('3.5')

    // Add a product
    await page.getByRole('button', { name: 'Add Product' }).click()
    await expect(page.getByRole('dialog', { name: 'Select Product' })).toBeVisible()
    await page.getByRole('button', { name: 'Select' }).first().click()

    // Fill in application rate - use a flexible selector that matches any unit
    await page.getByRole('spinbutton', { name: /Application Rate/ }).fill('20')

    // Save the application
    await page.getByRole('button', { name: 'Save Application' }).click()

    // Verify success message
    await expect(page.getByText(/saved successfully/i)).toBeVisible()
  })

  test('User can view application details', async ({ page }) => {
    // First, create a test application with unique name
    const appName = `CRUD Test - View Details ${Date.now()}`
    await page.goto('/dashboard/applications/new')
    await page.getByRole('textbox', { name: 'Application name' }).fill(appName)
    await page.getByRole('textbox', { name: 'Label' }).fill('Detail Test Area')
    await page.getByRole('spinbutton', { name: 'Size (ha)' }).fill('2.5')
    await page.getByRole('button', { name: 'Save Application' }).click()
    await expect(page.getByText(/saved successfully/i)).toBeVisible()

    // Navigate to dashboard
    await page.goto('/dashboard')

    // Click on the application link to view details
    await page.getByRole('link', { name: appName }).click()

    // Verify we're on the detail page and can see the application data
    await expect(page.getByText(appName)).toBeVisible()
    await expect(page.getByText('Detail Test Area')).toBeVisible()
    await expect(page.getByText('2.5 ha total')).toBeVisible()

    // Verify the areas table is displayed
    await expect(page.getByRole('columnheader', { name: 'Area' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Type' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Size (ha)' })).toBeVisible()

    // Verify action buttons are available
    await expect(page.getByRole('button', { name: 'Edit' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Delete' })).toBeVisible()
  })

  test('User can view application details via actions menu', async ({ page }) => {
    // Seed a test application directly in the database
    const appName = 'CRUD Test - View via Menu'
    await seedApplication({
      name: appName,
      areas: [
        { label: 'Menu Test Area', type: 'green', sizeHa: 1.5 }
      ]
    })

    // Navigate to dashboard
    await page.goto('/dashboard')

    // Find the application row and click the actions menu
    const row = page.getByRole('row', { name: new RegExp(appName) })
    await row.getByRole('button', { name: 'Open menu' }).click()

    // Click View in the dropdown menu
    await page.getByRole('menuitem', { name: 'View' }).click()

    // Wait for navigation to application detail page
    await expect(page).toHaveURL(/\/dashboard\/applications\/[^/]+$/)

    // Verify we're on the detail page
    await expect(page.getByText(appName)).toBeVisible()
    await expect(page.getByText('Menu Test Area')).toBeVisible()
  })

  test('User can edit application via detail page', async ({ page }) => {
    // Create a test application
    await page.goto('/dashboard/applications/new')
    await page.getByRole('textbox', { name: 'Application name' }).fill('CRUD Test - Edit Original')
    await page.getByRole('textbox', { name: 'Label' }).fill('Original Area')
    await page.getByRole('spinbutton', { name: 'Size (ha)' }).fill('4.0')
    await page.getByRole('button', { name: 'Save Application' }).click()
    await expect(page.getByText(/saved successfully/i)).toBeVisible()

    // Navigate to dashboard and view the application
    await page.goto('/dashboard')
    await page.getByRole('link', { name: 'CRUD Test - Edit Original' }).first().click()

    // Click the Edit button on the detail page
    await page.getByRole('button', { name: 'Edit' }).click()

    // Verify we're on the edit page
    await expect(page).toHaveURL(/\/edit$/)

    // Modify the application
    await page.getByRole('textbox', { name: 'Application name' }).fill('CRUD Test - Edited via Detail')
    await page.getByRole('textbox', { name: 'Label' }).fill('Edited Area')
    await page.getByRole('spinbutton', { name: 'Size (ha)' }).fill('5.5')

    // Save changes
    await page.getByRole('button', { name: 'Save Application' }).click()

    // Verify success message
    await expect(page.getByText(/application updated successfully/i)).toBeVisible()

    // Click back button to return to detail page
    await page.getByRole('button', { name: 'Back' }).click()

    // Verify the changes are reflected on the detail page
    await expect(page.getByText('CRUD Test - Edited via Detail')).toBeVisible()
    await expect(page.getByText('Edited Area')).toBeVisible()
  })

  test('User can edit application via actions menu', async ({ page }) => {
    // Seed a test application directly in the database
    await seedApplication({
      name: 'CRUD Test - Edit via Menu',
      areas: [
        { label: 'Menu Edit Area', type: 'green', sizeHa: 3.0 }
      ]
    })

    // Navigate to dashboard
    await page.goto('/dashboard')

    // Find the application row and click the actions menu
    const row = page.getByRole('row', { name: /CRUD Test - Edit via Menu/i }).first()
    await row.getByRole('button', { name: 'Open menu' }).click()

    // Click Edit in the dropdown menu
    await page.getByRole('menuitem', { name: 'Edit' }).click()

    // Verify we're on the edit page
    await expect(page).toHaveURL(/\/edit$/)
  })

  test('User can delete application via detail page', async ({ page }) => {
    // Seed a test application directly in the database
    await seedApplication({
      name: 'CRUD Test - Delete via Detail',
      areas: [
        { label: 'Delete Test Area', type: 'green', sizeHa: 1.0 }
      ]
    })

    // Navigate to dashboard and view the application
    await page.goto('/dashboard')
    await page.getByRole('link', { name: 'CRUD Test - Delete via Detail' }).first().click()

    // Click the Delete button
    await page.getByRole('button', { name: 'Delete' }).click()

    // Confirm deletion in the alert dialog
    await expect(page.getByRole('alertdialog')).toBeVisible()
    await page.getByRole('button', { name: /delete|confirm/i }).click()

    // Verify we're redirected to dashboard
    await expect(page).toHaveURL('/dashboard')

    // Verify success message
    await expect(page.getByText(/deleted successfully/i)).toBeVisible()

    // Verify the application is no longer in the list
    await expect(page.getByRole('link', { name: 'CRUD Test - Delete via Detail' })).not.toBeVisible()
  })

  test('User can delete application via actions menu', async ({ page }) => {
    // Seed a test application directly in the database
    await seedApplication({
      name: 'CRUD Test - Delete via Menu',
      areas: [
        { label: 'Menu Delete Area', type: 'green', sizeHa: 1.0 }
      ]
    })

    // Navigate to dashboard
    await page.goto('/dashboard')

    // Find the application row and click the actions menu
    const row = page.getByRole('row', { name: /CRUD Test - Delete via Menu/i }).first()
    await row.getByRole('button', { name: 'Open menu' }).click()

    // Click Delete in the dropdown menu
    await page.getByRole('menuitem', { name: 'Delete' }).click()

    // Confirm deletion in the alert dialog
    await expect(page.getByRole('alertdialog')).toBeVisible()
    await page.getByRole('button', { name: /delete|confirm/i }).click()

    // Verify success message
    await expect(page.getByText(/deleted successfully/i)).toBeVisible()

    // Verify the application is no longer in the list
    await expect(page.getByRole('link', { name: 'CRUD Test - Delete via Menu' })).not.toBeVisible()
  })
})
