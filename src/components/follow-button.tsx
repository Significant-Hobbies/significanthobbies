'use client';

import { useState, useTransition } from 'react';

import { toggleFollow } from '~/lib/actions/user';

interface FollowButtonProps {
  targetUserId: string;
  initialFollowing: boolean;
  initialCount: number;
  isOwnProfile: boolean;
}

export function FollowButton({
  targetUserId,
  initialFollowing,
  initialCount,
  isOwnProfile,
}: FollowButtonProps) {
  const [following, setFollowing] = useState(initialFollowing);
  const [followerCount, setFollowerCount] = useState(initialCount);
  const [isHovering, setIsHovering] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (isOwnProfile) return null;

  function handleClick() {
    startTransition(async () => {
      // Optimistic update
      const wasFollowing = following;
      setFollowing(!wasFollowing);
      setFollowerCount((c) => (wasFollowing ? c - 1 : c + 1));

      try {
        const result = await toggleFollow(targetUserId);
        setFollowing(result.following);
        setFollowerCount(result.followerCount);
      } catch {
        // Revert on error
        setFollowing(wasFollowing);
        setFollowerCount((c) => (wasFollowing ? c + 1 : c - 1));
      }
    });
  }

  const showUnfollow = following && isHovering;

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleClick}
        disabled={isPending}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        className={[
          'rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-150 disabled:opacity-60 cursor-pointer',
          following
            ? showUnfollow
              ? 'border border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/15'
              : 'border border-border bg-card text-foreground hover:border-border'
            : 'bg-primary text-primary-foreground hover:bg-lumi-300 border border-lumi-600',
        ].join(' ')}
      >
        {following ? (showUnfollow ? 'Unfollow' : 'Following') : 'Follow'}
      </button>
      <span className="text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">{followerCount}</span>{' '}
        {followerCount === 1 ? 'follower' : 'followers'}
      </span>
    </div>
  );
}
