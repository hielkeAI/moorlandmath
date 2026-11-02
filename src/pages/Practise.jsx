import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, RotateCcw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { asArray, XP_PER_CORRECT } from '@/lib/appData';
import { awardAnswer } from '@/lib/session';
import { topicById } from '@/lib/mathsEngine';
import QuestionRunner from '@/components/QuestionRunner';
import TopicPicker from '@/components/TopicPicker';

const QUESTION_COUNT = 10;

export default function Practise() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const topicId = params.get('topic');
  const profileRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [round, setRound] = useState(0);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    (async () => {
      const me = await base44.auth.me();
      const profiles = asArray(await base44.entities.Profile.filter({ created_by_id: me.id }));
      profileRef.current = profiles[0] || null;
      setReady(true);
    })();
  }, []);

  const topic = topicId ? topicById(topicId) : null;

  const handleAnswer = async ({ correct }) => {
    profileRef.current = await awardAnswer(profileRef.current, correct);
  };

  if (!ready) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-sm text-muted-foreground">Loading…</div>
    );
  }

  if (!topic) {
    return (
      <div className="mx-auto w-full max-w-6xl px-5 pb-24 pt-10 sm:px-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight">Practise</h1>
        <p className="mt-2 max-w-lg text-sm text-muted-foreground">
          Pick a topic. You'll get ten questions and the difficulty adjusts to how you're doing.
        </p>
        <div className="mt-8">
          <TopicPicker />
        </div>
      </div>
    );
  }

  if (summary) {
    const earned = summary.correctCount * XP_PER_CORRECT;
    return (
      <div className="mx-auto w-full max-w-xl px-5 py-16 sm:px-8">
        <div className="surface p-8 text-center sm:p-10">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">{topic.name}</p>
          <p className="num mt-4 font-display text-6xl font-semibold tracking-tight">
            {summary.correctCount}
            <span className="text-muted-foreground">/{summary.answered}</span>
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            You earned <span className="num font-semibold text-foreground">{earned} XP</span> this round.
          </p>
          <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => {
                setSummary(null);
                setRound((value) => value + 1);
              }}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground"
            >
              <RotateCcw className="h-4 w-4" /> Go again
            </button>
            <Link
              to="/practise"
              className="inline-flex h-11 items-center justify-center rounded-full border border-border px-5 text-sm font-semibold"
            >
              Another topic
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 py-10 sm:px-8">
      <div className="mx-auto mb-6 flex w-full max-w-2xl items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/practise')}
          className="text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          ← All topics
        </button>
      </div>
      <QuestionRunner
        key={`${topic.id}-${round}`}
        topicId={topic.id}
        count={QUESTION_COUNT}
        onAnswer={handleAnswer}
        onFinish={setSummary}
        label={topic.name}
      />
      <div className="mx-auto mt-8 w-full max-w-2xl">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          Back to dashboard <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}