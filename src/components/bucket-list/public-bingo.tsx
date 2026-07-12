'use client';

import { toPng } from 'html-to-image';
import { Download, Grid3X3, Share2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useRef } from 'react';
import { toast } from 'sonner';
import { BingoBoard } from '~/components/bucket-list/bingo-board';
import { Button } from '~/components/ui/button';
import { createRemixDraft, LIFE_BINGO_STORAGE_KEY, type BucketListDraft } from '~/lib/life-bingo';

export function PublicBingo({
  draft,
  ownerName,
}: {
  draft: BucketListDraft;
  ownerName?: string | null;
}) {
  const router = useRouter();
  const exportRef = useRef<HTMLDivElement>(null);

  function remix() {
    const next = createRemixDraft(draft);
    window.localStorage.setItem(LIFE_BINGO_STORAGE_KEY, JSON.stringify(next));
    router.push('/bucket-list/new');
  }

  async function exportBoard() {
    if (!exportRef.current) return;
    try {
      const dataUrl = await toPng(exportRef.current, {
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: '#f8f1e4',
      });
      const link = document.createElement('a');
      link.download = 'life-bingo.png';
      link.href = dataUrl;
      link.click();
    } catch {
      toast.error('This browser couldn’t export the board.');
    }
  }

  async function share() {
    const shareData = {
      title: draft.title,
      text: 'A life less ordinary, one square at a time.',
      url: window.location.href,
    };
    if (navigator.share) {
      await navigator.share(shareData).catch(() => undefined);
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied.');
    }
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[#e8e2d6] px-4 py-10 sm:py-16">
      <main className="mx-auto max-w-4xl">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-800">
              {ownerName ? `${ownerName}’s Life Bingo` : 'A Life Bingo'}
            </p>
            <p className="mt-2 text-sm text-stone-600">A bucket list in its most playable form.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={exportBoard}
              className="border-stone-300 bg-[#fffdf8]"
            >
              <Download className="h-3.5 w-3.5" /> Save image
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={share}
              className="border-stone-300 bg-[#fffdf8]"
            >
              <Share2 className="h-3.5 w-3.5" /> Share
            </Button>
          </div>
        </header>

        <div ref={exportRef}>
          <BingoBoard draft={draft} />
        </div>

        <section className="mt-8 grid gap-5 rounded-[1.5rem] border border-[#cfc4b2] bg-[#fffdf8] p-6 sm:grid-cols-[1fr_auto] sm:items-center sm:p-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-700">
              Borrow the inspiration
            </p>
            <h2 className="mt-2 font-serif text-3xl font-semibold leading-tight text-stone-900">
              Keep the ideas. Make the life yours.
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-stone-500">
              Remixing copies the prompts into a fresh private draft. Completed moments and personal
              notes never come with it.
            </p>
          </div>
          <Button
            onClick={remix}
            size="lg"
            className="rounded-xl bg-[#176b4a] text-white hover:bg-[#10583d]"
          >
            <Grid3X3 className="h-4 w-4" /> Make my version
          </Button>
        </section>
      </main>
    </div>
  );
}
