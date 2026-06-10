"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { setUsername } from "~/lib/actions/user";

export function UsernameForm() {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const isValid = /^[a-z0-9-]{3,30}$/.test(value);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    setLoading(true);
    try {
      await setUsername(value);
      toast.success("Username set!");
      router.push(`/u/${value}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-stone-200 bg-white">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center rounded-md border border-stone-300 bg-stone-50 px-3 focus-within:border-emerald-500 transition-colors">
              <span className="text-stone-400 text-sm select-none">@</span>
              <Input
                value={value}
                onChange={(e) =>
                  setValue(
                    e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                  )
                }
                placeholder="yourname"
                className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 pl-1"
                minLength={3}
                maxLength={30}
                required
              />
            </div>
            <p className="mt-1.5 text-xs text-stone-400">
              Lowercase letters, numbers, hyphens only
            </p>
          </div>
          <Button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700"
            disabled={loading || !isValid}
          >
            {loading ? "Saving..." : "Claim username"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
