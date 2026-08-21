import { CircleAlert, Cloud, Database } from 'lucide-react';

import type {
  PersonalDataDomain,
  PersonalDataInventory as PersonalDataInventoryModel,
} from '~/lib/personal-data-inventory';

const domainColors: Record<PersonalDataDomain, string> = {
  live: '#fff09a',
  journal: '#eadcf6',
  habits: '#dceeff',
  calorie: '#e4efd9',
  setline: '#f5e2d2',
  kith: '#f6e1d4',
  anchor: '#dce8f0',
};

export function PersonalDataInventory({ inventory }: { inventory: PersonalDataInventoryModel }) {
  const connected = inventory.status === 'connected';

  return (
    <section
      aria-labelledby="data-inventory-heading"
      className="mt-16 border-t border-[#ded5be] pt-12"
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="max-w-3xl">
          <p className="flex items-center gap-2 text-sm font-bold text-[#7658ad]">
            <Database className="size-4" aria-hidden="true" />
            Connected data
          </p>
          <h2 id="data-inventory-heading" className="mt-3 text-3xl sm:text-5xl">
            What Cloudflare has for you.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[#625b50]">
            A read-only inventory from Personal Platform. The Hub keeps no second copy and hides
            journal text and private notes.
          </p>
        </div>
        <p
          className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${
            connected
              ? 'border-[#a9c69a] bg-[#edf6e9] text-[#31512a]'
              : 'border-[#dfbd91] bg-[#fff4df] text-[#6a461a]'
          }`}
        >
          {connected ? (
            <Cloud className="size-3.5" aria-hidden="true" />
          ) : (
            <CircleAlert className="size-3.5" aria-hidden="true" />
          )}
          {connected ? 'Platform read confirmed' : 'Platform read unavailable'}
        </p>
      </div>

      {connected ? (
        <div className="mt-8 overflow-hidden rounded-[1.75rem] border border-[#ded5be] bg-white/75 shadow-[0_14px_40px_rgba(66,55,22,0.05)]">
          <ul className="divide-y divide-[#e8e1d0]">
            {inventory.domains.map((item) => (
              <li
                key={item.domain}
                className="grid gap-5 px-5 py-5 sm:px-7 md:grid-cols-[minmax(10rem,0.8fr)_minmax(7rem,0.5fr)_minmax(14rem,1.3fr)] md:items-center lg:grid-cols-[minmax(10rem,0.8fr)_minmax(8rem,0.55fr)_minmax(15rem,1.4fr)_minmax(12rem,0.9fr)]"
              >
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-black/10 font-serif text-base font-bold"
                    style={{ backgroundColor: domainColors[item.domain] }}
                  >
                    {item.name.at(0)}
                  </span>
                  <div>
                    <h3 className="font-serif text-xl font-semibold">{item.name}</h3>
                    <p className="text-xs text-[#71695d]">{sourceLabel(item.source)}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#766e61]">
                    {item.countScope}
                  </p>
                  <p className="mt-1 text-xl font-semibold tabular-nums">{countLabel(item)}</p>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#766e61]">
                    Latest safe preview
                  </p>
                  <p className="mt-1 leading-6 text-[#37332c]">
                    {item.status === 'unavailable'
                      ? 'Connector unavailable'
                      : (item.latestLabel ?? 'No synchronized record yet')}
                  </p>
                </div>

                <div className="md:col-start-3 md:row-start-2 lg:col-start-auto lg:row-start-auto lg:text-right">
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#766e61]">
                    Last updated
                  </p>
                  <p className="mt-1 text-sm text-[#514c41]">
                    {formatTimestamp(item.lastUpdatedAt)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-1 border-t border-[#ded5be] bg-[#faf7ed] px-5 py-4 text-xs text-[#675f53] sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <span>
              Cloudflare is the shared signed-in store; each app remains its own interface.
            </span>
            <span className="tabular-nums">Snapshot {formatTimestamp(inventory.generatedAt)}</span>
          </div>
        </div>
      ) : (
        <div className="mt-8 rounded-[1.75rem] border border-[#dfbd91] bg-[#fff8ea] p-6 sm:p-8">
          <p className="font-serif text-2xl font-semibold">The directory is still available.</p>
          <p className="mt-2 max-w-2xl leading-7 text-[#625b50]">
            Personal Platform could not confirm the Cloudflare snapshot just now. No missing data is
            being inferred; try the Hub again after the apps have synchronized.
          </p>
        </div>
      )}
    </section>
  );
}

function countLabel(item: PersonalDataInventoryModel['domains'][number]): string {
  if (item.count === null) return 'Unavailable';
  if (item.countScope === 'today') return `${item.count} ${item.count === 1 ? 'entry' : 'entries'}`;
  return `${item.count} ${item.count === 1 ? 'record' : 'records'}`;
}

function sourceLabel(source: string | null): string {
  if (source === 'personal-platform') return 'Personal Platform D1';
  if (source === 'calorie-service') return 'Calorie D1 connector';
  return source ?? 'Connector unavailable';
}

function formatTimestamp(value: string | null): string {
  if (!value) return 'Not yet';
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return 'Unknown';
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata',
  }).format(date);
}
