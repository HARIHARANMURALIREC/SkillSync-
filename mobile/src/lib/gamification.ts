export const LEVELS = [
  { level: 1, title: 'Novice', xp: 0 },
  { level: 2, title: 'Apprentice', xp: 250 },
  { level: 3, title: 'Practitioner', xp: 600 },
  { level: 4, title: 'Specialist', xp: 1100 },
  { level: 5, title: 'Strategist', xp: 1800 },
  { level: 6, title: 'Expert', xp: 2700 },
  { level: 7, title: 'Architect', xp: 3900 },
  { level: 8, title: 'Luminary', xp: 5400 },
];

export const BADGES = [
  { id: 'first-step', name: 'First step', hint: 'Complete one assessment' },
  { id: 'range', name: 'Range', hint: 'Assess three skills' },
  { id: 'breadth', name: 'Breadth', hint: 'Assess five skills' },
  { id: 'sharp', name: 'Sharp', hint: 'Score 8 or higher' },
  { id: 'precise', name: 'Precise', hint: 'Score 9 or higher' },
  { id: 'pathfinder', name: 'Pathfinder', hint: 'Generate a learning path' },
  { id: 'steady', name: 'Steady', hint: 'Complete 40% of a path' },
  { id: 'finisher', name: 'Finisher', hint: 'Complete a full path' },
  { id: 'spark', name: 'Spark', hint: 'Start a 3-day streak' },
  { id: 'ember', name: 'Ember', hint: 'Hold a 7-day streak' },
  { id: 'ready', name: 'Ready', hint: 'Reach 50% career readiness' },
  { id: 'close', name: 'Close', hint: 'Reach 80% career readiness' },
];

export type HeatDay = { key: string; on: boolean };
export type LevelInfo = {
  level: number;
  title: string;
  xp: number;
  progress: number;
  next: { level: number; title: string; xp: number } | null;
};
export type BadgeInfo = { id: string; name: string; hint: string; unlocked: boolean };

export function localDateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function last28Days(dates: string[] = []): HeatDay[] {
  const set = new Set(dates || []);
  const days: HeatDay[] = [];
  for (let i = 27; i >= 0; i -= 1) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = localDateKey(d);
    days.push({ key, on: set.has(key) });
  }
  return days;
}

export function computeXp({
  assessments = 0,
  avgScore = 0,
  skillsAssessed = 0,
  resourcesCompleted = 0,
  readiness = 0,
  streakDays = 0,
}: {
  assessments?: number;
  avgScore?: number;
  skillsAssessed?: number;
  resourcesCompleted?: number;
  readiness?: number;
  streakDays?: number;
}) {
  return (
    assessments * 40 +
    avgScore * 12 +
    skillsAssessed * 25 +
    resourcesCompleted * 30 +
    readiness * 2 +
    streakDays * 15
  );
}

export function levelFromXp(xp: number): LevelInfo {
  let current = LEVELS[0];
  let next = LEVELS[1] || null;
  for (let i = 0; i < LEVELS.length; i += 1) {
    if (xp >= LEVELS[i].xp) {
      current = LEVELS[i];
      next = LEVELS[i + 1] || null;
    }
  }
  const span = next ? next.xp - current.xp : 1;
  const into = xp - current.xp;
  const progress = next ? Math.min(100, (into / span) * 100) : 100;
  return { ...current, next, progress, xp };
}

export function unlockedBadges({
  assessments = 0,
  skillsAssessed = 0,
  maxScore = 0,
  hasPath = false,
  pathPct = 0,
  streakDays = 0,
  readiness = 0,
}: {
  assessments?: number;
  skillsAssessed?: number;
  maxScore?: number;
  hasPath?: boolean;
  pathPct?: number;
  streakDays?: number;
  readiness?: number;
}): BadgeInfo[] {
  const ids = new Set<string>();
  if (assessments >= 1) ids.add('first-step');
  if (skillsAssessed >= 3) ids.add('range');
  if (skillsAssessed >= 5) ids.add('breadth');
  if (maxScore >= 8) ids.add('sharp');
  if (maxScore >= 9) ids.add('precise');
  if (hasPath) ids.add('pathfinder');
  if (pathPct >= 40) ids.add('steady');
  if (pathPct >= 100) ids.add('finisher');
  if (streakDays >= 3) ids.add('spark');
  if (streakDays >= 7) ids.add('ember');
  if (readiness >= 50) ids.add('ready');
  if (readiness >= 80) ids.add('close');
  return BADGES.map((badge) => ({ ...badge, unlocked: ids.has(badge.id) }));
}
