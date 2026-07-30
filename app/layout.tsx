import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import "./explore-apps.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;
  return {
    title: "sundays — Beautifully vibe-coded apps",
    description: "A gallery for the little apps that became something worth showing.",
    openGraph: { title: "sundays — Made after work. Shared with the world.", description: "A gallery for beautifully vibe-coded apps, made in the offhours.", type: "website", images: [{ url: `${origin}/og.png`, width: 1200, height: 630, alt: "sundays. offhours" }] },
    twitter: { card: "summary_large_image", title: "sundays — Made after work. Shared with the world.", description: "A gallery for beautifully vibe-coded apps, made in the offhours.", images: [`${origin}/og.png`] },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
