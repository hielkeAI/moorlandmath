import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const YEAR_GROUPS = ['Year 7', 'Year 8', 'Year 9', 'Year 10', 'Year 11', 'Year 12', 'Year 13'];

const inputClass =
  'h-11 w-full rounded-xl border border-border bg-background px-4 text-[15px] outline-none transition-colors focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:opacity-60';
const labelClass = 'text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground';

export default function SchoolDetailsCard({ school, canEdit, onSave }) {
  const [name, setName] = useState(school.name || '');
  const [years, setYears] = useState(school.year_groups || []);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const toggleYear = (year) => {
    setYears(years.includes(year) ? years.filter((item) => item !== year) : [...years, year]);
  };

  const save = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await onSave({ name: name.trim(), year_groups: years });
    } catch (err) {
      setError(err.message || 'Could not save those details.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="surface p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-semibold tracking-tight">School details</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Set once by whoever runs maths — every class inherits it.
          </p>
        </div>
        <span className="num shrink-0 rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold tracking-[0.16em]">
          {school.code}
        </span>
      </div>

      <form onSubmit={save} className="mt-5 space-y-4">
        <div>
          <label className={labelClass} htmlFor="setup-school-name">
            School name
          </label>
          <input
            id="setup-school-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            disabled={!canEdit}
            className={cn(inputClass, 'mt-2')}
          />
        </div>

        <div>
          <p className={labelClass}>Year groups in school</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {YEAR_GROUPS.map((year) => (
              <button
                key={year}
                type="button"
                disabled={!canEdit}
                onClick={() => toggleYear(year)}
                className={cn(
                  'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors disabled:opacity-60',
                  years.includes(year)
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:text-foreground'
                )}
              >
                {year}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {canEdit ? (
          <button
            type="submit"
            disabled={busy}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Save details
          </button>
        ) : (
          <p className="text-xs text-muted-foreground">
            Only {school.created_by_name || 'the member of staff who set up the school'} can change these details.
          </p>
        )}
      </form>
    </div>
  );
}