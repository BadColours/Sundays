const MAX_IMAGE_BYTES = 5_000_000;
export async function readCaptureImage(response: Response) {
  const type = response.headers.get("content-type")?.split(";")[0].toLowerCase() ?? "";
  if (!["image/png", "image/webp", "image/jpeg"].includes(type)) { await response.body?.cancel(); throw new Error("The capture service must return PNG, WebP, or JPEG."); }
  if (Number(response.headers.get("content-length") ?? 0) > MAX_IMAGE_BYTES) { await response.body?.cancel(); throw new Error("Captured image is too large."); }
  const reader = response.body?.getReader();
  if (!reader) throw new Error("The capture is empty.");
  const parts: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const {done, value} = await reader.read();
      if (done) break;
      size += value.length;
      if (size > MAX_IMAGE_BYTES) throw new Error("Captured image is too large.");
      parts.push(value);
    }
  } finally { await reader.cancel(); reader.releaseLock(); }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const part of parts) { bytes.set(part,offset); offset += part.length; }
  const signature = type === "image/png" ? bytes[0] === 137 && bytes[1] === 80 && bytes[2] === 78 && bytes[3] === 71
    : type === "image/jpeg" ? bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
    : String.fromCharCode(...bytes.slice(0,4)) === "RIFF" && String.fromCharCode(...bytes.slice(8,12)) === "WEBP";
  if (!signature) throw new Error("The capture service returned an invalid image.");
  return { bytes, contentType:type, extension:type === "image/png" ? "png" : type === "image/webp" ? "webp" : "jpg" };
}
