"use client";

import { useState, useTransition } from "react";

import { toggleFollow } from "~/lib/actions/user";

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
          "rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-150 disabled:opacity-60 cursor-pointer",
          following
            ? showUnfollow
              ? "border border-red-300 bg-red-50 text-red-600 hover:bg-red-100"
              : "border border-stone-300 bg-white text-stone-700 hover:border-stone-400"
            : "bg-emerald-600 text-white hover:bg-emerald-700 border border-emerald-600",
        ].join(" ")}
      >
        {following ? (showUnfollow ? "Unfollow" : "Following") : "Follow"}
      </button>
      <span className="text-sm text-stone-500">
        <span className="font-semibold text-stone-700">{followerCount}</span>{" "}
        {followerCount === 1 ? "follower" : "followers"}
      </span>
    </div>
  );
}
