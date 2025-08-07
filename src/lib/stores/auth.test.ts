import { describe, it, expect, vi, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import { authStore } from './auth';
import { apiService } from '../services/api';

vi.mock('../services/api', () => ({
	apiService: {
		authenticate: vi.fn(),
		validateSession: vi.fn(),
		logout: vi.fn(),
		isAuthenticated: vi.fn()
	}
}));

describe('authStore', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		authStore.logout();
	});

	describe('login', () => {
		it('successfully logs in user', async () => {
			(apiService.authenticate as any).mockResolvedValue({
				data: {
					'session-token': 'token123',
					user: { email: 'test@example.com', username: 'testuser' }
				}
			});

			const result = await authStore.login('testuser', 'password');
			const state = get(authStore);

			expect(result).toBe(true);
			expect(state.isAuthenticated).toBe(true);
			expect(state.user).toEqual({ email: 'test@example.com', username: 'testuser' });
			expect(state.error).toBeNull();
			expect(state.isLoading).toBe(false);
		});

		it('handles login failure', async () => {
			(apiService.authenticate as any).mockResolvedValue({
				error: 'Invalid credentials'
			});

			const result = await authStore.login('baduser', 'badpass');
			const state = get(authStore);

			expect(result).toBe(false);
			expect(state.isAuthenticated).toBe(false);
			expect(state.user).toBeNull();
			expect(state.error).toBe('Invalid credentials');
			expect(state.isLoading).toBe(false);
		});

		it('sets loading state during authentication', async () => {
			let resolveAuth: (value: any) => void;
			const authPromise = new Promise(resolve => {
				resolveAuth = resolve;
			});
			
			(apiService.authenticate as any).mockReturnValue(authPromise);

			const loginPromise = authStore.login('testuser', 'password');
			const loadingState = get(authStore);

			expect(loadingState.isLoading).toBe(true);

			resolveAuth!({ data: { 'session-token': 'token', user: { email: 'test@example.com', username: 'testuser' } } });
			await loginPromise;

			const finalState = get(authStore);
			expect(finalState.isLoading).toBe(false);
		});
	});

	describe('logout', () => {
		it('clears user state and calls API logout', () => {
			authStore.logout();
			const state = get(authStore);

			expect(state.isAuthenticated).toBe(false);
			expect(state.user).toBeNull();
			expect(state.error).toBeNull();
			expect(apiService.logout).toHaveBeenCalled();
		});
	});

	describe('checkAuth', () => {
		it('validates existing session', () => {
			(apiService.isAuthenticated as any).mockReturnValue(true);

			authStore.checkAuth();
			const state = get(authStore);

			expect(state.isAuthenticated).toBe(true);
		});

		it('handles invalid session', () => {
			(apiService.isAuthenticated as any).mockReturnValue(false);

			authStore.checkAuth();
			const state = get(authStore);

			expect(state.isAuthenticated).toBe(false);
			expect(state.user).toBeNull();
		});
	});
});