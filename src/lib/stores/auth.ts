/**
 * Authentication store
 * Manages user session state and authentication flow
 */

import { writable } from 'svelte/store';
import { apiService, type SessionResponse } from '../services/api.js';

export interface AuthState {
  isAuthenticated: boolean;
  user: SessionResponse['user'] | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  isLoading: false,
  error: null
};

function createAuthStore() {
  const { subscribe, set, update } = writable<AuthState>(initialState);

  return {
    subscribe,
    
    /**
     * Authenticate user with username and password
     */
    async login(username: string, password: string): Promise<boolean> {
      update(state => ({ ...state, isLoading: true, error: null }));

      const result = await apiService.authenticate(username, password);

      if (result.error || !result.data) {
        update(state => ({
          ...state,
          isLoading: false,
          error: result.error || 'Authentication failed',
          isAuthenticated: false,
          user: null
        }));
        return false;
      }

      update(state => ({
        ...state,
        isLoading: false,
        error: null,
        isAuthenticated: true,
        user: result.data!.user
      }));

      return true;
    },

    /**
     * Log out user and clear session
     */
    logout(): void {
      apiService.logout();
      set(initialState);
    },

    /**
     * Clear error message
     */
    clearError(): void {
      update(state => ({ ...state, error: null }));
    },

    /**
     * Check if user is authenticated (for page loads)
     */
    checkAuth(): void {
      const isAuth = apiService.isAuthenticated();
      update(state => ({
        ...state, 
        isAuthenticated: isAuth,
        // Note: user data is lost on page refresh, but session token persists
        user: isAuth ? { email: '', username: '' } : null
      }));
    }
  };
}

export const authStore = createAuthStore();