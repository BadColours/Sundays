/** Cookie-authenticated writes must originate from this site. */
export function isSameOriginMutation(request: Request) {
  if (request.headers.get("sec-fetch-site") === "cross-site") return false;
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try { return new URL(origin).origin === new URL(request.url).origin; }
  catch { return false; }
}

export function mutationGuard(request: Request) {
  if (!isSameOriginMutation(request)) return new Response("This request must come from Sundays. Reload the page and try again.", { status: 403 });
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > 16_384) return new Response("The form is too large.", { status: 413 });
  return null;
}

export async function readBoundedFormData(request: Request) {
  const reader = request.body?.getReader();
  if (!reader) return new FormData();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 16_384) throw new Error("The form is too large.");
      chunks.push(value);
    }
  } finally { await reader.cancel(); reader.releaseLock(); }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  return new Response(bytes, { headers: { "content-type": request.headers.get("content-type") ?? "application/x-www-form-urlencoded" } }).formData();
}
