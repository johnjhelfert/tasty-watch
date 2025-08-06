import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const API_BASE_URL = 'https://api.cert.tastyworks.com';

function getAuthHeaders(sessionToken: string | null) {
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'User-Agent': 'TastyWatch/1.0.0 (Custom Desktop App)',
    'Authorization': sessionToken ? `Bearer ${sessionToken}` : '',
  };
}

export const GET: RequestHandler = async ({ request, params }) => {
  try {
    const sessionToken = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!sessionToken) {
      return json({ error: 'Not authenticated' }, { status: 401 });
    }

    const response = await fetch(`${API_BASE_URL}/market-data/${params.symbol.toUpperCase()}`, {
      headers: getAuthHeaders(sessionToken)
    });

    if (!response.ok) {
      return json({ error: `Failed to fetch quote for ${params.symbol}: ${response.statusText}` }, { status: response.status });
    }

    const data = await response.json();
    const quote = {
      symbol: params.symbol.toUpperCase(),
      'bid-price': data['bid-price'] || 0,
      'ask-price': data['ask-price'] || 0,
      'last-price': data['last-price'] || 0,
      'net-change': data['net-change'] || 0,
      'net-change-percent': data['net-change-percent'] || 0
    };

    return json({ data: quote });
  } catch (error) {
    return json({ 
      error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
};