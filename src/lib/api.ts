export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api/${path}`, {
    ...options,
    headers: {
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...options.headers,
    },
  });
  const data = await response.json();
  if (!response.ok) throw new Error((data as { error?: string }).error || 'Request failed.');
  return data as T;
}

export const send = (method: string, data?: unknown): RequestInit => ({
  method,
  body: data == null ? undefined : JSON.stringify(data),
});
