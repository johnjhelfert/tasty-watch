<script lang="ts">
  import { onMount, onDestroy, tick } from 'svelte';
  import { createChart, ColorType, CandlestickSeries } from 'lightweight-charts';
  import { getQuoteBySymbol } from '$lib/stores/quotes';

  export let symbol: string;

  let chartContainer: HTMLDivElement;
  let chart: any = null;
  let candlestickSeries: any = null;
  let isLoading = true;
  let error = '';
  let chartData: any[] = [];

  $: quote = $getQuoteBySymbol(symbol);

  onMount(() => {
    loadChartData();
  });

  onDestroy(() => {
    if (chart) {
      chart.remove();
    }
  });

  function initializeChart() {
    if (!chartContainer) {
      console.warn('Chart container not found');
      return;
    }

    try {
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

      candlestickSeries = chart.addSeries(CandlestickSeries, {
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
    } catch (err) {
      console.error('Failed to initialize chart:', err);
      throw err;
    }
  }

  async function loadChartData() {
    if (!symbol) return;

    isLoading = true;
    error = '';

    try {
      // Note: This is a mock implementation,
      //   authenticating with the websockets for candle would require full account access
      //   In a real implementation, this would fetch from:
      //   https://developer.tastytrade.com/streaming-market-data/#candle-events
      
      // Generate mock 24-hour candlestick data for demonstration
      const mockData = generateMockCandleData(symbol);
      
      chartData = mockData;
      isLoading = false;
      
      // Initialize chart after DOM is updated
      await tick();
      initializeChart();
      
      if (candlestickSeries) {
        candlestickSeries.setData(mockData);
        chart?.timeScale().fitContent();
      }
    } catch (err) {
      error = `Failed to load chart data: ${err instanceof Error ? err.message : 'Unknown error'}`;
      isLoading = false;
    }
  }

  function generateMockCandleData(symbol: string): any[] {
    // Generate 24 hours of hourly candlestick data
    const data = [];
    const now = Date.now();
    const basePrice = parseFloat(quote?.last || '100');
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

  export function retryLoadChart() {
    loadChartData();
  }
</script>

{#if error}
  <div class="error-state" role="alert">
    <div class="error-icon">⚠️</div>
    <h3>Chart Error</h3>
    <p>{error}</p>
    <button type="button" class="retry-button" on:click={retryLoadChart}>
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
{/if}

<style>
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

  @media (max-width: 768px) {
    .chart-container {
      height: 300px;
    }

    .chart-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }

    .chart-legend {
      gap: 1rem;
    }
  }
</style>