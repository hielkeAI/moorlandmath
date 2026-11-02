import { useMemo, useState } from 'react';
import { ArrowRight, Check, Lightbulb, X } from 'lucide-react';
import { checkAnswer, generateQuestion } from '@/lib/mathsEngine';
import { cn } from '@/lib/utils';

export default function QuestionRunner({ topicId, count, startTier = 2, onAnswer, onFinish, label }) {
  const [tier, setTier] = useState(startTier);
  const [question, setQuestion] = useState(() => generateQuestion(topicId, startTier));
  const [value, setValue] = useState('');
  const [result, setResult] = useState(null);
  const [answered, setAnswered] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [busy, setBusy] = useState(false);

  const progressPct = useMemo(() => Math.round((answered / count) * 100), [answered, count]);

  const submit = async (event) => {
    event.preventDefault();
    if (result || busy || !value.trim()) return;
    const isRight = checkAnswer(value, question);
    const nextAnswered = answered + 1;
    const nextCorrect = correctCount + (isRight ? 1 : 0);
    setResult(isRight ? 'correct' : 'wrong');
    setAnswered(nextAnswered);
    setCorrectCount(nextCorrect);
    if (onAnswer) {
      setBusy(true);
      await onAnswer({ correct: isRight, question, answered: nextAnswered, correctCount: nextCorrect });
      setBusy(false);
    }
  };

  const advance = () => {
    if (answered >= count) {
      onFinish?.({ answered, correctCount });
      return;
    }
    const nextTier = result === 'correct' ? Math.min(5, tier + 1) : Math.max(1, tier - 1);
    setTier(nextTier);
    setQuestion(generateQuestion(topicId, nextTier));
    setValue('');
    setResult(null);
  };

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{label || question.topic_name}</span>
        <span className="num">
          Question {Math.min(answered + (result ? 0 : 1), count)} of {count}
        </span>
      </div>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div className="surface mt-6 p-6 sm:p-9">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
          {question.topic_name} · level {question.tier}
        </p>
        <h2 className="mt-3 font-display text-[26px] font-semibold leading-snug tracking-tight sm:text-3xl">
          {question.prompt}
        </h2>

        <form onSubmit={submit} className="mt-7">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              autoFocus
              value={value}
              onChange={(event) => setValue(event.target.value)}
              disabled={Boolean(result) || busy}
              placeholder="Your answer"
              aria-label="Your answer"
              className={cn(
                'num h-14 flex-1 rounded-2xl border bg-background px-5 text-xl outline-none transition-colors',
                'border-border focus:border-primary focus:ring-4 focus:ring-primary/10',
                result === 'correct' && 'border-chart-2/60 bg-chart-2/5',
                result === 'wrong' && 'border-destructive/50 bg-destructive/5'
              )}
            />
            <button
              type="submit"
              disabled={Boolean(result) || busy || !value.trim()}
              className="h-14 rounded-2xl bg-primary px-7 text-sm font-semibold text-primary-foreground transition-opacity disabled:opacity-40"
            >
              Check answer
            </button>
          </div>
        </form>

        {result && (
          <div
            className={cn(
              'mt-6 rounded-2xl border p-5',
              result === 'correct' ? 'border-chart-2/40 bg-chart-2/[0.07]' : 'border-destructive/30 bg-destructive/[0.05]'
            )}
          >
            <p className="flex items-center gap-2 font-display text-base font-semibold">
              {result === 'correct' ? (
                <>
                  <Check className="h-4 w-4" /> Correct
                </>
              ) : (
                <>
                  <X className="h-4 w-4" /> Not quite — the answer is {question.answer}
                </>
              )}
            </p>
            <p className="mt-2 flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0" />
              {question.worked}
            </p>
            <button
              type="button"
              onClick={advance}
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary"
            >
              {answered >= count ? 'Finish' : 'Next question'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}