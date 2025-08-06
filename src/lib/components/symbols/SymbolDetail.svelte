<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { createChart, ColorType } from 'lightweight-charts';
  import { getQuoteBySymbol } from '../../stores/quotes.js';
  import { formatPrice, formatChange, formatPercentage, getPriceChangeClass } from '../../utils/formatters.js';
  
  export let symbol: string;
  export let onClose: () => void = () => {};

  let chartContainer: HTMLDivElement;
  let chart: any = null;
  let candlestickSeries: any = null;
  let isLoading = true;
  let error = '';
  let chartData: any[] = [];

  $: quote = $getQuoteBySymbol(symbol);
  $: changeClass = getPriceChangeClass(quote?.['net-change']);

  onMount(() => {
    initializeChart();
    loadChartData();
  });

  onDestroy(() => {
    if (chart) {
      chart.remove();
    }
  });

  function initializeChart() {
    if (!chartContainer) return;

    chart = createChart(chartContainer, {
      width: chartContainer.clientWidth,
      height: 400,
      layout: {
        background: { type: ColorType.Solid, color: '#ffffff' },
        textColor: '#333333',
      },
      grid: {
        vertLines: { color: '#f0f3f7' },
        horzLines: { color: '#f0f3f7' },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: '#e1e5e9',
      },
      timeScale: {
        borderColor: '#e1e5e9',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    candlestickSeries = chart.addCandlestickSeries({
      upColor: '#38a169',
      downColor: '#e53e3e',
      borderDownColor: '#e53e3e',
      borderUpColor: '#38a169',
      wickDownColor: '#e53e3e',
      wickUpColor: '#38a169',
    });

    // Handle window resize
    const handleResize = () => {
      if (chart && chartContainer) {
        chart.applyOptions({ width: chartContainer.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }

  async function loadChartData() {
    if (!symbol) return;

    isLoading = true;
    error = '';

    try {
      // Note: This is a mock implementation since the Tastytrade candle endpoint
      // details aren't fully specified in the requirements.
      // In a real implementation, this would fetch from:
      // https://developer.tastytrade.com/streaming-market-data/#candle-events
      
      // Generate mock 24-hour candlestick data for demonstration
      const mockData = generateMockCandleData(symbol);
      
      if (candlestickSeries) {
        candlestickSeries.setData(mockData);
        chart?.timeScale().fitContent();
      }

      chartData = mockData;
      isLoading = false;
    } catch (err) {
      error = `Failed to load chart data: ${err instanceof Error ? err.message : 'Unknown error'}`;
      isLoading = false;
    }
  }

  function generateMockCandleData(symbol: string): any[] {
    // Generate 24 hours of hourly candlestick data
    const data = [];
    const now = Date.now();
    const basePrice = quote?.['last-price'] || 100;
    let currentPrice = basePrice;

    for (let i = 24; i >= 0; i--) {
      const time = Math.floor((now - i * 60 * 60 * 1000) / 1000);
      
      // Generate realistic price movement
      const volatility = 0.02; // 2% volatility
      const change = (Math.random() - 0.5) * volatility * currentPrice;
      const open = currentPrice;
      const high = open + Math.abs(change) * (0.5 + Math.random() * 0.5);
      const low = open - Math.abs(change) * (0.5 + Math.random() * 0.5);
      const close = open + change;

      data.push({
        time,
        open: parseFloat(open.toFixed(2)),
        high: parseFloat(high.toFixed(2)),
        low: parseFloat(low.toFixed(2)),
        close: parseFloat(close.toFixed(2))
      });

      currentPrice = close;
    }

    return data;
  }

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
            <span class="current-price">${formatPrice(quote['last-price'])}</span>
            <span class="price-change {changeClass}">
              {formatChange(quote['net-change'])} ({formatPercentage(quote['net-change-percent'])})
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
      {#if error}
        <div class="error-state" role="alert">
          <div class="error-icon">⚠️</div>
          <h3>Chart Error</h3>
          <p>{error}</p>
          <button type="button" class="retry-button" on:click={loadChartData}>
            Retry
          </button>
        </div>
      {:else if isLoading}
        <div class="loading-state">
          <div class="loading-spinner">⟳</div>
          <h3>Loading Chart</h3>
          <p>Fetching 24-hour price data for {symbol}...</p>
        </div>
      {:else}
        <div class="chart-section">
          <div class="chart-header">
            <h3>24-Hour Price Chart</h3>
            <div class="chart-info">
              <span class="data-points">{chartData.length} data points</span>
            </div>
          </div>
          <div class="chart-container" bind:this={chartContainer}></div>
          <div class="chart-legend">
            <div class="legend-item">
              <span class="legend-color up"></span>
              <span>Price Up</span>
            </div>
            <div class="legend-item">
              <span class="legend-color down"></span>
              <span>Price Down</span>
            </div>
          </div>
        </div>

        {#if quote}
          <div class="quote-details">
            <h3>Market Data</h3>
            <div class="details-grid">
              <div class="detail-item">
                <span class="detail-label">Bid Price</span>
                <span class="detail-value">${formatPrice(quote['bid-price'])}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Ask Price</span>
                <span class="detail-value">${formatPrice(quote['ask-price'])}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Last Price</span>
                <span class="detail-value">${formatPrice(quote['last-price'])}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Net Change</span>
                <span class="detail-value {changeClass}">
                  {formatChange(quote['net-change'])}
                </span>
              </div>
              <div class="detail-item">
                <span class="detail-label">% Change</span>
                <span class="detail-value {changeClass}">
                  {formatPercentage(quote['net-change-percent'])}
                </span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Spread</span>
                <span class="detail-value">
                  ${formatPrice((quote['ask-price'] || 0) - (quote['bid-price'] || 0))}
                </span>
              </div>
            </div>
          </div>
        {/if}
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

  .error-state,
  .loading-state {
    text-align: center;
    padding: 3rem 2rem;
    color: #666;
  }

  .error-icon,
  .loading-spinner {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .loading-spinner {
    animation: spin 1s linear infinite;
    display: inline-block;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .error-state h3,
  .loading-state h3 {
    margin: 0 0 0.5rem 0;
    color: #333;
    font-size: 1.25rem;
    font-weight: 700;
  }

  .error-state p,
  .loading-state p {
    margin: 0 0 1.5rem 0;
    line-height: 1.5;
  }

  .retry-button {
    background: #667eea;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 0.75rem 1.5rem;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .retry-button:hover {
    background: #5a67d8;
  }

  .chart-section {
    margin-bottom: 2rem;
  }

  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .chart-header h3 {
    margin: 0;
    color: #333;
    font-size: 1.25rem;
    font-weight: 700;
  }

  .chart-info {
    font-size: 0.875rem;
    color: #666;
  }

  .data-points {
    background: #f0f4ff;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-weight: 600;
  }

  .chart-container {
    width: 100%;
    height: 400px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    margin-bottom: 1rem;
  }

  .chart-legend {
    display: flex;
    justify-content: center;
    gap: 2rem;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: #666;
  }

  .legend-color {
    width: 1rem;
    height: 0.25rem;
    border-radius: 2px;
  }

  .legend-color.up {
    background: #38a169;
  }

  .legend-color.down {
    background: #e53e3e;
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

    .chart-container {
      height: 300px;
    }

    .chart-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }

    .details-grid {
      grid-template-columns: 1fr;
    }

    .chart-legend {
      gap: 1rem;
    }
  }
</style>