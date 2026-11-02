import { base44 } from '@/api/base44Client';
import { nextStreak, todayKey, XP_PER_CORRECT } from '@/lib/appData';

const ATTEMPT_XP = 2;

const notifyProfileChanged = () => {
  window.dispatchEvent(new Event('numera:profile'));
};

export async function awardAnswer(profile, correct) {
  if (!profile) return null;
  const patch = {
    xp: (profile.xp || 0) + (correct ? XP_PER_CORRECT : ATTEMPT_XP),
    total_answered: (profile.total_answered || 0) + 1,
    total_correct: (profile.total_correct || 0) + (correct ? 1 : 0),
    streak: nextStreak(profile),
    last_active_date: todayKey(),
  };
  await base44.entities.Profile.update(profile.id, patch);
  notifyProfileChanged();
  return { ...profile, ...patch };
}

export async function addBonusXp(profile, amount) {
  if (!profile) return null;
  const patch = { xp: (profile.xp || 0) + amount };
  await base44.entities.Profile.update(profile.id, patch);
  notifyProfileChanged();
  return { ...profile, ...patch };
}