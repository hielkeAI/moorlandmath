import { Flame, Target } from 'lucide-react';
import ProgressRing from '@/components/ProgressRing';
import { XP_PER_LEVEL } from '@/lib/appData';

export default function ProgressPanel({
  level = 1,
  xp = 0,
  xpForLevel = XP_PER_LEVEL,
  streak = 0,
  answered = 0,
  accuracy = 0,
}) {
  return (
    <div className="space-y-4">
      <div className="surface p-6">
        <div className="flex items-center gap-5">
          <ProgressRing value={(xp / xpForLevel) * 100}>
            <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              Level
            </span>
            <span className="num font-display text-2xl font-semibold leading-none">{level}</span>
          </ProgressRing>
          <div>
            <p className="font-display text-base font-semibold">Keeping pace</p>
            <p className="mt-1 text-sm text-muted-foreground">
              <span className="num font-medium text-foreground">{Math.max(0, xpForLevel - xp)} XP</span> to level{' '}
              {level + 1}
            </p>
          </div>
        </div>
      </div>

      <div className="surface flex items-center gap-4 p-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/40">
          <Flame className="h-5 w-5" />
        </div>
        <div>
          <p className="num font-display text-xl font-semibold leading-none">{streak} days</p>
          <p className="mt-1 text-sm text-muted-foreground">Practice streak</p>
        </div>
      </div>

      <div className="surface divide-y divide-border p-2">
        <div className="flex items-baseline justify-between px-4 py-3">
          <span className="text-sm text-muted-foreground">Questions answered</span>
          <span className="num text-sm font-semibold">{answered}</span>
        </div>
        <div className="flex items-baseline justify-between px-4 py-3">
          <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Target className="h-3.5 w-3.5" />
            Accuracy
          </span>
          <span className="num text-sm font-semibold">{accuracy}%</span>
        </div>
      </div>
    </div>
  );
}