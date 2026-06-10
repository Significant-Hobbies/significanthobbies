import "~/app/globals.css";

import { type Metadata, type Viewport } from "next";
import { AnalyticsProvider } from "~/components/posthog-provider";
import { SaaSMakerFeedback } from "~/components/saasmaker-feedback";
import { SaasMakerAnalytics } from "~/components/SaasMakerAnalytics";
import { Geist } from "next/font/google";
import { Providers } from "~/components/providers";
import { Nav } from "~/components/nav";
import { JsonLd } from "~/components/json-ld";

const geist = Geist({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "SignificantHobbies — Your Hobby Journey",
    template: "%s | SignificantHobbies",
  },
  description:
    "Map your hobby history across life phases. Discover what rekindled, what persisted, and what to explore next.",
  manifest: "/manifest.json",
  icons: [{ rel: "icon", url: "/favicon.ico" }, { rel: "icon", url: "/icon.svg", type: "image/svg+xml" }],
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SignificantHobbies",
  },
  formatDetection: { telephone: false },
  openGraph: {
    type: "website",
    siteName: "SignificantHobbies",
    url: "https://significanthobbies.com",
    title: "SignificantHobbies — Your Hobby Journey",
    description:
      "Map your hobby history across life phases. Discover what rekindled, what persisted, and what to explore next.",
  },
  alternates: {
    canonical: "https://significanthobbies.com",
  },
  metadataBase: new URL("https://significanthobbies.com"),
  twitter: {
    card: "summary_large_image",
    title: "SignificantHobbies — Your Hobby Journey",
    description: "Map your hobby history across life phases.",
  },
};

export const viewport: Viewport = {
  themeColor: "#059669",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geist.className} min-h-screen bg-amber-50 text-stone-900`}>
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "SignificantHobbies",
            url: "https://significanthobbies.com",
            description:
              "Map your hobby history across life phases. Discover what rekindled, what persisted, and what to explore next.",
            sameAs: [],
          }}
        />
        <AnalyticsProvider>
          <Providers>
            <Nav />
            <main>{children}</main>
            <SaaSMakerFeedback />
            <SaasMakerAnalytics />
          </Providers>
        </AnalyticsProvider>
      </body>
    </html>
  );
}
