import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const API_BASE_URL = 'https://api.cert.tastyworks.com';

function getAuthHeaders(sessionToken: string | null) {
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'User-Agent': 'TastyWatch/1.0.0',
    'Authorization': sessionToken ? `Bearer ${sessionToken}` : '',
  };
}

export const GET: RequestHandler = async ({ request }) => {
  try {
    const sessionToken = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!sessionToken) {
      return json({ error: 'Not authenticated' }, { status: 401 });
    }

    console.log(getAuthHeaders(sessionToken))

    const response = await fetch(`${API_BASE_URL}/watchlists`, {
      headers: getAuthHeaders(sessionToken)
    });

    const body = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        return json({ error: '401 Unauthorized - Session expired' }, { status: 401 });
      }
      return json({ error: `Failed to fetch watchlists: ${response.statusText}` }, { status: response.status });
    }

    const result = await response.json();
    return json({ data: result.data.items });
  } catch (error) {
    return json({ 
      error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    const sessionToken = request.headers.get('authorization')?.replace('Bearer ', '');
    
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