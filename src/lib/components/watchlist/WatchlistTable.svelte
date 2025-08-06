<script lang="ts">
  import { onDestroy } from 'svelte';
  import { activeWatchlist, activeWatchlistSymbols } from '$lib/stores/watchlists';
  import { quotesStore, getQuoteBySymbol } from '$lib/stores/quotes';
  import { authStore } from '$lib/stores/auth';
  import { formatPrice, formatChange, formatPercentage, getPriceChangeClass, formatLastUpdated } from '$lib/utils/formatters';
  
  export let onSymbolClick: (symbol: string) => void = () => {};
  export let onRemoveSymbol: (symbol: string) => void = () => {};

  $: quotes = $quotesStore;
  $: symbols = $activeWatchlistSymbols;
  $: watchlist = $activeWatchlist;
  $: auth = $authStore;

  // Start/stop streaming when symbols change
  $: {
    if (symbols.length > 0) {
      // Pass session token for WebSocket streaming (Bonus 1)
      quotesStore.startStreaming(symbols, auth.isAuthenticated ? 'session-token' : undefined);
    } else {
      quotesStore.stopStreaming();
    }
  }

  onDestroy(() => {
    quotesStore.stopStreaming();
  });

  function handleSymbolClick(symbol: string, event: Event) {
    // Don't trigger if clicking on remove button
    if ((event.target as HTMLElement).closest('.remove-button')) {
      return;
    }
    onSymbolClick(symbol);
  }

  function handleRemoveSymbol(symbol: string, event: Event) {
    event.stopPropagation();
    onRemoveSymbol(symbol);
  }

  function handleKeydown(event: KeyboardEvent, symbol: string) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSymbolClick(symbol);
    }
  }
</script>

<div class="watchlist-table-container">
  {#if !watchlist}
    <div class="empty-state">
      <div class="empty-icon">📋</div>
      <h3>No Watchlist Selected</h3>
      <p>Create a new watchlist or select an existing one to view market data.</p>
    </div>
  {:else if symbols.length === 0}
    <div class="empty-state">
      <div class="empty-icon">📈</div>
      <h3>Empty Watchlist</h3>
      <p>Add symbols to "{watchlist.name}" to start tracking market data.</p>
    </div>
  {:else}
    <div class="table-header">
      <div class="table-info">
        <h3>{watchlist.name}</h3>
        <div class="last-updated">
          Last updated: {formatLastUpdated(quotes.lastUpdated)}
          {#if quotes.isLoading}
            <span class="loading-indicator" aria-label="Loading">⟳</span>
          {:else if quotes.isStreaming && quotes.connectionStatus === 'connected'}
            <span class="streaming-indicator" aria-label="Live streaming">🔴 LIVE</span>
          {:else if quotes.connectionStatus === 'connecting'}
            <span class="connecting-indicator" aria-label="Connecting">🟡 Connecting...</span>
          {/if}
        </div>
      </div>
      
      {#if quotes.error}
        <div class="error-banner" role="alert">
          <span class="error-icon">⚠️</span>
          {quotes.error}
          <button 
            type="button" 
            class="error-dismiss" 
            on:click={() => quotesStore.clearError()}
            aria-label="Dismiss error"
          >
            ✕
          </button>
        </div>
      {/if}
    </div>

    <div class="table-wrapper">
      <table class="watchlist-table" aria-label="Stock watchlist">
        <thead>
          <tr>
            <th scope="col">Symbol</th>
            <th scope="col">Bid Price</th>
            <th scope="col">Ask Price</th>
            <th scope="col">Last Price</th>
            <th scope="col">Change</th>
            <th scope="col">Change %</th>
            <th scope="col" class="actions-column">Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each symbols as symbol}
            {@const quote = $getQuoteBySymbol(symbol)}
            {@const changeClass = getPriceChangeClass(quote?.['net-change'])}
            <tr 
              class="symbol-row {changeClass}"
              tabindex="0"
              role="button"
              aria-label="View details for {symbol}"
              on:click={(e) => handleSymbolClick(symbol, e)}
              on:keydown={(e) => handleKeydown(e, symbol)}
            >
              <td class="symbol-cell">
                <span class="symbol-text">{symbol}</span>
              </td>
              <td class="price-cell">
                <span class="price-value">
                  ${formatPrice(quote?.['bid-price'])}
                </span>
              </td>
              <td class="price-cell">
                <span class="price-value">
                  ${formatPrice(quote?.['ask-price'])}
                </span>
              </td>
              <td class="price-cell">
                <span class="price-value last-price">
                  ${formatPrice(quote?.['last-price'])}
                </span>
              </td>
              <td class="change-cell {changeClass}">
                <span class="change-value">
                  {formatChange(quote?.['net-change'])}
                </span>
              </td>
              <td class="change-cell {changeClass}">
                <span class="change-value">
                  {formatPercentage(quote?.['net-change-percent'])}
                </span>
              </td>
              <td class="actions-cell">
                <button
                  type="button"
                  class="remove-button"
                  on:click={(e) => handleRemoveSymbol(symbol, e)}
                  aria-label="Remove {symbol} from watchlist"
                  title="Remove from watchlist"
                >
                  ✕
                </button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>

<style>
  .watchlist-table-container {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }

  .empty-state {
    text-align: center;
    padding: 3rem 2rem;
    color: #666;
  }

  .empty-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .empty-state h3 {
    margin: 0 0 0.5rem 0;
    color: #333;
    font-size: 1.25rem;
  }

  .empty-state p {
    margin: 0;
    font-size: 0.875rem;
    line-height: 1.5;
  }

  .table-header {
    padding: 1.5rem 2rem 0;
    border-bottom: 1px solid #e2e8f0;
  }

  .table-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .table-info h3 {
    margin: 0;
    color: #333;
    font-size: 1.5rem;
    font-weight: 700;
  }

  .last-updated {
    font-size: 0.875rem;
    color: #666;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .loading-indicator {
    animation: spin 1s linear infinite;
    display: inline-block;
  }

  .streaming-indicator {
    color: #e53e3e;
    font-weight: 600;
    font-size: 0.75rem;
    animation: pulse 2s infinite;
  }

  .connecting-indicator {
    color: #d69e2e;
    font-weight: 600;
    font-size: 0.75rem;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @keyframes pulse {
    0%, 50%, 100% { opacity: 1; }
    25%, 75% { opacity: 0.5; }
  }

  .error-banner {
    background-color: #fed7d7;
    border: 1px solid #feb2b2;
    border-radius: 8px;
    padding: 0.75rem 1rem;
    color: #c53030;
    font-size: 0.875rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .error-icon {
    flex-shrink: 0;
  }

  .error-dismiss {
    margin-left: auto;
    background: none;
    border: none;
    color: #c53030;
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 4px;
    font-size: 1rem;
    line-height: 1;
  }

  .error-dismiss:hover {
    background-color: rgba(197, 48, 48, 0.1);
  }

  .table-wrapper {
    overflow-x: auto;
  }

  .watchlist-table {
    width: 100%;
    border-collapse: collapse;
  }

  .watchlist-table th {
    background-color: #f8fafc;
    padding: 1rem 1.5rem;
    text-align: left;
    font-weight: 600;
    color: #4a5568;
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-bottom: 2px solid #e2e8f0;
  }

  .watchlist-table th:last-child {
    text-align: center;
  }

  .symbol-row {
    cursor: pointer;
    transition: background-color 0.2s;
    border-bottom: 1px solid #e2e8f0;
  }

  .symbol-row:hover {
    background-color: #f8fafc;
  }

  .symbol-row:focus {
    outline: 2px solid #667eea;
    outline-offset: -2px;
    background-color: #f0f4ff;
  }

  .symbol-row.positive {
    border-left: 4px solid #38a169;
  }

  .symbol-row.negative {
    border-left: 4px solid #e53e3e;
  }

  .symbol-row.neutral {
    border-left: 4px solid #a0aec0;
  }

  .watchlist-table td {
    padding: 1rem 1.5rem;
    font-size: 0.875rem;
  }

  .symbol-cell {
    font-weight: 600;
    color: #333;
  }

  .symbol-text {
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 1rem;
  }

  .price-cell {
    text-align: right;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    color: #4a5568;
  }

  .price-value {
    font-weight: 500;
  }

  .last-price {
    font-weight: 700;
    color: #333;
  }

  .change-cell {
    text-align: right;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-weight: 600;
  }

  .change-cell.positive .change-value {
    color: #38a169;
  }

  .change-cell.negative .change-value {
    color: #e53e3e;
  }

  .change-cell.neutral .change-value {
    color: #a0aec0;
  }

  .actions-cell {
    text-align: center;
  }

  .remove-button {
    background: none;
    border: none;
    color: #a0aec0;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 4px;
    font-size: 1rem;
    line-height: 1;
    transition: color 0.2s, background-color 0.2s;
  }

  .remove-button:hover {
    color: #e53e3e;
    background-color: #fed7d7;
  }

  .remove-button:focus {
    outline: 2px solid #e53e3e;
    outline-offset: 2px;
  }

  .actions-column {
    width: 80px;
  }

  @media (max-width: 768px) {
    .table-header {
      padding: 1rem;
    }

    .table-info {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }

    .watchlist-table th,
    .watchlist-table td {
      padding: 0.75rem 1rem;
    }

    .watchlist-table th {
      font-size: 0.75rem;
    }

    .watchlist-table td {
      font-size: 0.8125rem;
    }

    .symbol-text {
      font-size: 0.875rem;
    }
  }
</style>