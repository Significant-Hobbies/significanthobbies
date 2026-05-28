"use client";

import posthog from "posthog-js";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { EmailCapture } from "~/components/email-capture";
import { QuizResultCard } from "~/components/quiz-result-card";
import { HOBBY_CATEGORIES } from "~/lib/hobbies";

type Category =
  | "Creative"
  | "Physical"
  | "Outdoor"
  | "Intellectual"
  | "Gaming"
  | "Social"
  | "Culinary"
  | "Making"
  | "Music"
  | "Collecting";

interface QuizOption {
  emoji: string;
  label: string;
  categories: Category[];
}

interface QuizQuestion {
  question: string;
  options: QuizOption[];
}

interface HobbyExperiment {
  hobby: string;
  category: Category;
  time: string;
  cost: string;
  firstStep: string;
  reason: string;
}

const QUESTIONS: QuizQuestion[] = [
  {
    question: "When you have free time, you'd rather...",
    options: [
      { emoji: "🛠️", label: "Make something with my hands", categories: ["Creative", "Making"] },
      { emoji: "🏃", label: "Get moving and active", categories: ["Physical", "Outdoor"] },
      { emoji: "📖", label: "Learn something new", categories: ["Intellectual"] },
      { emoji: "🥂", label: "Hang out with people", categories: ["Social", "Culinary"] },
    ],
  },
  {
    question: "At a party, you're most likely...",
    options: [
      { emoji: "✏️", label: "In the corner sketching or people-watching", categories: ["Creative"] },
      { emoji: "🎉", label: "Organizing a group activity", categories: ["Social"] },
      { emoji: "💬", label: "Deep in conversation about ideas", categories: ["Intellectual"] },
      { emoji: "🎮", label: "Challenging someone to a game", categories: ["Gaming", "Physical"] },
    ],
  },
  {
    question: "Your ideal weekend involves...",
    options: [
      { emoji: "🥾", label: "A long hike or bike ride", categories: ["Physical", "Outdoor"] },
      { emoji: "🎨", label: "A workshop or class", categories: ["Making", "Creative"] },
      { emoji: "🍝", label: "Cooking a big meal for friends", categories: ["Culinary", "Social"] },
      { emoji: "🧩", label: "Getting lost in a book or puzzle", categories: ["Intellectual", "Gaming"] },
    ],
  },
  {
    question: "You feel most satisfied when you...",
    options: [
      { emoji: "✨", label: "Create something that didn't exist before", categories: ["Creative", "Making"] },
      { emoji: "💪", label: "Push past a physical challenge", categories: ["Physical"] },
      { emoji: "🎵", label: "Master a skill through practice", categories: ["Music", "Intellectual"] },
      { emoji: "🤝", label: "Connect with others over shared interests", categories: ["Social"] },
    ],
  },
  {
    question: "Your energy level right now...",
    options: [
      { emoji: "⚡", label: "High — I want to DO something", categories: ["Physical", "Outdoor"] },
      { emoji: "🔨", label: "Medium — I want to create or build", categories: ["Creative", "Making"] },
      { emoji: "😌", label: "Chill — I want to relax and explore", categories: ["Intellectual", "Gaming", "Collecting"] },
      { emoji: "🧑‍🤝‍🧑", label: "Social — I want to be around people", categories: ["Social", "Culinary"] },
    ],
  },
];

const ARCHETYPE_MAP: Record<Category, { title: string; emoji: string; description: string }> = {
  Creative: { title: "The Creator", emoji: "🎨", description: "You express yourself through art, design, and imagination." },
  Making: { title: "The Maker", emoji: "🔧", description: "You love turning raw materials into something real and tangible." },
  Physical: { title: "The Athlete", emoji: "🏆", description: "You thrive when you're pushing your body and breaking limits." },
  Outdoor: { title: "The Explorer", emoji: "🌿", description: "You come alive in nature and open spaces." },
  Intellectual: { title: "The Scholar", emoji: "📚", description: "You're driven by curiosity and love diving deep into ideas." },
  Gaming: { title: "The Strategist", emoji: "🎮", description: "You love competition, systems, and mastering complex challenges." },
  Social: { title: "The Connector", emoji: "🤝", description: "You energize others and love building community." },
  Culinary: { title: "The Foodie", emoji: "🍳", description: "You express love and creativity through food and flavor." },
  Music: { title: "The Musician", emoji: "🎵", description: "You're drawn to rhythm, melody, and sonic expression." },
  Collecting: { title: "The Curator", emoji: "🗂️", description: "You have a keen eye for quality and love curating meaningful things." },
};

function hobbySlug(name: string) {
  return encodeURIComponent(name.toLowerCase().replace(/\s+/g, "-"));
}

function getTopCategories(scores: Record<string, number>): Category[] {
  return Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([cat]) => cat as Category);
}

function getRecommendedHobbies(topCats: Category[]): string[] {
  const results: string[] = [];
  for (const cat of topCats.slice(0, 2)) {
    const found = HOBBY_CATEGORIES.find((c) => c.name === cat);
    if (found) {
      results.push(...found.hobbies.slice(0, 3));
    }
  }
  return results.slice(0, 6);
}

function getHobbyCategory(hobby: string): Category {
  return (
    (HOBBY_CATEGORIES.find((category) => category.hobbies.includes(hobby))?.name as Category | undefined) ??
    "Creative"
  );
}

function buildHobbyExperiments(hobbies: string[], topCats: Category[]): HobbyExperiment[] {
  return hobbies.slice(0, 3).map((hobby, index) => {
    const category = getHobbyCategory(hobby);
    const primaryMatch = topCats[0] === category;
    const time = index === 0 ? "25 minutes" : index === 1 ? "45 minutes" : "1 weekend hour";
    const cost = index === 0 ? "$0 starter" : index === 1 ? "Under $15" : "Use what you have";
    return {
      hobby,
      category,
      time,
      cost,
      firstStep: primaryMatch
        ? `Do one tiny ${hobby.toLowerCase()} session today and write down what felt easy.`
        : `Try the smallest version of ${hobby.toLowerCase()} before buying gear or joining a class.`,
      reason: primaryMatch
        ? `This matches your strongest quiz signal: ${category.toLowerCase()} energy.`
        : `This gives your ${category.toLowerCase()} side a low-risk test without changing your whole routine.`,
    };
  });
}

function trackRecommendationEvent(name: "recommendation_started" | "recommendation_saved", properties: Record<string, unknown>) {
  try {
    posthog.capture(name, { project_id: "significanthobbies", ...properties });
  } catch {
    // Best-effort only; recommendations should never fail because analytics did.
  }
}

export function HobbyQuiz() {
  const [step, setStep] = useState(0); // 0-4 = questions, 5 = results
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [isDownloading, setIsDownloading] = useState(false);
  const [savedExperimentPlan, setSavedExperimentPlan] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const trackedRecommendationStartRef = useRef(false);

  const isResults = step >= QUESTIONS.length;
  const currentQuestion = QUESTIONS[step];

  function handleSelect(optionIndex: number) {
    setSelectedOption(optionIndex);
  }

  function handleNext() {
    if (selectedOption === null) return;

    const option = QUESTIONS[step]!.options[selectedOption]!;
    const newScores = { ...scores };
    for (const cat of option.categories) {
      newScores[cat] = (newScores[cat] ?? 0) + 1;
    }

    setScores(newScores);
    setAnswers([...answers, selectedOption]);
    setSelectedOption(null);
    setStep(step + 1);
  }

  function handleRestart() {
    setStep(0);
    setAnswers([]);
    setSelectedOption(null);
    setScores({});
    setSavedExperimentPlan(false);
    trackedRecommendationStartRef.current = false;
  }

  function handleShare() {
    const topCats = getTopCategories(scores);
    const archetype = ARCHETYPE_MAP[topCats[0]!];
    const text = `I took the Hobby Finder Quiz and I'm ${archetype?.title ?? "a hobby explorer"}! Find your perfect hobby at significanthobbies.com/find-your-hobby`;
    if (navigator.share) {
      // share() rejects when the user cancels — that's not an error.
      void navigator
        .share({ title: "My Hobby Archetype", text, url: "https://significanthobbies.com/find-your-hobby" })
        .catch(() => {});
    } else {
      navigator.clipboard
        .writeText(text)
        .then(() => alert("Result copied to clipboard!"))
        .catch(() => alert("Couldn't copy — select and copy the text manually."));
    }
  }

  async function handleDownloadCard() {
    if (!cardRef.current) return;
    setIsDownloading(true);
    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2,
        backgroundColor: "#020617",
      });
      const link = document.createElement("a");
      link.download = "my-hobby-personality.png";
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Quiz card PNG export failed", err);
      alert("Couldn't create the image — try again in a moment.");
    } finally {
      setIsDownloading(false);
    }
  }

  const topCats = isResults ? getTopCategories(scores) : [];
  const primaryCat = topCats[0];
  const archetype = primaryCat ? ARCHETYPE_MAP[primaryCat] : null;
  const recommendedHobbies = isResults ? getRecommendedHobbies(topCats) : [];
  const hobbyExperiments = isResults ? buildHobbyExperiments(recommendedHobbies, topCats) : [];

  useEffect(() => {
    if (!isResults || !archetype) return;
    if (trackedRecommendationStartRef.current) return;
    trackedRecommendationStartRef.current = true;
    trackRecommendationEvent("recommendation_started", {
      archetype: archetype.title,
      top_categories: topCats,
      recommended_hobbies: recommendedHobbies.slice(0, 3),
    });
  }, [archetype, isResults, recommendedHobbies, topCats]);

  function handleSaveExperimentPlan() {
    const payload = {
      savedAt: new Date().toISOString(),
      archetype: archetype?.title ?? "Hobby Explorer",
      experiments: hobbyExperiments,
    };
    localStorage.setItem("significant-hobbies:experiment-plan", JSON.stringify(payload));
    setSavedExperimentPlan(true);
    trackRecommendationEvent("recommendation_saved", {
      archetype: payload.archetype,
      hobbies: hobbyExperiments.map((experiment) => experiment.hobby),
    });
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
        {/* Header */}
        {!isResults && (
          <div className="mb-10 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-emerald-600">
              Free Hobby Quiz
            </p>
            <h1 className="text-3xl font-bold text-stone-900">Find Your Perfect Hobby</h1>
            <p className="mt-3 text-stone-500">
              Answer 5 quick questions and get personalized hobby recommendations.
            </p>
          </div>
        )}

        {/* Progress indicator */}
        {!isResults && (
          <div className="mb-8 flex items-center justify-center gap-2">
            {QUESTIONS.map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i < step
                    ? "w-8 bg-emerald-500"
                    : i === step
                    ? "w-8 bg-emerald-300"
                    : "w-4 bg-stone-200"
                }`}
              />
            ))}
          </div>
        )}

        {/* Quiz question */}
        {!isResults && currentQuestion && (
          <div key={step} className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="mb-2 text-center text-sm text-stone-400">
              Question {step + 1} of {QUESTIONS.length}
            </div>
            <h2 className="mb-6 text-center text-xl font-semibold text-stone-800">
              {currentQuestion.question}
            </h2>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {currentQuestion.options.map((option, i) => {
                const isSelected = selectedOption === i;
                return (
                  <button
                    key={i}
                    onClick={() => handleSelect(i)}
                    className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all duration-150 hover:border-emerald-300 hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-50 shadow-sm"
                        : "border-stone-200 bg-white"
                    }`}
                  >
                    <span className="text-2xl">{option.emoji}</span>
                    <span
                      className={`text-sm font-medium ${
                        isSelected ? "text-emerald-800" : "text-stone-700"
                      }`}
                    >
                      {option.label}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex justify-center">
              <button
                onClick={handleNext}
                disabled={selectedOption === null}
                className={`rounded-lg px-8 py-3 text-sm font-semibold transition-all duration-150 ${
                  selectedOption !== null
                    ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm hover:shadow-md"
                    : "cursor-not-allowed bg-stone-100 text-stone-400"
                }`}
              >
                {step === QUESTIONS.length - 1 ? "See my results →" : "Next →"}
              </button>
            </div>
          </div>
        )}

        {/* Results screen */}
        {isResults && archetype && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Archetype reveal */}
            <div className="mb-10 rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-8 text-center shadow-sm">
              <div className="mb-4 text-6xl">{archetype.emoji}</div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-emerald-600">
                Your Hobby Archetype
              </p>
              <h1 className="mb-3 text-3xl font-bold text-stone-900">{archetype.title}</h1>
              <p className="text-stone-600">{archetype.description}</p>

              {topCats.length > 1 && (
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {topCats.map((cat) => {
                    const a = ARCHETYPE_MAP[cat];
                    return (
                      <span
                        key={cat}
                        className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700"
                      >
                        {a?.emoji} {cat}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Recommended hobbies */}
            <div className="mb-8">
              <h2 className="mb-1 text-lg font-semibold text-stone-900">Hobbies picked for you</h2>
              <p className="mb-4 text-sm text-stone-500">
                Based on your archetype — click any to explore community timelines.
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {recommendedHobbies.map((hobby) => {
                  const cat = HOBBY_CATEGORIES.find((c) => c.hobbies.includes(hobby));
                  return (
                    <Link
                      key={hobby}
                      href={`/hobbies/${hobbySlug(hobby)}`}
                      className="flex flex-col items-center gap-1 rounded-xl border border-stone-200 bg-white p-4 text-center text-sm font-medium text-stone-700 transition-all hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700 hover:shadow-sm"
                    >
                      <span className="text-2xl">{cat?.emoji ?? "✨"}</span>
                      <span>{hobby}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Guided hobby experiments */}
            <div className="mb-8 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-stone-900">Try one tiny experiment</h2>
                  <p className="text-sm text-stone-500">
                    Pick the lowest-friction test before committing to a whole new identity.
                  </p>
                </div>
                <button
                  onClick={handleSaveExperimentPlan}
                  className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition-colors hover:border-emerald-300 hover:bg-emerald-100"
                >
                  {savedExperimentPlan ? "Plan saved" : "Save plan"}
                </button>
              </div>
              <div className="grid gap-3">
                {hobbyExperiments.map((experiment) => {
                  const category = HOBBY_CATEGORIES.find((item) => item.name === experiment.category);
                  return (
                    <div key={experiment.hobby} className="rounded-xl border border-stone-200 bg-stone-50 p-4">
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-stone-900">
                            {category?.emoji ?? "✨"} {experiment.hobby}
                          </p>
                          <p className="mt-1 text-xs text-stone-500">{experiment.reason}</p>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1 text-[11px] font-medium text-stone-500">
                          <span>{experiment.time}</span>
                          <span>{experiment.cost}</span>
                        </div>
                      </div>
                      <p className="rounded-lg bg-white px-3 py-2 text-sm text-stone-700">
                        {experiment.firstStep}
                      </p>
                    </div>
                  );
                })}
              </div>
              {savedExperimentPlan && (
                <p className="mt-3 text-center text-xs font-medium text-emerald-700">
                  Saved on this device. Turn the experiment into a timeline when you are ready.
                </p>
              )}
            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/timeline/new"
                className="flex-1 rounded-lg bg-emerald-600 px-6 py-3 text-center text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700"
              >
                Build your hobby timeline →
              </Link>
              <Link
                href="/hobbies"
                className="flex-1 rounded-lg border border-stone-300 bg-white px-6 py-3 text-center text-sm font-semibold text-stone-700 transition-colors hover:border-stone-400 hover:bg-stone-50"
              >
                Explore all hobbies
              </Link>
            </div>

            <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <button
                onClick={handleShare}
                className="flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-5 py-2.5 text-sm font-medium text-stone-600 transition-colors hover:border-stone-300 hover:bg-stone-50"
              >
                <span>🔗</span> Share your result
              </button>
              <button
                onClick={handleDownloadCard}
                disabled={isDownloading}
                className="flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-5 py-2.5 text-sm font-medium text-stone-600 transition-colors hover:border-stone-300 hover:bg-stone-50 disabled:opacity-50"
              >
                <span>⬇️</span> {isDownloading ? "Downloading..." : "Download Card"}
              </button>
              <button
                onClick={handleRestart}
                className="text-sm text-stone-400 underline-offset-2 hover:text-stone-600 hover:underline"
              >
                Retake quiz
              </button>
            </div>

            {/* Hidden export card — rendered off-screen for PNG export */}
            <div className="fixed -left-[9999px] -top-[9999px] pointer-events-none">
              <QuizResultCard
                archetype={archetype.title}
                archetypeEmoji={archetype.emoji}
                topCategories={topCats}
                recommendedHobbies={recommendedHobbies}
                exportRef={cardRef}
              />
            </div>

            <div className="mt-8 rounded-xl border border-stone-200 bg-stone-50 p-6 text-center">
              <p className="font-medium text-stone-800 mb-2">Want hobby recommendations in your inbox?</p>
              <p className="text-sm text-stone-500 mb-4">Weekly inspiration — no spam, unsubscribe anytime.</p>
              <EmailCapture source="quiz" />
            </div>
          </div>
        )}
    </div>
  );
}
