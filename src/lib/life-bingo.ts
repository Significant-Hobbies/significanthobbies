export const LIFE_BINGO_DRAFT_VERSION = 1 as const;
export const LIFE_BINGO_STORAGE_KEY = "significant-hobbies:bucket-list-draft:v1";

export const BINGO_INTENTIONS = [
  { id: "adventure", label: "Adventure", emoji: "↗", description: "Novel places and small leaps" },
  { id: "creativity", label: "Creativity", emoji: "✦", description: "Make things without needing to be good" },
  { id: "connection", label: "Connection", emoji: "∞", description: "More stories with other people" },
  { id: "courage", label: "Courage", emoji: "!", description: "A life a little outside the usual" },
  { id: "learning", label: "Curiosity", emoji: "?", description: "Follow ideas and learn by doing" },
  { id: "nature", label: "Outside", emoji: "⌁", description: "More sky, weather, and wildness" },
  { id: "play", label: "Play", emoji: "○", description: "Joy with no productivity required" },
  { id: "wellbeing", label: "Reset", emoji: "~", description: "Slower rituals and clearer days" },
] as const;

export type BingoIntention = (typeof BINGO_INTENTIONS)[number]["id"];
export type BingoHorizon = "month" | "season" | "year" | "chapter";
export type BingoBoldness = "cozy" | "brave" | "bold";
export type BingoBoardSize = 3 | 5;
export type BingoVisibility = "PRIVATE" | "UNLISTED" | "PUBLIC";
export type BucketListView = "LIST" | "BINGO";
export type BingoEffort = "tiny" | "medium" | "bold";
export type BingoTone = "moss" | "clay" | "marigold" | "sky" | "rose" | "ink";

export type BucketListItem = {
  id: string;
  text: string;
  intention: BingoIntention | "wildcard";
  effort: BingoEffort;
  tone: BingoTone;
  completedAt?: string;
  note?: string;
  isWildcard?: boolean;
  sourceQuestId?: string;
  boardPosition?: number;
};

export type BucketListDraft = {
  version: typeof LIFE_BINGO_DRAFT_VERSION;
  title: string;
  subtitle: string;
  horizon: BingoHorizon;
  size: BingoBoardSize;
  boldness: BingoBoldness;
  defaultView: BucketListView;
  intentions: BingoIntention[];
  items: BucketListItem[];
  createdAt: string;
  updatedAt: string;
};

export type BingoLine = {
  kind: "row" | "column" | "diagonal";
  index: number;
  squareIndexes: number[];
};

type Suggestion = Omit<BucketListItem, "id" | "tone">;

const SUGGESTIONS: Record<BingoIntention, Suggestion[]> = {
  adventure: [
    { text: "Take the train somewhere you have never stopped", intention: "adventure", effort: "medium" },
    { text: "Spend a day exploring without an itinerary", intention: "adventure", effort: "medium" },
    { text: "Eat somewhere you cannot pronounce the menu", intention: "adventure", effort: "tiny" },
    { text: "Book one night somewhere close but unfamiliar", intention: "adventure", effort: "bold" },
    { text: "Say yes to an invitation you would usually skip", intention: "adventure", effort: "medium" },
    { text: "Watch sunrise from a place you have never been", intention: "adventure", effort: "medium" },
    { text: "Take yourself on a solo afternoon out", intention: "adventure", effort: "tiny" },
    { text: "Try the most curious thing on the menu", intention: "adventure", effort: "tiny" },
  ],
  creativity: [
    { text: "Make something deliberately imperfect", intention: "creativity", effort: "tiny" },
    { text: "Take a pottery, printmaking, or sewing class", intention: "creativity", effort: "medium" },
    { text: "Fill one sketchbook page without erasing", intention: "creativity", effort: "tiny" },
    { text: "Create a tiny gift instead of buying one", intention: "creativity", effort: "medium" },
    { text: "Learn one full song on an instrument", intention: "creativity", effort: "bold" },
    { text: "Photograph one ordinary day beautifully", intention: "creativity", effort: "tiny" },
    { text: "Write a one-page story from a memory", intention: "creativity", effort: "medium" },
    { text: "Show something you made to another person", intention: "creativity", effort: "bold" },
  ],
  connection: [
    { text: "Invite someone over without making it fancy", intention: "connection", effort: "medium" },
    { text: "Send a voice note to someone you miss", intention: "connection", effort: "tiny" },
    { text: "Ask an older relative about their twenties", intention: "connection", effort: "tiny" },
    { text: "Host a table where two guests have never met", intention: "connection", effort: "bold" },
    { text: "Make a new friend through a shared interest", intention: "connection", effort: "bold" },
    { text: "Plan the reunion instead of saying ‘we should’", intention: "connection", effort: "medium" },
    { text: "Learn and cook someone’s family recipe", intention: "connection", effort: "medium" },
    { text: "Give someone your full attention for an hour", intention: "connection", effort: "tiny" },
  ],
  courage: [
    { text: "Go to an event where you know nobody", intention: "courage", effort: "bold" },
    { text: "Ask for something you normally stay quiet about", intention: "courage", effort: "medium" },
    { text: "Try a beginner class and be visibly new", intention: "courage", effort: "medium" },
    { text: "Share a piece of work before it feels perfect", intention: "courage", effort: "bold" },
    { text: "Wear the thing you keep saving for later", intention: "courage", effort: "tiny" },
    { text: "Have one honest conversation you have delayed", intention: "courage", effort: "bold" },
    { text: "Do one thing alone that you usually need company for", intention: "courage", effort: "medium" },
    { text: "Introduce yourself first", intention: "courage", effort: "tiny" },
  ],
  learning: [
    { text: "Attend a talk about something completely new", intention: "learning", effort: "medium" },
    { text: "Learn ten useful phrases in another language", intention: "learning", effort: "tiny" },
    { text: "Read a book chosen by someone unlike you", intention: "learning", effort: "medium" },
    { text: "Visit a museum and follow one question home", intention: "learning", effort: "medium" },
    { text: "Ask an expert to show you how they work", intention: "learning", effort: "bold" },
    { text: "Learn to identify five birds, trees, or stars", intention: "learning", effort: "tiny" },
    { text: "Finish a small course with something you made", intention: "learning", effort: "bold" },
    { text: "Spend an hour following a ridiculous curiosity", intention: "learning", effort: "tiny" },
  ],
  nature: [
    { text: "Eat breakfast outside", intention: "nature", effort: "tiny" },
    { text: "Swim somewhere under open sky", intention: "nature", effort: "bold" },
    { text: "Take a walk after dark without headphones", intention: "nature", effort: "tiny" },
    { text: "Sleep one night outdoors", intention: "nature", effort: "bold" },
    { text: "Grow something you can eventually eat", intention: "nature", effort: "medium" },
    { text: "Spend a morning beside water", intention: "nature", effort: "medium" },
    { text: "Watch a storm from somewhere safe", intention: "nature", effort: "tiny" },
    { text: "Take the long path through a park or forest", intention: "nature", effort: "medium" },
  ],
  play: [
    { text: "Play a game you loved as a child", intention: "play", effort: "tiny" },
    { text: "Dance to one whole album at home", intention: "play", effort: "tiny" },
    { text: "Plan a themed dinner for no reason", intention: "play", effort: "medium" },
    { text: "Try karaoke, improv, or an open mic", intention: "play", effort: "bold" },
    { text: "Build something useless but delightful", intention: "play", effort: "medium" },
    { text: "Spend an afternoon following only fun", intention: "play", effort: "medium" },
    { text: "Invent an annual tradition with a friend", intention: "play", effort: "bold" },
    { text: "Buy the silly little treat", intention: "play", effort: "tiny" },
  ],
  wellbeing: [
    { text: "Keep one morning completely phone-free", intention: "wellbeing", effort: "tiny" },
    { text: "Make a meal slowly with no other task running", intention: "wellbeing", effort: "medium" },
    { text: "Take yourself somewhere quiet for an hour", intention: "wellbeing", effort: "tiny" },
    { text: "Create a bedtime ritual you look forward to", intention: "wellbeing", effort: "medium" },
    { text: "Clear one corner until it feels peaceful", intention: "wellbeing", effort: "tiny" },
    { text: "Take a full day without buying anything", intention: "wellbeing", effort: "medium" },
    { text: "Protect one weekend from obligations", intention: "wellbeing", effort: "bold" },
    { text: "Write a letter to your future self", intention: "wellbeing", effort: "medium" },
  ],
};

const TONES: BingoTone[] = ["moss", "clay", "marigold", "sky", "rose"];

const HORIZON_COPY: Record<BingoHorizon, { title: string; subtitle: string; size: BingoBoardSize }> = {
  month: { title: "A month worth remembering", subtitle: "Nine small invitations to make the ordinary feel different.", size: 3 },
  season: { title: "My season of possibility", subtitle: "A little more life before the season changes.", size: 3 },
  year: { title: `My ${new Date().getFullYear()} Life Bingo`, subtitle: "Twenty-five chances to make this year feel like mine.", size: 5 },
  chapter: { title: "The next chapter", subtitle: "Things I want to experience, not just accomplish.", size: 5 },
};

function hashSeed(seed: string): number {
  let value = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    value ^= seed.charCodeAt(i);
    value = Math.imul(value, 16777619);
  }
  return value >>> 0;
}

function seededRandom(seed: string): () => number {
  let state = hashSeed(seed) || 1;
  return () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffled<T>(items: T[], random: () => number): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j]!, result[i]!];
  }
  return result;
}

function effortAllowed(effort: BingoEffort, boldness: BingoBoldness): boolean {
  if (boldness === "bold") return true;
  if (boldness === "brave") return true;
  return effort !== "bold";
}

export function generateLifeBingo(input: {
  horizon: BingoHorizon;
  intentions: BingoIntention[];
  boldness: BingoBoldness;
  seed?: string;
}): BucketListDraft {
  const selectedIntentions = input.intentions.length > 0
    ? [...new Set(input.intentions)].slice(0, 3)
    : ["adventure", "creativity", "connection"] satisfies BingoIntention[];
  const preset = HORIZON_COPY[input.horizon];
  const squareCount = preset.size * preset.size;
  const seed = input.seed ?? `${Date.now()}-${selectedIntentions.join("-")}`;
  const random = seededRandom(seed);
  const desiredEfforts: BingoEffort[] = input.boldness === "cozy"
    ? ["tiny", "tiny", "medium"]
    : input.boldness === "bold"
      ? ["tiny", "medium", "bold", "bold"]
      : ["tiny", "medium", "medium", "bold"];

  const primaryCandidates = selectedIntentions.flatMap((intention) =>
    SUGGESTIONS[intention].filter((item) => effortAllowed(item.effort, input.boldness)),
  );
  const secondaryCandidates = BINGO_INTENTIONS
    .map((intention) => intention.id)
    .filter((intention) => !selectedIntentions.includes(intention))
    .flatMap((intention) =>
      SUGGESTIONS[intention].filter((item) => effortAllowed(item.effort, input.boldness)),
    );
  const candidates = [
    ...shuffled(primaryCandidates, random),
    ...shuffled(secondaryCandidates, random),
  ];

  const chosen: Suggestion[] = [];
  for (let index = 0; chosen.length < squareCount && index < squareCount * 8; index += 1) {
    const intention = selectedIntentions[index % selectedIntentions.length]!;
    const effort = desiredEfforts[index % desiredEfforts.length]!;
    const match = candidates.find(
      (item) => item.intention === intention && item.effort === effort && !chosen.some((picked) => picked.text === item.text),
    ) ?? candidates.find((item) => item.intention === intention && !chosen.some((picked) => picked.text === item.text))
      ?? candidates.find((item) => !chosen.some((picked) => picked.text === item.text));
    if (match) chosen.push(match);
  }

  const wildcardIndex = preset.size === 5 ? Math.floor(squareCount / 2) : -1;
  const items: BucketListItem[] = [];
  let sourceIndex = 0;
  for (let index = 0; index < squareCount; index += 1) {
    if (index === wildcardIndex) {
      items.push({
        id: `${hashSeed(`${seed}-wildcard`).toString(36)}-wildcard`,
        text: "Something unexpected",
        intention: "wildcard",
        effort: "medium",
        tone: "ink",
        isWildcard: true,
        boardPosition: index,
      });
      continue;
    }
    const suggestion = chosen[sourceIndex % chosen.length]!;
    items.push({
      ...suggestion,
      id: `${hashSeed(`${seed}-${index}-${suggestion.text}`).toString(36)}-${index}`,
      tone: TONES[(index + Math.floor(random() * TONES.length)) % TONES.length]!,
      boardPosition: index,
    });
    sourceIndex += 1;
  }

  const now = new Date().toISOString();
  return {
    version: LIFE_BINGO_DRAFT_VERSION,
    title: preset.title,
    subtitle: preset.subtitle,
    horizon: input.horizon,
    size: preset.size,
    boldness: input.boldness,
    defaultView: "BINGO",
    intentions: selectedIntentions,
    items,
    createdAt: now,
    updatedAt: now,
  };
}

export function replacementSquare(input: {
  draft: BucketListDraft;
  squareId: string;
  seed?: string;
}): BucketListItem | null {
  const current = input.draft.items.find((square) => square.id === input.squareId);
  if (!current || current.isWildcard) return null;
  const existingText = new Set(input.draft.items.map((square) => square.text));
  const intention = current.intention === "wildcard" ? input.draft.intentions[0]! : current.intention;
  const random = seededRandom(input.seed ?? `${Date.now()}-${input.squareId}`);
  const available = shuffled(SUGGESTIONS[intention], random).filter((item) => !existingText.has(item.text));
  const suggestion = available.find((item) => effortAllowed(item.effort, input.draft.boldness)) ?? available[0];
  if (!suggestion) return null;
  return {
    ...suggestion,
    id: `${hashSeed(`${input.squareId}-${suggestion.text}-${input.seed ?? Date.now()}`).toString(36)}-r`,
    tone: current.tone,
    boardPosition: current.boardPosition,
  };
}

export function getBingoLines(items: BucketListItem[], size: BingoBoardSize): BingoLine[] {
  const positionedItems = items.some((item) => typeof item.boardPosition === "number")
    ? items
        .filter((item) => typeof item.boardPosition === "number" && item.boardPosition < size * size)
        .sort((a, b) => a.boardPosition! - b.boardPosition!)
    : items.slice(0, size * size);
  if (positionedItems.length !== size * size) return [];
  const lines: BingoLine[] = [];
  const complete = (indexes: number[]) => indexes.every((index) => Boolean(positionedItems[index]?.completedAt));

  for (let row = 0; row < size; row += 1) {
    const squareIndexes = Array.from({ length: size }, (_, column) => row * size + column);
    if (complete(squareIndexes)) lines.push({ kind: "row", index: row, squareIndexes });
  }
  for (let column = 0; column < size; column += 1) {
    const squareIndexes = Array.from({ length: size }, (_, row) => row * size + column);
    if (complete(squareIndexes)) lines.push({ kind: "column", index: column, squareIndexes });
  }
  const descending = Array.from({ length: size }, (_, index) => index * size + index);
  const ascending = Array.from({ length: size }, (_, index) => index * size + (size - 1 - index));
  if (complete(descending)) lines.push({ kind: "diagonal", index: 0, squareIndexes: descending });
  if (complete(ascending)) lines.push({ kind: "diagonal", index: 1, squareIndexes: ascending });
  return lines;
}

export function getBingoProgress(draft: Pick<BucketListDraft, "items" | "size">) {
  const completed = draft.items.filter((square) => Boolean(square.completedAt)).length;
  const total = draft.items.length;
  const lines = getBingoLines(draft.items, draft.size);
  return {
    completed,
    total,
    percentage: total === 0 ? 0 : Math.round((completed / total) * 100),
    lines,
  };
}

export function createRemixDraft(source: BucketListDraft): BucketListDraft {
  const now = new Date().toISOString();
  return {
    ...source,
    title: source.title.startsWith("My ") ? source.title : `My ${source.title}`,
    items: source.items.map((square, index) => ({
      id: `${hashSeed(`${now}-${index}-${square.text}`).toString(36)}-remix`,
      text: square.text,
      intention: square.intention,
      effort: square.effort,
      tone: square.tone,
      isWildcard: square.isWildcard,
      boardPosition: square.boardPosition,
    })),
    createdAt: now,
    updatedAt: now,
  };
}

export function isBucketListDraft(value: unknown): value is BucketListDraft {
  if (!value || typeof value !== "object") return false;
  const draft = value as Partial<BucketListDraft>;
  return draft.version === LIFE_BINGO_DRAFT_VERSION
    && typeof draft.title === "string"
    && typeof draft.subtitle === "string"
    && (draft.size === 3 || draft.size === 5)
    && (draft.defaultView === "LIST" || draft.defaultView === "BINGO")
    && Array.isArray(draft.intentions)
    && Array.isArray(draft.items)
    && draft.items.every((item) => Boolean(item && typeof item.id === "string" && typeof item.text === "string"));
}

export function draftFromStoredRecord(record: {
  title: string;
  subtitle: string;
  horizon: string;
  size: number;
  boldness: string;
  defaultView: string;
  intentions: string;
  items: string;
  createdAt: Date;
  updatedAt: Date;
}): BucketListDraft | null {
  try {
    const draft = {
      version: LIFE_BINGO_DRAFT_VERSION,
      title: record.title,
      subtitle: record.subtitle,
      horizon: record.horizon,
      size: record.size,
      boldness: record.boldness,
      defaultView: record.defaultView,
      intentions: JSON.parse(record.intentions),
      items: JSON.parse(record.items),
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    };
    return isBucketListDraft(draft) ? draft : null;
  } catch {
    return null;
  }
}
