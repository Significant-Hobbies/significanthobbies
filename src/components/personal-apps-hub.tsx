import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

import type { PersonalDataInventory as PersonalDataInventoryModel } from '~/lib/personal-data-inventory';

import { PersonalDataInventory } from './personal-data-inventory';

type Product = {
  name: string;
  mark: string;
  description: string;
  platforms: string;
  status: string;
  href?: string;
  color: string;
};

const products: Product[] = [
  {
    name: 'Live',
    mark: 'L',
    description: 'A lifelong catalog for places, hobbies, side quests, and experiences.',
    platforms: 'Web',
    status: 'Available now',
    href: 'https://live.significanthobbies.com',
    color: '#fff09a',
  },
  {
    name: 'Journal',
    mark: 'J',
    description: 'A private page for morning, evening, and everything worth remembering.',
    platforms: 'iPhone · iPad',
    status: 'Native app in preparation',
    href: 'https://journal.significanthobbies.com',
    color: '#eadcf6',
  },
  {
    name: 'Habits',
    mark: 'H',
    description: 'Keep what helps, trade what does not, and remember the choices you made.',
    platforms: 'iPhone · iPad',
    status: 'Native app in preparation',
    href: 'https://habits.significanthobbies.com',
    color: '#dceeff',
  },
  {
    name: 'Calorie',
    mark: 'C',
    description: 'A private food, water, medicine, and weight journal.',
    platforms: 'Web · Apple',
    status: 'Web app available',
    href: 'https://calorie.significanthobbies.com',
    color: '#e4efd9',
  },
  {
    name: 'Setline',
    mark: 'S',
    description: 'A personal record for the practice and progress that matter to you.',
    platforms: 'Apple',
    status: 'Native app in preparation',
    href: 'https://setline.significanthobbies.com',
    color: '#f5e2d2',
  },
  {
    name: 'Kith',
    mark: 'K',
    description: 'A private place for the people you want to keep close.',
    platforms: 'iPhone',
    status: 'Native app in preparation',
    href: 'https://kith.significanthobbies.com',
    color: '#f6e1d4',
  },
  {
    name: 'Anchor',
    mark: 'A',
    description: 'See where your time went, including the interruptions around it.',
    platforms: 'Mac · iPhone · Watch',
    status: 'Native app in preparation',
    href: 'https://anchor.significanthobbies.com',
    color: '#dce8f0',
  },
];

export function PersonalAppsHub({ inventory }: { inventory: PersonalDataInventoryModel | null }) {
  return (
    <div className="min-h-[calc(100vh-4.5rem)] bg-[#fffdf4] px-4 py-12 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <header className="max-w-3xl">
          <p className="text-sm font-bold text-[#7658ad]">Significant Hobbies</p>
          <h1 className="mt-3 text-5xl leading-[0.98] tracking-[-0.045em] sm:text-7xl">
            Your personal apps, in one place.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#625b50]">
            Seven focused products. Each stays useful on its own. This Hub is the simple front door.
          </p>
        </header>

        <section aria-labelledby="products-heading" className="mt-12">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 id="products-heading" className="text-3xl sm:text-4xl">
              The collection
            </h2>
            <p className="text-sm text-[#5f584c]">Directory plus a read-only sync check.</p>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => {
              const card = (
                <>
                  <div className="flex items-start justify-between gap-4">
                    <span
                      aria-hidden="true"
                      className="flex size-12 items-center justify-center rounded-2xl border border-black/10 bg-white/70 font-serif text-xl font-bold shadow-sm"
                    >
                      {product.mark}
                    </span>
                    {product.href ? <ArrowUpRight className="size-5" aria-hidden="true" /> : null}
                  </div>
                  <div className="mt-10">
                    <h3 className="font-serif text-3xl font-semibold tracking-[-0.025em]">
                      {product.name}
                    </h3>
                    <p className="mt-3 min-h-20 leading-6 text-[#514c41]">{product.description}</p>
                    <div className="mt-5 border-t border-black/10 pt-4 text-sm">
                      <p className="font-semibold">{product.platforms}</p>
                      <p className="mt-1 text-[#5f584c]">{product.status}</p>
                    </div>
                  </div>
                </>
              );

              const className =
                'block min-h-72 rounded-[1.75rem] border border-black/10 p-6 shadow-[0_12px_32px_rgba(66,55,22,0.06)] transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#211e18] motion-safe:hover:-translate-y-1';

              return product.href ? (
                <Link
                  key={product.name}
                  href={product.href}
                  prefetch={false}
                  className={className}
                  style={{ backgroundColor: product.color }}
                >
                  {card}
                </Link>
              ) : (
                <article
                  key={product.name}
                  className={className}
                  style={{ backgroundColor: product.color }}
                >
                  {card}
                </article>
              );
            })}
          </div>
        </section>

        {inventory ? (
          <PersonalDataInventory inventory={inventory} />
        ) : (
          <aside className="mt-10 rounded-3xl border border-[#ded5be] bg-white p-6 sm:flex sm:items-center sm:justify-between sm:gap-8">
            <div>
              <p className="font-semibold">Each product owns its data.</p>
              <p className="mt-1 text-sm leading-6 text-[#5f584c]">
                Sign in to confirm what has synchronized through Personal Platform.
              </p>
            </div>
            <span className="mt-4 inline-flex rounded-full bg-[#f1ecdf] px-3 py-1.5 text-xs font-bold sm:mt-0">
              Read-only Hub
            </span>
          </aside>
        )}
      </div>
    </div>
  );
}
