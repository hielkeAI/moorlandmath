import { useState } from 'react';
import { CheckCircle2, FileUp, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { asArray } from '@/lib/appData';
import { parseRoster } from '@/lib/csv';

const inputClass =
  'h-11 w-full rounded-xl border border-border bg-background px-4 text-[15px] outline-none transition-colors focus:border-primary focus:ring-4 focus:ring-primary/10';

export default function RosterImport({ classrooms, onImported }) {
  const [classroomId, setClassroomId] = useState(classrooms[0]?.id || '');
  const [parsed, setParsed] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState('');

  const pickFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setError('');
    setDone('');
    const { students, skipped } = parseRoster(await file.text());
    if (!students.length) {
      setParsed(null);
      setError('No student names found in that file. Export the class list from Arbor or SIMS as CSV.');
      return;
    }
    setParsed({ students, skipped, fileName: file.name });
    event.target.value = '';
  };

  const runImport = async () => {
    const classroom = classrooms.find((item) => item.id === classroomId);
    if (!classroom || !parsed) return;
    setBusy(true);
    setError('');
    try {
      const existing = asArray(
        await base44.entities.Enrollment.filter({ classroom_id: classroom.id }, { limit: 300 })
      );
      const seen = new Set(existing.map((item) => String(item.student_name || '').trim().toLowerCase()));
      const fresh = parsed.students.filter((student) => !seen.has(student.name.toLowerCase()));

      if (!fresh.length) {
        setDone(`Everyone in ${parsed.fileName} is already in ${classroom.name}.`);
        setParsed(null);
        return;
      }

      await base44.entities.Enrollment.bulkCreate(
        fresh.map((student) => ({
          classroom_id: classroom.id,
          classroom_name: classroom.name,
          school_id: classroom.school_id,
          student_name: student.name,
          email: student.email,
          status: 'invited',
        }))
      );

      setDone(`Added ${fresh.length} ${fresh.length === 1 ? 'student' : 'students'} to ${classroom.name}.`);
      setParsed(null);
      onImported();
    } catch (err) {
      setError(err.message || 'That import did not go through.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="surface p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <FileUp className="h-4 w-4 text-primary" />
        <h2 className="font-display text-lg font-semibold tracking-tight">Import from Arbor or SIMS</h2>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Export a class list as CSV from Arbor or SIMS, then drop it here. Students appear on the class list
        straight away and link up when they join with the class code.
      </p>

      <div className="mt-5 space-y-3">
        <select
          value={classroomId}
          onChange={(event) => setClassroomId(event.target.value)}
          className={inputClass}
          aria-label="Class to import into"
        >
          {classrooms.map((classroom) => (
            <option key={classroom.id} value={classroom.id}>
              {classroom.name} · {classroom.year_group}
            </option>
          ))}
        </select>

        <label className="flex h-11 cursor-pointer items-center justify-center rounded-xl border border-dashed border-border text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground">
          <input type="file" accept=".csv,text/csv" onChange={pickFile} className="hidden" />
          Choose CSV file
        </label>
      </div>

      {parsed && (
        <div className="mt-4 rounded-2xl bg-secondary/60 p-4">
          <p className="text-sm font-medium">
            {parsed.students.length} {parsed.students.length === 1 ? 'student' : 'students'} found in{' '}
            <span className="text-muted-foreground">{parsed.fileName}</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {parsed.students
              .slice(0, 6)
              .map((student) => student.name)
              .join(', ')}
            {parsed.students.length > 6 ? ` and ${parsed.students.length - 6} more` : ''}
            {parsed.skipped ? ` · ${parsed.skipped} rows skipped` : ''}
          </p>
          <button
            type="button"
            onClick={runImport}
            disabled={busy || !classroomId}
            className="mt-3 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Import students
          </button>
        </div>
      )}

      {done && (
        <p className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-primary">
          <CheckCircle2 className="h-4 w-4" /> {done}
        </p>
      )}
      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

      <p className="mt-4 border-t border-border pt-3 text-xs text-muted-foreground">
        Live two-way sync needs the Arbor or SIMS API access your school's data manager holds. Until that is
        set up, the CSV route gets your class lists in.
      </p>
    </div>
  );
}