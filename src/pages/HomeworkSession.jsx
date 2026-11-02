import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { asArray, accuracy, formatDue, todayKey, XP_HOMEWORK_BONUS } from '@/lib/appData';
import { addBonusXp, awardAnswer } from '@/lib/session';
import QuestionRunner from '@/components/QuestionRunner';

export default function HomeworkSession() {
  const { id } = useParams();
  const profileRef = useRef(null);
  const progressRef = useRef(null);
  const [state, setState] = useState({ loading: true });
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const me = await base44.auth.me();
      const [homework, progressRes, profiles] = await Promise.all([
        base44.entities.Homework.get(id),
        base44.entities.HomeworkProgress.filter({ homework_id: id, created_by_id: me.id }, { limit: 5 }),
        base44.entities.Profile.filter({ created_by_id: me.id }, { limit: 5 }),
      ]);
      progressRef.current = asArray(progressRes)[0] || null;
      profileRef.current = asArray(profiles)[0] || null;
      const answered = progressRef.current?.answered || 0;
      if (active) {
        setState({
          loading: false,
          homework,
          remaining: Math.max(0, (homework.question_count || 10) - answered),
          answered,
        });
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  const handleAnswer = async ({ correct, answered, correctCount }) => {
    profileRef.current = await awardAnswer(profileRef.current, correct);
    const homework = state.homework;
    const total = homework.question_count || 10;
    const complete = answered >= total;
    const patch = {
      answered,
      correct: correctCount,
      question_count: total,
      status: complete ? 'complete' : 'in_progress',
    };
    if (complete) patch.completed_date = todayKey();

    if (progressRef.current) {
      await base44.entities.HomeworkProgress.update(progressRef.current.id, patch);
      progressRef.current = { ...progressRef.current, ...patch };
    } else {
      const created = await base44.entities.HomeworkProgress.create({
        homework_id: homework.id,
        classroom_id: homework.classroom_id,
        student_name: profileRef.current?.display_name || '',
        ...patch,
      });
      progressRef.current = created;
    }

    if (complete) {
      profileRef.current = await addBonusXp(profileRef.current, XP_HOMEWORK_BONUS);
    }
  };

  if (state.loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-sm text-muted-foreground">Loading…</div>
    );
  }

  if (summary || state.remaining === 0) {
    const correct = summary?.correctCount ?? progressRef.current?.correct ?? 0;
    const answered = summary?.answered ?? progressRef.current?.answered ?? 0;
    return (
      <div className="mx-auto w-full max-w-xl px-5 py-16 sm:px-8">
        <div className="surface p-8 text-center sm:p-10">
          <CheckCircle2 className="mx-auto h-10 w-10 text-chart-2" />
          <h1 className="mt-5 font-display text-2xl font-semibold tracking-tight">Homework complete</h1>
          <p className="mt-2 text-sm text-muted-foreground">{state.homework.title}</p>
          <p className="num mt-6 font-display text-5xl font-semibold tracking-tight">
            {correct}
            <span className="text-muted-foreground">/{answered || state.homework.question_count}</span>
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {accuracy(correct, answered || state.homework.question_count)}% accuracy · your teacher can see this now.
          </p>
          <Link
            to="/"
            className="mt-8 inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 py-10 sm:px-8">
      <div className="mx-auto mb-6 w-full max-w-2xl">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
          {state.homework.classroom_name} · due {formatDue(state.homework.due_date)}
        </p>
        <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight">{state.homework.title}</h1>
      </div>
      <QuestionRunner
        topicId={state.homework.topic_id}
        count={state.remaining}
        onAnswer={handleAnswer}
        onFinish={setSummary}
        label={state.homework.topic_name}
      />
    </div>
  );
}