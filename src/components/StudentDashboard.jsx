import { Link } from 'react-router-dom';
import { Flame } from 'lucide-react';
import HomeworkCard from '@/components/HomeworkCard';
import ProgressPanel from '@/components/ProgressPanel';
import { TOPICS } from '@/lib/mathsEngine';
import { accuracy, formatDue, levelFromXp, xpIntoLevel } from '@/lib/appData';

export default function StudentDashboard({ profile, homeworks = [], progress = [], peers = [] }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const xp = profile.xp || 0;
  const ranked = [...peers].sort((a, b) => (b.xp || 0) - (a.xp || 0)).slice(0, 5);

  return (
    <div className="mx-auto w-full max-w-6xl px-5 pb-24 pt-8 sm:px-8 sm:pt-12">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          {profile.streak > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/35 px-3 py-1 text-xs font-semibold ring-1 ring-inset ring-accent/60">
              <Flame className="h-3.5 w-3.5" />
              {profile.streak} day streak
            </span>
          )}
          <h1 className="mt-4 font-display text-4xl font-semibold tracking-[-0.03em] sm:text-[3.25rem] sm:leading-[1.05]">
            {greeting}, {(profile.display_name || 'there').split(' ')[0]}
          </h1>
          <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted-foreground">
            {profile.classroom_name
              ? `${profile.classroom_name} · ${profile.school_name || 'your school'}`
              : 'You are not in a class yet — ask your teacher for the class code.'}
          </p>
        </div>
        <Link
          to="/practise"
          className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-transform duration-200 hover:-translate-y-0.5"
        >
          Start practising
        </Link>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-3 lg:gap-10">
        <section className="lg:col-span-2">
          <h2 className="font-display text-lg font-semibold tracking-tight">Your homework</h2>
          {homeworks.length === 0 ? (
            <div className="surface mt-4 p-8 text-center">
              <p className="font-display text-base font-semibold">Nothing set right now</p>
              <p className="mt-1 text-sm text-muted-foreground">
                When your teacher sets homework it lands here straight away.
              </p>
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              {homeworks.map((homework) => {
                const record = progress.find((item) => item.homework_id === homework.id);
                return (
                  <HomeworkCard
                    key={homework.id}
                    title={homework.title}
                    subjectClass={homework.classroom_name}
                    due={formatDue(homework.due_date)}
                    kind={homework.kind}
                    answered={record?.answered || 0}
                    total={homework.question_count || 10}
                    to={`/homework/${homework.id}`}
                  />
                );
              })}
            </div>
          )}

          <h2 className="mt-10 font-display text-lg font-semibold tracking-tight">Practise a topic</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Questions adapt as you go — get them right and the difficulty climbs.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {TOPICS.map((topic) => (
              <Link
                key={topic.id}
                to={`/practise?topic=${topic.id}`}
                className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:border-primary/40 hover:bg-secondary"
              >
                {topic.name}
              </Link>
            ))}
          </div>
        </section>

        <aside>
          <h2 className="font-display text-lg font-semibold tracking-tight">Your progress</h2>
          <div className="mt-4">
            <ProgressPanel
              level={levelFromXp(xp)}
              xp={xpIntoLevel(xp)}
              streak={profile.streak || 0}
              answered={profile.total_answered || 0}
              accuracy={accuracy(profile.total_correct, profile.total_answered)}
            />
          </div>

          {ranked.length > 0 && (
            <div className="surface mt-4 p-2">
              <p className="px-4 pb-1 pt-3 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Class leaderboard
              </p>
              {ranked.map((peer, index) => (
                <div
                  key={peer.id}
                  className="flex items-center justify-between px-4 py-2.5 text-sm"
                >
                  <span className="flex items-center gap-2.5 truncate">
                    <span className="num w-4 text-xs text-muted-foreground">{index + 1}</span>
                    <span className={peer.id === profile.id ? 'font-semibold' : 'truncate'}>
                      {peer.display_name}
                    </span>
                  </span>
                  <span className="num text-xs text-muted-foreground">{peer.xp || 0} XP</span>
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}