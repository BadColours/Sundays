import { NextRequest, NextResponse } from "next/server";
import { bindings } from "../../../db/repository";

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ key: string[] }> }) {
  const bucket = bindings().THUMBNAILS;
  if (!bucket) return new NextResponse("Thumbnail storage unavailable", { status: 503 });
  const { key } = await params;
  const storageKey = key.join("/");
  if (!/^projects\/[a-zA-Z0-9-]+\/[a-zA-Z0-9-]+\.(png|webp|jpg)$/.test(storageKey)) return new NextResponse("Not found", { status:404 });
  const object = await bucket.get(storageKey);
  if (!object) return new NextResponse("Not found", { status: 404 });
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  const type = headers.get("content-type");
  if (!["image/png", "image/webp", "image/jpeg"].includes(type ?? "")) return new NextResponse("Unsupported image", {status:415});
  headers.set("etag", object.httpEtag);
  headers.set("cache-control", "public, max-age=31536000, immutable");
  headers.set("x-content-type-options", "nosniff");
  return new NextResponse(object.body, { headers });
}
