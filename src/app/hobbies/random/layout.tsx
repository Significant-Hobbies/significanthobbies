import type { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: { canonical: 'https://significanthobbies.com/hobbies/random' },
};

export default function RandomHobbyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
