import type { Metadata } from 'next';

import { GridBackground } from '~/components/aceternity';
import { JsonLd } from '~/components/json-ld';

import { HobbyQuiz } from './quiz-client';

export const metadata: Metadata = {
  title: 'Find Your Next Hobby — Hobby Quiz | SignificantHobbies',
  description:
    'Take our free hobby quiz to discover your perfect hobby. Answer 5 quick questions and get personalized hobby recommendations based on your personality and interests.',
  openGraph: {
    title: 'Find Your Next Hobby — Free Quiz',
    description: 'Answer 5 questions. Get personalized hobby recommendations.',
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
          url: 'https://significanthobbies.com/find-your-hobby',
          applicationCategory: 'LifestyleApplication',
          offers: { '@type': 'Offer', price: '0' },
        }}
      />
      <div className="relative">
        <GridBackground variant="dots" size={22} />
        <HobbyQuiz />
      </div>
    </>
  );
}
