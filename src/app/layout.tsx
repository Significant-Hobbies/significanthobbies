import '~/app/globals.css';

import type { Metadata, Viewport } from 'next';
import { Fraunces, Geist } from 'next/font/google';

import { JsonLd } from '~/components/json-ld';
import { Nav } from '~/components/nav';
import { AnalyticsProvider } from '~/components/posthog-provider';
import { Providers } from '~/components/providers';
import { SaaSMakerFeedback } from '~/components/saasmaker-feedback';
import { SiteFooter } from '~/components/site-footer';
import { VitalsReporter } from '~/components/VitalsReporter';

const geist = Geist({ subsets: ['latin'], display: 'swap', variable: '--font-sans' });
const fraunces = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-serif',
  axes: ['opsz'],
});

export const metadata: Metadata = {
  title: {
    default: 'SignificantHobbies — Your Hobby Journey',
    template: '%s | SignificantHobbies',
  },
  description:
    'Map your hobby history across life phases. Discover what rekindled, what persisted, and what to explore next.',
  keywords: [
    'hobby discovery',
    'hobby journal',
    'life phases hobbies',
    'hobby timeline',
    'bucket list',
    'find your hobby',
    'hobby quiz',
    'daily rituals',
    'habit tracking',
    'life planner',
  ],
  authors: [{ name: 'SignificantHobbies' }],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  manifest: '/manifest.json',
  icons: [
    { rel: 'icon', url: '/favicon.ico' },
    { rel: 'icon', url: '/icon.svg', type: 'image/svg+xml' },
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SignificantHobbies',
  },
  formatDetection: { telephone: false },
  openGraph: {
    type: 'website',
    siteName: 'SignificantHobbies',
    url: 'https://significanthobbies.com',
    title: 'SignificantHobbies — Your Hobby Journey',
    description:
      'Map your hobby history across life phases. Discover what rekindled, what persisted, and what to explore next.',
    images: [
      {
        url: 'https://significanthobbies.com/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'SignificantHobbies — Your Hobby Journey',
      },
    ],
  },
  alternates: {
    canonical: 'https://significanthobbies.com',
  },
  metadataBase: new URL('https://significanthobbies.com'),
  twitter: {
    card: 'summary_large_image',
    title: 'SignificantHobbies — Your Hobby Journey',
    description: 'Map your hobby history across life phases.',
    images: ['https://significanthobbies.com/opengraph-image'],
  },
};

export const viewport: Viewport = {
  themeColor: '#0c2b29',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${fraunces.variable}`}>
      <body
        className={`${geist.variable} ${fraunces.variable} min-h-screen bg-background text-foreground font-sans antialiased`}
      >
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'SignificantHobbies',
            url: 'https://significanthobbies.com',
            description:
              'Map your hobby history across life phases. Discover what rekindled, what persisted, and what to explore next.',
            sameAs: ['https://github.com/sarthak-fleet/significanthobbies'],
          }}
        />
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'SignificantHobbies',
            url: 'https://significanthobbies.com',
            description:
              'Map your hobby history across life phases. Discover what rekindled, what persisted, and what to explore next.',
            inLanguage: 'en',
            publisher: {
              '@type': 'Organization',
              name: 'SignificantHobbies',
              url: 'https://significanthobbies.com',
            },
          }}
        />
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "SignificantHobbies",
            url: "https://significanthobbies.com",
            description: "Discover meaningful hobbies, try Side Quests, map your hobby journey, and create a playable Life Bingo bucket list.",
            potentialAction: {
              "@type": "SearchAction",
              target: "https://significanthobbies.com/search?q={search_term_string}",
              "query-input": "required name=search_term_string",
            },
          }}
        />
        <AnalyticsProvider>
          <Providers>
            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground"
            >
              Skip to content
            </a>
            <Nav />
            <main id="main">{children}</main>
            <SiteFooter />
            <SaaSMakerFeedback />
            <VitalsReporter />
          </Providers>
        </AnalyticsProvider>
      </body>
    </html>
  );
}
