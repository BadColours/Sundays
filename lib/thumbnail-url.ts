export function thumbnailUrl(storageKey: string | null) {
  return storageKey ? `/thumbnail/${storageKey.split("/").map(encodeURIComponent).join("/")}` : null;
}
