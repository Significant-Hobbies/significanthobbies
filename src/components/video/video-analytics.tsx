"use client";

import { useEffect } from "react";
import { trackEvent } from "~/lib/analytics";

export function VideoAnalytics({ slug }: { slug: string }) {
  useEffect(() => {
    trackEvent("video_watch_page_viewed", { video_slug: slug });

    const handleClick = (event: MouseEvent) => {
      const target = event.target instanceof Element
        ? event.target.closest<HTMLElement>("[data-video-event]")
        : null;
      if (!target) return;
      trackEvent(target.dataset.videoEvent!, {
        video_slug: slug,
        label: target.dataset.videoLabel,
      });
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [slug]);

  return null;
}
