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
