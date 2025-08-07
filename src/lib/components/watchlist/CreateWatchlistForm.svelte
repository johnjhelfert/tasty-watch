<script lang="ts">
  export let isVisible = false;
  export let isLoading = false;
  export let onSubmit: (name: string) => void;
  export let onCancel: () => void;

  let newWatchlistName = '';

  function handleSubmit(event: Event) {
    event.preventDefault();
    
    if (!newWatchlistName.trim()) return;

    onSubmit(newWatchlistName);
  }

  function handleCancel() {
    newWatchlistName = '';
    onCancel();
  }

  $: if (!isVisible) {
    newWatchlistName = '';
  }
</script>

{#if isVisible}
  <form class="create-form" on:submit={handleSubmit}>
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
      <button type="button" class="cancel-button" on:click={handleCancel} disabled={isLoading}>
        Cancel
      </button>
    </div>
  </form>
{/if}

<style>
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
</style>