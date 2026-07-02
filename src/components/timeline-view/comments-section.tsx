'use client';

import { Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';

import { addComment, deleteComment } from '~/lib/actions/timeline';

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
  if (seconds < 60) return 'just now';
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

function Avatar({ user }: { user: Comment['user'] }) {
  if (user.image) {
    return (
      <Image
        src={user.image}
        alt={user.name ?? 'User'}
        width={32}
        height={32}
        className="h-8 w-8 rounded-full object-cover shrink-0 border border-border"
      />
    );
  }
  const initial = (user.name ?? user.username ?? '?')[0]?.toUpperCase() ?? '?';
  return (
    <div className="h-8 w-8 rounded-full bg-foreground/10 flex items-center justify-center shrink-0 text-xs font-semibold text-muted-foreground border border-border">
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
  const [body, setBody] = useState('');
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
        setBody('');
      } catch {
        toast.error('Failed to post comment');
      }
    });
  }

  async function handleDelete(commentId: string) {
    setDeletingId(commentId);
    try {
      await deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch {
      toast.error('Failed to delete comment');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h2 className="mb-4 text-base font-semibold text-foreground">Comments ({comments.length})</h2>

      {/* Comment form */}
      {isAuthenticated ? (
        <div className="mb-6">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value.slice(0, 280))}
            placeholder="Share your thoughts..."
            rows={3}
            className="w-full resize-none rounded-lg border border-border bg-card/40 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-lumi-500/50 focus:bg-card focus:outline-none focus:ring-1 focus:ring-lumi-500/80 transition-colors"
          />
          <div className="mt-1.5 flex items-center justify-between">
            <span
              className={[
                'text-xs',
                remaining < 20 ? 'text-rose-500' : 'text-muted-foreground/60',
              ].join(' ')}
            >
              {remaining} left
            </span>
            <button
              onClick={handlePost}
              disabled={isPosting || !body.trim()}
              className="rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-lumi-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPosting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-6 rounded-lg border border-border bg-card/40 px-4 py-3 text-sm text-muted-foreground">
          <Link href="/api/auth/signin" className="text-lumi-400 hover:underline font-medium">
            Sign in
          </Link>{' '}
          to join the conversation
        </div>
      )}

      {/* Comments list */}
      {comments.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground/60 py-6">Be the first to comment</p>
      ) : (
        <ul className="space-y-4">
          {comments.map((comment) => (
            <li key={comment.id} className="flex gap-3">
              <Avatar user={comment.user} />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-sm font-medium text-foreground">
                    {comment.user.name ?? comment.user.username ?? 'Anonymous'}
                  </span>
                  {comment.user.username && (
                    <span className="text-xs text-muted-foreground/60">
                      @{comment.user.username}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground/60">
                    {timeAgo(comment.createdAt)}
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-foreground break-words">{comment.body}</p>
              </div>
              {isOwn(comment.id) && (
                <button
                  onClick={() => handleDelete(comment.id)}
                  disabled={deletingId === comment.id}
                  aria-label="Delete comment"
                  className="shrink-0 self-start mt-0.5 rounded p-1 text-muted-foreground/40 transition-colors hover:bg-rose-50 hover:text-rose-500 disabled:opacity-40"
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
