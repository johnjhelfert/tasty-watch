<script lang="ts">
  import { getQuoteBySymbol } from '$lib/stores/quotes';
  import { formatPrice, formatChange, formatPercentage, getPriceChangeClass } from '$lib/utils/formatters';
  import SymbolChart from './SymbolChart.svelte';

  export let symbol: string;
  export let onClose: () => void = () => {};

  $: quote = $getQuoteBySymbol(symbol);
  $: netChange = quote ? parseFloat(quote.last) - parseFloat(quote['prev-close']) : 0;
  $: changeClass = getPriceChangeClass(netChange);


  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="symbol-detail-overlay" role="dialog" aria-modal="true" aria-labelledby="detail-title">
  <div class="detail-dialog">
    <div class="detail-header">
      <div class="symbol-info">
        <h2 id="detail-title" class="symbol-title">{symbol}</h2>
        {#if quote}
          <div class="price-info">
            <span class="current-price">${formatPrice(parseFloat(quote.last))}</span>
            <span class="price-change {changeClass}">
              {formatChange(netChange)} ({formatPercentage((netChange / parseFloat(quote['prev-close'])) * 100)})
            </span>
          </div>
        {/if}
      </div>
      <button 
        type="button" 
        class="close-button" 
        on:click={onClose}
        aria-label="Close symbol details"
      >
        ✕
      </button>
    </div>

    <div class="detail-content">
      <SymbolChart {symbol} />

      {#if quote}
        <div class="quote-details">
          <h3>Market Data</h3>
          <div class="details-grid">
            <div class="detail-item">
              <span class="detail-label">Bid Price</span>
              <span class="detail-value">${formatPrice(parseFloat(quote.bid))}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Ask Price</span>
              <span class="detail-value">${formatPrice(parseFloat(quote.ask))}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Last Price</span>
              <span class="detail-value">${formatPrice(parseFloat(quote.last))}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Net Change</span>
              <span class="detail-value {changeClass}">
                {formatChange(netChange)}
              </span>
            </div>
            <div class="detail-item">
              <span class="detail-label">% Change</span>
              <span class="detail-value {changeClass}">
                {formatPercentage((netChange / parseFloat(quote['prev-close'])) * 100)}
              </span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Spread</span>
              <span class="detail-value">
                ${formatPrice(parseFloat(quote.ask) - parseFloat(quote.bid))}
              </span>
            </div>
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .symbol-detail-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1100;
    padding: 2rem;
    overflow-y: auto;
  }

  .detail-dialog {
    background: white;
    border-radius: 16px;
    box-shadow: 0 24px 48px rgba(0, 0, 0, 0.2);
    width: 100%;
    max-width: 900px;
    max-height: 90vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .detail-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 2rem 2rem 1rem;
    border-bottom: 1px solid #e2e8f0;
  }

  .symbol-info {
    flex: 1;
  }

  .symbol-title {
    margin: 0 0 0.5rem 0;
    color: #333;
    font-size: 2rem;
    font-weight: 700;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  }

  .price-info {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-top: 0.5rem;
  }

  .current-price {
    font-size: 1.5rem;
    font-weight: 700;
    color: #333;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  }

  .price-change {
    font-size: 1rem;
    font-weight: 600;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  }

  .price-change.positive {
    color: #38a169;
  }

  .price-change.negative {
    color: #e53e3e;
  }

  .price-change.neutral {
    color: #a0aec0;
  }

  .close-button {
    background: none;
    border: none;
    color: #a0aec0;
    cursor: pointer;
    padding: 0.75rem;
    border-radius: 8px;
    font-size: 1.5rem;
    line-height: 1;
    transition: color 0.2s, background-color 0.2s;
    margin: -0.5rem -0.5rem 0 0;
  }

  .close-button:hover {
    color: #666;
    background-color: #f7fafc;
  }

  .close-button:focus {
    outline: 2px solid #667eea;
    outline-offset: 2px;
  }

  .detail-content {
    flex: 1;
    overflow-y: auto;
    padding: 1rem 2rem 2rem;
  }


  .quote-details h3 {
    margin: 0 0 1rem 0;
    color: #333;
    font-size: 1.25rem;
    font-weight: 700;
  }

  .details-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }

  .detail-item {
    background: #f8fafc;
    padding: 1rem;
    border-radius: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .detail-label {
    font-size: 0.875rem;
    color: #666;
    font-weight: 500;
  }

  .detail-value {
    font-size: 0.875rem;
    font-weight: 700;
    color: #333;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  }

  .detail-value.positive {
    color: #38a169;
  }

  .detail-value.negative {
    color: #e53e3e;
  }

  .detail-value.neutral {
    color: #a0aec0;
  }

  @media (max-width: 768px) {
    .symbol-detail-overlay {
      padding: 1rem;
    }

    .detail-header {
      padding: 1.5rem 1.5rem 1rem;
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }

    .symbol-title {
      font-size: 1.5rem;
    }

    .current-price {
      font-size: 1.25rem;
    }

    .price-info {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }

    .close-button {
      align-self: flex-end;
      margin-top: -2rem;
    }

    .detail-content {
      padding: 1rem 1.5rem 1.5rem;
    }

    .details-grid {
      grid-template-columns: 1fr;
    }
  }
</style>