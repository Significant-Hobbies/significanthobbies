'use client';

import { Heart } from 'lucide-react';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';

import { toggleLike } from '~/lib/actions/timeline';

interface Props {
  timelineId: string;
  initialLiked: boolean;
  initialCount: number;
  isAuthenticated: boolean;
}

export function LikeButton({ timelineId, initialLiked, initialCount, isAuthenticated }: Props) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!isAuthenticated) {
      toast.error('Sign in to like timelines');
      return;
    }

    const optimisticLiked = !liked;
    const optimisticCount = optimisticLiked ? count + 1 : count - 1;
    setLiked(optimisticLiked);
    setCount(optimisticCount);

    startTransition(async () => {
      try {
        const result = await toggleLike(timelineId);
        setLiked(result.liked);
        setCount(result.count);
      } catch {
        // Revert on failure
        setLiked(liked);
        setCount(count);
        toast.error('Failed to update like');
      }
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      aria-label={liked ? 'Unlike timeline' : 'Like timeline'}
      className={[
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
        liked
          ? 'border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100'
          : 'border-stone-200 bg-white text-stone-500 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-500',
        isPending ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer',
      ].join(' ')}
    >
      <Heart
        className={[
          'h-3.5 w-3.5 transition-colors',
          liked ? 'fill-rose-500 text-rose-500' : '',
        ].join(' ')}
      />
      <span>{count}</span>
    </button>
  );
}
