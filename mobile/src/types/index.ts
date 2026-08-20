export interface SkillInfo {
  name: string;
  question_count: number;
  recommended: boolean;
  freshness?: string | null;
  days_stale?: number;
}

export interface AssessmentHistoryEntry {
  skill_name: string;
  score: number;
  level: string;
  created_at: string;
}

export interface LearningResource {
  title: string;
  type: string;
  url?: string;
  estimated_hours: number;
}

export interface WeeklyPath {
  week_number: number;
  skill_name: string;
  resources: LearningResource[];
  estimated_hours: number;
  status: string;
  is_revised?: boolean;
  completed_resources?: number[];
}

export interface LearningPathData {
  total_weeks: number;
  weekly_paths: WeeklyPath[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface StreakData {
  count: number;
  last?: string | null;
  dates: string[];
}

export interface SkillRadarPoint {
  skill_name: string;
  level: number;
}

export interface DashboardData {
  user: {
    email: string;
    full_name?: string;
    career_goal?: string;
  };
  progress_summary: {
    total_assessments: number;
    skills_assessed: number;
    path_completion_pct?: number;
    resources_completed?: number;
    total_resources?: number;
    gap_summary?: {
      high_priority_gaps?: number;
    };
  };
  skill_radar?: SkillRadarPoint[];
  skill_gaps: Array<{
    skill_name: string;
    current_level: number;
    target_level: number;
    gap: number;
    priority: string;
    explanation?: string[];
  }>;
  career_readiness?: {
    score: number;
    completed_skills: number;
    total_skills: number;
  };
  streak?: StreakData;
  career_fork?: {
    current_role?: string | null;
    current_score: number;
    best_adjacent?: string | null;
    best_score: number;
    weeks_saved: number;
    blocking_skills: string[];
    message: string;
  };
  freshness?: Array<{
    skill_name: string;
    last_touch?: string | null;
    status: string;
    days_stale: number;
  }>;
  weekly_plan?: WeeklyPlanData | null;
}

export interface WeeklyPlanItem {
  skill: string;
  hours: number;
  action: string;
}

export interface WeeklyPlanData {
  week_start: string;
  focus: string;
  plan: WeeklyPlanItem[];
  check_in: string;
  next_step: string;
  generated_at?: string | null;
}

export interface ReadinessReportSnapshot {
  display_name: string;
  career_goal?: string | null;
  readiness_score: number;
  completed_skills: number;
  total_skills: number;
  top_gaps: Array<{
    skill_name: string;
    current_level: number;
    target_level: number;
    priority?: string;
  }>;
  top_skills: Array<{
    skill_name: string;
    score: number;
    level: string;
  }>;
  path_completion_pct: number;
  resources_completed: number;
  total_resources: number;
  streak_days: number;
  freshness_summary: { fresh: number; aging: number; stale: number };
  teachback_passed: number;
  generated_at: string;
  fork_message?: string | null;
}

export interface ReadinessReportResponse {
  share_token: string;
  share_path: string;
  snapshot: ReadinessReportSnapshot;
  created_at: string;
}
