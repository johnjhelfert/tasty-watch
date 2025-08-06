/**
 * Watchlists store
 * Manages watchlist data and operations
 */

import { writable, derived } from 'svelte/store';
import { apiService, type Watchlist } from '../services/api.js';
import { authStore } from './auth.js';

export interface WatchlistsState {
  watchlists: Watchlist[];
  activeWatchlist: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: WatchlistsState = {
  watchlists: [],
  activeWatchlist: null,
  isLoading: false,
  error: null
};

function createWatchlistsStore() {
  const { subscribe, set, update } = writable<WatchlistsState>(initialState);

  return {
    subscribe,

    /**
     * Load all user watchlists
     */
    async loadWatchlists(): Promise<void> {
      update(state => ({ ...state, isLoading: true, error: null }));

      const result = await apiService.getWatchlists();

      if (result.error || !result.data) {
        // Handle authentication errors by clearing auth state
        if (result.error?.includes('401') || result.error?.includes('Unauthorized') || result.error?.includes('Not authenticated')) {
          authStore.logout();
          // Reset watchlists state to prevent retry loop
          set(initialState);
          return;
        }
        update(state => ({
          ...state,
          isLoading: false,
          error: result.error || 'Failed to load watchlists'
        }));
        return;
      }

      update(state => ({
        ...state,
        isLoading: false,
        error: null,
        watchlists: result.data!,
        // Set first watchlist as active if none selected
        activeWatchlist: state.activeWatchlist || (result.data!.length > 0 ? result.data![0].name : null)
      }));
    },

    /**
     * Create a new watchlist
     */
    async createWatchlist(name: string): Promise<boolean> {
      if (!name.trim()) {
        update(state => ({ ...state, error: 'Watchlist name cannot be empty' }));
        return false;
      }

      update(state => ({ ...state, isLoading: true, error: null }));

      const result = await apiService.createWatchlist(name.trim());

      if (result.error || !result.data) {
        update(state => ({
          ...state,
          isLoading: false,
          error: result.error || 'Failed to create watchlist'
        }));
        return false;
      }

      update(state => ({
        ...state,
        isLoading: false,
        error: null,
        watchlists: [...state.watchlists, result.data!],
        // Set new watchlist as active if it's the first one
        activeWatchlist: state.activeWatchlist || result.data!.name
      }));

      return true;
    },

    /**
     * Delete a watchlist
     */
    async deleteWatchlist(name: string): Promise<boolean> {
      update(state => ({ ...state, isLoading: true, error: null }));

      const result = await apiService.deleteWatchlist(name);

      if (result.error) {
        update(state => ({
          ...state,
          isLoading: false,
          error: result.error || 'Failed to delete watchlist'
        }));
        return false;
      }

      update(state => {
        const remainingWatchlists = state.watchlists.filter(w => w.name !== name);
        return {
          ...state,
          isLoading: false,
          error: null,
          watchlists: remainingWatchlists,
          // Switch to first remaining watchlist if deleted was active
          activeWatchlist: state.activeWatchlist === name 
            ? (remainingWatchlists.length > 0 ? remainingWatchlists[0].name : null)
            : state.activeWatchlist
        };
      });

      return true;
    },

    /**
     * Add symbol to watchlist
     */
    async addSymbol(watchlistName: string, symbol: string): Promise<boolean> {
      if (!symbol.trim()) {
        update(state => ({ ...state, error: 'Symbol cannot be empty' }));
        return false;
      }

      update(state => ({ ...state, isLoading: true, error: null }));

      const result = await apiService.addSymbolToWatchlist(watchlistName, symbol.trim());

      if (result.error || !result.data) {
        update(state => ({
          ...state,
          isLoading: false,
          error: result.error || 'Failed to add symbol'
        }));
        return false;
      }

      update(state => ({
        ...state,
        isLoading: false,
        error: null,
        watchlists: state.watchlists.map(w => 
          w.name === watchlistName ? result.data! : w
        )
      }));

      return true;
    },

    /**
     * Remove symbol from watchlist
     */
    async removeSymbol(watchlistName: string, symbol: string): Promise<boolean> {
      update(state => ({ ...state, isLoading: true, error: null }));

      const result = await apiService.removeSymbolFromWatchlist(watchlistName, symbol);

      if (result.error || !result.data) {
        update(state => ({
          ...state,
          isLoading: false,
          error: result.error || 'Failed to remove symbol'
        }));
        return false;
      }

      update(state => ({
        ...state,
        isLoading: false,
        error: null,
        watchlists: state.watchlists.map(w => 
          w.name === watchlistName ? result.data! : w
        )
      }));

      return true;
    },

    /**
     * Set active watchlist
     */
    setActiveWatchlist(name: string | null): void {
      update(state => ({ ...state, activeWatchlist: name }));
    },

    /**
     * Clear error message
     */
    clearError(): void {
      update(state => ({ ...state, error: null }));
    },

    /**
     * Reset store to initial state
     */
    reset(): void {
      set(initialState);
    }
  };
}

export const watchlistsStore = createWatchlistsStore();

// Derived store for active watchlist data
export const activeWatchlist = derived(
  watchlistsStore,
  ($watchlists) => {
    if (!$watchlists.activeWatchlist) return null;
    return $watchlists.watchlists.find(w => w.name === $watchlists.activeWatchlist) || null;
  }
);

// Derived store for symbols in active watchlist
export const activeWatchlistSymbols = derived(
  activeWatchlist,
  ($activeWatchlist) => {
    if (!$activeWatchlist) return [];
    return $activeWatchlist['watchlist-entries'].map(entry => entry.symbol);
  }
);