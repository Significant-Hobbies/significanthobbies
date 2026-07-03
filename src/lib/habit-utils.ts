// Pure habit computation functions — not server actions, safe to import client-side.

interface HabitLogLite {
  habitId: string;
  dayDate: string;
  completed: boolean;
}

// Compute current streak (consecutive days with completed=true ending today or yesterday).
export function computeStreak(logs: HabitLogLite[], habitId: string): number {
  const habitLogs = logs
    .filter((l) => l.habitId === habitId && l.completed)
    .map((l) => l.dayDate)
    .sort();

  if (habitLogs.length === 0) return 0;

  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  // Streak must include today or yesterday to be "current"
  if (habitLogs[habitLogs.length - 1] !== today && habitLogs[habitLogs.length - 1] !== yesterday) {
    return 0;
  }

  let streak = 1;
  for (let i = habitLogs.length - 1; i > 0; i--) {
    const curr = new Date(habitLogs[i]!);
    const prev = new Date(habitLogs[i - 1]!);
    const diffDays = Math.round((curr.getTime() - prev.getTime()) / 86400000);
    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

// Compute weekly progress: how many of the last 7 days were completed.
export function computeWeeklyProgress(
  logs: HabitLogLite[],
  habitId: string
): { completed: number; target: number } {
  const last7Days: string[] = [];
  for (let i = 0; i < 7; i++) {
    last7Days.push(new Date(Date.now() - i * 86400000).toISOString().slice(0, 10));
  }

  const completed = logs.filter(
    (l) => l.habitId === habitId && l.completed && last7Days.includes(l.dayDate)
  ).length;

  return { completed, target: 7 };
}
