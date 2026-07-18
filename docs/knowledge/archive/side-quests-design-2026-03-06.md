# Side Quests, Badges & Timeline Pins (archive)

> **Archive snapshot.** The 2026-03-06 design for side quests, badges, and
> timeline pins. Shipped and now reflected in `src/lib/side-quests.ts` (50
> static quests) and the `UserQuest`/`Arc` tables. Preserved as the design
> record. Current state in
> [`../product/overview.md`](../../product/overview.md) and
> [`../architecture/data-model.md`](../../architecture/data-model.md).

## Overview

Inspired by a viral tweet thread ("50 side quests to complete" — 552K views), build three interconnected features:

1. **Blog post** referencing the tweet, tying "side quests" to SignificantHobbies' mission
2. **`/side-quests` page** with three progressive modes (random, personalized, quest board)
3. **Badges** — Fireside Girls-style achievement patches earned by completing quests and hobby milestones
4. **Timeline Pins** — lightweight markers on timelines representing moments/sparks (distinct from sustained hobbies)

## 1. Blog Post: "You're Bored Because You're Not Doing Side Quests"

Static entry in `blog-posts.ts`. Category: **"Inspiration"** (new, orange-themed).

Structure:
- Hook: the viral tweet + why 552K people resonated
- Reframe: life as an RPG — main quests (career, family) vs side quests (hobbies)
- Why side quests matter (ties to existing articles on flow, identity, rekindling)
- The 6 quest categories with examples
- CTA: "Generate your first side quest" → `/side-quests`

~5 min read. Links to `/side-quests`.

## 2. `/side-quests` Page

### Data: `src/lib/side-quests.ts`

50 curated quests, each with:
```ts
type SideQuest = {
  id: string;
  title: string;
  description: string;   // 1-2 sentences
  category: QuestCategory;
  difficulty: "easy" | "medium" | "hard";
  timeEstimate: string;   // "15 min", "1 hour", "half day"
  emoji: string;
  relatedHobbies: string[]; // maps to HOBBY_CATEGORIES
};
```

6 categories:
- **Sensory** — walks, silence, textures, constellations
- **Creative** — draw, write, photograph, make music
- **Culinary** — cook, bake, brew, ferment
- **Social** — compliment, volunteer, attend, host
- **Exploration** — museum, new route, stargazing, travel
- **Mindful** — journal, meditate, detox, stretch

### Mode A: Random Quest (default)

- Big card showing a random quest on page load
- "Roll again" button (dice animation)
- Share button (copies URL with `?q=<id>` param)
- No input required

### Mode B: Personalized ("Help me pick")

- Tab/toggle switch from Mode A
- 3 pill selectors (not a form):
  1. Vibe: Solo / Social / Either
  2. Energy: Chill / Active / Creative
  3. Time: 15 min / 1 hour / Half day
- Filters the 50 quests, shows a random match from filtered set
- "Try another" within filtered set

### Mode C: Quest Board

- Tab/toggle from modes A/B
- Grid of all 50 quests as cards, grouped by category
- Click to expand details, checkmark to complete
- Progress bar at top: X/50
- Completion triggers badge check + hobby suggestion prompt

### Storage

Anonymous: `localStorage` key `sh-side-quests`:
```ts
{ completed: string[], startedAt: string }
```

After completing 3 quests → subtle banner: "Save your progress? Sign in to keep your quests across devices."

Logged in: `completedQuests` JSON field on User model (string[] of quest IDs). Syncs with localStorage on login.

## 3. Badges

### Concept

Fireside Girls-style merit patches. Users discover badges by earning them — the full list is NOT shown upfront. Some badges are secret/hidden.

### Data: `src/lib/badges.ts`

```ts
type Badge = {
  id: string;
  name: string;
  description: string;
  emoji: string;
  category: "quest" | "hobby" | "timeline" | "social" | "secret";
  hidden: boolean;         // true = not shown until earned
  criteria: BadgeCriteria; // programmatic check
};
```

### Badge List (v1)

**Quest badges:**
| Badge | Criteria | Hidden |
|---|---|---|
| First Steps | Complete 1 quest | No |
| Curious Cat | Complete 5 quests | No |
| Adventurer | Complete 10 quests | No |
| Renaissance Soul | Complete quests in 5+ categories | No |
| Side Quest Master | Complete all 50 | No |

**Category badges (one per quest category):**
| Badge | Criteria | Hidden |
|---|---|---|
| Chef's Kiss | Complete 3 culinary quests | No |
| Wanderer | Complete 3 exploration quests | No |
| Maker | Complete 3 creative quests | No |
| Zen Master | Complete 3 mindful quests | No |
| People Person | Complete 3 social quests | No |
| Sensor | Complete 3 sensory quests | No |

**Hobby/timeline badges:**
| Badge | Criteria | Hidden |
|---|---|---|
| Rekindler | Add a hobby you previously had | Yes |
| Storyteller | Create a timeline with 5+ phases | No |
| Polymath | Have hobbies in 5+ categories | No |
| Deep Diver | Rate any hobby intensity 5 | Yes |

**Secret badges:**
| Badge | Criteria | Hidden |
|---|---|---|
| Night Owl | Complete a stargazing quest | Yes |
| Unplugged | Complete the social media detox quest | Yes |
| Full Circle | Complete a quest, add it as a pin, then add the related hobby to timeline | Yes |

### Display

- Profile page: badge sash/grid showing earned badges
- Quest board: toast notification when badge earned ("You earned: Chef's Kiss!")
- Unearned non-hidden badges show as greyed-out silhouettes with "?"
- Hidden badges show nothing until earned

### Storage

Same pattern as quests: localStorage for anonymous, JSON field on User for logged in.
`earnedBadges: { badgeId: string, earnedAt: string }[]`

## 4. Timeline Pins

### Concept

Pins are lightweight markers on a timeline — moments, sparks, one-off experiences. Distinct from phases (sustained hobbies over time). A pin says "March 2026: Tried calligraphy for a week" — if that spark becomes a sustained hobby, it graduates to a phase entry. The pin remains as the origin story.

### Data Model

Add to `Phase` type or store alongside phases in the timeline JSON:
```ts
type TimelinePin = {
  id: string;
  label: string;
  emoji: string;
  date: string;          // "2026-03" (month-level)
  questId?: string;      // links back to side quest if applicable
  relatedHobby?: string; // e.g. "Calligraphy"
};
```

Stored in the Timeline model's `phases` JSON field as a sibling array, or as a new `pins` JSON field (preferred — cleaner separation):

```prisma
model Timeline {
  // ... existing fields
  pins String @default("[]")  // JSON array of TimelinePin
}
```

### Visual

- Small diamond/star markers rendered between phase blocks on `PhaseSwimlane`
- Positioned by date (between relevant phases)
- Hover/tap to see details
- Subtle — doesn't clutter the main timeline view

### Flow: Quest → Pin → Hobby

1. User completes a quest on Quest Board
2. Completion card: "Add to your timeline as a pin?"
3. If yes → creates a TimelinePin with the quest's emoji, title, current month, and relatedHobbies
4. Pin appears on timeline
5. Later, if user adds the related hobby as a full phase entry, the pin serves as the origin story

## 5. Nav & Integration

- Add "Side Quests" to nav (between Explore and Blog), with a small "New" badge indicator
- Blog post CTA links to `/side-quests`
- Landing page can mention side quests in the features section
- Profile page shows badge collection

## 6. Tech Decisions

- All quest/badge data is static in TS files (no DB for quest definitions)
- User progress: localStorage (anonymous) + User model JSON fields (logged in)
- No new API routes needed for v1 — quest completion is client-side
- Pin creation uses existing timeline update action (add to pins JSON)
- Prisma migration: add `pins` field to Timeline, add `completedQuests` and `earnedBadges` fields to User
