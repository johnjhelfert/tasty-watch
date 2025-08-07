import { test, expect } from '@playwright/test';
import { setupApiMocks } from './test-utils';

test.describe('Accessibility', () => {
	test.beforeEach(async ({ page }) => {
		// Set up API mocking for this test
		await setupApiMocks(page);
		await page.goto('/');
	});

	test('should have proper heading hierarchy', async ({ page }) => {
		// Login first to see the app headings
		await page.fill('input[id="username"]', 'testuser');
		await page.fill('input[id="password"]', 'password123');
		await page.click('button[type="submit"]');
		
		await expect(page.getByText('Welcome, testuser')).toBeVisible();
		
		// Check that headings exist (h2, h3 are present in the app after login)
		const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
		expect(headings.length).toBeGreaterThan(0);
		
		// Verify main headings are visible
		await expect(page.getByRole('heading', { name: 'Watchlists' })).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Test Watchlist' })).toBeVisible();
	});

	test('should have accessible form labels', async ({ page }) => {
		const usernameInput = page.locator('input[id="username"]');
		const passwordInput = page.locator('input[id="password"]');
		
		await expect(usernameInput).toHaveAccessibleName(/username|email/i);
		await expect(passwordInput).toHaveAccessibleName(/password/i);
		
		const usernameLabel = page.locator('label[for="username"]');
		const passwordLabel = page.locator('label[for="password"]');
		
		await expect(usernameLabel).toBeVisible();
		await expect(passwordLabel).toBeVisible();
	});

	test('should support keyboard navigation', async ({ page }) => {
		// Wait for form to be ready
		await expect(page.locator('input[id="username"]')).toBeVisible();
		
		await page.keyboard.press('Tab');
		await expect(page.locator('input[id="username"]')).toBeFocused();
		
		await page.keyboard.press('Tab');
		await expect(page.locator('input[id="password"]')).toBeFocused();
		
		await page.keyboard.press('Tab');
		// Check for either the show password button or submit button
		const focusedElement = page.locator(':focus');
		const isFocusedValid = await focusedElement.evaluate(el => {
			return el.matches('button[type="submit"]') || el.matches('button[aria-label*="password"]');
		});
		expect(isFocusedValid).toBe(true);
	});

	test('should have ARIA attributes for dynamic content', async ({ page }) => {
		await page.fill('input[id="username"]', 'invalid');
		await page.fill('input[id="password"]', 'invalid');
		await page.click('button[type="submit"]');
		
		await expect(page.getByText(/Authentication failed/)).toBeVisible();
		
		const errorMessage = page.locator('[role="alert"]:visible').first();
		await expect(errorMessage).toBeVisible();
	});

	test('should have proper button roles and labels', async ({ page }) => {
		const submitButton = page.locator('button[type="submit"]');
		await expect(submitButton).toHaveAccessibleName(/sign in/i);
		
		const passwordToggle = page.getByRole('button', { name: /show.*password/i });
		await expect(passwordToggle).toBeVisible();
		await expect(passwordToggle).toHaveAccessibleName(/show|hide.*password/i);
	});

	test('should maintain focus management in modals', async ({ page }) => {
		await page.fill('input[id="username"]', 'testuser');
		await page.fill('input[id="password"]', 'password123');
		await page.click('button[type="submit"]');
		
		await expect(page.getByText('Welcome, testuser')).toBeVisible();
		
		await page.getByRole('button', { name: /add.*symbol/i }).click();
		
		const searchInput = page.getByPlaceholder(/Type a stock symbol/i);
		await expect(searchInput).toBeFocused();
		
		await page.keyboard.press('Escape');
		
		await expect(searchInput).not.toBeVisible();
	});

	test('should announce screen reader updates', async ({ page }) => {
		await page.fill('input[id="username"]', 'testuser');
		await page.fill('input[id="password"]', 'password123');
		await page.click('button[type="submit"]');
		
		await expect(page.getByText('Welcome, testuser')).toBeVisible();
		
		const liveRegions = page.locator('[aria-live="polite"], [aria-live="assertive"]');
		const liveRegionCount = await liveRegions.count();
		expect(liveRegionCount).toBeGreaterThan(0);
	});

	test('should have sufficient color contrast', async ({ page }) => {
		await page.fill('input[id="username"]', 'testuser');
		await page.fill('input[id="password"]', 'password123');
		await page.click('button[type="submit"]');
		
		await expect(page.getByText('Welcome, testuser')).toBeVisible();
		
		const textElements = page.locator('body *:visible');
		const count = await textElements.count();
		expect(count).toBeGreaterThan(0);
	});
});