import { describe, it, expect, beforeEach, vi } from 'vitest';
import { apiService } from './api';

Object.defineProperty(window, 'localStorage', {
	value: {
		getItem: vi.fn(),
		setItem: vi.fn(),
		removeItem: vi.fn(),
		clear: vi.fn(),
	},
	writable: true,
});

describe('ApiService', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		(window.localStorage.getItem as any).mockReturnValue('mock-session-token');
	});

	describe('authenticate', () => {
		it('successfully authenticates and stores session token', async () => {
			const result = await apiService.authenticate('testuser', 'password123');

			expect(result.error).toBeUndefined();
			expect(result.data).toEqual({
				'session-token': 'mock-session-token',
				user: {
					email: 'test@example.com',
					username: 'testuser'
				}
			});
			expect(window.localStorage.setItem).toHaveBeenCalledWith('tasty-session-token', 'mock-session-token');
		});

		it('handles authentication failure', async () => {
			const result = await apiService.authenticate('baduser', 'badpass');
			
			expect(result.data).toBeUndefined();
			expect(result.error).toContain('Authentication failed');
		});
	});

	describe('getWatchlists', () => {
		it('fetches watchlists successfully', async () => {
			const result = await apiService.getWatchlists();

			expect(result.error).toBeUndefined();
			expect(result.data).toHaveLength(1);
			expect(result.data?.[0].name).toBe('Test Watchlist');
		});
	});

	describe('createWatchlist', () => {
		it('creates a new watchlist', async () => {
			const result = await apiService.createWatchlist('New Test List', 0);

			expect(result.error).toBeUndefined();
			expect(result.data?.name).toBe('New Watchlist');
		});
	});

	describe('getQuotes', () => {
		it('fetches market data for symbols', async () => {
			const result = await apiService.getQuotes(['AAPL']);

			expect(result.error).toBeUndefined();
			expect(result.data).toHaveLength(1);
			expect(result.data?.[0]?.symbol).toBe('AAPL');
			expect(result.data?.[0]?.last).toBe('150.22');
		});
	});

	describe('searchSymbols', () => {
		it('searches symbols with query', async () => {
			const result = await apiService.searchSymbols('AAPL');

			expect(result.error).toBeUndefined();
			expect(result.data).toHaveLength(2);
			expect(result.data?.[0].symbol).toBe('AAPL');
		});
	});

	describe('logout', () => {
		it('clears session token', () => {
			apiService.logout();
			expect(window.localStorage.removeItem).toHaveBeenCalledWith('tasty-session-token');
		});
	});
});