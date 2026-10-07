export interface User {
  id: string;
  email: string;
  full_name?: string;
  plan: 'free' | 'pro' | 'enterprise';
  is_recruiter: boolean;
  created_at: string;
}

export interface Resume {
  id: string;
  user_id?: string;
  title: string;
  file_name: string;
  file_size: number;
  file_type: string;
  raw_text?: string;
  parsed_sections?: {
    summary?: string;
    experience?: string;
    education?: string;
    skills?: string;
    projects?: string;
    certifications?: string;
    [key: string]: any;
  };
  formatting_meta?: {
    page_count?: number;
    has_tables?: boolean;
    has_images?: boolean;
    image_count?: number;
    multi_column_detected?: boolean;
    word_count?: number;
    character_count?: number;
    file_type?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface JobDescription {
  id: string;
  title: string;
  company: string;
  raw_text: string;
  created_at: string;
}

export interface AnalysisScore {
  category: string;
  score: number;
  max_score: number;
  status: string;
  explanation?: string;
}

export interface KeywordMatch {
  keyword: string;
  category: 'Critical Missing' | 'Recommended' | 'Already Found';
  status: 'found' | 'missing';
  relevance: 'high' | 'medium' | 'low';
  section_suggestion?: string;
}

export interface SkillGap {
  skill_name: string;
  match_percentage: number;
  priority: 'Must Have' | 'Good to Have' | 'Bonus';
  in_resume: boolean;
  in_job: boolean;
}

export interface ResumeIssue {
  severity: 'Passed' | 'Warning' | 'Critical';
  category: string;
  title: string;
  description: string;
  recommendation?: string;
}

export interface Recommendation {
  section: string;
  priority: 'High' | 'Medium' | 'Low';
  title: string;
  action_item: string;
}

export interface SectionAnalysisDetail {
  section_name: string;
  score: number;
  strengths: string[];
  issues: string[];
  recommendations: string[];
}

export interface Analysis {
  id: string;
  resume_id: string;
  job_id: string;
  resume_title?: string;
  job_title?: string;
  company_name?: string;
  overall_ats_score: number;
  job_match_score: number;
  keyword_match_score: number;
  quality_score: number;
  summary?: string;
  scores: AnalysisScore[];
  keywords: KeywordMatch[];
  skills: SkillGap[];
  issues: ResumeIssue[];
  recommendations: Recommendation[];
  sections_analysis?: SectionAnalysisDetail[];
  created_at: string;
}

export interface DashboardStats {
  total_analyses: number;
  average_ats_score: number;
  best_match_score: number;
  resumes_improved: number;
  score_history: Array<{
    id: string;
    date: string;
    ats_score: number;
    match_score: number;
    keyword_score: number;
  }>;
  top_missing_skills: Array<{
    skill: string;
    occurrences: number;
  }>;
  most_frequent_missing_keywords: Array<{
    keyword: string;
    count: number;
  }>;
  suggested_improvements: Array<{
    section: string;
    priority: string;
    title: string;
    action: string;
  }>;
  recent_analyses: Array<{
    id: string;
    resume_id: string;
    resume_name: string;
    job_title: string;
    company: string;
    ats_score: number;
    match_score: number;
    date: string;
  }>;
}

export interface BulletImprovement {
  original: string;
  improved: string;
  style: string;
  changes_made: string[];
  detected_weaknesses: string[];
}

export interface CoverLetter {
  id?: string;
  title: string;
  content: string;
  tone: string;
  length: string;
  created_at?: string;
}

export interface TailorChangeItem {
  category: 'Added' | 'Improved' | 'Removed' | 'Recommended' | string;
  item: string;
  description?: string;
}

export interface ATSForecast {
  current_score: number;
  expected_score: number;
  increase: number;
  reasoning: string[];
}

export interface ResumeTailorRequest {
  resume_id?: string;
  resume_text?: string;
  job_id?: string;
  job_title: string;
  company: string;
  job_description: string;
}

export interface ResumeTailorResponse {
  original_resume: string;
  tailored_resume: string;
  job_title: string;
  company: string;
  tailored_sections: Record<string, string>;
  change_log: TailorChangeItem[];
  ats_forecast: ATSForecast;
  new_resume_id?: string;
}

