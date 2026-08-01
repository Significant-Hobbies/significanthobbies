'use client';

import Link from 'next/link';
import { useEffect, useState, useTransition } from 'react';
import { importLocalAccountData, type LocalAccountImport } from '~/lib/actions/local-import';
import {
  archiveLocalRecordByKey,
  browserRecordAdapter,
  readLocalRecord,
} from '~/lib/local-record-store';

const DIRECT_KEYS = [
  'profile:draft',
  'onboarding:draft',
  'daily:state',
  'commitments:state',
] as const;

export function LocalImportCoordinator({ isAuthenticated }: { isAuthenticated: boolean }) {
  const [payload, setPayload] = useState<LocalAccountImport | null>(null);
  const [living, setLiving] = useState({ bucket: false, timeline: false });
  const [dismissed, setDismissed] = useState(false);
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();
  useEffect(() => {
    if (!isAuthenticated) return;
    const adapter = browserRecordAdapter();
    Promise.all([
      readLocalRecord(adapter, 'profile:draft', 'profile', isObject),
      readLocalRecord(adapter, 'onboarding:draft', 'onboarding', isObject),
      readLocalRecord(adapter, 'daily:state', 'daily', isObject),
      readLocalRecord(adapter, 'commitments:state', 'commitments', Array.isArray),
      readLocalRecord(adapter, 'significant-hobbies:bucket-list-draft:v1', 'bucket-list', isObject),
      readLocalRecord(adapter, 'timeline-draft-new', 'timelines', isObject),
    ]).then(([profile, onboarding, daily, commitments, bucket, timeline]) => {
      const direct: LocalAccountImport = {
        profile: profile
          ? {
              name: text(profile.name),
              bio: text(profile.bio),
              website: text(profile.website),
              creed: text(profile.creed),
            }
          : null,
        onboarding: onboarding
          ? {
              ...(validUsername(onboarding.username) ? { username: onboarding.username } : {}),
              birthYear: typeof onboarding.birthYear === 'number' ? onboarding.birthYear : 2000,
              droppedHobby: text(onboarding.droppedHobby),
              lastFinished: nullableText(onboarding.lastFinished),
              nextYearFeeling: nullableText(onboarding.nextYearFeeling),
            }
          : null,
        daily: daily as LocalAccountImport['daily'],
        commitments: commitments as LocalAccountImport['commitments'],
      };
      if (direct.profile || direct.onboarding || direct.daily || direct.commitments)
        setPayload(direct);
      setLiving({ bucket: Boolean(bucket), timeline: Boolean(timeline) });
    });
  }, [isAuthenticated]);
  function importDirect() {
    if (!payload) return;
    startTransition(async () => {
      const result = await importLocalAccountData(payload);
      if (!result.success)
        return setError(result.error ?? 'Import failed. Your device copy is safe.');
      const adapter = browserRecordAdapter();
      await Promise.all(DIRECT_KEYS.map((key) => archiveLocalRecordByKey(adapter, key)));
      setPayload(null);
    });
  }
  if (!isAuthenticated || dismissed || (!payload && !living.bucket && !living.timeline))
    return null;
  return (
    <aside className="fixed bottom-4 left-1/2 z-[90] w-[min(42rem,calc(100%-2rem))] -translate-x-1/2 rounded-2xl border border-primary/30 bg-card p-5 shadow-xl">
      <p className="font-semibold">Work from this device is ready to move into your account.</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Nothing local is removed until its database save succeeds.
      </p>
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      <div className="mt-4 flex flex-wrap gap-2">
        {payload && (
          <button
            type="button"
            disabled={pending}
            onClick={importDirect}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            Import private data
          </button>
        )}
        {living.bucket && (
          <Link
            href="/bucket-list/new"
            className="rounded-lg border border-border px-4 py-2 text-sm"
          >
            Review bucket-list draft
          </Link>
        )}
        {living.timeline && (
          <Link href="/timeline/new" className="rounded-lg border border-border px-4 py-2 text-sm">
            Review timeline draft
          </Link>
        )}
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="px-3 py-2 text-sm text-muted-foreground"
        >
          Not now
        </button>
      </div>
    </aside>
  );
}

function isObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object';
}
function text(value: unknown) {
  return typeof value === 'string' ? value : '';
}
function nullableText(value: unknown) {
  return typeof value === 'string' ? value : null;
}
function validUsername(value: unknown): value is string {
  return typeof value === 'string' && /^[a-z0-9-]{3,30}$/.test(value);
}
