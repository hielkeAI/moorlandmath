import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Loader2, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { asArray, randomCode } from '@/lib/appData';
import { cn } from '@/lib/utils';

const YEAR_GROUPS = ['Year 7', 'Year 8', 'Year 9', 'Year 10', 'Year 11', 'Year 12', 'Year 13'];

const inputClass =
  'h-12 w-full rounded-xl border border-border bg-background px-4 text-[15px] outline-none transition-colors focus:border-primary focus:ring-4 focus:ring-primary/10';
const labelClass = 'text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground';

export default function Onboarding() {
  const navigate = useNavigate();
  const [role, setRole] = useState('student');
  const [classCode, setClassCode] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [schoolCode, setSchoolCode] = useState('');
  const [className, setClassName] = useState('');
  const [yearGroup, setYearGroup] = useState('Year 10');
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      const me = await base44.auth.me();
      const profiles = asArray(await base44.entities.Profile.filter({ created_by_id: me.id }));
      if (profiles.length) {
        navigate('/', { replace: true });
        return;
      }
      setChecking(false);
    })();
  }, [navigate]);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      const me = await base44.auth.me();
      const name = me.full_name || me.email.split('@')[0];

      if (role === 'student') {
        const code = classCode.trim().toUpperCase();
        if (!code) throw new Error('Enter the class code from your teacher.');
        const found = asArray(await base44.entities.Classroom.filter({ join_code: code }));
        if (!found.length) throw new Error('No class found with that code. Double-check it with your teacher.');
        const classroom = found[0];
        await base44.entities.Profile.create({
          display_name: name,
          role: 'student',
          school_id: classroom.school_id,
          school_name: classroom.school_name,
          classroom_id: classroom.id,
          classroom_name: classroom.name,
          xp: 0,
          total_answered: 0,
          total_correct: 0,
          streak: 0,
        });
        await base44.entities.Enrollment.create({
          classroom_id: classroom.id,
          classroom_name: classroom.name,
          school_id: classroom.school_id,
          student_name: name,
        });
      } else {
        const code = schoolCode.trim().toUpperCase();
        let school;
        if (code) {
          const found = asArray(await base44.entities.School.filter({ code }));
          if (!found.length) throw new Error('No school found with that code.');
          school = found[0];
        } else {
          if (!schoolName.trim()) throw new Error('Enter your school name.');
          school = await base44.entities.School.create({
            name: schoolName.trim(),
            code: randomCode(6),
            created_by_name: name,
          });
        }
        const classroom = await base44.entities.Classroom.create({
          name: className.trim() || 'My class',
          year_group: yearGroup,
          school_id: school.id,
          school_name: school.name,
          join_code: randomCode(6),
          teacher_name: name,
        });
        await base44.entities.Profile.create({
          display_name: name,
          role: 'teacher',
          school_id: school.id,
          school_name: school.name,
          classroom_id: classroom.id,
          classroom_name: classroom.name,
          xp: 0,
          total_answered: 0,
          total_correct: 0,
          streak: 0,
        });
      }

      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Something went wrong. Try again.');
    } finally {
      setBusy(false);
    }
  };

  if (checking) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-muted-foreground">
        Setting things up…
      </div>
    );
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-foreground p-12 text-background lg:flex">
        <div
          className="pointer-events-none absolute -right-24 top-1/3 h-72 w-72 rounded-full opacity-40 blur-3xl"
          style={{ background: 'hsl(var(--primary))' }}
        />
        <div
          className="pointer-events-none absolute -left-16 bottom-0 h-64 w-64 rounded-full opacity-30 blur-3xl"
          style={{ background: 'hsl(var(--accent))' }}
        />
        <div className="relative flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-background font-display text-sm font-bold text-foreground">
            N
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">Numera</span>
        </div>
        <div className="relative">
          <h2 className="max-w-sm font-display text-4xl font-semibold leading-[1.1] tracking-tight">
            One maths platform for the whole school.
          </h2>
          <ul className="mt-8 space-y-3 text-sm text-background/70">
            <li className="flex items-center gap-3">
              <Sparkles className="h-4 w-4" /> Questions that adapt to every student
            </li>
            <li className="flex items-center gap-3">
              <GraduationCap className="h-4 w-4" /> Homework set in seconds, tracked live
            </li>
          </ul>
        </div>
        <p className="relative text-xs text-background/50">Join your class in under a minute.</p>
      </div>

      <div className="flex items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-md">
          <h1 className="font-display text-3xl font-semibold tracking-tight">Join Numera</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Tell us who you are and we'll put you in the right place.
          </p>

          <div className="mt-7 grid grid-cols-2 gap-2 rounded-2xl bg-secondary p-1.5">
            {[
              { id: 'student', label: 'I am a student' },
              { id: 'teacher', label: 'I am a teacher' },
            ].map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setRole(option.id)}
                className={cn(
                  'h-10 rounded-xl text-sm font-semibold transition-colors',
                  role === option.id
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="mt-6 space-y-5">
            {role === 'student' ? (
              <div>
                <label className={labelClass} htmlFor="class-code">
                  Class code
                </label>
                <input
                  id="class-code"
                  value={classCode}
                  onChange={(event) => setClassCode(event.target.value.toUpperCase())}
                  placeholder="e.g. K4T9RB"
                  className={cn(inputClass, 'num mt-2 tracking-[0.2em]')}
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  Your teacher will give you this six-character code.
                </p>
              </div>
            ) : (
              <>
                <div>
                  <label className={labelClass} htmlFor="school-name">
                    School name
                  </label>
                  <input
                    id="school-name"
                    value={schoolName}
                    onChange={(event) => setSchoolName(event.target.value)}
                    placeholder="e.g. Kingsford Academy"
                    className={cn(inputClass, 'mt-2')}
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor="school-code">
                    Already have a school code? (optional)
                  </label>
                  <input
                    id="school-code"
                    value={schoolCode}
                    onChange={(event) => setSchoolCode(event.target.value.toUpperCase())}
                    placeholder="Leave blank to create a new school"
                    className={cn(inputClass, 'num mt-2 tracking-[0.2em]')}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass} htmlFor="class-name">
                      Class name
                    </label>
                    <input
                      id="class-name"
                      value={className}
                      onChange={(event) => setClassName(event.target.value)}
                      placeholder="10A Maths"
                      className={cn(inputClass, 'mt-2')}
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="year-group">
                      Year group
                    </label>
                    <select
                      id="year-group"
                      value={yearGroup}
                      onChange={(event) => setYearGroup(event.target.value)}
                      className={cn(inputClass, 'mt-2')}
                    >
                      {YEAR_GROUPS.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}

            <button
              type="submit"
              disabled={busy}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition-opacity disabled:opacity-60"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {busy ? 'Setting up…' : role === 'student' ? 'Join my class' : 'Create my class'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}