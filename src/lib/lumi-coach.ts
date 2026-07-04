'use server';

import { desc, eq } from 'drizzle-orm';
import { getCloudflareContext } from '@opennextjs/cloudflare';

import { bucketListItems, timelines } from '~/db/schema';
import type { Phase } from '~/lib/types';
import { parseJSONColumn } from '~/lib/utils';
import {
  getBucketListArchetype,
  getBucketListSuggestions,
  getCelebrityMatch,
} from '~/lib/bucket-list-insights';
import { BUCKET_ITEM_CATEGORIES } from '~/lib/famous-bucket-lists';
import { enforceRateLimit } from '~/lib/rate-limit';
import { getServerAuthSession } from '~/server/auth';
import { db } from '~/server/db';

// ─── Types ───────────────────────────────────────────────────────────────────

export type CoachContext = {
  userName: string;
  timelineCount: number;
  totalPhases: number;
  recentHobbies: string[];
  bucketListTotal: number;
  bucketListDone: number;
  bucketListInProgress: number;
  topCategories: string[];
  archetypeName: string | null;
  archetypeEmoji: string | null;
  celebrityMatch: string | null;
};

export type CoachReflection = {
  greeting: string;
  reflection: string;
  questions: string[];
  suggestion: string;
  generatedAt: string;
  source: 'ai' | 'rule-based';
};

// ─── Context gathering ───────────────────────────────────────────────────────

export async function gatherCoachContext(): Promise<CoachContext | null> {
  const session = await getServerAuthSession();
  if (!session?.user?.id) return null;

  const [rawTimelines, rawBucketItems] = await Promise.all([
    db
      .select()
      .from(timelines)
      .where(eq(timelines.userId, session.user.id))
      .orderBy(desc(timelines.updatedAt)),
    db
      .select()
      .from(bucketListItems)
      .where(eq(bucketListItems.userId, session.user.id))
      .orderBy(desc(bucketListItems.createdAt)),
  ]);

  const allPhases: Phase[] = [];
  for (const t of rawTimelines) {
    allPhases.push(...parseJSONColumn<Phase[]>(t.phases, [], `coach:timeline:${t.id}`));
  }

  const recentHobbies = [
    ...new Set(allPhases.slice(-5).flatMap((p) => p.hobbies.map((h) => h.name))),
  ].slice(0, 8);

  const bucketItems = rawBucketItems.map((i) => ({
    category: i.category,
    title: i.title,
    status: i.status,
  }));

  const archetype = getBucketListArchetype(bucketItems);
  const celebrity = getCelebrityMatch(bucketItems);

  const catCounts: Record<string, number> = {};
  for (const item of bucketItems) {
    if (item.category) catCounts[item.category] = (catCounts[item.category] ?? 0) + 1;
  }
  const topCategories = Object.entries(catCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(
      ([cat]) => BUCKET_ITEM_CATEGORIES[cat as keyof typeof BUCKET_ITEM_CATEGORIES]?.label ?? cat
    );

  return {
    userName: session.user.name?.split(' ')[0] ?? 'there',
    timelineCount: rawTimelines.length,
    totalPhases: allPhases.length,
    recentHobbies,
    bucketListTotal: rawBucketItems.length,
    bucketListDone: rawBucketItems.filter((i) => i.status === 'done').length,
    bucketListInProgress: rawBucketItems.filter((i) => i.status === 'in_progress').length,
    topCategories,
    archetypeName: archetype?.name ?? null,
    archetypeEmoji: archetype?.emoji ?? null,
    celebrityMatch: celebrity?.name ?? null,
  };
}

// ─── AI prompt ───────────────────────────────────────────────────────────────

function buildPrompt(ctx: CoachContext): string {
  const hobbyList =
    ctx.recentHobbies.length > 0 ? ctx.recentHobbies.join(', ') : 'no hobbies logged yet';
  const catList =
    ctx.topCategories.length > 0 ? ctx.topCategories.join(', ') : 'no clear categories yet';
  const archetypeLine = ctx.archetypeName
    ? `Their bucket-list archetype is "${ctx.archetypeName}" ${ctx.archetypeEmoji}.`
    : "They don't have enough bucket-list items to determine an archetype yet.";
  const celebrityLine = ctx.celebrityMatch
    ? `Their bucket list is most similar to ${ctx.celebrityMatch}'s.`
    : '';

  return `You are Whale, a warm and insightful life coach for SignificantHobbies — a platform where people plan their life through hobbies, timelines, and bucket lists.

You're doing a weekly check-in with ${ctx.userName}. Here's their current context:
- Timelines: ${ctx.timelineCount} (with ${ctx.totalPhases} life phases total)
- Recent hobbies: ${hobbyList}
- Bucket list: ${ctx.bucketListTotal} items — ${ctx.bucketListDone} done, ${ctx.bucketListInProgress} in progress
- Top bucket-list categories: ${catList}
- ${archetypeLine}
${celebrityLine}

Write a weekly reflection that:
1. Opens with a warm, personal greeting (1 sentence)
2. Reflects on what they've been doing — notice patterns, celebrate progress, or gently observe gaps (2-3 sentences)
3. Asks 2-3 thoughtful coaching questions that help them think about what's next (each on its own line, prefixed with "→")
4. Ends with one concrete suggestion for the coming week (1 sentence)

Keep it concise, genuine, and specific to their data. Don't be generic or preachy. Talk like a friend who happens to be wise about life planning. Don't use emojis in the questions.

Format your response as:
GREETING: <greeting>
REFLECTION: <reflection>
QUESTIONS:
→ <question 1>
→ <question 2>
→ <question 3>
SUGGESTION: <suggestion>`;
}

// ─── AI call via Workers AI binding ──────────────────────────────────────────

// Model fallback chain: try the best model first, fall back to smaller/faster
// ones if it fails. All models are free on Cloudflare Workers AI.
const AI_MODELS = [
  '@cf/meta/llama-3.3-70b-instruct-fp8-fast', // 70B — best quality
  '@cf/meta/llama-3.1-8b-instruct', // 8B — fast fallback
] as const;

async function callWorkersAI(prompt: string): Promise<string | null> {
  try {
    const cfCtx = await getCloudflareContext();
    const ai = (
      cfCtx.env as {
        AI?: { run: (model: string, opts: unknown) => Promise<{ response?: string }> };
      }
    ).AI;
    if (!ai) return null;

    for (const model of AI_MODELS) {
      try {
        const result = await ai.run(model, {
          messages: [
            {
              role: 'system',
              content: 'You are Whale, a warm life coach. Be concise, specific, and genuine.',
            },
            { role: 'user', content: prompt },
          ],
          max_tokens: 600,
          temperature: 0.7,
        });
        if (result?.response) return result.response;
      } catch (modelErr) {
        console.error(`[lumi-coach] Model ${model} failed, trying fallback`, modelErr);
      }
    }
    return null;
  } catch (err) {
    console.error('[lumi-coach] Workers AI call failed', err);
    return null;
  }
}

// ─── Response parsing ────────────────────────────────────────────────────────

function parseAIResponse(raw: string, ctx: CoachContext): CoachReflection {
  const greeting = raw.match(/GREETING:\s*(.+)/i)?.[1]?.trim() ?? `Hey ${ctx.userName},`;
  const reflection = raw.match(/REFLECTION:\s*(.+?)(?:\n\s*QUESTIONS:)/is)?.[1]?.trim() ?? '';
  const questionBlock = raw.match(/QUESTIONS:\s*(.+?)(?:\n\s*SUGGESTION:)/is)?.[1]?.trim() ?? '';
  const suggestion = raw.match(/SUGGESTION:\s*(.+)/i)?.[1]?.trim() ?? '';

  const questions = questionBlock
    .split('\n')
    .map((l) => l.replace(/^→\s*/, '').trim())
    .filter((l) => l.length > 0)
    .slice(0, 3);

  return {
    greeting,
    reflection: reflection || 'Take a moment to look at where you are.',
    questions:
      questions.length > 0
        ? questions
        : ["What's one thing you want to make progress on this week?"],
    suggestion: suggestion || 'Pick one small step toward a bucket-list item this week.',
    generatedAt: new Date().toISOString(),
    source: 'ai',
  };
}

// ─── Rule-based fallback ─────────────────────────────────────────────────────

function ruleBasedReflection(ctx: CoachContext): CoachReflection {
  const greeting = `Hey ${ctx.userName},`;

  let reflection = '';
  if (ctx.bucketListDone > 0) {
    reflection = `You've completed ${ctx.bucketListDone} bucket-list item${ctx.bucketListDone > 1 ? 's' : ''}`;
    if (ctx.bucketListInProgress > 0) {
      reflection += ` and have ${ctx.bucketListInProgress} in progress. That's real momentum.`;
    } else {
      reflection += `. That's real momentum — celebrate it.`;
    }
  } else if (ctx.bucketListTotal > 0) {
    reflection = `You have ${ctx.bucketListTotal} bucket-list items waiting. None done yet, but the list is there — that's the first step.`;
  } else if (ctx.totalPhases > 0) {
    reflection = `You've logged ${ctx.totalPhases} life phases across ${ctx.timelineCount} timeline${ctx.timelineCount > 1 ? 's' : ''}. Your story is taking shape.`;
  } else {
    reflection = `Your canvas is blank — and that's exciting. Everything starts with the first entry.`;
  }

  if (ctx.archetypeName) {
    reflection += ` You're leaning toward "${ctx.archetypeName}" ${ctx.archetypeEmoji}.`;
  }

  const questions: string[] = [];
  if (ctx.recentHobbies.length > 0) {
    questions.push(
      `You've been into ${ctx.recentHobbies.slice(0, 3).join(', ')} — what's the next step with one of those?`
    );
  }
  if (ctx.bucketListInProgress > 0) {
    questions.push(
      `You have ${ctx.bucketListInProgress} bucket-list item${ctx.bucketListInProgress > 1 ? 's' : ''} in progress — which one can you move forward this week?`
    );
  }
  if (ctx.bucketListTotal === 0) {
    questions.push(
      `What's one experience you'd be sad to miss? That's your first bucket-list item.`
    );
  }
  if (questions.length < 2) {
    questions.push(`What would make this week feel meaningful to you?`);
  }

  const suggestions = getBucketListSuggestions(
    ctx.recentHobbies.map((h) => ({ title: h, category: null })),
    1
  );
  const suggestion =
    suggestions.length > 0
      ? `This week, consider adding "${suggestions[0]!.title}" to your bucket list.`
      : 'This week, pick one bucket-list item and take the smallest possible step toward it.';

  return {
    greeting,
    reflection,
    questions: questions.slice(0, 3),
    suggestion,
    generatedAt: new Date().toISOString(),
    source: 'rule-based',
  };
}

// ─── Main entry ──────────────────────────────────────────────────────────────

export async function getWeeklyReflection(): Promise<CoachReflection | null> {
  const ctx = await gatherCoachContext();
  if (!ctx) return null;

  // Rate limit the AI call (10 reflections per 5 minutes per user).
  await enforceRateLimit('coach', ctx.userName);

  const aiResponse = await callWorkersAI(buildPrompt(ctx));
  if (aiResponse) {
    return parseAIResponse(aiResponse, ctx);
  }

  return ruleBasedReflection(ctx);
}
