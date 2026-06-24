'use client';

import { Download, Link2, Loader2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '~/components/ui/button';
import { trackCoreAction } from '~/lib/analytics';
import { captureError } from '~/lib/foundry-monitoring';
import { computePersonality } from '~/lib/personality';
import type { TimelineData } from '~/lib/types';

import { ExportCard } from './export-card';

interface Props {
  timeline: TimelineData;
}

export function ExportButton({ timeline }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const personality = timeline.phases.length > 0 ? computePersonality(timeline.phases) : null;

  async function handleExport() {
    if (!cardRef.current) return;
    setIsExporting(true);
    try {
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2,
        backgroundColor: '#020617',
      });
      const link = document.createElement('a');
      link.download = `${timeline.title ?? 'hobby-timeline'}.png`;
      link.href = dataUrl;
      link.click();
      toast.success('Downloaded!');
      // Owner analytics: exporting a share card is a core product action.
      trackCoreAction('timeline_exported');
    } catch (err) {
      // PNG rendering can fail on tainted canvases / large timelines —
      // surface a clear message and capture detail for debugging.
      console.error('Timeline PNG export failed', err);
      captureError(err, { scope: 'timeline-edit', source: 'png_export' });
      toast.error("Couldn't export the image — try again in a moment.");
    } finally {
      setIsExporting(false);
    }
  }

  function handleCopyLink() {
    void navigator.clipboard
      .writeText(window.location.href)
      .then(() => {
        toast.success('Link copied!');
      })
      .catch(() => {
        toast.error("Couldn't copy the link — copy it from the address bar.");
      });
  }

  function handleTwitterShare() {
    const url = window.location.href;
    const text = personality
      ? `I'm a ${personality.archetype.name}! Check out my hobby timeline on Significant Hobbies`
      : 'Check out my hobby timeline on Significant Hobbies';
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      '_blank'
    );
  }

  function handleWhatsAppShare() {
    const url = window.location.href;
    const text = 'Check out my hobby timeline on Significant Hobbies';
    window.open(`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`, '_blank');
  }

  return (
    <>
      <div className="flex items-center gap-1.5 flex-wrap">
        <Button
          onClick={handleExport}
          disabled={isExporting}
          variant="outline"
          className="border-stone-300 text-stone-600 hover:text-stone-900"
        >
          {isExporting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          <span className="hidden sm:inline">Export PNG</span>
          <span className="sm:hidden">PNG</span>
        </Button>

        <Button
          onClick={handleCopyLink}
          variant="outline"
          size="sm"
          className="border-stone-300 text-stone-600 hover:text-stone-900"
        >
          <Link2 className="mr-1.5 h-4 w-4" />
          <span className="hidden sm:inline">Copy link</span>
          <span className="sm:hidden">Link</span>
        </Button>

        <Button
          onClick={handleTwitterShare}
          variant="outline"
          size="sm"
          className="border-stone-300 text-stone-600 hover:text-stone-900 px-2.5"
          title="Share on X / Twitter"
        >
          <span className="text-base font-bold leading-none">𝕏</span>
        </Button>

        <Button
          onClick={handleWhatsAppShare}
          variant="outline"
          size="sm"
          className="border-stone-300 text-stone-600 hover:text-stone-900 px-2.5"
          title="Share on WhatsApp"
        >
          <span className="text-xs font-bold leading-none">WA</span>
        </Button>
      </div>

      {/* Hidden export card — rendered off-screen */}
      <div className="fixed -left-[9999px] -top-[9999px] pointer-events-none">
        <ExportCard timeline={timeline} exportRef={cardRef} />
      </div>
    </>
  );
}
