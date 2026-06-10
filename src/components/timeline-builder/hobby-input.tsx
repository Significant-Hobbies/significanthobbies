"use client";

import { X } from "lucide-react";
import { type KeyboardEvent,useState } from "react";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import type { HobbyEntry } from "~/lib/types";

interface Props {
  hobbies: HobbyEntry[];
  onChange: (hobbies: HobbyEntry[]) => void;
}

export function HobbyInput({ hobbies, onChange }: Props) {
  const [input, setInput] = useState("");

  function addHobbies(raw: string) {
    const names = raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const existing = new Set(hobbies.map((h) => h.name.toLowerCase()));
    const newHobbies = names
      .filter((name) => !existing.has(name.toLowerCase()))
      .map((name) => ({ name }));
    if (newHobbies.length) onChange([...hobbies, ...newHobbies]);
    setInput("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addHobbies(input);
    }
  }

  function removeHobby(name: string) {
    onChange(hobbies.filter((h) => h.name !== name));
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add hobbies (comma-separated, Enter to add)"
          className="bg-stone-50 border-stone-300 text-sm h-11"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => addHobbies(input)}
          className="border-stone-300 h-11 shrink-0"
        >
          Add
        </Button>
      </div>
      {hobbies.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {hobbies.map((hobby) => (
            <Badge
              key={hobby.name}
              variant="secondary"
              className="bg-emerald-100 text-emerald-700 border border-emerald-200 py-1 pl-2.5 pr-1 flex items-center gap-1 text-xs"
            >
              {hobby.name}
              {/* Remove button — padded so it's a comfortable touch target. */}
              <button
                type="button"
                onClick={() => removeHobby(hobby.name)}
                className="-mr-0.5 flex h-7 w-7 items-center justify-center rounded-full hover:bg-emerald-200 hover:text-emerald-900"
                aria-label={`Remove ${hobby.name}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
