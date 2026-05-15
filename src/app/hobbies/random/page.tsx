"use client";

import { useEffect, useState } from "react";

import { HOBBY_CATEGORIES } from "~/lib/hobbies";

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function RandomHobby() {
  const [msg, setMsg] = useState("Picking a random hobby…");

  useEffect(() => {
    const all = HOBBY_CATEGORIES.flatMap((c) => c.hobbies);
    if (all.length === 0) {
      setMsg("No hobbies catalogued yet.");
      return;
    }
    const pick = all[Math.floor(Math.random() * all.length)]!;
    window.location.replace(`/hobbies/${slugify(pick)}`);
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <p className="font-mono text-sm text-stone-500">{msg}</p>
    </main>
  );
}
