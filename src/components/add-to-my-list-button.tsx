"use client";

import { useState, useTransition } from "react";

import { addBucketListItem } from "~/lib/actions/bucket-list";
import type { BucketItemCategory } from "~/lib/famous-bucket-lists";

type Props = {
  title: string;
  description?: string;
  category?: BucketItemCategory;
  sourceSlug: string;
  sourceItemTitle: string;
};

export function AddToMyListButton({ title, description, category, sourceSlug, sourceItemTitle }: Props) {
  const [added, setAdded] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleAdd() {
    startTransition(async () => {
      await addBucketListItem({ title, description, category, sourceSlug, sourceItemTitle });
      setAdded(true);
    });
  }

  if (added) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
        <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white text-[9px] font-bold">✓</span>
        Added to your bucket list
      </span>
    );
  }

  return (
    <button
      onClick={handleAdd}
      disabled={isPending}
      className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-white px-3 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50 hover:border-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isPending ? "Adding…" : "+ Add to my list"}
    </button>
  );
}
