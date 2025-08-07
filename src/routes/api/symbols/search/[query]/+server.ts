import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getAuthHeaders } from '$lib/utils/auth.js';
import { apiConfig } from '$lib/config/api.js';

export const GET: RequestHandler = async ({ request, params }) => {
  try {
    const sessionToken = request.headers.get('authorization');
    
    if (!sessionToken) {
      return json({ error: 'Not authenticated' }, { status: 401 });
    }

    if (!params.query.trim()) {
      return json({ data: [] });
    }

    const response = await fetch(`${apiConfig.getApiUrl()}/symbols/search/${encodeURIComponent(params.query)}`, {
      headers: getAuthHeaders(sessionToken)
    });

    if (!response.ok) {
      return json({ error: `Failed to search symbols: ${response.statusText}` }, { status: response.status });
    }

    const result = await response.json();
    return json({ data: result.data.items });
  } catch (error) {
    return json({ 
      error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
};