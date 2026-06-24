'use client';

import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';

import { Input } from '~/components/ui/input';

interface Props {
  initialQuery: string;
}

export function SearchPageClient({ initialQuery }: Props) {
  const router = useRouter();
  const [value, setValue] = useState(initialQuery);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      setValue(v);
      if (v.trim()) {
        router.push(`/search?q=${encodeURIComponent(v.trim())}`);
      } else {
        router.push('/search');
      }
    },
    [router]
  );

  return (
    <div className="relative">
      <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
      <Input
        value={value}
        onChange={handleChange}
        placeholder="Search timelines, people, hobbies..."
        className="h-12 border-stone-300 bg-white pl-10 text-base placeholder:text-stone-400"
        autoFocus
      />
    </div>
  );
}
