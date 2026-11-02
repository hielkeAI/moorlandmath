import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Dices,
  Divide,
  Gauge,
  Hash,
  ListOrdered,
  Percent,
  Replace,
  Ruler,
  Scale,
  Sigma,
  Split,
  Square,
  Triangle,
} from 'lucide-react';
import { TOPICS } from '@/lib/mathsEngine';

const ICONS = {
  hash: Hash,
  divide: Divide,
  percent: Percent,
  sigma: Sigma,
  scale: Scale,
  replace: Replace,
  list: ListOrdered,
  triangle: Triangle,
  ruler: Ruler,
  square: Square,
  split: Split,
  gauge: Gauge,
  chart: BarChart3,
  dice: Dices,
};

export default function TopicPicker({ onSelect }) {
  const navigate = useNavigate();
  const strands = [...new Set(TOPICS.map((topic) => topic.strand))];

  const choose = (topic) => {
    if (onSelect) onSelect(topic);
    else navigate(`/practise?topic=${topic.id}`);
  };

  return (
    <div className="space-y-8">
      {strands.map((strand) => (
        <section key={strand}>
          <h3 className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">{strand}</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {TOPICS.filter((topic) => topic.strand === strand).map((topic) => {
              const Icon = ICONS[topic.icon] || Hash;
              return (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => choose(topic)}
                  className="surface lift group flex items-start gap-4 p-5 text-left"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="h-[18px] w-[18px]" />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-display text-base font-semibold tracking-tight">{topic.name}</span>
                    <span className="mt-0.5 block text-sm leading-snug text-muted-foreground">{topic.blurb}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}