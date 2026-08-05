import type { Metadata } from 'next';

import { JsonLd } from '~/components/json-ld';
import { DEFAULT_SOCIAL_IMAGE, SITE_URL } from '~/lib/site-metadata';

import { HobbyQuiz } from './quiz-client';

export const metadata: Metadata = {
  title: 'Find Your Next Hobby — Hobby Quiz',
  description:
    'Take our free hobby quiz to discover your perfect hobby. Answer nine focused questions and get personalized recommendations based on your interests and preferred way of spending time.',
  alternates: { canonical: '/find-your-hobby' },
  openGraph: {
    title: 'Find Your Next Hobby — Free Quiz',
    description: 'Answer nine focused questions. Get personalized hobby recommendations.',
    url: '/find-your-hobby',
    type: 'website',
    images: [{ url: DEFAULT_SOCIAL_IMAGE }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Find Your Next Hobby — Free Quiz',
    description: 'Answer nine focused questions. Get personalized hobby recommendations.',
    images: [DEFAULT_SOCIAL_IMAGE],
  },
};

export default function FindYourHobbyPage() {
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'Hobby Finder Quiz',
          description: 'Find your perfect hobby with our free personality quiz.',
          url: `${SITE_URL}/find-your-hobby`,
          applicationCategory: 'LifestyleApplication',
          offers: { '@type': 'Offer', price: '0' },
        }}
      />
      <div className="relative bg-[#b9dcf5]">
        <HobbyQuiz />
      </div>
    </>
  );
}
