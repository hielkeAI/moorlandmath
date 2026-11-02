import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { asArray, countEnrollments } from '@/lib/appData';
import StudentDashboard from '@/components/StudentDashboard';
import TeacherDashboard from '@/components/TeacherDashboard';

export default function Home() {
  const navigate = useNavigate();
  const [state, setState] = useState({ loading: true });

  useEffect(() => {
    let active = true;
    (async () => {
      const me = await base44.auth.me();
      const profiles = asArray(await base44.entities.Profile.filter({ created_by_id: me.id }));
      if (!profiles.length) {
        if (active) navigate('/onboarding', { replace: true });
        return;
      }
      const profile = profiles[0];

      if (profile.role === 'teacher') {
        const classrooms = asArray(await base44.entities.Classroom.filter({ created_by_id: me.id }));
        let counts = {};
        if (classrooms.length) {
          const enrollments = asArray(
            await base44.entities.Enrollment.filter(
              { classroom_id: { $in: classrooms.map((c) => c.id) } },
              { limit: 300 }
            )
          );
          counts = countEnrollments(enrollments);
        }
        if (active) setState({ loading: false, profile, classrooms, counts });
        return;
      }

      const [homeworkRes, progressRes, peersRes] = await Promise.all([
        profile.classroom_id
          ? base44.entities.Homework.filter({ classroom_id: profile.classroom_id }, { limit: 50 })
          : [],
        base44.entities.HomeworkProgress.filter({ created_by_id: me.id }, { limit: 100 }),
        profile.classroom_id
          ? base44.entities.Profile.filter({ classroom_id: profile.classroom_id }, { limit: 50 })
          : [],
      ]);

      const homeworks = asArray(homeworkRes).sort((a, b) =>
        String(a.due_date || '').localeCompare(String(b.due_date || ''))
      );

      if (active) {
        setState({
          loading: false,
          profile,
          homeworks,
          progress: asArray(progressRes),
          peers: asArray(peersRes),
        });
      }
    })();
    return () => {
      active = false;
    };
  }, [navigate]);

  if (state.loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-sm text-muted-foreground">
        Loading your maths…
      </div>
    );
  }

  if (state.profile.role === 'teacher') {
    return <TeacherDashboard profile={state.profile} classrooms={state.classrooms} counts={state.counts} />;
  }

  return (
    <StudentDashboard
      profile={state.profile}
      homeworks={state.homeworks}
      progress={state.progress}
      peers={state.peers}
    />
  );
}