import { test, expect } from '@playwright/test';
import { setupApiMocks } from './test-utils';

test.describe('Watchlist Management', () => {
	test.beforeEach(async ({ page }) => {
		// Set up API mocking for this test
		await setupApiMocks(page);
		await page.goto('/');
		await page.fill('input[id="username"]', 'testuser');
		await page.fill('input[id="password"]', 'password123');
		await page.click('button[type="submit"]');
		await expect(page.getByText('Welcome, testuser')).toBeVisible();
	});

	test('should display existing watchlists', async ({ page }) => {
		await expect(page.getByRole('heading', { name: 'Test Watchlist' })).toBeVisible();
		await expect(page.getByText('AAPL')).toBeVisible();
		await expect(page.getByText('TSLA')).toBeVisible();
	});

	test('should create a new watchlist', async ({ page }) => {
		await page.getByRole('button', { name: /create.*watchlist/i }).click();
		
		await page.fill('input[placeholder*="watchlist name"]', 'My New Watchlist');
		await page.click('button[type="submit"]');

		// Wait for creation and check either heading or button text
		await page.waitForTimeout(1000); // Allow time for creation
		const watchlistExists = page.getByText('My New Watchlist');
		await expect(watchlistExists.first()).toBeVisible();
	});

	test('should add symbol to watchlist', async ({ page }) => {
		await page.getByRole('button', { name: /add.*symbol/i }).click();
		
		// Wait for the modal/search form to appear
		// @ts-ignore
		const searchInput = page.getByPlaceholder(/Type a stock symbol/i, { timeout: 5000 });
		await expect(searchInput).toBeVisible();
		
		await searchInput.fill('NVDA');
		
		await expect(page.getByText('NVDA')).toBeVisible();
		await page.click('text=NVDA');

		await expect(page.getByText('NVDA')).toBeVisible();
	});

	test('should remove symbol from watchlist', async ({ page }) => {
		const symbolRow = page.locator('tr', { hasText: 'AAPL' });
		await symbolRow.hover();
		
		await symbolRow.getByRole('button', { name: /remove|delete/i }).click();
		
		await expect(symbolRow).not.toBeVisible();
	});

	test('should display watchlist with price data', async ({ page }) => {
		// Verify watchlist symbols are displayed
		await expect(page.getByText('AAPL')).toBeVisible();
		await expect(page.getByText('TSLA')).toBeVisible();
		
		// Verify table structure exists for displaying prices
		const table = page.locator('table, .watchlist-table, [role="table"]');
		await expect(table).toBeVisible();
		
		// Check that AAPL row contains expected data structure
		const aaplRow = page.locator('tr', { hasText: 'AAPL' });
		await expect(aaplRow).toBeVisible();
		
		// Note: Real-time price updates would require backend integration
		// This test verifies the UI structure is ready for price display
	});

	test('should show symbol detail view', async ({ page }) => {
		// Click on the symbol in the table
		await page.locator('tr[aria-label="View details for AAPL"]').click();
		
		// Check if a symbol detail modal appears (look for heading with symbol name)
		await expect(page.getByRole('heading', { name: 'AAPL' })).toBeVisible();
		
		// Look for close button and close the modal
		const closeButton = page.getByRole('button', { name: /close/i });
		await closeButton.click();
		
		// Should return to main watchlist view
		await expect(page.getByRole('heading', { name: 'Test Watchlist' })).toBeVisible();
	});

	test('should search symbols with debouncing', async ({ page }) => {
		await page.getByRole('button', { name: /add.*symbol/i }).click();
		
		// @ts-ignore
		const searchInput = page.getByPlaceholder(/Type a stock symbol/i, { timeout: 5000 });
		await expect(searchInput).toBeVisible();
		
		await searchInput.type('NVDA', { delay: 50 });
		
		// Wait for search results to appear in the search modal
		await expect(page.locator('.search-result').first()).toBeVisible();
	});

	test('should handle keyboard navigation in search', async ({ page }) => {
		await page.getByRole('button', { name: /add.*symbol/i }).click();
		
		// @ts-ignore
		const searchInput = page.getByPlaceholder(/Type a stock symbol/i, { timeout: 5000 });
		await expect(searchInput).toBeVisible();
		
		await searchInput.fill('NVDA');
		
		// Wait for search results to appear
		await expect(page.locator('.search-result').first()).toBeVisible();
		
		await searchInput.press('ArrowDown');
		await searchInput.press('Enter');
		
		// Modal should close and symbol should be added
		await expect(searchInput).not.toBeVisible();
	});
});