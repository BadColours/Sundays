import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sundays demo",
  robots: { index: false, follow: false, nocache: true },
};

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
