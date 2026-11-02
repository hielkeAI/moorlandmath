import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { accuracy, formatDue } from '@/lib/appData';
import { TOPICS } from '@/lib/mathsEngine';
import DiscordChannelCard from '@/components/DiscordChannelCard';

const inputClass =
  'h-11 w-full rounded-xl border border-border bg-background px-4 text-[15px] outline-none transition-colors focus:border-primary focus:ring-4 focus:ring-primary/10';

const inSevenDays = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);

export default function TeacherClass() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    topic_id: TOPICS[0].id,
    kind: 'homework',
    question_count: 10,
    due_date: inSevenDays,
  });

  const load = async () => {
    try {
      const response = await base44.functions.invoke('getClassProgress', { classroom_id: id });
      setData(response.data);
    } catch (err) {
      setError(err?.response?.data?.error || 'You do not have access to this class.');
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const assign = async (event) => {
    event.preventDefault();
    setBusy(true);
    setFormError('');
    try {
      const topic = TOPICS.find((item) => item.id === form.topic_id);
      await base44.entities.Homework.create({
        classroom_id: id,
        classroom_name: data.classroom.name,
        school_id: data.classroom.school_id,
        title: `${topic.name} ${form.kind}`,
        kind: form.kind,
        topic_id: topic.id,
        topic_name: topic.name,
        question_count: Number(form.question_count),
        due_date: form.due_date,
        teacher_name: data.classroom.teacher_name || '',
      });
      base44.functions
        .invoke('notifyDiscord', {
          classroom_id: id,
          title: `New ${form.kind}: ${topic.name}`,
          detail: `${Number(form.question_count)} questions · due ${formatDue(form.due_date)}`,
        })
        .catch(() => {});
      await load();
    } catch (err) {
      setFormError(err.message || 'Could not set that homework.');
    } finally {
      setBusy(false);
    }
  };

  if (error) {
    return (
      <div className="mx-auto max-w-xl px-5 py-20 sm:px-8">
        <p className="text-sm text-muted-foreground">{error}</p>
        <Link to="/classes" className="mt-4 inline-flex text-sm font-semibold text-primary">
          Back to classes
        </Link>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-sm text-muted-foreground">Loading…</div>
    );
  }

  const { classroom, students, homeworks, progress } = data;

  return (
    <div className="mx-auto w-full max-w-4xl px-5 pb-24 pt-8 sm:px-8">
      <Link to="/classes" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> All classes
      </Link>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            {classroom.year_group || classroom.school_name}
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">{classroom.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{students.length} students joined</p>
        </div>
        <div className="rounded-2xl bg-secondary px-4 py-3 text-center">
          <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Join code</p>
          <p className="num mt-1 font-display text-lg font-semibold tracking-[0.18em]">{classroom.join_code}</p>
        </div>
      </div>

      <form onSubmit={assign} className="surface mt-8 grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-[1.2fr_0.8fr_0.7fr_0.8fr_auto]">
        <select
          value={form.topic_id}
          onChange={(event) => setForm({ ...form, topic_id: event.target.value })}
          className={inputClass}
          aria-label="Topic"
        >
          {TOPICS.map((topic) => (
            <option key={topic.id} value={topic.id}>
              {topic.name}
            </option>
          ))}
        </select>
        <select
          value={form.kind}
          onChange={(event) => setForm({ ...form, kind: event.target.value })}
          className={inputClass}
          aria-label="Homework or assessment"
        >
          <option value="homework">Homework</option>
          <option value="assessment">Assessment</option>
        </select>
        <select
          value={form.question_count}
          onChange={(event) => setForm({ ...form, question_count: event.target.value })}
          className={inputClass}
          aria-label="Number of questions"
        >
          {[5, 10, 15, 20].map((count) => (
            <option key={count} value={count}>
              {count} questions
            </option>
          ))}
        </select>
        <input
          type="date"
          value={form.due_date}
          onChange={(event) => setForm({ ...form, due_date: event.target.value })}
          className={inputClass}
          aria-label="Due date"
        />
        <button
          type="submit"
          disabled={busy}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          Set work
        </button>
      </form>
      {formError && <p className="mt-3 text-sm text-destructive">{formError}</p>}

      <div className="mt-6">
        <DiscordChannelCard classroomId={id} classroomName={classroom.name} />
      </div>

      <div className="mt-8 space-y-4">
        <h2 className="font-display text-lg font-semibold tracking-tight">Homework &amp; assessments</h2>
        {homeworks.length === 0 && (
          <p className="text-sm text-muted-foreground">Nothing set yet — use the form above to assign the first set.</p>
        )}
        {[...homeworks]
          .sort((a, b) => String(b.due_date || '').localeCompare(String(a.due_date || '')))
          .map((homework) => {
            const rows = students.map((student) => {
              const record = progress.find(
                (item) => item.homework_id === homework.id && item.student_id === student.id
              );
              return { ...student, answered: record?.answered || 0, correct: record?.correct || 0 };
            });
            const completed = rows.filter(
              (row) => !row.invited && row.answered >= homework.question_count
            ).length;
            return (
              <div key={homework.id} className="surface overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-5 py-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-display text-base font-semibold tracking-tight">{homework.topic_name}</p>
                      {homework.kind === 'assessment' && (
                        <span className="rounded-full bg-accent/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]">
                          Assessment
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      Due {formatDue(homework.due_date)} · {homework.question_count} questions
                    </p>
                  </div>
                  <span className="num rounded-full bg-secondary px-3 py-1 text-xs font-semibold">
                    {students.length > 0 ? `${completed}/${students.length} finished` : 'No students yet'}
                  </span>
                </div>
                <div className="divide-y divide-border">
                  {rows.length === 0 && (
                    <p className="px-5 py-4 text-sm text-muted-foreground">
                      No students yet — share the join code {classroom.join_code}.
                    </p>
                  )}
                  {rows.map((row) => {
                    const pct = Math.min(100, Math.round((row.answered / homework.question_count) * 100));
                    return (
                      <div key={`${homework.id}-${row.id}`} className="flex items-center gap-4 px-5 py-3">
                        <span className="flex w-40 shrink-0 items-center gap-2 text-sm">
                          <span className="truncate">{row.name}</span>
                          {row.invited && (
                            <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
                              Not joined
                            </span>
                          )}
                        </span>
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="num w-14 shrink-0 text-right text-xs text-muted-foreground">
                          {row.answered}/{homework.question_count}
                        </span>
                        <span className="num w-12 shrink-0 text-right text-xs font-medium">
                          {row.answered ? `${accuracy(row.correct, row.answered)}%` : '—'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}