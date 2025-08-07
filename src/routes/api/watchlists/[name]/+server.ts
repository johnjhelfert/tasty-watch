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

export const PUT: RequestHandler = async ({ request, params }) => {
  try {
    const sessionToken = request.headers.get('authorization');
    
    if (!sessionToken) {
      return json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { name, watchlistEntries } = await request.json();
    
    if (!watchlistEntries) {
      return json({ error: 'Missing watchlist entries' }, { status: 400 });
    }

    let apiUrl: string;
    let method: string;
    let body: string | undefined;

    apiUrl = `${API_BASE_URL}/watchlists/${encodeURIComponent(params.name)}`;
    method = 'PUT';
    body = JSON.stringify({
      name,
      'watchlist-entries': watchlistEntries
    });

    const response = await fetch(apiUrl, {
      method,
      headers: getAuthHeaders(sessionToken),
      ...(body && { body })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return json({ 
        error: `Failed to update watchlist: ${response.statusText}`,
        details: errorText 
      }, { status: response.status });
    }

    const result = await response.json();
    return json({ data: result.data });
  } catch (error) {
    return json({ 
      error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
};