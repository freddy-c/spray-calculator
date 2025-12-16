import { test as setup, expect } from '@playwright/test'

/**
 * Authentication Setup for E2E Tests
 *
 * This script runs before all tests to authenticate a user and save the session.
 * The session is saved to playwright/.auth/user.json and reused by all tests.
 *
 * Prerequisites:
 * 1. A test user must exist in your database
 * 2. Environment variables or test credentials must be configured
 *
 * To create a test user, you can either:
 * - Use your sign-up flow manually
 * - Create a database seed script
 * - Use Better Auth's API directly
 */

const authFile = 'playwright/.auth/user.json'

// Test user credentials
// TODO: Replace with your actual test user credentials or use environment variables
const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL || 'test@example.com'
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD || 'password123'

setup('authenticate', async ({ page }) => {
  await page.goto('/sign-in');

  await page.locator("#email").fill(TEST_USER_EMAIL);
  await page.locator("#password").fill(TEST_USER_PASSWORD);

  await page.getByRole("button", { name: "Login" }).click();

  // Verify successful login by checking for a known element on the dashboard
  await expect(page).toHaveURL(/\/dashboard/);

  // Save authenticated state to file
  await page.context().storageState({ path: authFile });
})
