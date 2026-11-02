import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Copy, Users } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { asArray, randomCode } from '@/lib/appData';

const inputClass =
  'h-11 w-full rounded-xl border border-border bg-background px-4 text-[15px] outline-none transition-colors focus:border-primary focus:ring-4 focus:ring-primary/10';

export default function Classes() {
  const [state, setState] = useState({ loading: true });
  const [name, setName] = useState('');
  const [yearGroup, setYearGroup] = useState('Year 10');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const me = await base44.auth.me();
    const profiles = asArray(await base44.entities.Profile.filter({ created_by_id: me.id }));
    const profile = profiles[0];
    if (profile?.role === 'teacher') {
      const classrooms = asArray(await base44.entities.Classroom.filter({ created_by_id: me.id }));
      setState({ loading: false, profile, classrooms });
      return;
    }
    const peers = profile?.classroom_id
      ? asArray(await base44.entities.Profile.filter({ classroom_id: profile.classroom_id }, { limit: 50 }))
      : [];
    const classroom = profile?.classroom_id
      ? await base44.entities.Classroom.get(profile.classroom_id).catch(() => null)
      : null;
    setState({ loading: false, profile, peers: peers.sort((a, b) => (b.xp || 0) - (a.xp || 0)), classroom });
  };

  useEffect(() => {
    load();
  }, []);

  const createClass = async (event) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      const me = await base44.auth.me();
      const profile = state.profile;
      await base44.entities.Classroom.create({
        name: name.trim() || 'My class',
        year_group: yearGroup,
        school_id: profile.school_id,
        school_name: profile.school_name,
        join_code: randomCode(6),
        teacher_name: profile.display_name,
      });
      setName('');
      await load();
    } catch (err) {
      setError(err.message || 'Could not create that class.');
    } finally {
      setBusy(false);
    }
  };

  const joinClass = async (event) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      const found = asArray(await base44.entities.Classroom.filter({ join_code: code.trim().toUpperCase() }));
      if (!found.length) throw new Error('No class found with that code.');
      const classroom = found[0];
      await base44.entities.Profile.update(state.profile.id, {
        classroom_id: classroom.id,
        classroom_name: classroom.name,
        school_id: classroom.school_id,
        school_name: classroom.school_name,
      });
      await base44.entities.Enrollment.create({
        classroom_id: classroom.id,
        classroom_name: classroom.name,
        school_id: classroom.school_id,
        student_name: state.profile.display_name,
      });
      setCode('');
      await load();
    } catch (err) {
      setError(err.message || 'Could not join that class.');
    } finally {
      setBusy(false);
    }
  };

  if (state.loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-sm text-muted-foreground">Loading…</div>
    );
  }

  if (state.profile?.role === 'teacher') {
    return (
      <div className="mx-auto w-full max-w-4xl px-5 pb-24 pt-10 sm:px-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight">Classes</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {state.profile.school_name} · share a join code and students are in within a minute.
        </p>

        <form onSubmit={createClass} className="surface mt-8 grid gap-3 p-5 sm:grid-cols-[1fr_auto_auto]">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Class name, e.g. 10A Maths"
            className={inputClass}
          />
          <select value={yearGroup} onChange={(event) => setYearGroup(event.target.value)} className={inputClass}>
            {['Year 7', 'Year 8', 'Year 9', 'Year 10', 'Year 11', 'Year 12', 'Year 13'].map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={busy}
            className="h-11 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            Create class
          </button>
        </form>

        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

        <div className="mt-6 space-y-3">
          {state.classrooms.map((classroom) => (
            <Link
              key={classroom.id}
              to={`/classes/${classroom.id}`}
              className="surface lift flex items-center justify-between p-5"
            >
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  {classroom.year_group}
                </p>
                <p className="mt-1 font-display text-lg font-semibold tracking-tight">{classroom.name}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="num rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold tracking-[0.16em]">
                  {classroom.join_code}
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Link>
          ))}
          {state.classrooms.length === 0 && (
            <p className="text-sm text-muted-foreground">No classes yet — create your first one above.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-5 pb-24 pt-10 sm:px-8">
      <h1 className="font-display text-3xl font-semibold tracking-tight">Your class</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {state.profile?.classroom_name || 'You have not joined a class yet.'}
      </p>

      {state.classroom && (
        <div className="surface mt-6 flex items-center justify-between p-5">
          <div className="flex items-center gap-3">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Share this code to let classmates join</span>
          </div>
          <span className="num rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold tracking-[0.16em]">
            {state.classroom.join_code}
          </span>
        </div>
      )}

      <form onSubmit={joinClass} className="surface mt-6 grid gap-3 p-5 sm:grid-cols-[1fr_auto]">
        <input
          value={code}
          onChange={(event) => setCode(event.target.value.toUpperCase())}
          placeholder="Join a class with a code"
          className={inputClass}
        />
        <button
          type="submit"
          disabled={busy}
          className="h-11 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          Join class
        </button>
      </form>
      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

      {state.peers?.length > 0 && (
        <div className="surface mt-6 divide-y divide-border p-2">
          <p className="px-4 pb-1 pt-3 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Class leaderboard
          </p>
          {state.peers.map((peer, index) => (
            <div key={peer.id} className="flex items-center justify-between px-4 py-3 text-sm">
              <span className="flex items-center gap-3">
                <span className="num w-4 text-xs text-muted-foreground">{index + 1}</span>
                {peer.display_name}
              </span>
              <span className="num text-xs text-muted-foreground">{peer.xp || 0} XP</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}