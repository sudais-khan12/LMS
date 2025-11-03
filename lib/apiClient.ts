export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export async function apiClient<T = unknown>(
  url: string,
  options?: { method?: HttpMethod; body?: unknown; headers?: Record<string, string> }
): Promise<T> {
  const res = await fetch(url, {
    method: options?.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
    body: options?.body !== undefined ? JSON.stringify(options.body) : undefined,
    credentials: 'include',
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    // Extract error message from API response
    // API returns { success: false, error: "..." } for errors
    const message = data?.error || data?.message || `Request failed (${res.status})`;
    const error = new Error(message);
    // Attach status code for better error handling
    (error as any).status = res.status;
    (error as any).response = data;
    throw error;
  }
  return data as T;
}


