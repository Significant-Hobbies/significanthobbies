'use client';

import { Globe, Link, Loader2, Lock } from 'lucide-react';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';

import { Button } from '~/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { setTimelineVisibility } from '~/lib/actions/timeline';
import type { TimelineVisibility } from '~/lib/types';

const OPTIONS: {
  value: TimelineVisibility;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  desc: string;
}[] = [
  {
    value: 'PRIVATE',
    label: 'Private',
    icon: Lock,
    desc: 'Only you can see',
  },
  {
    value: 'UNLISTED',
    label: 'Unlisted',
    icon: Link,
    desc: 'Anyone with the link',
  },
  {
    value: 'PUBLIC',
    label: 'Public',
    icon: Globe,
    desc: 'Listed publicly',
  },
];

interface Props {
  timelineId: string;
  current: TimelineVisibility;
}

export function VisibilityToggle({ timelineId, current }: Props) {
  const [visibility, setVisibility] = useState<TimelineVisibility>(current);
  const [isPending, startTransition] = useTransition();

  const active = OPTIONS.find((o) => o.value === visibility) ?? OPTIONS[0]!;
  const Icon = active.icon;

  function handleChange(value: TimelineVisibility) {
    if (value === visibility) return;
    startTransition(async () => {
      try {
        await setTimelineVisibility(timelineId, value);
        setVisibility(value);
        toast.success(`Visibility set to ${value.toLowerCase()}`);
      } catch {
        toast.error('Failed to update visibility');
      }
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-stone-300 text-stone-600 hover:text-stone-900 gap-1.5"
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Icon className="h-3.5 w-3.5" />
          )}
          {active.label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white border-stone-200">
        {OPTIONS.map((opt) => {
          const OptIcon = opt.icon;
          return (
            <DropdownMenuItem
              key={opt.value}
              onClick={() => handleChange(opt.value)}
              className="flex items-start gap-3 py-2 cursor-pointer hover:bg-stone-100 focus:bg-stone-100"
            >
              <OptIcon className="h-4 w-4 mt-0.5 text-stone-500 shrink-0" />
              <div>
                <div className="text-sm text-stone-800">{opt.label}</div>
                <div className="text-xs text-stone-500">{opt.desc}</div>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
