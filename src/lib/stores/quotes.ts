/**
 * Quotes store
 */

import { writable, derived } from 'svelte/store';
import { apiService } from '../services/api.js';
import type { QuoteData } from '$lib/types/api';

export interface QuotesState {
  quotes: Record<string, QuoteData>;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

const initialState: QuotesState = {
  quotes: {},
  isLoading: false,
  error: null,
  lastUpdated: null
};

function createQuotesStore() {
  const { subscribe, set, update } = writable<QuotesState>(initialState);

  let pollInterval: number | null = null;
  let currentSymbols: string[] = [];

  return {
    subscribe,

    /**
     * Start polling quotes for given symbols
     */
    async startStreaming(symbols: string[]): Promise<void> {
      // Stop existing polling
      this.stopStreaming();

      currentSymbols = [...symbols];

      if (symbols.length === 0) {
        update(state => ({ ...state, quotes: {}, lastUpdated: null }));
        return;
      }

      // Use HTTP polling
      await this.startPolling(symbols);
    },


    /**
     * Start HTTP polling
     */
    async startPolling(symbols: string[]): Promise<void> {
      if (symbols.length === 0) return;

      // Initial fetch
      await this.fetchQuotes(symbols);

      // Start 5-second polling
      pollInterval = window.setInterval(async () => {
        await this.fetchQuotes(currentSymbols);
      }, 5000);
    },

    /**
     * Stop polling quotes
     */
    stopStreaming(): void {
      // Stop HTTP polling
      if (pollInterval !== null) {
        clearInterval(pollInterval);
        pollInterval = null;
      }

      currentSymbols = [];
    },

    /**
     * Fetch quotes for symbols (HTTP method)
     */
    async fetchQuotes(symbols: string[]): Promise<void> {
      if (symbols.length === 0) return;

      update(state => ({ ...state, isLoading: true, error: null }));

      const result = await apiService.getQuotes(symbols);

      if (result.error || !result.data) {
        update(state => ({
          ...state,
          isLoading: false,
          error: result.error || 'Failed to fetch quotes'
        }));
        return;
      }

      // Convert array to record for O(1) lookups
      const quotesRecord: Record<string, QuoteData> = {};
      result.data.forEach(quote => {
        quotesRecord[quote.symbol] = quote;
      });

      update(state => ({
        ...state,
        isLoading: false,
        error: null,
        quotes: quotesRecord,
        lastUpdated: new Date()
      }));
    },

    /**
     * Clear error message
     */
    clearError(): void {
      update(state => ({ ...state, error: null }));
    },

    /**
     * Reset store and stop streaming
     */
    reset(): void {
      this.stopStreaming();
      set(initialState);
    }
  };
}

export const quotesStore = createQuotesStore();

// Derived store for quote lookup by symbol
export const getQuoteBySymbol = derived(
  quotesStore,
  ($quotes) => (symbol: string) => $quotes.quotes[symbol.toUpperCase()] || null
);