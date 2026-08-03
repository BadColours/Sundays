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
    title: "sundays — Personal software made after hours",
    description: "Open creator profiles and a gallery of independent applications, hosted and controlled by their makers.",
    openGraph: { title: "sundays — Personal software made after hours", description: "Open creator profiles and a gallery of independent applications, hosted and controlled by their makers.", type: "website", images: [{ url: `${origin}/og.png`, width: 1200, height: 630, alt: "sundays. offhours" }] },
    twitter: { card: "summary_large_image", title: "sundays — Personal software made after hours", description: "Open creator profiles and a gallery of independent applications, hosted and controlled by their makers.", images: [`${origin}/og.png`] },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
