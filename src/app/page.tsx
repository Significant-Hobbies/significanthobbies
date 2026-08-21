import { PersonalAppsHub } from '~/components/personal-apps-hub';
import { getPersonalDataInventory } from '~/server/personal-platform';

export const metadata = {
  title: 'Significant Hobbies — Personal Apps',
  description: 'A simple directory for Live, Journal, Habits, Calorie, Setline, Kith, and Anchor.',
  alternates: { canonical: 'https://significanthobbies.com' },
};

export default async function HomePage() {
  const inventory = await getPersonalDataInventory();
  return <PersonalAppsHub inventory={inventory} />;
}
