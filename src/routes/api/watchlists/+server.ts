import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getAuthHeaders } from '$lib/utils/auth.js';

const API_BASE_URL = 'https://api.cert.tastyworks.com';

export const GET: RequestHandler = async ({ request }) => {
  try {
    const sessionToken = request.headers.get('authorization');
    
    if (!sessionToken) {
      return json({ error: 'Not authenticated' }, { status: 401 });
    }

    const response = await fetch(`${API_BASE_URL}/watchlists`, {
      headers: getAuthHeaders(sessionToken)
    });

    const result = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        return json({ error: '401 Unauthorized - Session expired' }, { status: 401 });
      }
      return json({ error: `Failed to fetch watchlists: ${response.statusText}` }, { status: response.status });
    }

    return json({ data: result.data.items });
  } catch (error) {
    return json({ 
      error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    const sessionToken = request.headers.get('authorization');
    
    if (!sessionToken) {
      return json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { name } = await request.json();

    const response = await fetch(`${API_BASE_URL}/watchlists`, {
      method: 'POST',
      headers: getAuthHeaders(sessionToken),
      body: JSON.stringify({
        name: name,
        'watchlist-entries': []
      })
    });

    if (!response.ok) {
      return json({ error: `Failed to create watchlist: ${response.statusText}` }, { status: response.status });
    }

    const result = await response.json();
    return json({ data: result.data });
  } catch (error) {
    return json({ 
      error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
};