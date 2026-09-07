import type { Metadata } from "next";
import "./globals.css";
import "./explore-apps.css";
import "./product.css";
export const metadata: Metadata = {
  icons: { icon: "/favicon.svg" },
  metadataBase: new URL("https://offhours-gallery.badcolours.chatgpt.site"),
  title: "sundays — Personal software made after hours",
  description: "Open creator profiles and a gallery of independent applications, hosted and controlled by their makers.",
  openGraph: {title:"sundays — Personal software made after hours",description:"Personal software, hosted and controlled by its creators.",type:"website",images:[{url:"/og.png",width:1200,height:630,alt:"sundays. offhours"}]},
  twitter: {card:"summary_large_image",images:["/og.png"]},
};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>) { return <html lang="en"><body>{children}</body></html>; }
