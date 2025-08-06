<script lang="ts">
  import { watchlistsStore } from '$lib/stores/watchlists';
  
  let showCreateForm = false;
  let newWatchlistName = '';
  let showDeleteConfirm = '';

  $: ({ watchlists, activeWatchlist, isLoading, error } = $watchlistsStore);

  function toggleCreateForm() {
    showCreateForm = !showCreateForm;
    if (!showCreateForm) {
      newWatchlistName = '';
    }
  }

  async function handleCreateWatchlist(event: Event) {
    event.preventDefault();
    
    if (!newWatchlistName.trim()) return;

    const success = await watchlistsStore.createWatchlist(newWatchlistName);
    if (success) {
      newWatchlistName = '';
      showCreateForm = false;
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

  {#if showCreateForm}
    <form class="create-form" on:submit={handleCreateWatchlist}>
      <div class="form-group">
        <label for="watchlist-name" class="sr-only">Watchlist name</label>
        <input
          id="watchlist-name"
          type="text"
          bind:value={newWatchlistName}
          placeholder="Enter watchlist name"
          disabled={isLoading}
          required
          maxlength="50"
          aria-describedby="name-help"
        />
        <div id="name-help" class="input-help">
          Choose a descriptive name for your watchlist
        </div>
      </div>
      <div class="form-actions">
        <button type="submit" class="save-button" disabled={isLoading || !newWatchlistName.trim()}>
          {isLoading ? 'Creating...' : 'Create'}
        </button>
        <button type="button" class="cancel-button" on:click={toggleCreateForm} disabled={isLoading}>
          Cancel
        </button>
      </div>
    </form>
  {/if}

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
            <div class="watchlist-info">
              <span class="watchlist-name">{watchlist.name}</span>
              <span id="watchlist-{watchlist.name}-info" class="symbol-count">
                {watchlist['watchlist-entries'].length} symbol{watchlist['watchlist-entries'].length !== 1 ? 's' : ''}
              </span>
            </div>
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

  <!-- Delete confirmation dialog -->
  {#if showDeleteConfirm}
    <div class="dialog-overlay" role="dialog" aria-modal="true" aria-labelledby="delete-title">
      <div class="dialog">
        <h3 id="delete-title">Delete Watchlist</h3>
        <p>Are you sure you want to delete "{showDeleteConfirm}"? This action cannot be undone.</p>
        <div class="dialog-actions">
          <button type="button" class="delete-confirm" on:click={confirmDelete} disabled={isLoading}>
            {isLoading ? 'Deleting...' : 'Delete'}
          </button>
          <button type="button" class="cancel-button" on:click={cancelDelete} disabled={isLoading}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  {/if}
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

  .create-form {
    background: #f8fafc;
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 1.5rem;
  }

  .form-group {
    margin-bottom: 1rem;
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

  .create-form input {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid #e2e8f0;
    border-radius: 6px;
    font-size: 0.875rem;
    transition: border-color 0.2s;
  }

  .create-form input:focus {
    outline: none;
    border-color: #667eea;
  }

  .create-form input:disabled {
    background-color: #f7fafc;
    cursor: not-allowed;
    opacity: 0.6;
  }

  .input-help {
    font-size: 0.75rem;
    color: #666;
    margin-top: 0.25rem;
  }

  .form-actions {
    display: flex;
    gap: 0.5rem;
  }

  .save-button {
    background: #667eea;
    color: white;
    border: none;
    border-radius: 6px;
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .save-button:hover:not(:disabled) {
    background: #5a67d8;
  }

  .save-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .cancel-button {
    background: none;
    color: #666;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    cursor: pointer;
    transition: border-color 0.2s, color 0.2s;
  }

  .cancel-button:hover:not(:disabled) {
    border-color: #cbd5e0;
    color: #4a5568;
  }

  .cancel-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
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

  .dialog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
  }

  .dialog {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    max-width: 400px;
    width: 100%;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  }

  .dialog h3 {
    margin: 0 0 1rem 0;
    color: #333;
    font-size: 1.25rem;
    font-weight: 700;
  }

  .dialog p {
    margin: 0 0 1.5rem 0;
    color: #666;
    line-height: 1.5;
  }

  .dialog-actions {
    display: flex;
    gap: 0.75rem;
    justify-content: flex-end;
  }

  .delete-confirm {
    background: #e53e3e;
    color: white;
    border: none;
    border-radius: 6px;
    padding: 0.75rem 1.5rem;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .delete-confirm:hover:not(:disabled) {
    background: #c53030;
  }

  .delete-confirm:disabled {
    opacity: 0.6;
    cursor: not-allowed;
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

    .dialog {
      padding: 1.5rem;
      margin: 1rem;
    }
  }
</style>