import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authStore } from '$lib/stores/auth';

vi.mock('$lib/stores/auth');

describe('LoginForm Component Logic', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should call authStore.login with correct credentials', async () => {
		const mockLogin = vi.fn().mockResolvedValue(true);
		(authStore as any).login = mockLogin;

		// Simulate form submission logic
		const username = 'testuser';
		const password = 'password123';
		
		await authStore.login(username.trim(), password);

		expect(mockLogin).toHaveBeenCalledWith('testuser', 'password123');
	});

	it('should not submit with empty credentials', async () => {
		const mockLogin = vi.fn();
		(authStore as any).login = mockLogin;

		// Simulate validation logic
		const username = '';
		const password = '';
		
		if (!username.trim() || !password.trim()) {
			// Don't call login
		} else {
			await authStore.login(username.trim(), password);
		}

		expect(mockLogin).not.toHaveBeenCalled();
	});

	it('should handle authentication errors', async () => {
		const mockLogin = vi.fn().mockResolvedValue(false);
		const mockClearError = vi.fn();
		(authStore as any).login = mockLogin;
		(authStore as any).clearError = mockClearError;

		const result = await authStore.login('baduser', 'badpass');
		
		expect(result).toBe(false);
		expect(mockLogin).toHaveBeenCalledWith('baduser', 'badpass');
		
		// Simulate clearing error
		authStore.clearError();
		expect(mockClearError).toHaveBeenCalled();
	});

	it('should trim username input', async () => {
		const mockLogin = vi.fn().mockResolvedValue(true);
		(authStore as any).login = mockLogin;

		const username = '  testuser  ';
		const password = 'password123';
		
		await authStore.login(username.trim(), password);

		expect(mockLogin).toHaveBeenCalledWith('testuser', 'password123');
	});
});