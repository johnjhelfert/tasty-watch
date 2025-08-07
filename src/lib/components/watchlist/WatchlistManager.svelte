<script lang="ts">
  import { watchlistsStore } from '$lib/stores/watchlists';
  import DeleteWatchlistDialog from './DeleteWatchlistDialog.svelte';
  import CreateWatchlistForm from './CreateWatchlistForm.svelte';
  
  let showCreateForm = false;
  let showDeleteConfirm = '';

  $: ({ watchlists, activeWatchlist, isLoading, error } = $watchlistsStore);

  function toggleCreateForm() {
    showCreateForm = !showCreateForm;
  }

  async function handleCreateWatchlist(name: string) {
    const success = await watchlistsStore.createWatchlist(name);
    if (success) {
      showCreateForm = false;
      watchlistsStore.setActiveWatchlist(name);
    }
  }

  function handleSelectWatchlist(name: string) {
    watchlistsStore.setActiveWatchlist(name);
  }

  function showDeleteDialog(name: string, event: Event) {
    event.stopPropagation();
    showDeleteConfirm = name;
  }

  function cancelDelete() {
    showDeleteConfirm = '';
  }

  async function confirmDelete() {
    if (!showDeleteConfirm) return;
    
    await watchlistsStore.deleteWatchlist(showDeleteConfirm);
    showDeleteConfirm = '';
  }

  function clearError() {
    watchlistsStore.clearError();
  }
</script>

<div class="watchlist-manager">
  <div class="manager-header">
    <h2>Watchlists</h2>
    <button 
      type="button" 
      class="create-button"
      on:click={toggleCreateForm}
      disabled={showCreateForm && isLoading}
      aria-label="Create new watchlist"
    >
      {showCreateForm ? '✕' : '+'}
    </button>
  </div>

  {#if error}
    <div class="error-banner" role="alert">
      <span class="error-icon">⚠️</span>
      {error}
      <button type="button" class="error-dismiss" on:click={clearError} aria-label="Dismiss error">
        ✕
      </button>
    </div>
  {/if}

  <CreateWatchlistForm 
    isVisible={showCreateForm}
    {isLoading}
    onSubmit={handleCreateWatchlist}
    onCancel={toggleCreateForm}
  />

  <div class="watchlists-list" role="list" aria-label="Your watchlists">
    {#if watchlists.length === 0}
      <div class="empty-state">
        <div class="empty-icon">📝</div>
        <p>No watchlists yet. Create your first one to get started!</p>
      </div>
    {:else}
      {#each watchlists as watchlist}
        <div 
          class="watchlist-item"
          class:active={watchlist.name === activeWatchlist}
          role="listitem"
        >
          <button
            type="button"
            class="watchlist-button"
            on:click={() => handleSelectWatchlist(watchlist.name)}
            disabled={isLoading}
            aria-pressed={watchlist.name === activeWatchlist}
            aria-describedby="watchlist-{watchlist.name}-info"
          >
            <span class="watchlist-info">
              <span class="watchlist-name">{watchlist.name}</span>
              <span id="watchlist-{watchlist.name}-info" class="symbol-count">
                {watchlist['watchlist-entries']?.length} symbol{watchlist['watchlist-entries']?.length !== 1 ? 's' : ''}
              </span>
            </span>
          </button>
          
          <button
            type="button"
            class="delete-button"
            on:click={(e) => showDeleteDialog(watchlist.name, e)}
            disabled={isLoading}
            aria-label="Delete {watchlist.name} watchlist"
            title="Delete watchlist"
          >
            🗑️
          </button>
        </div>
      {/each}
    {/if}
  </div>

  <DeleteWatchlistDialog 
    isOpen={!!showDeleteConfirm}
    watchlistName={showDeleteConfirm}
    {isLoading}
    onConfirm={confirmDelete}
    onCancel={cancelDelete}
  />
</div>

<style>
  .watchlist-manager {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    padding: 1.5rem;
    height: fit-content;
  }

  .manager-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .manager-header h2 {
    margin: 0;
    color: #333;
    font-size: 1.5rem;
    font-weight: 700;
  }

  .create-button {
    background: #667eea;
    color: white;
    border: none;
    border-radius: 8px;
    width: 2.5rem;
    height: 2.5rem;
    font-size: 1.25rem;
    cursor: pointer;
    transition: background-color 0.2s, transform 0.1s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .create-button:hover:not(:disabled) {
    background: #5a67d8;
    transform: translateY(-1px);
  }

  .create-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
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


  .watchlists-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .empty-state {
    text-align: center;
    padding: 2rem 1rem;
    color: #666;
  }

  .empty-icon {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }

  .empty-state p {
    margin: 0;
    font-size: 0.875rem;
    line-height: 1.5;
  }

  .watchlist-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: #f8fafc;
    border-radius: 8px;
    transition: background-color 0.2s;
  }

  .watchlist-item:hover {
    background: #edf2f7;
  }

  .watchlist-item.active {
    background: #e6fffa;
    border: 2px solid #38b2ac;
  }

  .watchlist-button {
    flex: 1;
    background: none;
    border: none;
    padding: 1rem;
    text-align: left;
    cursor: pointer;
    border-radius: 8px;
    transition: background-color 0.2s;
  }

  .watchlist-button:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  .watchlist-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .watchlist-name {
    font-weight: 600;
    color: #333;
    font-size: 0.875rem;
  }

  .symbol-count {
    font-size: 0.75rem;
    color: #666;
  }

  .delete-button {
    background: none;
    border: none;
    color: #a0aec0;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 6px;
    font-size: 1rem;
    transition: color 0.2s, background-color 0.2s;
  }

  .delete-button:hover:not(:disabled) {
    color: #e53e3e;
    background-color: #fed7d7;
  }

  .delete-button:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }


  @media (max-width: 768px) {
    .watchlist-manager {
      padding: 1rem;
    }

    .manager-header h2 {
      font-size: 1.25rem;
    }

    .create-button {
      width: 2rem;
      height: 2rem;
      font-size: 1rem;
    }

  }
</style>