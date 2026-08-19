import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';
import {
  computeXp,
  last28Days,
  levelFromXp,
  unlockedBadges,
} from '../lib/gamification';

const ProgressContext = createContext(null);

const emptyStreak = { dates: [], last: null, count: 0 };

export function ProgressProvider({ children }) {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [streak, setStreak] = useState(emptyStreak);

  useEffect(() => {
    if (!user) {
      setSummary(null);
      setStreak(emptyStreak);
      return undefined;
    }
    let cancelled = false;
    Promise.all([
      api.get('/api/dashboard'),
      api.post('/api/streak/ping').catch(() => null),
    ])
      .then(([dash, ping]) => {
        if (cancelled) return;
        setSummary(dash.data);
        const next = ping?.data || dash.data?.streak;
        if (next) setStreak({ dates: next.dates || [], last: next.last || null, count: next.count || 0 });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [user]);

  const stats = useMemo(() => {
    const progress = summary?.progress_summary || {};
    const readiness = summary?.career_readiness?.score || 0;
    const assessments = progress.total_assessments || 0;
    const radar = summary?.skill_radar || [];
    const avgScore = radar.length
      ? radar.reduce((s, r) => s + (r.level || 0), 0) / radar.length
      : 0;
    const skillsAssessed = progress.skills_assessed || 0;
    const pathPct = progress.path_completion_pct || 0;
    const resourcesCompleted = progress.resources_completed || 0;
    const streakDays = streak.count || 0;
    const xp = computeXp({
      assessments,
      avgScore,
      skillsAssessed,
      resourcesCompleted,
      readiness,
      streakDays,
    });
    const level = levelFromXp(xp);
    const heat = last28Days(streak.dates);
    const badges = unlockedBadges({
      assessments,
      skillsAssessed,
      maxScore: avgScore,
      hasPath: pathPct > 0 || (summary?.learning_path_preview || []).length > 0,
      pathPct,
      streakDays,
      readiness,
    });
    return { xp, level, heat, badges, streakDays, readiness, pathPct };
  }, [summary, streak]);

  const refreshProgress = async () => {
    const [dash, ping] = await Promise.all([
      api.get('/api/dashboard'),
      api.post('/api/streak/ping').catch(() => null),
    ]);
    setSummary(dash.data);
    const next = ping?.data || dash.data?.streak;
    if (next) setStreak({ dates: next.dates || [], last: next.last || null, count: next.count || 0 });
  };

  return (
    <ProgressContext.Provider value={{ ...stats, refreshProgress, summary }}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider');
  return ctx;
}
