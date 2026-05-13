import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StackAudit — Free AI Spend Audit for Startups",
  description:
    "Find out if you're overspending on AI tools. Get a free, instant audit of your Cursor, Copilot, Claude, ChatGPT & API spend — with real savings recommendations.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    title: "StackAudit — Free AI Spend Audit for Startups",
    description:
      "Stop overpaying for AI tools. Get an instant audit of your stack and find real savings.",
    type: "website",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "StackAudit — Free AI Spend Audit",
    description:
      "Stop overpaying for AI tools. Instant audit, real savings.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-surface antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
