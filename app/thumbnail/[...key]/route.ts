import { NextRequest, NextResponse } from "next/server";
import { bindings } from "../../../db/repository";

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ key: string[] }> }) {
  const bucket = bindings().THUMBNAILS;
  if (!bucket) return new NextResponse("Thumbnail storage unavailable", { status: 503 });
  const { key } = await params;
  const object = await bucket.get(key.join("/"));
  if (!object) return new NextResponse("Not found", { status: 404 });
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("cache-control", "public, max-age=31536000, immutable");
  headers.set("x-content-type-options", "nosniff");
  return new NextResponse(object.body, { headers });
}
