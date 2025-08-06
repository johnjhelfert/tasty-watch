/**
 * Tastytrade API client service
 * Handles authentication, session management, and API calls
 */

const API_BASE_URL = '/api';

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
  'watchlist-entries': WatchlistEntry[];
  'group-name'?: string;
}

export interface WatchlistEntry {
  symbol: string;
  'instrument-type': string;
}

export interface QuoteData {
  symbol: string;
  'bid-price': number;
  'ask-price': number;
  'last-price': number;
  'net-change': number;
  'net-change-percent': number;
}

export interface SymbolSearchResult {
  symbol: string;
  description: string;
  'instrument-type': string;
}

class ApiService {
  private sessionToken: string | null = null;
  private baseHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  constructor() {
    // Load session token from localStorage on initialization
    if (typeof window !== 'undefined') {
      this.sessionToken = localStorage.getItem('tasty-session-token');
    }
  }

  /**
   * Authenticate user and get session token
   */
  async authenticate(username: string, password: string): Promise<ApiResponse<SessionResponse>> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth`, {
        method: 'POST',
        headers: this.baseHeaders,
        body: JSON.stringify({
          username: username,
          password: password
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { error: errorData.error || 'Authentication failed' };
      }

      const result = await response.json();
      this.sessionToken = result.data['session-token'];

      // Persist session token to localStorage
      if (typeof window !== 'undefined' && this.sessionToken) {
        localStorage.setItem('tasty-session-token', this.sessionToken);
      }

      return { data: result.data };
    } catch (error) {
      return { error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }

  /**
   * Get authenticated headers
   */
  private getAuthHeaders(): HeadersInit {
    return {
      ...this.baseHeaders,
      'Authorization': this.sessionToken ? `Bearer ${this.sessionToken}` : '',
    };
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.sessionToken;
  }

  /**
   * Clear session token
   */
  logout(): void {
    this.sessionToken = null;
    // Clear session token from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('tasty-session-token');
    }
  }

  /**
   * Get user's watchlists
   */
  async getWatchlists(): Promise<ApiResponse<Watchlist[]>> {
    if (!this.sessionToken) {
      return { error: 'Not authenticated' };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/watchlists`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.logout(); // Clear the invalid token
          return { error: '401 Unauthorized - Session expired' };
        }
        const errorData = await response.json();
        return { error: errorData.error || `Failed to fetch watchlists: ${response.statusText}` };
      }

      const result = await response.json();
      return { data: result.data };
    } catch (error) {
      return { error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }

  /**
   * Create a new watchlist
   */
  async createWatchlist(name: string): Promise<ApiResponse<Watchlist>> {
    if (!this.sessionToken) {
      return { error: 'Not authenticated' };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/watchlists`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ name })
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { error: errorData.error || `Failed to create watchlist: ${response.statusText}` };
      }

      const result = await response.json();
      return { data: result.data };
    } catch (error) {
      return { error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }

  /**
   * Delete a watchlist
   */
  async deleteWatchlist(name: string): Promise<ApiResponse<void>> {
    if (!this.sessionToken) {
      return { error: 'Not authenticated' };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/watchlists/${encodeURIComponent(name)}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { error: errorData.error || `Failed to delete watchlist: ${response.statusText}` };
      }

      const result = await response.json();
      return { data: result.data };
    } catch (error) {
      return { error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }

  /**
   * Add symbol to watchlist
   */
  async addSymbolToWatchlist(watchlistName: string, symbol: string): Promise<ApiResponse<Watchlist>> {
    if (!this.sessionToken) {
      return { error: 'Not authenticated' };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/watchlists/${encodeURIComponent(watchlistName)}/entries`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ symbol: symbol.toUpperCase() })
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { error: errorData.error || `Failed to add symbol: ${response.statusText}` };
      }

      const result = await response.json();
      return { data: result.data };
    } catch (error) {
      return { error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }

  /**
   * Remove symbol from watchlist
   */
  async removeSymbolFromWatchlist(watchlistName: string, symbol: string): Promise<ApiResponse<Watchlist>> {
    if (!this.sessionToken) {
      return { error: 'Not authenticated' };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/watchlists/${encodeURIComponent(watchlistName)}/entries/${symbol.toUpperCase()}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { error: errorData.error || `Failed to remove symbol: ${response.statusText}` };
      }

      const result = await response.json();
      return { data: result.data };
    } catch (error) {
      return { error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }

  /**
   * Search for symbols
   */
  async searchSymbols(query: string): Promise<ApiResponse<SymbolSearchResult[]>> {
    if (!this.sessionToken) {
      return { error: 'Not authenticated' };
    }

    if (!query.trim()) {
      return { data: [] };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/symbols/search/${encodeURIComponent(query)}`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { error: errorData.error || `Failed to search symbols: ${response.statusText}` };
      }

      const result = await response.json();
      return { data: result.data };
    } catch (error) {
      return { error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }

  /**
   * Get market data for symbols
   */
  async getQuotes(symbols: string[]): Promise<ApiResponse<QuoteData[]>> {
    if (!this.sessionToken) {
      return { error: 'Not authenticated' };
    }

    if (symbols.length === 0) {
      return { data: [] };
    }

    try {
      const promises = symbols.map(async (symbol) => {
        const response = await fetch(`${API_BASE_URL}/market-data/${symbol.toUpperCase()}`, {
          headers: this.getAuthHeaders()
        });

        if (!response.ok) {
          console.warn(`Failed to fetch quote for ${symbol}: ${response.statusText}`);
          return null;
        }

        const result = await response.json();
        return result.data;
      });

      const results = await Promise.all(promises);
      const validResults = results.filter((result): result is QuoteData => result !== null);
      
      return { data: validResults };
    } catch (error) {
      return { error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();