import type { Metadata } from "next";

interface SharePageProps {
  params: { id: string };
}

export async function generateMetadata({
  params,
}: SharePageProps): Promise<Metadata> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return {
    title: "AI Spend Audit Results — StackAudit",
    description:
      "See how much this team could save on AI tools like Cursor, Copilot, Claude, and ChatGPT.",
    openGraph: {
      title: "AI Spend Audit Results — StackAudit",
      description:
        "Free audit: find out how much your startup overspends on AI tools.",
      type: "website",
      url: `${appUrl}/share/${params.id}`,
      images: ["/og-image.png"],
    },
    twitter: {
      card: "summary_large_image",
      title: "AI Spend Audit Results",
      description: "Free audit of AI tool spend for startups.",
      images: ["/og-image.png"],
    },
  };
}

export default function SharePage({ params }: SharePageProps) {
  return <ShareClient auditId={params.id} />;
}

// ── Client component for fetching and rendering ──
import ShareClient from "./ShareClient";
