"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { addComment, deleteComment } from "~/lib/actions/timeline";

type Comment = {
  id: string;
  body: string;
  createdAt: Date;
  user: {
    name: string | null;
    username: string | null;
    image: string | null;
  };
};

interface Props {
  timelineId: string;
  initialComments: Comment[];
  currentUserId?: string | null;
  ownCommentIds: Set<string>;
}

function timeAgo(date: Date): string {
  const now = Date.now();
  const diff = now - new Date(date).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

function Avatar({ user }: { user: Comment["user"] }) {
  if (user.image) {
    return (
      <img
        src={user.image}
        alt={user.name ?? "User"}
        className="h-8 w-8 rounded-full object-cover shrink-0 border border-stone-200"
      />
    );
  }
  const initial = (user.name ?? user.username ?? "?")[0]?.toUpperCase() ?? "?";
  return (
    <div className="h-8 w-8 rounded-full bg-stone-200 flex items-center justify-center shrink-0 text-xs font-semibold text-stone-600 border border-stone-200">
      {initial}
    </div>
  );
}

export function CommentsSectionWithOwn({
  timelineId,
  initialComments,
  currentUserId,
  ownCommentIds,
}: Props) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [body, setBody] = useState("");
  const [isPosting, startPostTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  // Track ids of comments posted in this session as own
  const [localOwnIds, setLocalOwnIds] = useState<Set<string>>(new Set());

  const isAuthenticated = !!currentUserId;
  const remaining = 280 - body.length;

  function isOwn(commentId: string) {
    return ownCommentIds.has(commentId) || localOwnIds.has(commentId);
  }

  function handlePost() {
    const trimmed = body.trim();
    if (!trimmed) return;

    startPostTransition(async () => {
      try {
        const created = await addComment(timelineId, trimmed);
        setComments((prev) => [
          ...prev,
          {
            id: created.id,
            body: created.body,
            createdAt: created.createdAt,
            user: created.user ?? { name: null, username: null, image: null },
          },
        ]);
        setLocalOwnIds((prev) => new Set([...prev, created.id]));
        setBody("");
      } catch {
        toast.error("Failed to post comment");
      }
    });
  }

  async function handleDelete(commentId: string) {
    setDeletingId(commentId);
    try {
      await deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch {
      toast.error("Failed to delete comment");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-6">
      <h2 className="mb-4 text-base font-semibold text-stone-800">
        Comments ({comments.length})
      </h2>

      {/* Comment form */}
      {isAuthenticated ? (
        <div className="mb-6">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value.slice(0, 280))}
            placeholder="Share your thoughts..."
            rows={3}
            className="w-full resize-none rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-800 placeholder:text-stone-400 focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400 transition-colors"
          />
          <div className="mt-1.5 flex items-center justify-between">
            <span
              className={[
                "text-xs",
                remaining < 20 ? "text-rose-500" : "text-stone-400",
              ].join(" ")}
            >
              {remaining} left
            </span>
            <button
              onClick={handlePost}
              disabled={isPosting || !body.trim()}
              className="rounded-lg bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPosting ? "Posting..." : "Post"}
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-6 rounded-lg border border-stone-100 bg-stone-50 px-4 py-3 text-sm text-stone-500">
          <Link
            href="/api/auth/signin"
            className="text-emerald-600 hover:underline font-medium"
          >
            Sign in
          </Link>{" "}
          to join the conversation
        </div>
      )}

      {/* Comments list */}
      {comments.length === 0 ? (
        <p className="text-center text-sm text-stone-400 py-6">
          Be the first to comment
        </p>
      ) : (
        <ul className="space-y-4">
          {comments.map((comment) => (
            <li key={comment.id} className="flex gap-3">
              <Avatar user={comment.user} />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-sm font-medium text-stone-800">
                    {comment.user.name ?? comment.user.username ?? "Anonymous"}
                  </span>
                  {comment.user.username && (
                    <span className="text-xs text-stone-400">
                      @{comment.user.username}
                    </span>
                  )}
                  <span className="text-xs text-stone-400">
                    {timeAgo(comment.createdAt)}
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-stone-700 break-words">
                  {comment.body}
                </p>
              </div>
              {isOwn(comment.id) && (
                <button
                  onClick={() => handleDelete(comment.id)}
                  disabled={deletingId === comment.id}
                  aria-label="Delete comment"
                  className="shrink-0 self-start mt-0.5 rounded p-1 text-stone-300 transition-colors hover:bg-rose-50 hover:text-rose-500 disabled:opacity-40"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
