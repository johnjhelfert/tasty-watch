import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { apiConfig } from '$lib/config/api.js';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { username, password } = await request.json();

    const response = await fetch(`${apiConfig.getApiUrl()}/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'TastyWatch/1.0.0'
      },
      body: JSON.stringify({
        login: username,
        password: password
      })
    });

    if (!response.ok) {
      const error = await response.text();
      return json({ error: `Authentication failed: ${error}` }, { status: response.status });
    }

    const data = await response.json();
    return json({ data: data.data });
  } catch (error) {
    return json({ 
      error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
};