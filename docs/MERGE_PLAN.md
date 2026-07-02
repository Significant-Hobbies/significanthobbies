# Merge Plan — today-little-log × significanthobbies

Last updated: 2026-07-02

## Thesis

One life planner, two dimensions:

- **Daily** (private): one daily ritual page — AM/PM prompts, habit check-ins, compulsory journal entry at the bottom. This is "how you spend your days."
- **Living** (opt-in public): hobbies, bucket lists, side quests, timelines. No gamification. This is "what you do with your life."

The journal is the segue between the two. You write about practicing your hobby, and that connects to your timeline and commitments.

The mortality frame (life grid, manifesto) connects both. A finite life is the reason daily practice and life aspirations both matter.

**Private by default.** The daily ritual is structurally private — no visibility option. Timelines, bucket lists, and profiles are opt-in public.

## Stack

- **Keep Next.js (SH's stack).** Migrate TLL's surfaces in as new routes.
- Both already use Turso + Drizzle + better-auth, so DB and auth merge cleanly.

## What comes over from TLL

### One surface: Daily Ritual

A single route (`/daily`) that merges three TLL surfaces into one flow:

**Morning (AM):**
- Ritual prompts (from TLL's `useDailyCheckins`)
- Habit check-ins for the day (from TLL's `useHabits` — simplified to did-you-do-it, no scoring)

**Evening (PM):**
- Ritual prompts
- Habit check-ins update
- **Compulsory journal entry** (from TLL's `useJournalEntries`) — the day's reflection, at the bottom

One page. One entry per day. The journal is not a separate route — it's the bottom of the daily ritual.

### What we drop from TLL

- **Scoreboard** — no scoring, no min/ideal/max, no monthly calendar. Habits are simple check-ins.
- **Focus timer** — productivity tool, not a life planner tool.
- **Tasks / Eisenhower** — SH has commitments + side quests.
- **Memories / Review / Patterns** — reflection happens in the journal and on the dashboard.
- **Separate habits route** — folded into daily ritual.
- **Separate journal route** — folded into daily ritual.
- **Separate rituals route** — folded into daily ritual.

### DB tables to add (from TLL schema)

Core (bring over, simplified):
- `habits` — habit definitions (name, frequency, active). Drop scoring columns.
- `habit_logs` — daily check-ins (habit_id, date, completed). Drop value_num.
- `journal_entries` — one per day, linked to the ritual. Fields: date, am_prompt, pm_prompt, entry_text.
- `daily_checkins` — AM/PM ritual check-in state (date, am_completed, pm_completed).

Merge into SH's `users` table:
- `dob` (birth date — SH already has birthYear, merge to one field)
- `identity_statement` (optional, shown on dashboard)

Drop (not needed):
- `scoreboard_items`, `scoreboard_logs`, `scoreboard_day_notes`, `scoreboard_month_locks`
- `weight_logs`, `urge_logs`, `food_items`, `food_logs`
- `emotions`, `goals`, `goal_actions`, `mana_state`
- `projects`, `tasks`, `life_rules`, `schedules`
- `time_sessions` (focus timer)
- `quick_logs`, `dev_logs`, `weekly_reviews`
- `user_stats` (XP/life_score — no scoring in merged product)
- `profiles` (merge fields into SH users)

### Hooks to migrate

| TLL hook | SH approach |
|----------|-------------|
| `useHabits` (384 LOC) | Server actions: `getHabits`, `logHabit`, `createHabit`, `deleteHabit`. Simplified — no scoring. |
| `useJournalEntries` (329 LOC) | Server actions: `getTodayEntry`, `saveEntry`. One entry per day. |
| `useDailyCheckins` (108 LOC) | Server actions: `getCheckin`, `saveCheckin`. AM/PM state. |
| `useScoreboard` (763 LOC) | **Drop.** No scoring. |
| `useTasks` (295 LOC) | **Drop.** SH has commitments + side quests. |
| `useUserStats` (96 LOC) | **Drop.** No XP. |
| `useStreak` (51 LOC) | **Drop.** No streaks without scoring. |
| `useLifeMath` (151 LOC) | SH already has `src/lib/mortality.ts` — merge. |

## What stays from SH

Everything we just polished:
- Three pillars: Hobbies, Bucket Lists, Side Quests
- Manifesto page (mortality frame as mission)
- Life grid on dashboard
- Commitments (daily practice for a specific hobby — bridges both dimensions)
- Public profiles (opt-in)
- SEO surfaces (hobby directory, blog, bucket list ideas)
- Footer structured around pillars
- Nav (updated to surface both dimensions)

## Navigation

**Primary nav (4 links):**
- Hobbies
- Bucket Lists
- Side Quests
- Daily (new — links to `/daily` ritual)

**Avatar dropdown (secondary):**
- Dashboard
- Commitments
- My Profile
- Sign out

The daily ritual is one click away in the top nav. Everything else is secondary.

## Dashboard

The dashboard is the unified home base. Sections in order:

1. **Life grid** (existing) — weeks lived, weeks remaining
2. **Today's practice** (existing) — commitments + today's habit check-ins
3. **Today's journal** (new) — the day's journal entry, or a prompt to go to `/daily`
4. **Timelines** (existing)
5. **Bucket list** (existing)

The dashboard surfaces both dimensions without forcing the user to navigate between them.

## The daily ritual page (`/daily`)

One page. One flow. Two visits per day (morning and evening).

### Morning state
```
Good morning, [name].

[AM ritual prompts — 2-3 questions from TLL's ritual config]

Today's habits:
  [ ] Drink water
  [ ] Practice guitar
  [ ] Walk 10k steps
  [ ] Read 30 min

Journal:
  [textarea: What are you doing today?]
```

### Evening state
```
Good evening, [name].

[PM ritual prompts — 2-3 reflection questions]

Today's habits:
  [x] Drink water
  [x] Practice guitar
  [ ] Walk 10k steps
  [x] Read 30 min

Journal:
  [textarea: What happened today?]
```

One save action. The journal entry is compulsory — you can't complete the evening ritual without writing something. This is the segue: the journal connects your daily practice to your life aspirations.

## Privacy model

- **Daily ritual: structurally private.** No visibility field. No public API. No sharing.
- **Timelines, bucket lists, profiles: opt-in public.** User explicitly chooses visibility per item.
- **Habits and journal entries: always private.** They live inside the daily ritual.

## Identity reconciliation

Update SH's PRODUCT.md:
- The "no streaks/scoring" stance stays for the Living dimension.
- The Daily dimension has no scoring either — just check-ins and journaling.
- Keep: "We don't rank you against other people. Your weeks are your own."
- Keep: "We don't shame you for missed days."
- Add: "One daily ritual. Morning prompts, habit check-ins, and a journal entry. That's it. No scoring, no streaks, no dashboards about your dashboards."

## Migration phases

### Phase 1: Schema merge (foundation)
- Add `habits`, `habit_logs`, `journal_entries`, `daily_checkins` tables to SH's `src/db/schema.ts`
- Merge `dob` and `identity_statement` into SH's `users` table
- Drop `birthYear` from users (replaced by `dob`)
- Run `pnpm db:push` to apply
- **Deliverable:** merged schema, existing SH users unaffected

### Phase 2: Daily ritual route
- Create `/daily` route with the merged ritual + habits + journal flow
- Server actions: `getHabits`, `logHabit`, `createHabit`, `deleteHabit`, `getTodayEntry`, `saveEntry`, `getCheckin`, `saveCheckin`
- Apply SH's current design system (tokens, no gold decoration, no kicker labels)
- AM/PM state detection (based on time of day)
- Compulsory journal entry on PM ritual
- **Deliverable:** one functional `/daily` route, styled to match SH

### Phase 3: Dashboard integration
- Add today's habit check-ins + journal prompt to dashboard
- Wire habits and commitments — they're related but distinct:
  - Commitment = "I will practice guitar for 30 days" (hobby-specific, has stamps)
  - Habit = "I will drink water daily" (general, simple check-in)
- **Deliverable:** unified dashboard surfacing both dimensions

### Phase 4: Nav + footer + identity
- Add "Daily" to primary nav (4 links: Hobbies, Bucket Lists, Side Quests, Daily)
- Update footer to include Daily dimension
- Update PRODUCT.md with merged identity
- Update manifesto to mention both dimensions
- **Deliverable:** coherent product identity

### Phase 5: Data migration + decommission TLL
- Export TLL user data (habits, journal entries, checkins)
- Import into SH's merged DB
- Redirect TLL domain to SH
- Archive TLL repo
- **Deliverable:** one product, one deploy

## What we lose

- TLL's PWA/offline behavior
- TLL's scoring system (intentional — no scoring in merged product)
- TLL's focus timer (intentional — not a life planner tool)
- TLL's separate habits/journal/rituals routes (intentional — merged into one)

## What we gain

- One product, one deploy, one DB, one auth
- A coherent "life planner" thesis — daily ritual + life aspirations, connected by journaling
- One capture surface per day instead of three
- The journal as segue between daily practice and life aspirations
- SH's SEO engine driving traffic to the merged product
- Simpler fleet (one fewer deploy target)

## Open questions

1. **TLL user migration:** Only one primary user (Sarthak). Manual export/import, or scripted?
2. **Ritual prompts:** What are the actual AM/PM prompts? TLL has a config — bring as-is or rewrite?
3. **Habit creation:** Where does the user manage habits (add/edit/delete)? In the daily ritual page itself, or a settings section?
4. **Journal length:** Any constraints? Free-form, or a min/max character count?
