<script lang="ts">
  import { onMount } from 'svelte';
  import { authStore } from '$lib/stores/auth';
  import { watchlistsStore } from '$lib/stores/watchlists';
  import { quotesStore } from '$lib/stores/quotes';
  import LoginForm from '$lib/components/auth/LoginForm.svelte';
  import WatchlistManager from '$lib/components/watchlist/WatchlistManager.svelte';
  import WatchlistTable from '$lib/components/watchlist/WatchlistTable.svelte';
  import SymbolSearch from '$lib/components/symbols/SymbolSearch.svelte';
  import SymbolDetail from '$lib/components/symbols/SymbolDetail.svelte';
  import tastyLogo from '$lib/assets/logo.svg';

  let showSymbolSearch = false;
  let selectedSymbol = '';
  let showSymbolDetail = false;

  $: auth = $authStore;
  $: watchlists = $watchlistsStore;

  onMount(() => {
    // Check if user is already authenticated on page load
    authStore.checkAuth();
  });

  // Load watchlists after successful authentication (only once)
  let hasLoadedWatchlists = false;
  $: if (auth.isAuthenticated && !hasLoadedWatchlists && !watchlists.isLoading) {
    hasLoadedWatchlists = true;
    watchlistsStore.loadWatchlists();
  }

  function handleLogout() {
    quotesStore.reset();
    watchlistsStore.reset();
    authStore.logout();
    hasLoadedWatchlists = false;
  }

  function handleAddSymbol() {
    showSymbolSearch = true;
  }

  async function handleSymbolSelect(symbol: string) {
    if (!watchlists.activeWatchlist) return;
    
    const success = await watchlistsStore.addSymbol(watchlists.activeWatchlist, symbol);
    if (success) {
      showSymbolSearch = false;
    }
  }

  function handleCancelSymbolSearch() {
    showSymbolSearch = false;
  }

  async function handleRemoveSymbol(symbol: string) {
    if (!watchlists.activeWatchlist) return;
    
    await watchlistsStore.removeSymbol(watchlists.activeWatchlist, symbol);
  }

  function handleSymbolClick(symbol: string) {
    selectedSymbol = symbol;
    showSymbolDetail = true;
  }

  function handleCloseSymbolDetail() {
    showSymbolDetail = false;
    selectedSymbol = '';
  }
</script>

<svelte:head>
  <title>Tasty Watch - Stock Watchlist</title>
  <meta name="description" content="Real-time stock watchlist powered by Tastytrade API" />
</svelte:head>

{#if !auth.isAuthenticated}
  <LoginForm />
{:else}
  <div class="app-container">
    <header class="app-header">
      <div class="header-content">
        <div class="header-left">
          <img src={tastyLogo} alt="Tasty Watch" class="logo" />
        </div>
        <div class="header-actions">
          {#if auth.user?.username}
            <span class="username">Welcome, {auth.user.username}</span>
          {/if}
          <button type="button" class="add-symbol-button" on:click={handleAddSymbol}>
            + Add Symbol
          </button>
          <button type="button" class="logout-button" on:click={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </header>

    <main class="app-main">
      <div class="main-grid">
        <aside class="sidebar">
          <WatchlistManager />
        </aside>
        
        <section class="content">
          <WatchlistTable 
            onSymbolClick={handleSymbolClick}
            onRemoveSymbol={handleRemoveSymbol}
          />
        </section>
      </div>
    </main>

    {#if showSymbolSearch}
      <SymbolSearch 
        onSymbolSelect={handleSymbolSelect}
        onCancel={handleCancelSymbolSearch}
      />
    {/if}

    {#if showSymbolDetail && selectedSymbol}
      <SymbolDetail 
        symbol={selectedSymbol}
        onClose={handleCloseSymbolDetail}
      />
    {/if}
  </div>
{/if}

<style>
  :global(html) {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    line-height: 1.6;
  }

  :global(body) {
    margin: 0;
    padding: 0;
    background: #f8fafc;
    color: #333;
  }

  :global(*, *::before, *::after) {
    box-sizing: border-box;
  }

  .app-container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .app-header {
    background: white;
    border-bottom: 1px solid #e2e8f0;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    z-index: 100;
  }

  .header-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .logo {
    height: auto;
    width: 400px;
    object-fit: contain;
  }

  .username {
    color: #666;
    font-size: 0.875rem;
    padding: 0.25rem 0.75rem;
    background: #f0f4ff;
    border-radius: 12px;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .add-symbol-button {
    background: #38a169;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 0.75rem 1.5rem;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s, transform 0.1s;
  }

  .add-symbol-button:hover {
    background: #2f855a;
    transform: translateY(-1px);
  }

  .add-symbol-button:active {
    transform: translateY(0);
  }

  .logout-button {
    background: none;
    color: #666;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
    cursor: pointer;
    transition: border-color 0.2s, color 0.2s;
  }

  .logout-button:hover {
    border-color: #cbd5e0;
    color: #4a5568;
  }

  .logout-button:focus {
    outline: 2px solid #667eea;
    outline-offset: 2px;
  }

  .app-main {
    flex: 1;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
    padding: 2rem;
  }

  .main-grid {
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 2rem;
    height: 100%;
  }

  .sidebar {
    display: flex;
    flex-direction: column;
  }

  .content {
    min-height: 500px;
  }

  @media (max-width: 768px) {
    .header-content {
      padding: 1rem;
      flex-direction: column;
      gap: 1rem;
    }

    .header-left {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }

    .logo {
      height: 2rem;
    }

    .header-actions {
      width: 100%;
      justify-content: stretch;
    }

    .add-symbol-button,
    .logout-button {
      flex: 1;
    }

    .app-main {
      padding: 1rem;
    }

    .main-grid {
      grid-template-columns: 1fr;
      gap: 1rem;
    }

    .sidebar {
      order: 2;
    }

    .content {
      order: 1;
    }
  }
</style>
