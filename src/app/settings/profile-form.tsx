'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';

import { updateCreed, updateProfile } from '~/lib/actions/user';
import { StorageModeProvider, StorageModeStatus } from '~/components/storage-mode-provider';
import { browserRecordAdapter, readLocalRecord, writeLocalRecord } from '~/lib/local-record-store';
import type { StorageMode } from '~/lib/storage-mode';

interface ProfileFormProps {
  initialName: string;
  initialBio: string;
  initialWebsite: string;
  initialCreed: string;
  username: string;
  storageMode: StorageMode;
}

export function ProfileForm({
  initialName,
  initialBio,
  initialWebsite,
  initialCreed,
  username,
  storageMode,
}: ProfileFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState(initialName);
  const [bio, setBio] = useState(initialBio);
  const [website, setWebsite] = useState(initialWebsite);
  const [creed, setCreed] = useState(initialCreed);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState(false);

  const bioLength = bio.length;
  const BIO_MAX = 160;
  // Matches the server-side cap in updateCreed.
  const CREED_MAX = 500;

  useEffect(() => {
    if (storageMode !== 'local') return;
    readLocalRecord(
      browserRecordAdapter(),
      'profile:draft',
      'profile',
      (value): value is { name: string; bio: string; website: string; creed: string } =>
        !!value && typeof value === 'object' && 'name' in value
    ).then((draft) => {
      if (!draft) return;
      setName(draft.name);
      setBio(draft.bio);
      setWebsite(draft.website);
      setCreed(draft.creed);
    });
  }, [storageMode]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Client-side validation
    if (website.trim() && !/^https?:\/\/.+/.test(website.trim())) {
      setError('Website must start with http:// or https://');
      return;
    }

    if (storageMode === 'local') {
      startTransition(async () => {
        await writeLocalRecord(browserRecordAdapter(), 'profile:draft', 'profile', {
          name: name.trim(),
          bio: bio.trim(),
          website: website.trim(),
          creed: creed.trim(),
        });
        setToast(true);
        setTimeout(() => setToast(false), 3000);
      });
      return;
    }

    startTransition(async () => {
      try {
        await updateProfile({
          name: name.trim() || undefined,
          bio: bio.trim(),
          website: website.trim(),
        });
        // Separate action rather than folding creed into updateProfile: it owns
        // the 500-char cap and revalidates /dashboard, where the creed is the
        // page heading. It had no caller at all before this, so `users.creed`
        // was NULL for every user and both display surfaces always fell back.
        if (creed.trim() !== initialCreed.trim()) {
          const res = await updateCreed(creed);
          if (!res.success) throw new Error(res.error ?? 'Could not save your creed');
        }
        setToast(true);
        setTimeout(() => setToast(false), 3000);
        if (username) {
          router.push(`/u/${username}`);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      }
    });
  }

  return (
    <StorageModeProvider mode={storageMode}>
      <div className="space-y-4">
        <StorageModeStatus />
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Toast */}
          {toast && (
            <div className="rounded-lg border border-foreground/20 bg-foreground/10 px-4 py-2.5 text-sm font-medium text-foreground">
              Profile updated!
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Display name */}
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-foreground">
              Display name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your display name"
              maxLength={60}
              className="w-full rounded-lg border border-border bg-card/40 px-3.5 py-2 text-sm text-foreground placeholder-stone-400 outline-none transition focus:border-foreground/30 focus:bg-card focus:ring-2 focus:ring-foreground/20"
            />
          </div>

          {/* Creed — rendered as a serif italic quote on the dashboard and profile,
          so the input previews that voice rather than looking like a bio field. */}
          <div>
            <label htmlFor="creed" className="mb-1.5 block text-sm font-medium text-foreground">
              Your creed
            </label>
            <p className="mb-2 text-xs leading-relaxed text-subtle">
              One declaration, in your own words — &ldquo;I am someone who&hellip;&rdquo;. It
              becomes the heading of your dashboard and the quote on your public profile.
            </p>
            <textarea
              id="creed"
              value={creed}
              onChange={(e) => setCreed(e.target.value.slice(0, CREED_MAX))}
              placeholder="I am someone who finishes what they start."
              rows={2}
              className="w-full resize-none rounded-lg border border-border bg-card/40 px-3.5 py-2 font-serif text-base italic leading-relaxed text-foreground placeholder-stone-400 outline-none transition focus:border-foreground/30 focus:bg-card focus:ring-2 focus:ring-foreground/20"
            />
            <p
              className={[
                'mt-1 text-right text-xs',
                creed.length >= CREED_MAX ? 'text-destructive font-medium' : 'text-subtle',
              ].join(' ')}
            >
              {creed.length} / {CREED_MAX}
            </p>
          </div>

          {/* Bio */}
          <div>
            <label htmlFor="bio" className="mb-1.5 block text-sm font-medium text-foreground">
              Bio
            </label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, BIO_MAX))}
              placeholder="Tell the world about your hobby journey..."
              rows={3}
              className="w-full resize-none rounded-lg border border-border bg-card/40 px-3.5 py-2 text-sm text-foreground placeholder-stone-400 outline-none transition focus:border-foreground/30 focus:bg-card focus:ring-2 focus:ring-foreground/20"
            />
            <p
              className={[
                'mt-1 text-right text-xs',
                bioLength >= BIO_MAX ? 'text-destructive font-medium' : 'text-subtle',
              ].join(' ')}
            >
              {bioLength} / {BIO_MAX}
            </p>
          </div>

          {/* Website */}
          <div>
            <label htmlFor="website" className="mb-1.5 block text-sm font-medium text-foreground">
              Website
            </label>
            <div className="flex items-center rounded-lg border border-border bg-card/40 px-3.5 py-2 transition focus-within:border-foreground/30 focus-within:bg-card focus-within:ring-2 focus-within:ring-foreground/20">
              <span className="mr-1 select-none text-sm text-subtle">https://</span>
              <input
                id="website"
                type="text"
                value={website.replace(/^https?:\/\//, '')}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '') {
                    setWebsite('');
                  } else {
                    setWebsite(`https://${val}`);
                  }
                }}
                placeholder="yoursite.com"
                className="flex-1 bg-transparent text-sm text-foreground placeholder-stone-400 outline-none"
              />
            </div>
            <p className="mt-1 text-xs text-subtle">Include https:// — e.g. https://yoursite.com</p>
          </div>

          {/* Submit */}
          <div className="relative overflow-hidden rounded-lg pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
            >
              {isPending ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </StorageModeProvider>
  );
}
