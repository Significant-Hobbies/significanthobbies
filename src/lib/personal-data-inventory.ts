const personalDataDomains = [
  'live',
  'journal',
  'habits',
  'calorie',
  'setline',
  'kith',
  'anchor',
] as const;

export type PersonalDataDomain = (typeof personalDataDomains)[number];

type PersonalDataDomainInventory = {
  domain: PersonalDataDomain;
  name: string;
  count: number | null;
  countScope: 'all records' | 'today';
  lastUpdatedAt: string | null;
  latestLabel: string | null;
  source: string | null;
  status: 'connected' | 'empty' | 'unavailable';
};

export type PersonalDataInventory = {
  generatedAt: string | null;
  source: string | null;
  status: 'connected' | 'unavailable';
  domains: PersonalDataDomainInventory[];
  recentActivity: PersonalDataActivity[];
};

type PersonalDataActivity = {
  id: string;
  domain: PersonalDataDomain;
  name: string;
  occurredAt: string;
  action: 'updated' | 'deleted';
};

const domainNames: Record<PersonalDataDomain, string> = {
  live: 'Live',
  journal: 'Journal',
  habits: 'Habits',
  calorie: 'Calorie',
  setline: 'Setline',
  kith: 'Kith',
  anchor: 'Anchor',
};

export function buildPersonalDataInventory(
  value: unknown,
  activityValue?: unknown
): PersonalDataInventory {
  const payload = record(value);
  const summaries = Array.isArray(payload?.summaries) ? payload.summaries : null;
  if (!payload || !summaries) return unavailablePersonalDataInventory();

  return {
    generatedAt: text(payload.generatedAt),
    source: text(payload.source),
    status: 'connected',
    recentActivity: buildRecentActivity(activityValue),
    domains: personalDataDomains.map((domain) => {
      const summary = summaries.map(record).find((item) => item?.domain === domain) ?? null;
      return domain === 'calorie'
        ? calorieInventory(summary)
        : platformDomainInventory(domain, summary);
    }),
  };
}

export function unavailablePersonalDataInventory(): PersonalDataInventory {
  return {
    generatedAt: null,
    source: null,
    status: 'unavailable',
    domains: personalDataDomains.map((domain) => ({
      domain,
      name: domainNames[domain],
      count: null,
      countScope: domain === 'calorie' ? 'today' : 'all records',
      lastUpdatedAt: null,
      latestLabel: null,
      source: null,
      status: 'unavailable',
    })),
    recentActivity: [],
  };
}

function buildRecentActivity(value: unknown): PersonalDataActivity[] {
  const payload = record(value);
  const items = Array.isArray(payload?.items) ? payload.items : [];
  return items
    .flatMap((value) => {
      const item = record(value);
      const domain = item?.domain;
      const id = text(item?.id);
      const occurredAt = text(item?.occurredAt);
      const eventType = text(item?.eventType);
      if (!isPersonalDataDomain(domain) || !id || !occurredAt || !eventType) return [];
      return [
        {
          id,
          domain,
          name: domainNames[domain],
          occurredAt,
          action: eventType.endsWith('.deleted') ? ('deleted' as const) : ('updated' as const),
        },
      ];
    })
    .slice(0, 8);
}

function isPersonalDataDomain(value: unknown): value is PersonalDataDomain {
  return typeof value === 'string' && personalDataDomains.includes(value as PersonalDataDomain);
}

function platformDomainInventory(
  domain: Exclude<PersonalDataDomain, 'calorie'>,
  summary: Record<string, unknown> | null
): PersonalDataDomainInventory {
  const count = number(summary?.activeCount);
  const latest = record(summary?.latest);
  if (count === null) return unavailableDomain(domain, 'all records', text(summary?.source));

  return {
    domain,
    name: domainNames[domain],
    count,
    countScope: 'all records',
    lastUpdatedAt: text(summary?.lastUpdatedAt),
    latestLabel: latestLabel(domain, latest),
    source: text(summary?.source),
    status: count === 0 ? 'empty' : 'connected',
  };
}

function calorieInventory(summary: Record<string, unknown> | null): PersonalDataDomainInventory {
  const source = text(summary?.source);
  const details = record(summary?.summary);
  const count = number(details?.entryCount);
  if (summary?.status !== 'connected' || count === null) {
    return unavailableDomain('calorie', 'today', source);
  }

  const totals = record(details?.totals);
  const calories = number(totals?.calories);
  const protein = number(totals?.proteinG);
  const nutrients = [
    calories === null ? null : `${formatNumber(calories)} kcal`,
    protein === null ? null : `${formatNumber(protein)} g protein`,
  ].filter((item): item is string => item !== null);

  return {
    domain: 'calorie',
    name: domainNames.calorie,
    count,
    countScope: 'today',
    lastUpdatedAt: text(details?.lastUpdatedAt),
    latestLabel: nutrients.length > 0 ? nutrients.join(' · ') : null,
    source,
    status: count === 0 ? 'empty' : 'connected',
  };
}

function latestLabel(
  domain: Exclude<PersonalDataDomain, 'calorie'>,
  latest: Record<string, unknown> | null
): string | null {
  if (!latest) return null;
  switch (domain) {
    case 'live':
      return text(latest.title);
    case 'journal': {
      const occurredOn = text(latest.occurredOn);
      return occurredOn ? `Entry from ${occurredOn}` : 'Journal entry';
    }
    case 'habits': {
      const name = text(latest.name);
      const status = text(latest.status);
      return [name, status].filter(Boolean).join(' · ') || null;
    }
    case 'setline': {
      const title = text(latest.title);
      const minutes = number(latest.minutes);
      return (
        [title, minutes === null ? null : `${formatNumber(minutes)} min`]
          .filter(Boolean)
          .join(' · ') || null
      );
    }
    case 'kith': {
      const personName = text(latest.personName);
      return personName ? `Interaction with ${personName}` : 'Interaction recorded';
    }
    case 'anchor': {
      const title = text(latest.title);
      const durationSeconds = number(latest.durationSeconds);
      const duration =
        durationSeconds === null ? null : `${formatNumber(Math.round(durationSeconds / 60))} min`;
      return [title, duration].filter(Boolean).join(' · ') || null;
    }
    default:
      return null;
  }
}

function unavailableDomain(
  domain: PersonalDataDomain,
  countScope: PersonalDataDomainInventory['countScope'],
  source: string | null
): PersonalDataDomainInventory {
  return {
    domain,
    name: domainNames[domain],
    count: null,
    countScope,
    lastUpdatedAt: null,
    latestLabel: null,
    source,
    status: 'unavailable',
  };
}

function record(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function text(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

function number(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null;
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('en', { maximumFractionDigits: 1 }).format(value);
}
