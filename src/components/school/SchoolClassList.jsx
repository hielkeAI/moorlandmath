import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function SchoolClassList({ classrooms, counts, myId }) {
  return (
    <div className="surface overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h2 className="font-display text-lg font-semibold tracking-tight">Classes at this school</h2>
        <span className="num rounded-full bg-secondary px-3 py-1 text-xs font-semibold">{classrooms.length}</span>
      </div>

      {classrooms.length === 0 ? (
        <p className="px-5 py-4 text-sm text-muted-foreground">
          No classes yet — create one from the Classes page.
        </p>
      ) : (
        <div className="divide-y divide-border">
          {classrooms.map((classroom) => {
            const mine = classroom.created_by_id === myId;
            const body = (
              <div className="flex items-center gap-4 px-5 py-3.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{classroom.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {[classroom.year_group, classroom.teacher_name].filter(Boolean).join(' · ')}
                  </p>
                </div>
                <span className="num rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold tracking-[0.14em]">
                  {classroom.join_code}
                </span>
                <span className="num w-20 shrink-0 text-right text-xs text-muted-foreground">
                  {counts[classroom.id] || 0} students
                </span>
                {mine ? <ArrowRight className="h-4 w-4 text-muted-foreground" /> : <span className="w-4" />}
              </div>
            );

            return mine ? (
              <Link key={classroom.id} to={`/classes/${classroom.id}`} className="block transition-colors hover:bg-secondary/50">
                {body}
              </Link>
            ) : (
              <div key={classroom.id}>{body}</div>
            );
          })}
        </div>
      )}
    </div>
  );
}