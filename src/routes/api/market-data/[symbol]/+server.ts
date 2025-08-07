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

    const response = await fetch(`${apiConfig.getApiUrl()}/market-data/${params.symbol.toUpperCase()}`, {
      headers: getAuthHeaders(sessionToken)
    });

    if (!response.ok) {
      return json({ error: `Failed to fetch quote for ${params.symbol}: ${response.statusText}` }, { status: response.status });
    }

    const data = await response.json();

    return json(data);
  } catch (error) {
    return json({ 
      error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
};