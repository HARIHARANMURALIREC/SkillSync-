import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';
import {
  computeXp,
  last28Days,
  levelFromXp,
  unlockedBadges,
  BadgeInfo,
  HeatDay,
  LevelInfo,
} from '../lib/gamification';
import { DashboardData, StreakData } from '../types';

const emptyStreak: StreakData = { dates: [], last: null, count: 0 };

interface ProgressContextType {
  xp: number;
  level: LevelInfo;
  heat: HeatDay[];
  badges: BadgeInfo[];
  streakDays: number;
  readiness: number;
  pathPct: number;
  summary: DashboardData | null;
  refreshProgress: () => Promise<void>;
}

const ProgressContext = createContext<ProgressContextType | null>(null);

function asStreak(raw?: StreakData | null): StreakData {
  if (!raw) return emptyStreak;
  return {
    dates: raw.dates || [],
    last: raw.last || null,
    count: raw.count || 0,
  };
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [summary, setSummary] = useState<DashboardData | null>(null);
  const [streak, setStreak] = useState<StreakData>(emptyStreak);

  useEffect(() => {
    if (!user) {
      setSummary(null);
      setStreak(emptyStreak);
      return;
    }
    let cancelled = false;
    Promise.all([
      api.get('/api/dashboard'),
      api.post('/api/streak/ping').catch(() => null),
    ])
      .then(([dash, ping]) => {
        if (cancelled) return;
        setSummary(dash.data);
        setStreak(asStreak(ping?.data || dash.data?.streak));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [user]);

  const stats = useMemo(() => {
    const progress = summary?.progress_summary;
    const readiness = summary?.career_readiness?.score || 0;
    const assessments = progress?.total_assessments || 0;
    const radar = summary?.skill_radar || [];
    const avgScore = radar.length
      ? radar.reduce((s, r) => s + (r.level || 0), 0) / radar.length
      : 0;
    const skillsAssessed = progress?.skills_assessed || 0;
    const pathPct = progress?.path_completion_pct || 0;
    const resourcesCompleted = progress?.resources_completed || 0;
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
      hasPath: pathPct > 0,
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
    setStreak(asStreak(ping?.data || dash.data?.streak));
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
