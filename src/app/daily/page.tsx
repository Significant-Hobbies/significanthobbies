import { ArrowRight, BookOpen, Repeat2 } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Daily became Journal and Habits — Significant Hobbies',
  robots: { index: false, follow: false },
};

export default function DailyTransitionPage() {
  return (
    <main className="min-h-[calc(100vh-4.5rem)] bg-[#fbf8ef] px-4 py-10 text-[#211e18] sm:py-16">
      <div className="mx-auto max-w-5xl">
        <header className="max-w-3xl">
          <p className="text-sm font-bold text-[#7658ad]">Daily has grown into two places</p>
          <h1 className="mt-3 font-serif text-5xl leading-[0.98] tracking-[-0.04em] sm:text-7xl">
            Writing and repetition deserve different rooms.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#625b50]">
            Your existing entries and check-ins are still here. Choose the part of your day you want
            to continue.
          </p>
        </header>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <Destination
            href="/journal"
            color="bg-[#c5abfa] text-[#241a31]"
            icon={<BookOpen className="size-7" />}
            title="Journal"
            copy="Write this morning or evening, then return to the words you left behind."
            action="Open Journal"
          />
          <Destination
            href="/habits"
            color="bg-[#dceabf] text-[#24351f]"
            icon={<Repeat2 className="size-7" />}
            title="Habits"
            copy="Check in on the small practices you want to keep returning to."
            action="Open Habits"
          />
        </div>
      </div>
    </main>
  );
}

function Destination({
  href,
  color,
  icon,
  title,
  copy,
  action,
}: {
  href: string;
  color: string;
  icon: React.ReactNode;
  title: string;
  copy: string;
  action: string;
}) {
  return (
    <Link
      href={href}
      className={`group flex min-h-72 flex-col justify-between rounded-[1.75rem] p-6 shadow-[0_12px_36px_rgba(66,55,22,0.08)] sm:p-8 ${color}`}
    >
      {icon}
      <div>
        <h2 className="font-serif text-4xl">{title}</h2>
        <p className="mt-3 max-w-sm leading-7 opacity-75">{copy}</p>
        <span className="mt-7 inline-flex min-h-11 items-center gap-2 border-b-2 border-current font-bold">
          {action}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
