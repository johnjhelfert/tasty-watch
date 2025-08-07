<script lang="ts">
  export let isOpen = false;
  export let watchlistName = '';
  export let isLoading = false;
  export let onConfirm: () => void;
  export let onCancel: () => void;
</script>

{#if isOpen}
  <div class="dialog-overlay" role="dialog" aria-modal="true" aria-labelledby="delete-title">
    <div class="dialog">
      <h3 id="delete-title">Delete Watchlist</h3>
      <p>Are you sure you want to delete "{watchlistName}"? This action cannot be undone.</p>
      <div class="dialog-actions">
        <button type="button" class="delete-confirm" on:click={onConfirm} disabled={isLoading}>
          {isLoading ? 'Deleting...' : 'Delete'}
        </button>
        <button type="button" class="cancel-button" on:click={onCancel} disabled={isLoading}>
          Cancel
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
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

  .cancel-button {
    background: none;
    color: #666;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 0.75rem 1.5rem;
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

  @media (max-width: 768px) {
    .dialog {
      padding: 1.5rem;
      margin: 1rem;
    }
  }
</style>