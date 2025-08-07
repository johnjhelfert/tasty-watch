import type { Page } from '@playwright/test';

/**
 * Set up API mocking for E2E tests using Playwright's route interception
 * This is the proper way to mock APIs in E2E tests without polluting production code
 */
export async function setupApiMocks(page: Page) {
  // Mock authentication endpoint
  await page.route('**/api/auth', async route => {
    const request = route.request();
    const postData = request.postDataJSON();
    
    if (postData?.username === 'baduser' || postData?.username === 'invalid') {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Authentication failed' })
      });
    } else {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            'session-token': 'mock-session-token',
            user: {
              email: 'test@example.com',
              username: 'testuser'
            }
          }
        })
      });
    }
  });

  // Mock watchlists GET endpoint
  await page.route('**/api/watchlists', async route => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            {
              name: 'Test Watchlist',
              'watchlist-entries': [
                { symbol: 'AAPL', 'instrument-type': 'Equity' },
                { symbol: 'TSLA', 'instrument-type': 'Equity' }
              ]
            }
          ]
        })
      });
    } else if (route.request().method() === 'POST') {
      const postData = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            name: postData?.name || 'New Watchlist',
            'watchlist-entries': []
          }
        })
      });
    }
  });

  // Mock watchlist operations (PUT/DELETE)
  await page.route('**/api/watchlists/*', async route => {
    if (route.request().method() === 'DELETE') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: undefined })
      });
    } else if (route.request().method() === 'PUT') {
      const postData = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            name: postData?.name || 'Updated Watchlist',
            'watchlist-entries': postData?.watchlistEntries || []
          }
        })
      });
    }
  });

  // Mock market data endpoint
  await page.route('**/api/market-data/*', async route => {
    const url = new URL(route.request().url());
    const symbol = url.pathname.split('/').pop()?.toUpperCase() || 'UNKNOWN';
    
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          symbol,
          ask: '150.25',
          'ask-size': 100,
          bid: '150.20',
          'bid-size': 200,
          close: '149.50',
          'day-high-price': '151.00',
          'day-low-price': '148.75',
          'instrument-type': 'Equity',
          'is-trading-halted': false,
          last: '150.22',
          mark: '150.225',
          mid: '150.225',
          open: '149.80',
          'prev-close': '149.50',
          'prev-close-date': '2025-01-06',
          'summary-date': '2025-01-07',
          'updated-at': '2025-01-07T12:00:00Z',
          'year-high-price': '180.00',
          'year-low-price': '120.00'
        }
      })
    });
  });

  // Mock symbol search endpoint
  await page.route('**/api/symbols/search/*', async route => {
    const url = new URL(route.request().url());
    const query = url.pathname.split('/').pop() || 'UNKNOWN';
    
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: [
          { symbol: query.toUpperCase(), description: `${query.toUpperCase()} Inc.`, 'instrument-type': 'Equity' },
          { symbol: `${query.toUpperCase()}2`, description: `${query.toUpperCase()}2 Corp.`, 'instrument-type': 'Equity' }
        ]
      })
    });
  });
}