'use server';

import { and, desc, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { bucketListItems } from '~/db/schema';
import { getServerAuthSession } from '~/server/auth';
import { db } from '~/server/db';

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
