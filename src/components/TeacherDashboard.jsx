import { Link } from 'react-router-dom';
import { ArrowRight, Users } from 'lucide-react';

export default function TeacherDashboard({ profile, classrooms = [], counts = {} }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="mx-auto w-full max-w-6xl px-5 pb-24 pt-8 sm:px-8 sm:pt-12">
      <h1 className="font-display text-4xl font-semibold tracking-[-0.03em] sm:text-[3.25rem] sm:leading-[1.05]">
        {greeting}, {(profile.display_name || 'there').split(' ')[0]}
      </h1>
      <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted-foreground">
        {profile.school_name || 'Your school'} · set homework, then watch every student's progress land in real time.
      </p>

      <div className="mt-10 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold tracking-tight">Your classes</h2>
        <Link
          to="/classes"
          className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground"
        >
          Manage classes
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {classrooms.length === 0 ? (
        <div className="surface mt-4 p-8 text-center">
          <p className="font-display text-base font-semibold">No classes yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Create a class on the Classes page and share its join code with your students.
          </p>
        </div>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {classrooms.map((classroom) => (
            <Link key={classroom.id} to={`/classes/${classroom.id}`} className="surface lift block p-6">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                {classroom.year_group || 'Class'}
              </p>
              <h3 className="mt-2 font-display text-xl font-semibold tracking-tight">{classroom.name}</h3>
              <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" />
                  {counts[classroom.id] || 0} students
                </span>
                <span className="num rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground">
                  {classroom.join_code}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}