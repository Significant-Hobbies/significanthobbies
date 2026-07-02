'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { setUsername } from '~/lib/actions/user';

export function UsernameForm() {
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const isValid = /^[a-z0-9-]{3,30}$/.test(value);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    setLoading(true);
    try {
      await setUsername(value);
      toast.success('Username set!');
      router.push(`/u/${value}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-border bg-card">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center rounded-md border border-border bg-card/40 px-3 focus-within:border-foreground/30 transition-colors">
              <span className="text-muted-foreground/60 text-sm select-none">@</span>
              <Input
                value={value}
                onChange={(e) => setValue(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="yourname"
                className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 pl-1"
                minLength={3}
                maxLength={30}
                required
              />
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground/60">
              Lowercase letters, numbers, hyphens only
            </p>
          </div>
          <Button
            type="submit"
            className="w-full bg-primary hover:opacity-90"
            disabled={loading || !isValid}
          >
            {loading ? 'Saving...' : 'Claim username'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
