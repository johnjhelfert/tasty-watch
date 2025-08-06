
export function getAuthHeaders(sessionToken: string | null): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'User-Agent': 'TastyWatch/1.0.0',
    'Authorization': sessionToken || '',
  };
}