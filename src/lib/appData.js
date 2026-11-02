export const asArray = (res) => (Array.isArray(res) ? res : res?.items || []);

export const XP_PER_LEVEL = 250;
export const XP_PER_CORRECT = 10;
export const XP_HOMEWORK_BONUS = 50;

export const levelFromXp = (xp = 0) => Math.floor(xp / XP_PER_LEVEL) + 1;
export const xpIntoLevel = (xp = 0) => xp % XP_PER_LEVEL;

export const todayKey = () => new Date().toISOString().slice(0, 10);

const dayBefore = (isoDate) => {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
};

export const nextStreak = (profile) => {
  const today = todayKey();
  if (profile?.last_active_date === today) return profile.streak || 1;
  if (profile?.last_active_date === dayBefore(today)) return (profile.streak || 0) + 1;
  return 1;
};

export const countEnrollments = (enrollments = []) => {
  const counts = {};
  const activeNames = {};
  enrollments.forEach((item) => {
    if (item.status === 'invited') return;
    const key = String(item.student_name || '').trim().toLowerCase();
    activeNames[item.classroom_id] = activeNames[item.classroom_id] || new Set();
    activeNames[item.classroom_id].add(key);
    counts[item.classroom_id] = (counts[item.classroom_id] || 0) + 1;
  });
  enrollments.forEach((item) => {
    if (item.status !== 'invited') return;
    const key = String(item.student_name || '').trim().toLowerCase();
    if ((activeNames[item.classroom_id] || new Set()).has(key)) return;
    counts[item.classroom_id] = (counts[item.classroom_id] || 0) + 1;
  });
  return counts;
};

export const randomCode = (length = 6) => {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < length; i += 1) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
};

export const formatDue = (isoDate) => {
  if (!isoDate) return 'No deadline';
  const due = new Date(`${isoDate}T12:00:00`);
  const today = new Date();
  const days = Math.round((due - today) / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return due.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
};

export const accuracy = (correct = 0, answered = 0) =>
  answered > 0 ? Math.round((correct / answered) * 100) : 0;

export const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('') || '?';