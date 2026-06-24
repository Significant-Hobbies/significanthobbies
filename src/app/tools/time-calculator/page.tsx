import type { Metadata } from 'next';

import { TimeCalculatorClient } from './time-calculator-client';

export const metadata: Metadata = {
  title: 'Hobby Time Calculator — How Much Free Time Do You Have? | SignificantHobbies',
  description:
    "Calculate how much free time you actually have for hobbies each week. Input your schedule and discover hidden hours you didn't know existed.",
};

export default function TimeCalculatorPage() {
  return <TimeCalculatorClient />;
}
