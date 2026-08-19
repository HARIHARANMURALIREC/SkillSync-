export interface SkillInfo {
  name: string;
  question_count: number;
  recommended: boolean;
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
}
