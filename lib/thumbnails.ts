import { bindings, getProjectById, setThumbnailState } from "../db/repository";
import { validatePublicUrl } from "./url-safety";
import { readCaptureImage } from "./image-response";
export { thumbnailUrl } from "./thumbnail-url";

export async function captureProjectThumbnail(projectId: string) {
  const project = await getProjectById(projectId);
  if (!project) return;
  const runtime = bindings();
  const finish = (status: "ready" | "failed", key: string | null, error: string | null) => setThumbnailState(projectId,status,key,error,project.live_url,project.updated_at);
  if (!runtime.THUMBNAILS) { await finish("failed",null,"Thumbnail storage is unavailable."); return; }
  // Existing provider retained. A custom service must enforce network isolation
  // for redirects and subresources, not just the initial URL.
  const screenshotApiUrl = runtime.SCREENSHOT_API_URL || "https://webshot.site/api/capture";
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(),50_000);
  try {
    const safeUrl = validatePublicUrl(project.live_url).toString();
    const isWebshot = new URL(screenshotApiUrl).hostname === "webshot.site";
    const response = await fetch(screenshotApiUrl, {
      method:"POST", redirect:"error", signal:controller.signal,
      headers:{"content-type":"application/json",accept:"image/webp,image/png,image/jpeg",...(runtime.SCREENSHOT_API_TOKEN ? {authorization:`Bearer ${runtime.SCREENSHOT_API_TOKEN}`} : {})},
      body:JSON.stringify(isWebshot ? {url:safeUrl,format:"webp",mode:"desktop_viewport"} : {url:safeUrl,viewport:{width:1440,height:1024},output:{format:"webp",quality:82,width:1200,height:850},security:{blockPrivateNetworks:true,maxRedirects:3}}),
    });
    if (!response.ok) { await response.body?.cancel(); throw new Error("The preview service is temporarily unavailable. Please retry."); }
    const {bytes,contentType,extension} = await readCaptureImage(response);
    const key = `projects/${project.id}/${crypto.randomUUID()}.${extension}`;
    await runtime.THUMBNAILS.put(key,bytes,{httpMetadata:{contentType,cacheControl:"public, max-age=31536000, immutable"}});
    const saved = await finish("ready",key,null);
    // Late jobs may not overwrite newer edits; discard only their new object.
    if (!saved) await runtime.THUMBNAILS.delete(key);
  } catch {
    await finish("failed",null,"The preview could not be captured. You can retry from your dashboard.");
  } finally { clearTimeout(timeout); }
}
