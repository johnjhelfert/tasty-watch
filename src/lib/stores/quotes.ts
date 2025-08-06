/**
 * Quotes store
 * Manages real-time market data and quote updates with WebSocket streaming
 */

import { writable, derived } from 'svelte/store';
import { apiService, type QuoteData } from '../services/api.js';
import { webSocketService, type StreamingQuote } from '../services/websocket.js';

export interface QuotesState {
  quotes: Record<string, QuoteData>;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  isStreaming: boolean;
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
}

const initialState: QuotesState = {
  quotes: {},
  isLoading: false,
  error: null,
  lastUpdated: null,
  isStreaming: false,
  connectionStatus: 'disconnected'
};

function createQuotesStore() {
  const { subscribe, set, update } = writable<QuotesState>(initialState);

  let pollInterval: number | null = null;
  let currentSymbols: string[] = [];
  let wsQuoteUnsubscribe: (() => void) | null = null;
  let wsStatusUnsubscribe: (() => void) | null = null;
  let useWebSocket = true; // Prefer WebSocket over polling

  return {
    subscribe,

    /**
     * Start streaming/polling quotes for given symbols
     */
    async startStreaming(symbols: string[], sessionToken?: string): Promise<void> {
      // Stop existing streaming/polling
      this.stopStreaming();

      currentSymbols = [...symbols];

      if (symbols.length === 0) {
        update(state => ({ ...state, quotes: {}, lastUpdated: null }));
        return;
      }

      // Try WebSocket streaming first (Bonus 1)
      if (useWebSocket && sessionToken) {
        const streamingStarted = await this.startWebSocketStreaming(symbols, sessionToken);
        if (streamingStarted) {
          return;
        }
        // Fall back to polling if WebSocket fails
        console.warn('WebSocket streaming failed, falling back to polling');
      }

      // Use HTTP polling as fallback
      await this.startPolling(symbols);
    },

    /**
     * Start WebSocket streaming
     */
    async startWebSocketStreaming(symbols: string[], sessionToken: string): Promise<boolean> {
      try {
        update(state => ({ ...state, connectionStatus: 'connecting', isStreaming: true }));

        webSocketService.setSessionToken(sessionToken);

        // Set up connection status callback
        wsStatusUnsubscribe = webSocketService.onConnectionStatus((connected, error) => {
          update(state => ({
            ...state,
            connectionStatus: connected ? 'connected' : 'disconnected',
            error: error || (connected ? null : state.error)
          }));

          if (!connected && error) {
            console.warn('WebSocket connection failed, falling back to polling');
            this.startPolling(currentSymbols);
          }
        });

        // Set up quote update callback
        wsQuoteUnsubscribe = webSocketService.onQuoteUpdate((streamingQuote) => {
          this.handleWebSocketQuote(streamingQuote);
        });

        // Connect and subscribe
        const connected = await webSocketService.connect();
        if (connected) {
          await webSocketService.subscribeToSymbols(symbols);
          return true;
        }

        return false;
      } catch (error) {
        console.error('Failed to start WebSocket streaming:', error);
        update(state => ({
          ...state,
          connectionStatus: 'disconnected',
          isStreaming: false,
          error: 'Failed to start real-time streaming'
        }));
        return false;
      }
    },

    /**
     * Handle WebSocket quote update
     */
    handleWebSocketQuote(streamingQuote: StreamingQuote): void {
      const quoteData: QuoteData = {
        symbol: streamingQuote.symbol,
        'bid-price': streamingQuote.bid,
        'ask-price': streamingQuote.ask,
        'last-price': streamingQuote.last,
        'net-change': streamingQuote.change,
        'net-change-percent': streamingQuote.changePercent
      };

      update(state => ({
        ...state,
        quotes: {
          ...state.quotes,
          [streamingQuote.symbol]: quoteData
        },
        lastUpdated: new Date(),
        error: null
      }));
    },

    /**
     * Start HTTP polling (fallback method)
     */
    async startPolling(symbols: string[]): Promise<void> {
      update(state => ({ 
        ...state, 
        isStreaming: false, 
        connectionStatus: 'disconnected' 
      }));

      if (symbols.length === 0) return;

      // Initial fetch
      await this.fetchQuotes(symbols);

      // Start 5-second polling
      pollInterval = window.setInterval(async () => {
        await this.fetchQuotes(currentSymbols);
      }, 5000);
    },

    /**
     * Stop streaming/polling quotes
     */
    stopStreaming(): void {
      // Stop WebSocket streaming
      if (wsQuoteUnsubscribe) {
        wsQuoteUnsubscribe();
        wsQuoteUnsubscribe = null;
      }
      if (wsStatusUnsubscribe) {
        wsStatusUnsubscribe();
        wsStatusUnsubscribe = null;
      }
      webSocketService.disconnect();

      // Stop HTTP polling
      if (pollInterval !== null) {
        clearInterval(pollInterval);
        pollInterval = null;
      }

      currentSymbols = [];
      update(state => ({ 
        ...state, 
        isStreaming: false, 
        connectionStatus: 'disconnected' 
      }));
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
     * Legacy method for backward compatibility
     */
    async startPollingLegacy(symbols: string[]): Promise<void> {
      return this.startStreaming(symbols);
    },

    /**
     * Legacy method for backward compatibility
     */
    stopPollingLegacy(): void {
      this.stopStreaming();
    },

    /**
     * Get quote for specific symbol
     */
    getQuote: (symbol: string) => {
      let currentState: QuotesState;
      const unsubscribe = subscribe(state => currentState = state);
      unsubscribe();
      return currentState!.quotes[symbol.toUpperCase()] || null;
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