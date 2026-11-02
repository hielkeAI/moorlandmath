import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { asArray, countEnrollments } from '@/lib/appData';
import SchoolDetailsCard from '@/components/school/SchoolDetailsCard';
import SchoolClassList from '@/components/school/SchoolClassList';
import RosterImport from '@/components/school/RosterImport';

export default function SchoolSetup() {
  const [state, setState] = useState({ loading: true });
  const [me, setMe] = useState(null);

  const load = async () => {
    const user = await base44.auth.me();
    const profiles = asArray(await base44.entities.Profile.filter({ created_by_id: user.id }));
    const profile = profiles[0];

    if (!profile || profile.role !== 'teacher') {
      setState({ loading: false, profile });
      return;
    }

    const school = profile.school_id
      ? await base44.entities.School.get(profile.school_id).catch(() => null)
      : null;
    const classrooms = school
      ? asArray(await base44.entities.Classroom.filter({ school_id: school.id }, { limit: 100 }))
      : [];

    let counts = {};
    if (classrooms.length) {
      const enrollments = asArray(
        await base44.entities.Enrollment.filter(
          { classroom_id: { $in: classrooms.map((classroom) => classroom.id) } },
          { limit: 500 }
        )
      );
      counts = countEnrollments(enrollments);
    }

    setMe(user);
    setState({ loading: false, profile, school, classrooms, counts });
  };

  useEffect(() => {
    load();
  }, []);

  const saveSchool = async (patch) => {
    if (!state.school) return;
    await base44.entities.School.update(state.school.id, patch);
    await load();
  };

  if (state.loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-sm text-muted-foreground">Loading…</div>
    );
  }

  if (state.profile?.role !== 'teacher') {
    return (
      <div className="mx-auto max-w-xl px-5 py-20 sm:px-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight">School setup</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          This area is for heads of maths and SLT. Ask your teacher if your school isn't set up yet.
        </p>
        <Link to="/" className="mt-4 inline-flex text-sm font-semibold text-primary">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const { school, classrooms = [], counts = {} } = state;
  const canEdit = Boolean(school) && (school.created_by_id === me?.id || me?.role === 'admin');

  return (
    <div className="mx-auto w-full max-w-5xl px-5 pb-24 pt-10 sm:px-8">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {school ? school.name : state.profile.school_name || 'Your school'}
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">School setup</h1>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Configure your school, keep class lists in step with Arbor or SIMS, and give every class the same
        starting point.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          {school ? (
            <SchoolDetailsCard school={school} canEdit={canEdit} onSave={saveSchool} />
          ) : (
            <div className="surface p-6">
              <h2 className="font-display text-lg font-semibold tracking-tight">No school linked yet</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Your profile isn't attached to a school. Create one from the Classes page to get started.
              </p>
            </div>
          )}

          <SchoolClassList classrooms={classrooms} counts={counts} myId={me?.id} />
        </div>

        <div className="space-y-6">
          {classrooms.length > 0 ? (
            <RosterImport classrooms={classrooms} onImported={load} />
          ) : (
            <div className="surface p-6">
              <h2 className="font-display text-lg font-semibold tracking-tight">Import from Arbor or SIMS</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Create a class first, then you can drop a CSV class list exported from Arbor or SIMS into it.
              </p>
              <Link to="/classes" className="mt-3 inline-flex text-sm font-semibold text-primary">
                Go to classes
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}