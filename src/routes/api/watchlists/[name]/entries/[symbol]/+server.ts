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

export const DELETE: RequestHandler = async ({ request, params }) => {
  try {
    const sessionToken = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!sessionToken) {
      return json({ error: 'Not authenticated' }, { status: 401 });
    }

    const response = await fetch(`${API_BASE_URL}/watchlists/${encodeURIComponent(params.name)}/watchlist-entries/${params.symbol.toUpperCase()}`, {
      method: 'DELETE',
      headers: getAuthHeaders(sessionToken)
    });

    if (!response.ok) {
      return json({ error: `Failed to remove symbol: ${response.statusText}` }, { status: response.status });
    }

    const result = await response.json();
    return json({ data: result.data });
  } catch (error) {
    return json({ 
      error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
};