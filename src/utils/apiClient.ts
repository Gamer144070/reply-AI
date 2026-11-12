/**
 * Safe API client utility to prevent "Unexpected token '<' / <!doctype" JSON parsing errors
 */
export async function postApiJson<T>(url: string, payload: unknown): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const responseText = await response.text();

  let data: any;
  try {
    data = JSON.parse(responseText);
  } catch (_e) {
    if (!response.ok) {
      throw new Error(`Server temporarily unavailable (HTTP ${response.status}). Please try again.`);
    }
    throw new Error('Received non-JSON response from server. Please refresh and try again.');
  }

  if (!response.ok) {
    throw new Error(data?.error || `Server responded with status ${response.status}`);
  }

  return data as T;
}
