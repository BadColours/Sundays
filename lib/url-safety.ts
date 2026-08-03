const blockedHostSuffixes = [".localhost", ".local", ".internal", ".home", ".lan", ".test", ".invalid", ".example"];

function parseIPv4(value: string) {
  const parts = value.split(".");
  if (parts.length !== 4 || parts.some((part) => !/^\d{1,3}$/.test(part))) return null;
  const octets = parts.map(Number);
  return octets.every((part) => part >= 0 && part <= 255) ? octets : null;
}

export function isPrivateIp(value: string) {
  const normalized = value.toLowerCase().replace(/^\[|\]$/g, "");
  const ipv4 = parseIPv4(normalized);
  if (ipv4) {
    const [a, b] = ipv4;
    return a === 0 || a === 10 || a === 127 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || a >= 224;
  }
  if (!normalized.includes(":")) return false;
  return normalized === "::" || normalized === "::1" || normalized.startsWith("fc") || normalized.startsWith("fd") || /^fe[89ab]/.test(normalized) || normalized.startsWith("::ffff:127.") || normalized.startsWith("::ffff:10.") || normalized.startsWith("::ffff:192.168.");
}

export function validatePublicUrl(value: string): URL {
  let url: URL;
  try { url = new URL(value); } catch { throw new Error("Enter a valid public URL."); }
  if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error("Only public HTTP or HTTPS URLs are accepted.");
  if (url.username || url.password) throw new Error("URLs containing credentials are not accepted.");
  const hostname = url.hostname.toLowerCase().replace(/\.$/, "");
  if (!hostname || hostname === "localhost" || !hostname.includes(".") || blockedHostSuffixes.some((suffix) => hostname.endsWith(suffix)) || isPrivateIp(hostname)) {
    throw new Error("Local, private, or internal addresses are not accepted.");
  }
  url.hash = "";
  return url;
}

async function resolvePublicHost(hostname: string, signal: AbortSignal) {
  if (parseIPv4(hostname) || hostname.includes(":")) {
    if (isPrivateIp(hostname)) throw new Error("The URL resolves to a private address.");
    return;
  }
  for (const type of ["A", "AAAA"]) {
    const response = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(hostname)}&type=${type}`, {
      headers: { accept: "application/dns-json" }, signal,
    });
    if (!response.ok) throw new Error("The project host could not be verified.");
    const payload = await response.json() as { Answer?: Array<{ type: number; data: string }> };
    const addresses = (payload.Answer ?? []).filter((answer) => answer.type === 1 || answer.type === 28).map((answer) => answer.data);
    if (addresses.some(isPrivateIp)) throw new Error("The URL resolves to a private address.");
  }
}

export async function probePublicUrl(value: string) {
  let current = validatePublicUrl(value);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);
  try {
    for (let redirectCount = 0; redirectCount <= 3; redirectCount += 1) {
      await resolvePublicHost(current.hostname, controller.signal);
      const response = await fetch(current.toString(), {
        method: "GET",
        redirect: "manual",
        headers: { "user-agent": "Sundays-Link-Check/1.0", range: "bytes=0-65535", accept: "text/html,application/xhtml+xml" },
        signal: controller.signal,
      });
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get("location");
        if (!location || redirectCount === 3) throw new Error("The project URL has an unsafe or excessive redirect chain.");
        current = validatePublicUrl(new URL(location, current).toString());
        continue;
      }
      if (!response.ok) throw new Error(`The project URL returned ${response.status}.`);
      const length = Number(response.headers.get("content-length") ?? 0);
      if (length > 2_000_000) throw new Error("The project response is too large to verify safely.");
      await response.body?.cancel();
      return current.toString();
    }
  } catch (error) {
    if (controller.signal.aborted) throw new Error("The project URL took too long to respond.");
    throw error;
  } finally {
    clearTimeout(timeout);
  }
  throw new Error("The project URL could not be verified.");
}
