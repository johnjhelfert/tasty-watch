import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getAuthHeaders } from '$lib/utils/auth.js';

const API_BASE_URL = 'https://api.cert.tastyworks.com';

export const DELETE: RequestHandler = async ({ request, params }) => {
  try {
    const sessionToken = request.headers.get('authorization');
    
    if (!sessionToken) {
      return json({ error: 'Not authenticated' }, { status: 401 });
    }

    const response = await fetch(`${API_BASE_URL}/watchlists/${encodeURIComponent(params.name)}`, {
      method: 'DELETE',
      headers: getAuthHeaders(sessionToken)
    });

    if (!response.ok) {
      return json({ error: `Failed to delete watchlist: ${response.statusText}` }, { status: response.status });
    }

    return json({ data: undefined });
  } catch (error) {
    return json({ 
      error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
};