'use server';

import { and, desc, eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { bucketListItems, bucketLists } from '~/db/schema';
import { trackCoreAction } from '~/lib/analytics';
import type { BingoVisibility, BucketListDraft } from '~/lib/life-bingo';
import { getServerAuthSession } from '~/server/auth';
import { db } from '~/server/db';

const IntentionSchema = z.enum([
  'adventure',
  'creativity',
  'connection',
  'courage',
  'learning',
  'nature',
  'play',
  'wellbeing',
]);

const BucketListItemSchema = z.object({
  id: z.string().min(1).max(100),
  text: z.string().trim().min(1).max(180),
  intention: z.union([IntentionSchema, z.literal('wildcard')]),
  effort: z.enum(['tiny', 'medium', 'bold']),
  tone: z.enum(['moss', 'clay', 'marigold', 'sky', 'rose', 'ink']),
  completedAt: z.string().max(40).optional(),
  note: z.string().trim().max(280).optional(),
  isWildcard: z.boolean().optional(),
  sourceQuestId: z.string().max(100).optional(),
  boardPosition: z.number().int().min(0).max(24).optional(),
});

const BucketListPayloadSchema = z.object({
  version: z.literal(1),
  title: z.string().trim().min(1).max(100),
  subtitle: z.string().trim().max(220),
  horizon: z.enum(['month', 'season', 'year', 'chapter']),
  size: z.union([z.literal(3), z.literal(5)]),
  boldness: z.enum(['cozy', 'brave', 'bold']),
  defaultView: z.enum(['LIST', 'BINGO']),
  intentions: z.array(IntentionSchema).max(3),
  items: z.array(BucketListItemSchema).min(1).max(50),
  createdAt: z.string().max(40),
  updatedAt: z.string().max(40),
});

const VisibilitySchema = z.enum(['PRIVATE', 'UNLISTED', 'PUBLIC']);

function serializeDraft(draft: z.infer<typeof BucketListPayloadSchema>) {
  return {
    title: draft.title,
    subtitle: draft.subtitle,
    horizon: draft.horizon,
    size: draft.size,
    boldness: draft.boldness,
    defaultView: draft.defaultView,
    intentions: JSON.stringify(draft.intentions),
    items: JSON.stringify(draft.items),
  };
}

async function requireOwner(listId: string, userId: string) {
  const list = await db.query.bucketLists.findFirst({
    where: and(eq(bucketLists.id, listId), eq(bucketLists.userId, userId)),
  });
  if (!list) throw new Error('Bucket list not found');
  return list;
}

async function generateShareSlug(title: string): Promise<string> {
  const base =
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 48) || 'life-bingo';

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const candidate = `${base}-${nanoid(6)}`;
    const existing = await db.query.bucketLists.findFirst({
      where: eq(bucketLists.slug, candidate),
      columns: { id: true },
    });
    if (!existing) return candidate;
  }
  return nanoid(12);
}

export async function createBucketList(input: BucketListDraft) {
  const session = await getServerAuthSession();
  if (!session?.user?.id) throw new Error('Not authenticated');

  const draft = BucketListPayloadSchema.parse(input);
  const now = new Date();
  const [created] = await db
    .insert(bucketLists)
    .values({
      userId: session.user.id,
      ...serializeDraft(draft),
      visibility: 'PRIVATE',
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  revalidatePath('/bucket-list');
  revalidatePath('/dashboard');
  trackCoreAction('bucket_list_saved', session.user.id);
  return created;
}

export async function updateBucketList(listId: string, input: BucketListDraft) {
  const session = await getServerAuthSession();
  if (!session?.user?.id) throw new Error('Not authenticated');

  const existing = await requireOwner(listId, session.user.id);
  const draft = BucketListPayloadSchema.parse(input);
  const [updated] = await db
    .update(bucketLists)
    .set({ ...serializeDraft(draft), updatedAt: new Date() })
    .where(and(eq(bucketLists.id, listId), eq(bucketLists.userId, session.user.id)))
    .returning();

  revalidatePath(`/bucket-list/${listId}`);
  revalidatePath('/bucket-list');
  revalidatePath('/dashboard');
  if (existing.slug) revalidatePath(`/b/${existing.slug}`);
  return updated;
}

export async function setBucketListVisibility(listId: string, next: BingoVisibility) {
  const session = await getServerAuthSession();
  if (!session?.user?.id) throw new Error('Not authenticated');

  const visibility = VisibilitySchema.parse(next);
  const existing = await requireOwner(listId, session.user.id);
  const slug =
    visibility === 'PRIVATE'
      ? existing.slug
      : (existing.slug ?? (await generateShareSlug(existing.title)));
  const [updated] = await db
    .update(bucketLists)
    .set({ visibility, slug, updatedAt: new Date() })
    .where(and(eq(bucketLists.id, listId), eq(bucketLists.userId, session.user.id)))
    .returning();

  revalidatePath(`/bucket-list/${listId}`);
  revalidatePath('/bucket-list');
  if (slug) revalidatePath(`/b/${slug}`);
  return updated;
}

export async function deleteBucketList(listId: string) {
  const session = await getServerAuthSession();
  if (!session?.user?.id) throw new Error('Not authenticated');
  await requireOwner(listId, session.user.id);
  await db
    .delete(bucketLists)
    .where(and(eq(bucketLists.id, listId), eq(bucketLists.userId, session.user.id)));
  revalidatePath('/bucket-list');
  revalidatePath('/dashboard');
}

const CATEGORIES = [
  'travel',
  'adventure',
  'creative',
  'achievement',
  'social',
  'humanitarian',
] as const;

const AddItemSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  category: z.enum(CATEGORIES).optional(),
  sourceSlug: z.string().optional(),
  sourceItemTitle: z.string().optional(),
  targetYear: z.number().int().min(1900).max(2200).optional(),
});

export async function addBucketListItem(data: {
  title: string;
  description?: string;
  category?: string;
  sourceSlug?: string;
  sourceItemTitle?: string;
  targetYear?: number;
}): Promise<{ success: boolean; id?: string }> {
  const session = await getServerAuthSession();
  if (!session?.user?.id) throw new Error('Not authenticated');
  const parsed = AddItemSchema.parse(data);
  const [row] = await db
    .insert(bucketListItems)
    .values({
      userId: session.user.id,
      title: parsed.title,
      description: parsed.description ?? null,
      category: parsed.category ?? null,
      status: 'planned',
      sourceSlug: parsed.sourceSlug ?? null,
      sourceItemTitle: parsed.sourceItemTitle ?? null,
      targetYear: parsed.targetYear ?? null,
    })
    .returning({ id: bucketListItems.id });
  revalidatePath('/dashboard');
  if (parsed.sourceSlug) revalidatePath(`/bucket-lists/${parsed.sourceSlug}`);
  return { success: true, id: row?.id };
}

export async function updateBucketListItemStatus(
  id: string,
  status: 'planned' | 'in_progress' | 'done'
): Promise<{ success: boolean }> {
  const session = await getServerAuthSession();
  if (!session?.user?.id) throw new Error('Not authenticated');
  await db
    .update(bucketListItems)
    .set({
      status,
      completedAt: status === 'done' ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(and(eq(bucketListItems.id, id), eq(bucketListItems.userId, session.user.id)));
  revalidatePath('/dashboard');
  return { success: true };
}

const UpdateItemSchema = z.object({
  targetYear: z.number().int().min(1900).max(2200).nullable().optional(),
  category: z.enum(CATEGORIES).nullable().optional(),
});

export async function updateBucketListItem(
  id: string,
  patch: { targetYear?: number | null; category?: string | null }
): Promise<{ success: boolean }> {
  const session = await getServerAuthSession();
  if (!session?.user?.id) throw new Error('Not authenticated');
  const parsed = UpdateItemSchema.parse(patch);
  await db
    .update(bucketListItems)
    .set({ ...parsed, updatedAt: new Date() })
    .where(and(eq(bucketListItems.id, id), eq(bucketListItems.userId, session.user.id)));
  revalidatePath('/dashboard');
  return { success: true };
}

export async function removeBucketListItem(id: string): Promise<{ success: boolean }> {
  const session = await getServerAuthSession();
  if (!session?.user?.id) throw new Error('Not authenticated');
  await db
    .delete(bucketListItems)
    .where(and(eq(bucketListItems.id, id), eq(bucketListItems.userId, session.user.id)));
  revalidatePath('/dashboard');
  return { success: true };
}

export async function updateBucketListItemVisibility(
  id: string,
  visibility: 'public' | 'private'
): Promise<{ success: boolean }> {
  const session = await getServerAuthSession();
  if (!session?.user?.id) throw new Error('Not authenticated');
  await db
    .update(bucketListItems)
    .set({ visibility, updatedAt: new Date() })
    .where(and(eq(bucketListItems.id, id), eq(bucketListItems.userId, session.user.id)));
  revalidatePath('/dashboard');
  return { success: true };
}

export type BucketListItem = typeof bucketListItems.$inferSelect;

export async function getUserBucketList(): Promise<BucketListItem[]> {
  const session = await getServerAuthSession();
  if (!session?.user?.id) return [];
  return db
    .select()
    .from(bucketListItems)
    .where(eq(bucketListItems.userId, session.user.id))
    .orderBy(desc(bucketListItems.createdAt));
}
