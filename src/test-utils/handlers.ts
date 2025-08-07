import { http, HttpResponse } from 'msw';

export const handlers = [
	// Auth endpoints
	http.post('/api/auth', async ({ request }) => {
		const body = await request.json() as { username: string; password: string };
		
		// Check if it's a valid authentication request
		if (body.username === 'baduser' || body.password === 'badpass') {
			return HttpResponse.json(
				{ error: 'Authentication failed' },
				{ status: 401 }
			);
		}
		
		return HttpResponse.json({
			data: {
				'session-token': 'mock-session-token',
				user: {
					email: 'test@example.com',
					username: 'testuser'
				}
			}
		});
	}),

	http.post('/api/auth/validate', () => {
		return HttpResponse.json({ valid: true });
	}),

	http.post('/api/auth/logout', () => {
		return new HttpResponse(null, { status: 200 });
	}),

	// Watchlist endpoints
	http.get('/api/watchlists', () => {
		return HttpResponse.json({
			data: [
				{
					name: 'Test Watchlist',
					'watchlist-entries': [
						{ symbol: 'AAPL', 'instrument-type': 'Equity' },
						{ symbol: 'GOOGL', 'instrument-type': 'Equity' }
					]
				}
			]
		});
	}),

	http.post('/api/watchlists', () => {
		return HttpResponse.json({
			data: {
				name: 'New Watchlist',
				'watchlist-entries': []
			}
		});
	}),

	http.put('/api/watchlists/:id', () => {
		return HttpResponse.json({
			id: '1',
			name: 'Updated Watchlist',
			symbols: ['AAPL', 'GOOGL', 'MSFT', 'TSLA']
		});
	}),

	http.delete('/api/watchlists/:id', () => {
		return new HttpResponse(null, { status: 200 });
	}),

	// Market data endpoints
	http.get('/api/market-data/:symbol', ({ params }) => {
		const { symbol } = params;
		return HttpResponse.json({
			data: {
				symbol: symbol as string,
				last: '150.22',
				bid: '149.95',
				ask: '150.05',
				'bid-size': 100,
				'ask-size': 100,
				close: '149.50',
				'day-high-price': '152.00',
				'day-low-price': '148.00',
				'instrument-type': 'Equity',
				'is-trading-halted': false,
				mark: '150.00',
				mid: '150.00',
				open: '149.50',
				'prev-close': '149.00',
				'prev-close-date': '2024-01-01',
				'summary-date': '2024-01-02',
				'updated-at': new Date().toISOString(),
				'year-high-price': '180.00',
				'year-low-price': '120.00'
			}
		});
	}),

	// Symbol search endpoints
	http.get('/api/symbols/search/:query', ({ params }) => {
		const { query } = params;
		// For tests, always return both results since test expects 2
		return HttpResponse.json({
			data: [
				{
					symbol: 'AAPL',
					description: 'Apple Inc.',
					'instrument-type': 'Equity'
				},
				{
					symbol: 'AMZN',
					description: 'Amazon.com Inc.',
					'instrument-type': 'Equity'
				}
			]
		});
	})
];