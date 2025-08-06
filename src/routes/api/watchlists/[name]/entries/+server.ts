import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getAuthHeaders } from '$lib/utils/auth.js';

const API_BASE_URL = 'https://api.cert.tastyworks.com';

export const POST: RequestHandler = async ({ request, params }) => {
  try {
    const sessionToken = request.headers.get('authorization');
    
    if (!sessionToken) {
      return json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { symbol } = await request.json();

    const response = await fetch(`${API_BASE_URL}/watchlists/${encodeURIComponent(params.name)}/watchlist-entries`, {
      method: 'POST',
      headers: getAuthHeaders(sessionToken),
      body: JSON.stringify({
        symbol: symbol.toUpperCase(),
        'instrument-type': 'Equity'
      })
    });

    if (!response.ok) {
      return json({ error: `Failed to add symbol: ${response.statusText}` }, { status: response.status });
    }

    const result = await response.json();
    return json({ data: result.data });
  } catch (error) {
    return json({ 
      error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
};