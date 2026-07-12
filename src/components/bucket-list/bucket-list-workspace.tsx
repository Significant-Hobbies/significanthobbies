"use client";

import { toPng } from "html-to-image";
import {
  Check,
  ChevronLeft,
  Download,
  Grid3X3,
  List,
  Loader2,
  Lock,
  Plus,
  RefreshCw,
  Share2,
  Sparkles,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { BucketListView } from "~/components/bucket-list/bucket-list-view";
import { BingoBoard } from "~/components/bucket-list/bingo-board";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import {
  createBucketList,
  deleteBucketList,
  setBucketListVisibility,
  updateBucketList,
} from "~/lib/actions/bucket-list";
import {
  BINGO_INTENTIONS,
  LIFE_BINGO_STORAGE_KEY,
  generateLifeBingo,
  getBingoProgress,
  isBucketListDraft,
  replacementSquare,
  type BingoBoldness,
  type BingoHorizon,
  type BingoIntention,
  type BingoVisibility,
  type BucketListDraft,
  type BucketListItem,
  type BucketListView as BucketListViewMode,
} from "~/lib/life-bingo";
import { cn } from "~/lib/utils";

const HORIZONS: Array<{ id: BingoHorizon; label: string; detail: string; marker: string }> = [
  { id: "month", label: "This month", detail: "9 small shifts", marker: "30 days" },
  { id: "season", label: "This season", detail: "9 things before it changes", marker: "3 months" },
  { id: "year", label: "This year", detail: "25 chances to make it yours", marker: "12 months" },
  { id: "chapter", label: "The next chapter", detail: "25 experiences without a deadline", marker: "open ended" },
];

const BOLDNESS: Array<{ id: BingoBoldness; label: string; detail: string }> = [
  { id: "cozy", label: "Keep it cozy", detail: "Gentle, local, easy to begin" },
  { id: "brave", label: "A little brave", detail: "A useful nudge beyond the usual" },
  { id: "bold", label: "Make it a story", detail: "Bigger swings and memorable firsts" },
];

function createCustomItem(text: string, boardPosition?: number): BucketListItem {
  return {
    id: crypto.randomUUID(),
    text,
    intention: "wildcard",
    effort: "medium",
    tone: "sky",
    boardPosition,
  };
}

export function BucketListWorkspace({
  initialDraft = null,
  isAuthenticated,
  listId,
  initialVisibility = "PRIVATE",
  initialSlug = null,
  queuedQuest = null,
}: {
  initialDraft?: BucketListDraft | null;
  isAuthenticated: boolean;
  listId?: string;
  initialVisibility?: BingoVisibility;
  initialSlug?: string | null;
  queuedQuest?: { id: string; title: string } | null;
}) {
  const router = useRouter();
  const boardExportRef = useRef<HTMLDivElement>(null);
  const skipFirstAutosave = useRef(true);
  const [draft, setDraft] = useState<BucketListDraft | null>(initialDraft);
  const [hydrated, setHydrated] = useState(Boolean(initialDraft));
  const [horizon, setHorizon] = useState<BingoHorizon>("season");
  const [intentions, setIntentions] = useState<BingoIntention[]>(["adventure", "creativity", "connection"]);
  const [boldness, setBoldness] = useState<BingoBoldness>("brave");
  const [activeView, setActiveView] = useState<BucketListViewMode>(initialDraft?.defaultView ?? "BINGO");
  const [visibility, setVisibility] = useState<BingoVisibility>(initialVisibility);
  const [slug, setSlug] = useState<string | null>(initialSlug);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editNote, setEditNote] = useState("");
  const [newItem, setNewItem] = useState("");
  const [isPending, startTransition] = useTransition();
  const [saveState, setSaveState] = useState<"saved" | "saving" | "unsaved">(listId ? "saved" : "unsaved");

  useEffect(() => {
    if (initialDraft) {
      setHydrated(true);
      return;
    }
    try {
      const stored = window.localStorage.getItem(LIFE_BINGO_STORAGE_KEY);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (isBucketListDraft(parsed)) {
          const hasQuest = queuedQuest && parsed.items.some((item) => item.sourceQuestId === queuedQuest.id);
          const next = queuedQuest && !hasQuest
            ? { ...parsed, items: [...parsed.items, { ...createCustomItem(queuedQuest.title), sourceQuestId: queuedQuest.id }] }
            : parsed;
          setDraft(next);
          setActiveView(next.defaultView);
          if (queuedQuest && !hasQuest) toast.success("Side Quest added to your bucket-list draft.");
        }
      } else if (queuedQuest) {
        const next = generateLifeBingo({ horizon: "season", intentions: ["adventure", "play", "connection"], boldness: "brave", seed: `side-quest-${queuedQuest.id}` });
        next.title = "My next adventures";
        next.subtitle = "A few good reasons to break routine.";
        next.defaultView = "LIST";
        next.items[0] = { ...createCustomItem(queuedQuest.title, 0), sourceQuestId: queuedQuest.id, tone: "clay" };
        setDraft(next);
        setActiveView("LIST");
        toast.success("Side Quest added to a new bucket-list draft.");
      }
    } catch {
      window.localStorage.removeItem(LIFE_BINGO_STORAGE_KEY);
    }
    setHydrated(true);
  }, [initialDraft, queuedQuest]);

  useEffect(() => {
    if (!hydrated || !draft || listId) return;
    window.localStorage.setItem(LIFE_BINGO_STORAGE_KEY, JSON.stringify(draft));
  }, [draft, hydrated, listId]);

  useEffect(() => {
    if (!listId || !draft) return;
    if (skipFirstAutosave.current) {
      skipFirstAutosave.current = false;
      return;
    }
    setSaveState("saving");
    const timeout = window.setTimeout(() => {
      startTransition(async () => {
        try {
          await updateBucketList(listId, draft);
          setSaveState("saved");
        } catch {
          setSaveState("unsaved");
          toast.error("We couldn’t save that change. Try again in a moment.");
        }
      });
    }, 850);
    return () => window.clearTimeout(timeout);
  }, [draft, listId]);

  const progress = useMemo(() => (draft ? getBingoProgress(draft) : null), [draft]);
  const editingItem = draft?.items.find((item) => item.id === editingId) ?? null;

  const changeDraft = useCallback((update: (current: BucketListDraft) => BucketListDraft) => {
    setDraft((current) => {
      if (!current) return current;
      const next = update(current);
      return { ...next, updatedAt: new Date().toISOString() };
    });
    setSaveState("unsaved");
  }, []);

  function chooseIntention(intention: BingoIntention) {
    setIntentions((current) => {
      if (current.includes(intention)) return current.filter((item) => item !== intention);
      if (current.length >= 3) return [...current.slice(1), intention];
      return [...current, intention];
    });
  }

  function generateBoard() {
    if (intentions.length === 0) {
      toast.error("Choose at least one thing you want more of.");
      return;
    }
    const next = generateLifeBingo({ horizon, intentions, boldness });
    setDraft(next);
    setActiveView("BINGO");
    setSaveState("unsaved");
  }

  function openEditor(item: BucketListItem) {
    setEditingId(item.id);
    setEditText(item.text);
    setEditNote(item.note ?? "");
  }

  function saveItem() {
    if (!editingId || !editText.trim()) return;
    changeDraft((current) => ({
      ...current,
      items: current.items.map((item) =>
        item.id === editingId ? { ...item, text: editText.trim().slice(0, 180), note: editNote.trim().slice(0, 280) || undefined } : item,
      ),
    }));
    setEditingId(null);
  }

  function toggleItem(item: BucketListItem) {
    changeDraft((current) => ({
      ...current,
      items: current.items.map((candidate) =>
        candidate.id === item.id
          ? { ...candidate, completedAt: candidate.completedAt ? undefined : new Date().toISOString() }
          : candidate,
      ),
    }));
  }

  function replaceItem(item: BucketListItem) {
    if (!draft) return;
    const replacement = replacementSquare({ draft, squareId: item.id });
    if (!replacement) {
      toast.error("No fresh suggestion found for this square.");
      return;
    }
    changeDraft((current) => ({
      ...current,
      items: current.items.map((candidate) => (candidate.id === item.id ? replacement : candidate)),
    }));
    setEditingId(null);
  }

  function removeItem(item: BucketListItem) {
    changeDraft((current) => ({ ...current, items: current.items.filter((candidate) => candidate.id !== item.id) }));
    setEditingId(null);
  }

  function moveItem(itemId: string, direction: -1 | 1) {
    changeDraft((current) => {
      const index = current.items.findIndex((item) => item.id === itemId);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= current.items.length) return current;
      const items = [...current.items];
      [items[index], items[nextIndex]] = [items[nextIndex]!, items[index]!];
      return { ...current, items };
    });
  }

  function addItem(preferredPosition?: number) {
    const text = newItem.trim();
    if (!text) return;
    changeDraft((current) => {
      const occupied = new Set(current.items.map((item) => item.boardPosition).filter((position) => typeof position === "number"));
      const firstOpen = Array.from({ length: current.size * current.size }, (_, index) => index).find((position) => !occupied.has(position));
      return {
        ...current,
        items: [...current.items, createCustomItem(text.slice(0, 180), preferredPosition ?? firstOpen)],
      };
    });
    setNewItem("");
  }

  function changeView(view: BucketListViewMode) {
    setActiveView(view);
    changeDraft((current) => ({ ...current, defaultView: view }));
  }

  function saveToAccount() {
    if (!draft) return;
    if (!isAuthenticated) {
      router.push("/login?callbackUrl=/bucket-list/new");
      return;
    }
    startTransition(async () => {
      try {
        const created = await createBucketList(draft);
        window.localStorage.removeItem(LIFE_BINGO_STORAGE_KEY);
        toast.success("Saved to your bucket list.");
        router.push(`/bucket-list/${created?.id}`);
      } catch {
        toast.error("We couldn’t save your bucket list.");
      }
    });
  }

  function updateVisibility(next: BingoVisibility) {
    if (!listId) return;
    startTransition(async () => {
      try {
        const updated = await setBucketListVisibility(listId, next);
        setVisibility(next);
        setSlug(updated?.slug ?? slug);
        toast.success(next === "PRIVATE" ? "Your list is private." : "Your Bingo link is ready.");
      } catch {
        toast.error("We couldn’t update sharing.");
      }
    });
  }

  async function exportBoard() {
    if (!boardExportRef.current || !draft) return;
    try {
      const dataUrl = await toPng(boardExportRef.current, { pixelRatio: 2, cacheBust: true, backgroundColor: "#f8f1e4" });
      const link = document.createElement("a");
      link.download = `${draft.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "life-bingo"}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Your Bingo board is ready.");
    } catch {
      toast.error("We couldn’t export this board in your browser.");
    }
  }

  async function copyShareLink() {
    if (!slug) return;
    const url = `${window.location.origin}/b/${slug}`;
    await navigator.clipboard.writeText(url);
    toast.success("Share link copied.");
  }

  function deleteList() {
    if (!listId || !window.confirm("Delete this bucket list? This cannot be undone.")) return;
    startTransition(async () => {
      try {
        await deleteBucketList(listId);
        router.push("/bucket-list");
      } catch {
        toast.error("We couldn’t delete this list.");
      }
    });
  }

  if (!hydrated) {
    return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-emerald-700" /></div>;
  }

  if (!draft) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] bg-[#f7f1e7] px-4 py-10 sm:py-16">
        <div className="mx-auto max-w-5xl">
          <Link href="/life-bingo" className="mb-8 inline-flex items-center gap-1 text-xs font-semibold text-stone-500 hover:text-stone-900">
            <ChevronLeft className="h-3.5 w-3.5" /> About Life Bingo
          </Link>
          <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:gap-16">
            <header className="lg:sticky lg:top-24 lg:self-start">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-emerald-700">Make your list</p>
              <h1 className="mt-3 max-w-xl font-serif text-5xl font-semibold leading-[0.93] tracking-[-0.04em] text-stone-900 sm:text-6xl">
                What should this chapter feel like?
              </h1>
              <p className="mt-5 max-w-md text-base leading-relaxed text-stone-600">
                Choose a horizon and a few things you want more of. We’ll turn them into concrete experiences, not vague goals.
              </p>
              <div className="mt-8 hidden rotate-[-2deg] rounded-2xl border border-[#d8cbb5] bg-[#fffaf0] p-5 shadow-sm lg:block">
                <p className="font-serif text-2xl text-stone-800">“A good list should make Tuesday feel full of possibility.”</p>
              </div>
            </header>

            <div className="space-y-9 rounded-[1.75rem] border border-[#ded3c1] bg-[#fffdf8] p-5 shadow-[0_24px_70px_rgba(72,58,38,0.1)] sm:p-8">
              <fieldset>
                <legend className="mb-4 text-sm font-bold text-stone-900"><span className="mr-2 font-serif text-xl text-emerald-700">01</span> How far are we looking?</legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  {HORIZONS.map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => setHorizon(item.id)}
                      className={cn(
                        "rounded-xl border p-4 text-left transition",
                        horizon === item.id ? "border-emerald-700 bg-emerald-50 shadow-sm" : "border-stone-200 bg-white hover:border-stone-300",
                      )}
                    >
                      <span className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-stone-900">{item.label}</span>
                        <span className="text-[0.6rem] font-bold uppercase tracking-wider text-stone-400">{item.marker}</span>
                      </span>
                      <span className="mt-1 block text-xs text-stone-500">{item.detail}</span>
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend className="mb-1 text-sm font-bold text-stone-900"><span className="mr-2 font-serif text-xl text-emerald-700">02</span> What do you want more of?</legend>
                <p className="mb-4 text-xs text-stone-500">Choose up to three. Choosing another replaces your oldest choice.</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {BINGO_INTENTIONS.map((item) => {
                    const selected = intentions.includes(item.id);
                    return (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => chooseIntention(item.id)}
                        aria-pressed={selected}
                        className={cn(
                          "min-h-24 rounded-xl border p-3 text-left transition",
                          selected ? "border-emerald-700 bg-[#e1eee5] text-emerald-950" : "border-stone-200 bg-white text-stone-700 hover:border-stone-300",
                        )}
                      >
                        <span className="font-serif text-xl">{item.emoji}</span>
                        <span className="mt-2 block text-xs font-bold">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <fieldset>
                <legend className="mb-4 text-sm font-bold text-stone-900"><span className="mr-2 font-serif text-xl text-emerald-700">03</span> How bold should it be?</legend>
                <div className="grid gap-2 sm:grid-cols-3">
                  {BOLDNESS.map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => setBoldness(item.id)}
                      className={cn(
                        "rounded-xl border px-4 py-3 text-left transition",
                        boldness === item.id ? "border-emerald-700 bg-emerald-50" : "border-stone-200 bg-white hover:border-stone-300",
                      )}
                    >
                      <span className="block text-sm font-semibold text-stone-900">{item.label}</span>
                      <span className="mt-0.5 block text-[0.68rem] leading-snug text-stone-500">{item.detail}</span>
                    </button>
                  ))}
                </div>
              </fieldset>

              <Button onClick={generateBoard} size="lg" className="h-12 w-full rounded-xl bg-[#176b4a] text-white hover:bg-[#10583d]">
                <Sparkles className="h-4 w-4" /> Make my Life Bingo
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[#f7f1e7] pb-20">
      <div className="border-b border-[#ded3c1] bg-[#fffdf8]/90 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Link href="/bucket-list" className="rounded-lg p-2 text-stone-500 hover:bg-stone-100" aria-label="Back to bucket lists">
              <ChevronLeft className="h-4 w-4" />
            </Link>
            <div>
              <p className="text-[0.62rem] font-bold uppercase tracking-[0.2em] text-emerald-700">Bucket List</p>
              <p className="max-w-[13rem] truncate text-sm font-semibold text-stone-900 sm:max-w-sm">{draft.title}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-lg border border-stone-200 bg-white p-1" aria-label="Choose bucket list view">
              <button type="button" onClick={() => changeView("LIST")} className={cn("flex min-h-11 items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold sm:min-h-0", activeView === "LIST" ? "bg-stone-900 text-white" : "text-stone-500 hover:text-stone-900")}>
                <List className="h-3.5 w-3.5" /> List
              </button>
              <button type="button" onClick={() => changeView("BINGO")} className={cn("flex min-h-11 items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold sm:min-h-0", activeView === "BINGO" ? "bg-stone-900 text-white" : "text-stone-500 hover:text-stone-900")}>
                <Grid3X3 className="h-3.5 w-3.5" /> Bingo
              </button>
            </div>
            {activeView === "BINGO" && (
              <Button variant="outline" size="sm" onClick={exportBoard} className="min-h-11 border-stone-300 bg-white sm:min-h-8">
                <Download className="h-3.5 w-3.5" /> Export
              </Button>
            )}
            {!listId && (
              <Button size="sm" onClick={saveToAccount} disabled={isPending} className="min-h-11 bg-[#176b4a] text-white hover:bg-[#10583d] sm:min-h-8">
                {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : isAuthenticated ? <Check className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                {isAuthenticated ? "Save list" : "Sign in to save"}
              </Button>
            )}
            {listId && <span className="min-w-14 text-right text-[0.65rem] font-medium text-stone-400">{saveState === "saving" || isPending ? "Saving…" : saveState === "saved" ? "Saved" : "Unsaved"}</span>}
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-4 sm:py-6">
        {activeView === "LIST" && (
          <div className="mx-auto mb-6 grid max-w-3xl gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <p className="text-xs font-semibold text-stone-500">
                {progress?.completed} of {progress?.total} lived
                {progress && progress.lines.length > 0 && <span className="ml-2 text-emerald-700">· {progress.lines.length} Bingo {progress.lines.length === 1 ? "line" : "lines"}</span>}
              </p>
              <div className="mt-2 h-1.5 max-w-md overflow-hidden rounded-full bg-stone-200">
                <div className="h-full rounded-full bg-emerald-700 transition-all duration-500" style={{ width: `${progress?.percentage ?? 0}%` }} />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Input value={newItem} onChange={(event) => setNewItem(event.target.value)} onKeyDown={(event) => event.key === "Enter" && addItem()} placeholder="Add something you want to do…" aria-label="New bucket-list item" className="h-11 w-full border-stone-300 bg-white sm:h-9 sm:w-64" maxLength={180} />
              <Button variant="outline" size="sm" onClick={() => addItem()} disabled={!newItem.trim()} className="min-h-11 border-stone-300 bg-white sm:min-h-8"><Plus className="h-3.5 w-3.5" /> Add</Button>
            </div>
          </div>
        )}

        {activeView === "BINGO" ? (
          <div ref={boardExportRef} className="mx-auto max-w-[45rem]">
            <BingoBoard compact draft={draft} onSelectItem={openEditor} onSelectEmpty={(position) => {
              const text = window.prompt("What do you want to put here?");
              if (!text?.trim()) return;
              changeDraft((current) => ({ ...current, items: [...current.items, createCustomItem(text.trim().slice(0, 180), position)] }));
            }} />
          </div>
        ) : (
          <div className="mx-auto max-w-3xl">
            <BucketListView draft={draft} onToggle={toggleItem} onEdit={openEditor} onMove={moveItem} />
          </div>
        )}

        {listId && (
          <section className="mx-auto mt-8 flex max-w-4xl flex-col gap-4 rounded-2xl border border-stone-200 bg-white/70 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-stone-900">Share the Bingo version</p>
              <p className="mt-0.5 text-xs text-stone-500">Your reflections stay on the card only when you make the list shareable.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select value={visibility} onChange={(event) => updateVisibility(event.target.value as BingoVisibility)} className="h-9 rounded-md border border-stone-300 bg-white px-3 text-xs font-semibold text-stone-700">
                <option value="PRIVATE">Private</option>
                <option value="UNLISTED">Anyone with link</option>
                <option value="PUBLIC">Public</option>
              </select>
              {slug && visibility !== "PRIVATE" && <Button size="sm" variant="outline" onClick={copyShareLink} className="border-stone-300 bg-white"><Share2 className="h-3.5 w-3.5" /> Copy link</Button>}
              <Button size="sm" variant="ghost" onClick={deleteList} className="text-red-600 hover:bg-red-50 hover:text-red-700"><Trash2 className="h-3.5 w-3.5" /> Delete</Button>
            </div>
          </section>
        )}
      </main>

      <Dialog open={Boolean(editingItem)} onOpenChange={(open) => !open && setEditingId(null)}>
        <DialogContent className="border-stone-200 bg-[#fffdf8] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">Make this one yours</DialogTitle>
            <DialogDescription>Edit the experience, add a memory, or swap it for a fresh suggestion.</DialogDescription>
          </DialogHeader>
          {editingItem && (
            <div className="space-y-4">
              <div>
                <label htmlFor="bucket-item-text" className="mb-1.5 block text-xs font-semibold text-stone-600">Experience</label>
                <Textarea id="bucket-item-text" value={editText} onChange={(event) => setEditText(event.target.value)} maxLength={180} className="min-h-24 border-stone-300 bg-white" />
              </div>
              <div>
                <label htmlFor="bucket-item-note" className="mb-1.5 block text-xs font-semibold text-stone-600">One line to remember it by <span className="font-normal text-stone-400">(optional)</span></label>
                <Textarea id="bucket-item-note" value={editNote} onChange={(event) => setEditNote(event.target.value)} maxLength={280} placeholder="What happened? Who was there?" className="min-h-20 border-stone-300 bg-white" />
              </div>
              <button type="button" onClick={() => toggleItem(editingItem)} className={cn("flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition", editingItem.completedAt ? "border-emerald-300 bg-emerald-50" : "border-stone-200 bg-white hover:border-emerald-300")}>
                <span>
                  <span className="block text-sm font-semibold text-stone-900">{editingItem.completedAt ? "Completed" : "Mark this lived"}</span>
                  <span className="block text-xs text-stone-500">{editingItem.completedAt ? new Date(editingItem.completedAt).toLocaleDateString() : "Give the square its ink stamp"}</span>
                </span>
                <span className={cn("flex h-8 w-8 items-center justify-center rounded-full", editingItem.completedAt ? "bg-emerald-700 text-white" : "bg-stone-100 text-stone-400")}><Check className="h-4 w-4" /></span>
              </button>
            </div>
          )}
          <DialogFooter className="sm:justify-between">
            <div className="flex gap-1">
              {editingItem && !editingItem.isWildcard && <Button variant="ghost" size="sm" onClick={() => replaceItem(editingItem)} className="text-stone-500"><RefreshCw className="h-3.5 w-3.5" /> Swap</Button>}
              {editingItem && <Button variant="ghost" size="sm" onClick={() => removeItem(editingItem)} className="text-red-600 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /> Remove</Button>}
            </div>
            <Button onClick={saveItem} className="bg-[#176b4a] text-white hover:bg-[#10583d]">Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
