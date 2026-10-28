import type { z } from 'zod';

export const fail = (status: number, message: string): never => {
  throw new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
};
export async function body<T>(request: Request, schema: z.ZodType<T>): Promise<T> {
  if (Number(request.headers.get('Content-Length') || 0) > 1_000_000)
    fail(413, 'Content is too large.');
  const reader = request.body?.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  if (reader) {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 1_000_000) {
        await reader.cancel();
        fail(413, 'Content is too large.');
      }
      chunks.push(value);
    }
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  let input: unknown;
  try {
    input = JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return fail(400, 'Invalid JSON.');
  }
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return fail(400, `${issue.path.join('.') || 'Request'}: ${issue.message}`);
  }
  return parsed.data;
}
