import { QUEST_CATEGORIES, type QuestCategory, SIDE_QUESTS, type SideQuest } from './side-quests';

export type CircleCadence = 'weekly' | 'weekend' | 'daily';

export interface HobbyCircle {
  id: string;
  name: string;
  focus: QuestCategory | 'balanced';
  cadence: CircleCadence;
  members: string[];
  createdAt: string;
}

export interface CirclePlan {
  circle: HobbyCircle;
  quests: SideQuest[];
  completedCount: number;
  totalCount: number;
  completionPct: number;
  checkInPrompt: string;
}

export function createDefaultCircle(now = new Date()): HobbyCircle {
  return {
    id: `circle-${now.getTime()}`,
    name: 'Weekend hobby circle',
    focus: 'balanced',
    cadence: 'weekly',
    members: ['Me'],
    createdAt: now.toISOString(),
  };
}

function questScore(
  quest: SideQuest,
  circle: HobbyCircle,
  completedQuestIds: Set<string>,
  index: number
): number {
  let score = 100 - index;

  if (completedQuestIds.has(quest.id)) score -= 80;
  if (circle.focus !== 'balanced' && quest.category === circle.focus) score += 60;
  if (circle.cadence === 'daily' && quest.timeEstimate.includes('15')) score += 20;
  if (circle.cadence === 'weekend' && quest.timeEstimate === 'half day') score += 25;
  if (quest.difficulty === 'easy') score += 10;
  if (quest.category === 'social') score += Math.min(circle.members.length, 4) * 5;

  return score;
}

export function buildCirclePlan(
  circle: HobbyCircle,
  completedQuestIds: string[],
  questCount = 3
): CirclePlan {
  const completed = new Set(completedQuestIds);
  const quests = SIDE_QUESTS.map((quest, index) => ({
    quest,
    score: questScore(quest, circle, completed, index),
  }))
    .sort((a, b) => b.score - a.score)
    .slice(0, questCount)
    .map(({ quest }) => quest);

  const completedCount = quests.filter((quest) => completed.has(quest.id)).length;
  const completionPct = quests.length > 0 ? Math.round((completedCount / quests.length) * 100) : 0;

  return {
    circle,
    quests,
    completedCount,
    totalCount: quests.length,
    completionPct,
    checkInPrompt: buildCheckInPrompt(circle, quests),
  };
}

export function buildCheckInPrompt(circle: HobbyCircle, quests: SideQuest[]): string {
  const focusLabel =
    circle.focus === 'balanced'
      ? 'balanced hobbies'
      : (QUEST_CATEGORIES.find((category) => category.id === circle.focus)?.label.toLowerCase() ??
        circle.focus);

  const questLines = quests
    .map((quest, index) => `${index + 1}. ${quest.title} (${quest.timeEstimate})`)
    .join('\n');

  return [
    `${circle.name} check-in`,
    `Focus: ${focusLabel}`,
    `Cadence: ${circle.cadence}`,
    '',
    'This round:',
    questLines,
    '',
    'Reply with: picked quest, proof, one sentence on how it felt.',
  ].join('\n');
}

export function normalizeMemberList(input: string): string[] {
  const members = input
    .split(/[,\n]/)
    .map((member) => member.trim())
    .filter(Boolean);

  return Array.from(new Set(members));
}
