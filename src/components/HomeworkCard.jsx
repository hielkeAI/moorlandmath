import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays } from 'lucide-react';

export default function HomeworkCard({ title, subjectClass, due, kind = 'homework', answered = 0, total = 10, to }) {
  const pct = total > 0 ? Math.min(100, Math.round((answered / total) * 100)) : 0;
  const done = answered >= total;

  return (
    <div className="surface lift p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">{subjectClass}</p>
            {kind === 'assessment' && (
              <span className="rounded-full bg-accent/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]">
                Assessment
              </span>
            )}
          </div>
          <h3 className="mt-2 font-display text-xl font-semibold leading-snug tracking-tight">{title}</h3>
          <p className="mt-1.5 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5" />
            Due {due}
          </p>
        </div>
        <span className="num shrink-0 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
          {answered}/{total}
        </span>
      </div>

      <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>

      {to ? (
        <Link to={to} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary">
          {done ? 'Review' : answered > 0 ? 'Continue' : kind === 'assessment' ? 'Start assessment' : 'Start homework'}
          <ArrowRight className="h-4 w-4" />
        </Link>
      ) : (
        <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary">
          {done ? 'Complete' : answered > 0 ? 'Continue' : kind === 'assessment' ? 'Start assessment' : 'Start homework'}
          <ArrowRight className="h-4 w-4" />
        </span>
      )}
    </div>
  );
}