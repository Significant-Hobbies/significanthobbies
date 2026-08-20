import { PersonalAppsHub } from '~/components/personal-apps-hub';

export const metadata = {
  title: 'Significant Hobbies — Personal Apps',
  description: 'A simple directory for Live, Journal, Habits, Calorie, Setline, Kith, and Anchor.',
  alternates: { canonical: 'https://significanthobbies.com' },
};

export default function HomePage() {
  return <PersonalAppsHub />;
}
