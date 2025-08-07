import { test, expect } from '@playwright/test';
import { setupApiMocks } from './test-utils';

test.describe('Authentication', () => {
	test.beforeEach(async ({ page }) => {
		// Set up API mocking for this test
		await setupApiMocks(page);
		await page.goto('/');
	});
	test('should login successfully with valid credentials', async ({ page }) => {
		await page.goto('/');

		await expect(page.getByText('Sign in to your Tastytrade account')).toBeVisible();

		await page.fill('input[id="username"]', 'testuser');
		await page.fill('input[id="password"]', 'password123');
		
		await page.click('button[type="submit"]');

		await expect(page.getByText('Welcome, testuser')).toBeVisible({ timeout: 10000 });
	});

	test('should show error with invalid credentials', async ({ page }) => {
		await page.goto('/');

		await page.fill('input[id="username"]', 'invalid');
		await page.fill('input[id="password"]', 'invalid');
		
		await page.click('button[type="submit"]');

		await expect(page.getByText(/Authentication failed/)).toBeVisible();
	});

	test('should not submit form with empty fields', async ({ page }) => {
		await page.goto('/');

		// Verify submit button is disabled when fields are empty
		const submitButton = page.locator('button[type="submit"]');
		await expect(submitButton).toBeDisabled();

		// Form should still be on the login page
		await expect(page.getByText('Sign in to your Tastytrade account')).toBeVisible();
	});

	test('should toggle password visibility', async ({ page }) => {
		await page.goto('/');

		const passwordInput = page.locator('input[id="password"]');
		const toggleButton = page.getByRole('button', { name: 'Show password' });

		await expect(passwordInput).toHaveAttribute('type', 'password');

		await toggleButton.click();
		await expect(passwordInput).toHaveAttribute('type', 'text');
		await expect(page.getByRole('button', { name: 'Hide password' })).toBeVisible();
	});

	test('should logout successfully', async ({ page }) => {
		await page.goto('/');
		
		await page.fill('input[id="username"]', 'testuser');
		await page.fill('input[id="password"]', 'password123');
		await page.click('button[type="submit"]');

		await expect(page.getByText('Welcome, testuser')).toBeVisible();

		await page.getByRole('button', { name: /logout|sign out/i }).click();

		await expect(page.getByText('Sign in to your Tastytrade account')).toBeVisible();
	});
});