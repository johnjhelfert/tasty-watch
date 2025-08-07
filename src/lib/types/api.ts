/**
 * API type definitions for Tastytrade integration
 */

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  context?: string;
}

export interface SessionResponse {
  'session-token': string;
  user: {
    email: string;
    username: string;
  };
}

export interface Watchlist {
  name: string;
  'watchlist-entries'?: WatchlistEntry[];
  'group-name'?: string;
}

export interface WatchlistEntry {
  symbol: string;
  'instrument-type'?: string;
}

export interface QuoteData {
  symbol: string;
  ask: string;
  'ask-size': number;
  bid: string;
  'bid-size': number;
  close: string;
  'day-high-price': string;
  'day-low-price': string;
  'instrument-type': string;
  'is-trading-halted': boolean;
  last: string;
  mark: string;
  mid: string;
  open: string;
  'prev-close': string;
  'prev-close-date': string;
  'summary-date': string;
  'updated-at': string;
  'year-high-price': string;
  'year-low-price': string;
}

export interface SymbolSearchResult {
  symbol: string;
  description: string;
  'instrument-type': string;
}
