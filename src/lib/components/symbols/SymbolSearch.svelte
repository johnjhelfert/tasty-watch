<script lang="ts">
  import { onMount } from 'svelte';
  import { apiService, type SymbolSearchResult } from '$lib/services/api';
  import { debounce } from '$lib/utils/formatters';
  import { activeWatchlist } from '$lib/stores/watchlists';
  
  export let onSymbolSelect: (symbol: string) => void = () => {};
  export let onCancel: () => void = () => {};

  let searchQuery = '';
  let searchResults: SymbolSearchResult[] = [];
  let isSearching = false;
  let searchError = '';
  let selectedIndex = -1;
  let searchInput: HTMLInputElement;

  $: watchlist = $activeWatchlist;

  // Debounced search function
  const debouncedSearch = debounce(async (query: string) => {
    if (!query.trim()) {
      searchResults = [];
      return;
    }

    isSearching = true;
    searchError = '';

    const result = await apiService.searchSymbols(query.trim());

    if (result.error || !result.data) {
      searchError = result.error || 'Failed to search symbols';
      searchResults = [];
    } else {
      searchResults = result.data.slice(0, 10); // Limit to 10 results
    }

    isSearching = false;
    selectedIndex = -1;
  }, 300);

  // Search when query changes
  $: debouncedSearch(searchQuery);

  onMount(() => {
    // Focus search input when component mounts
    if (searchInput) {
      searchInput.focus();
    }
  });

  function handleSymbolSelect(symbol: string) {
    onSymbolSelect(symbol);
    resetSearch();
  }

  function handleKeydown(event: KeyboardEvent) {
    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        onCancel();
        break;

      case 'ArrowDown':
        event.preventDefault();
        if (searchResults.length > 0) {
          selectedIndex = Math.min(selectedIndex + 1, searchResults.length - 1);
        }
        break;

      case 'ArrowUp':
        event.preventDefault();
        if (searchResults.length > 0) {
          selectedIndex = Math.max(selectedIndex - 1, -1);
        }
        break;

      case 'Enter':
        event.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
          handleSymbolSelect(searchResults[selectedIndex].symbol);
        } else if (searchQuery.trim()) {
          // Allow direct symbol entry
          handleSymbolSelect(searchQuery.trim().toUpperCase());
        }
        break;
    }
  }

  function resetSearch() {
    searchQuery = '';
    searchResults = [];
    selectedIndex = -1;
    searchError = '';
  }

  function handleResultClick(symbol: string, index: number) {
    selectedIndex = index;
    handleSymbolSelect(symbol);
  }

  function handleCancel() {
    resetSearch();
    onCancel();
  }

  function clearError() {
    searchError = '';
  }
</script>

<div class="symbol-search-overlay" role="dialog" aria-modal="true" aria-labelledby="search-title">
  <div class="search-dialog">
    <div class="search-header">
      <h2 id="search-title">Add Symbol to {watchlist?.name || 'Watchlist'}</h2>
      <button 
        type="button" 
        class="close-button" 
        on:click={handleCancel}
        aria-label="Close search"
      >
        ✕
      </button>
    </div>

    <div class="search-form">
      <div class="search-input-container">
        <label for="symbol-search" class="sr-only">Search for stocks</label>
        <input
          id="symbol-search"
          bind:this={searchInput}
          bind:value={searchQuery}
          type="text"
          placeholder="Type a stock symbol or company name..."
          on:keydown={handleKeydown}
          aria-describedby="search-help"
          aria-owns={searchResults.length > 0 ? 'search-results' : undefined}
          aria-activedescendant={selectedIndex >= 0 ? `result-${selectedIndex}` : undefined}
          autocomplete="off"
          spellcheck="false"
        />
        {#if isSearching}
          <div class="search-loading" aria-label="Searching">
            <span class="loading-spinner">⟳</span>
          </div>
        {/if}
      </div>
      
      <div id="search-help" class="search-help">
        Use arrow keys to navigate, Enter to select, Escape to cancel
      </div>

      {#if searchError}
        <div class="error-message" role="alert">
          <span class="error-icon">⚠️</span>
          {searchError}
          <button type="button" class="error-dismiss" on:click={clearError} aria-label="Dismiss error">
            ✕
          </button>
        </div>
      {/if}
    </div>

    {#if searchResults.length > 0}
      <div class="search-results">
        <ul id="search-results" role="listbox" aria-label="Search results">
          {#each searchResults as result, index}
            <li
              id="result-{index}"
              role="option"
              class="search-result"
              class:selected={index === selectedIndex}
              aria-selected={index === selectedIndex}
              tabindex="-1"
              on:click={() => handleResultClick(result.symbol, index)}
              on:keydown={(e) => e.key === 'Enter' && handleResultClick(result.symbol, index)}
            >
              <div class="result-content">
                <div class="symbol-info">
                  <span class="symbol-text">{result.symbol}</span>
                  <span class="instrument-type">{result['instrument-type']}</span>
                </div>
                <div class="description">{result.description}</div>
              </div>
            </li>
          {/each}
        </ul>

        <div class="results-footer">
          <p class="results-help">
            {#if selectedIndex >= 0}
              Press Enter to add {searchResults[selectedIndex].symbol}
            {:else}
              Select a symbol or type directly and press Enter
            {/if}
          </p>
        </div>
      </div>
    {:else if searchQuery.trim() && !isSearching && !searchError}
      <div class="no-results">
        <div class="no-results-icon">🔍</div>
        <p>No symbols found for "{searchQuery}"</p>
        <p class="no-results-help">Try a different search term or enter the symbol directly</p>
      </div>
    {/if}

    {#if !searchQuery.trim() && !isSearching}
      <div class="search-placeholder">
        <div class="placeholder-icon">📈</div>
        <h3>Search for Stocks</h3>
        <p>Start typing a stock symbol (e.g., AAPL) or company name to find stocks to add to your watchlist.</p>
        <div class="search-tips">
          <h4>Tips:</h4>
          <ul>
            <li>Use stock symbols for fastest results</li>
            <li>Search by company name for discovery</li>
            <li>Navigate with arrow keys</li>
          </ul>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .symbol-search-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: flex-start;
    justify-content: center;
    z-index: 1000;
    padding: 2rem;
    padding-top: 10vh;
  }

  .search-dialog {
    background: white;
    border-radius: 12px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
    width: 100%;
    max-width: 600px;
    max-height: 80vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .search-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 2rem;
    border-bottom: 1px solid #e2e8f0;
  }

  .search-header h2 {
    margin: 0;
    color: #333;
    font-size: 1.25rem;
    font-weight: 700;
  }

  .close-button {
    background: none;
    border: none;
    color: #a0aec0;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 6px;
    font-size: 1.25rem;
    line-height: 1;
    transition: color 0.2s, background-color 0.2s;
  }

  .close-button:hover {
    color: #666;
    background-color: #f7fafc;
  }

  .close-button:focus {
    outline: 2px solid #667eea;
    outline-offset: 2px;
  }

  .search-form {
    padding: 1.5rem 2rem;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
  }

  .search-input-container {
    position: relative;
    margin-bottom: 0.75rem;
  }

  .search-input-container input {
    width: 100%;
    padding: 1rem 3rem 1rem 1rem;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .search-input-container input:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  .search-loading {
    position: absolute;
    right: 1rem;
    top: 50%;
    transform: translateY(-50%);
  }

  .loading-spinner {
    animation: spin 1s linear infinite;
    display: inline-block;
    color: #667eea;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .search-help {
    font-size: 0.875rem;
    color: #666;
    margin-bottom: 0.75rem;
  }

  .error-message {
    background-color: #fed7d7;
    border: 1px solid #feb2b2;
    border-radius: 8px;
    padding: 0.75rem 1rem;
    color: #c53030;
    font-size: 0.875rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
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

  .search-results {
    flex: 1;
    overflow-y: auto;
    border-top: 1px solid #e2e8f0;
  }

  .search-results ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .search-result {
    cursor: pointer;
    border-bottom: 1px solid #f7fafc;
    transition: background-color 0.2s;
  }

  .search-result:hover,
  .search-result.selected {
    background-color: #f0f4ff;
  }

  .search-result.selected {
    border-left: 4px solid #667eea;
  }

  .result-content {
    padding: 1rem 2rem;
  }

  .symbol-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.25rem;
  }

  .symbol-text {
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-weight: 700;
    color: #333;
    font-size: 1rem;
  }

  .instrument-type {
    background: #e2e8f0;
    color: #4a5568;
    padding: 0.125rem 0.5rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
  }

  .description {
    color: #666;
    font-size: 0.875rem;
    line-height: 1.4;
  }

  .results-footer {
    padding: 1rem 2rem;
    border-top: 1px solid #f7fafc;
    background: #fafafa;
  }

  .results-help {
    margin: 0;
    font-size: 0.875rem;
    color: #666;
    text-align: center;
  }

  .no-results {
    text-align: center;
    padding: 2rem;
    color: #666;
  }

  .no-results-icon {
    font-size: 2rem;
    margin-bottom: 1rem;
  }

  .no-results p {
    margin: 0 0 0.5rem 0;
  }

  .no-results-help {
    font-size: 0.875rem;
    color: #a0aec0;
  }

  .search-placeholder {
    text-align: center;
    padding: 3rem 2rem;
    color: #666;
  }

  .placeholder-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .search-placeholder h3 {
    margin: 0 0 1rem 0;
    color: #333;
    font-size: 1.5rem;
    font-weight: 700;
  }

  .search-placeholder p {
    margin: 0 0 2rem 0;
    line-height: 1.6;
    max-width: 400px;
    margin-left: auto;
    margin-right: auto;
  }

  .search-tips {
    text-align: left;
    max-width: 300px;
    margin: 0 auto;
    background: #f8fafc;
    padding: 1.5rem;
    border-radius: 8px;
  }

  .search-tips h4 {
    margin: 0 0 0.75rem 0;
    color: #333;
    font-size: 1rem;
    font-weight: 600;
  }

  .search-tips ul {
    margin: 0;
    padding-left: 1.25rem;
    font-size: 0.875rem;
    line-height: 1.5;
  }

  .search-tips li {
    margin-bottom: 0.25rem;
  }

  @media (max-width: 768px) {
    .symbol-search-overlay {
      padding: 1rem;
      padding-top: 5vh;
    }

    .search-header {
      padding: 1rem 1.5rem;
    }

    .search-header h2 {
      font-size: 1.125rem;
    }

    .search-form {
      padding: 1rem 1.5rem;
    }

    .result-content {
      padding: 1rem 1.5rem;
    }

    .results-footer {
      padding: 1rem 1.5rem;
    }

    .search-placeholder {
      padding: 2rem 1rem;
    }

    .search-tips {
      padding: 1rem;
    }
  }
</style>