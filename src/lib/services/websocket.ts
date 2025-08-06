/**
 * WebSocket service for real-time market data streaming
 * Handles connection, subscription management, and message processing
 */

export interface StreamingQuote {
  symbol: string;
  bid: number;
  ask: number;
  last: number;
  change: number;
  changePercent: number;
  timestamp: number;
}

export interface WebSocketMessage {
  type: string;
  data?: any;
  symbol?: string;
}

export type QuoteUpdateCallback = (quote: StreamingQuote) => void;
export type ConnectionStatusCallback = (connected: boolean, error?: string) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private sessionToken: string | null = null;
  private subscribedSymbols: Set<string> = new Set();
  private quoteCallbacks: Set<QuoteUpdateCallback> = new Set();
  private statusCallbacks: Set<ConnectionStatusCallback> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second
  private reconnectTimer: number | null = null;
  private isIntentionallyClosed = false;
  private heartbeatInterval: number | null = null;

  private readonly wsUrl = 'wss://streamer.cert.tastyworks.com';

  /**
   * Set session token for authentication
   */
  setSessionToken(token: string): void {
    this.sessionToken = token;
  }

  /**
   * Connect to WebSocket
   */
  async connect(): Promise<boolean> {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return true;
    }

    if (!this.sessionToken) {
      this.notifyStatusCallbacks(false, 'No session token available');
      return false;
    }

    this.isIntentionallyClosed = false;
    
    try {
      this.ws = new WebSocket(this.wsUrl);
      
      this.ws.onopen = this.handleOpen.bind(this);
      this.ws.onmessage = this.handleMessage.bind(this);
      this.ws.onclose = this.handleClose.bind(this);
      this.ws.onerror = this.handleError.bind(this);

      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          resolve(false);
        }, 10000); // 10 second timeout

        const originalOnOpen = this.ws!.onopen;
        this.ws!.onopen = (event) => {
          clearTimeout(timeout);
          if (originalOnOpen) originalOnOpen.call(this.ws!, event);
          resolve(true);
        };

        const originalOnError = this.ws!.onerror;
        this.ws!.onerror = (event) => {
          clearTimeout(timeout);
          if (originalOnError) originalOnError.call(this.ws!, event);
          resolve(false);
        };
      });
    } catch (error) {
      this.notifyStatusCallbacks(false, `Connection failed: ${error}`);
      return false;
    }
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    this.isIntentionallyClosed = true;
    this.clearReconnectTimer();
    this.clearHeartbeat();
    
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    
    this.subscribedSymbols.clear();
    this.notifyStatusCallbacks(false);
  }

  /**
   * Subscribe to symbol quotes
   */
  async subscribeToSymbols(symbols: string[]): Promise<void> {
    // Remove symbols that are no longer needed
    for (const symbol of this.subscribedSymbols) {
      if (!symbols.includes(symbol)) {
        await this.unsubscribeFromSymbol(symbol);
      }
    }

    // Add new symbols
    for (const symbol of symbols) {
      if (!this.subscribedSymbols.has(symbol)) {
        await this.subscribeToSymbol(symbol);
      }
    }
  }

  /**
   * Subscribe to single symbol
   */
  private async subscribeToSymbol(symbol: string): Promise<void> {
    if (!this.isConnected()) {
      const connected = await this.connect();
      if (!connected) return;
    }

    const message = {
      action: 'subscribe',
      service: 'QUOTE',
      command: 'SUBS',
      account: this.sessionToken,
      source: this.sessionToken,
      parameters: {
        keys: symbol.toUpperCase(),
        fields: '0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29'
      }
    };

    this.sendMessage(message);
    this.subscribedSymbols.add(symbol.toUpperCase());
  }

  /**
   * Unsubscribe from single symbol
   */
  private async unsubscribeFromSymbol(symbol: string): Promise<void> {
    if (!this.isConnected()) return;

    const message = {
      action: 'unsubscribe',
      service: 'QUOTE',
      command: 'UNSUBS',
      account: this.sessionToken,
      source: this.sessionToken,
      parameters: {
        keys: symbol.toUpperCase()
      }
    };

    this.sendMessage(message);
    this.subscribedSymbols.delete(symbol.toUpperCase());
  }

  /**
   * Add quote update callback
   */
  onQuoteUpdate(callback: QuoteUpdateCallback): () => void {
    this.quoteCallbacks.add(callback);
    return () => this.quoteCallbacks.delete(callback);
  }

  /**
   * Add connection status callback
   */
  onConnectionStatus(callback: ConnectionStatusCallback): () => void {
    this.statusCallbacks.add(callback);
    return () => this.statusCallbacks.delete(callback);
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Handle WebSocket open event
   */
  private handleOpen(): void {
    console.log('WebSocket connected');
    this.reconnectAttempts = 0;
    this.reconnectDelay = 1000;
    this.notifyStatusCallbacks(true);
    this.startHeartbeat();
    
    // Send authentication message
    this.authenticate();
  }

  /**
   * Handle WebSocket message event
   */
  private handleMessage(event: MessageEvent): void {
    try {
      const message = JSON.parse(event.data);
      this.processMessage(message);
    } catch (error) {
      console.warn('Failed to parse WebSocket message:', error);
    }
  }

  /**
   * Handle WebSocket close event
   */
  private handleClose(event: CloseEvent): void {
    console.log('WebSocket disconnected:', event.code, event.reason);
    this.clearHeartbeat();
    this.notifyStatusCallbacks(false);
    
    if (!this.isIntentionallyClosed && this.sessionToken) {
      this.scheduleReconnect();
    }
  }

  /**
   * Handle WebSocket error event
   */
  private handleError(event: Event): void {
    console.error('WebSocket error:', event);
    this.notifyStatusCallbacks(false, 'Connection error');
  }

  /**
   * Send authentication message
   */
  private authenticate(): void {
    if (!this.sessionToken) return;

    const authMessage = {
      action: 'auth',
      service: 'ADMIN',
      command: 'LOGIN',
      account: this.sessionToken,
      source: this.sessionToken,
      parameters: {
        token: this.sessionToken,
        version: '1.0',
        qoslevel: 0
      }
    };

    this.sendMessage(authMessage);
  }

  /**
   * Process incoming WebSocket message
   */
  private processMessage(message: any): void {
    if (message.service === 'QUOTE' && message.command === 'SUBS' && message.content) {
      // Process quote updates
      message.content.forEach((quoteData: any) => {
        if (quoteData.key) {
          const quote = this.parseQuoteData(quoteData);
          if (quote) {
            this.notifyQuoteCallbacks(quote);
          }
        }
      });
    } else if (message.service === 'ADMIN') {
      // Handle admin messages (auth responses, heartbeats, etc.)
      console.log('Admin message:', message);
    }
  }

  /**
   * Parse quote data from WebSocket message
   */
  private parseQuoteData(data: any): StreamingQuote | null {
    try {
      // Note: This is a simplified parser. The actual Tastytrade streaming format
      // may be different and would need to be adjusted based on documentation
      const symbol = data.key || data[0];
      const bid = parseFloat(data[1] || data.BID_PRICE || 0);
      const ask = parseFloat(data[2] || data.ASK_PRICE || 0);
      const last = parseFloat(data[3] || data.LAST_PRICE || 0);
      const change = parseFloat(data[7] || data.NET_CHANGE || 0);
      const changePercent = parseFloat(data[8] || data.NET_CHANGE_PERCENT || 0);

      return {
        symbol: symbol.toString().toUpperCase(),
        bid,
        ask,
        last,
        change,
        changePercent,
        timestamp: Date.now()
      };
    } catch (error) {
      console.warn('Failed to parse quote data:', error, data);
      return null;
    }
  }

  /**
   * Send message to WebSocket
   */
  private sendMessage(message: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.notifyStatusCallbacks(false, 'Max reconnection attempts reached');
      return;
    }

    this.clearReconnectTimer();
    
    this.reconnectTimer = window.setTimeout(async () => {
      this.reconnectAttempts++;
      console.log(`Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
      
      const connected = await this.connect();
      if (connected) {
        // Re-subscribe to all symbols
        const symbols = Array.from(this.subscribedSymbols);
        this.subscribedSymbols.clear();
        await this.subscribeToSymbols(symbols);
      }
      
      // Exponential backoff
      this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000);
    }, this.reconnectDelay);
  }

  /**
   * Clear reconnection timer
   */
  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  /**
   * Start heartbeat to keep connection alive
   */
  private startHeartbeat(): void {
    this.clearHeartbeat();
    
    this.heartbeatInterval = window.setInterval(() => {
      if (this.isConnected()) {
        this.sendMessage({
          action: 'heartbeat',
          service: 'ADMIN',
          command: 'KEEPALIVE',
          account: this.sessionToken,
          source: this.sessionToken
        });
      }
    }, 30000); // Send heartbeat every 30 seconds
  }

  /**
   * Clear heartbeat timer
   */
  private clearHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Notify all quote callbacks
   */
  private notifyQuoteCallbacks(quote: StreamingQuote): void {
    this.quoteCallbacks.forEach(callback => {
      try {
        callback(quote);
      } catch (error) {
        console.error('Error in quote callback:', error);
      }
    });
  }

  /**
   * Notify all status callbacks
   */
  private notifyStatusCallbacks(connected: boolean, error?: string): void {
    this.statusCallbacks.forEach(callback => {
      try {
        callback(connected, error);
      } catch (error) {
        console.error('Error in status callback:', error);
      }
    });
  }
}

// Export singleton instance
export const webSocketService = new WebSocketService();