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

export interface RecruiterJob {
  id: string;
  title: string;
  company: string;
  description: string;
  skills: string[];
  experience_level: string;
  status: string;
  candidate_count: number;
  average_ats_score: number;
  created_at: string;
}

export interface CandidateRankingItem {
  rank: number;
  analysis_id: string;
  resume_id: string;
  candidate_name: string;
  email: string;
  phone?: string;
  education?: string;
  role: string;
  job_title: string;
  company: string;
  ats_score: number;
  match_score: number;
  skill_match: number;
  experience_match: number;
  verified_skills: string[];
  missing_skills: string[];
  strengths: string[];
  concerns: string[];
  created_at: string;
}

export interface CandidateDetail {
  analysis_id: string;
  resume_id: string;
  candidate_name: string;
  email: string;
  phone?: string;
  education?: string;
  job_title: string;
  company: string;
  ats_score: number;
  match_score: number;
  skill_match: number;
  experience_match: number;
  raw_resume: string;
  parsed_sections: Record<string, string>;
  match_explanation: string;
  missing_skills: string[];
  verified_skills: string[];
  strengths: string[];
  concerns: string[];
  scores: Record<string, number>;
  created_at: string;
}

export interface RecruiterJobCreate {
  title: string;
  company: string;
  description: string;
  skills: string[];
  experience_level: string;
}

export interface BatchScreenResponse {
  job_id: string;
  job_title: string;
  company: string;
  total_screened: number;
  candidates: CandidateRankingItem[];
}

// Subscription Billing Types
export interface BillingPlan {
  id: string;
  name: string;
  price_inr: number;
  billing_interval: string;
  features: string[];
  max_analyses: number;
  allows_tailor: boolean;
  allows_cover_letter: boolean;
  allows_recruiter: boolean;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan: string;
  provider: string;
  provider_subscription_id?: string;
  status: 'active' | 'past_due' | 'canceled' | 'trialing' | 'expired' | string;
  current_period_start?: string;
  current_period_end?: string;
  cancel_at_period_end: boolean;
  trial_end?: string;
  created_at: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  provider: string;
  amount: number;
  currency: string;
  status: 'paid' | 'open' | 'void' | 'uncollectible' | string;
  plan_name: string;
  paid_at?: string;
  created_at: string;
}

export interface Payment {
  id: string;
  provider: string;
  provider_payment_id?: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'failed' | 'pending' | string;
  payment_method: string;
  failure_reason?: string;
  created_at: string;
}

export interface UsageTracker {
  month: string;
  analyses_used: number;
  max_analyses: number;
  resumes_uploaded: number;
  ai_generations_used: number;
  can_analyze: boolean;
}

export interface BillingOverview {
  current_plan: string;
  subscription?: Subscription;
  usage: UsageTracker;
  plans: BillingPlan[];
  invoices: Invoice[];
  payments: Payment[];
}

export interface CheckoutSessionResponse {
  provider: 'stripe' | 'razorpay';
  session_id?: string;
  order_id?: string;
  client_secret?: string;
  public_key?: string;
  key_id?: string;
  amount: number;
  currency: string;
  plan_id: string;
  plan_name: string;
}

// AI Hiring Copilot Types (Enterprise B2B)
export interface InterviewQuestion {
  category: string;
  difficulty?: string;
  question: string;
  rationale?: string;
  purpose?: string;
  what_to_listen_for?: string | string[];
}

export interface CopilotCandidate {
  rank: number;
  analysis_id: string;
  resume_id: string;
  job_id?: string;
  job_title?: string;
  candidate_name: string;
  email: string;
  phone?: string;
  role?: string;
  company?: string;
  ats_score: number;
  match_score: number;
  stage: 'Screening' | 'Shortlisted' | 'Interview' | 'Offer' | 'Rejected' | string;
  hiring_decision: 'Strong Yes' | 'Yes' | 'Leaning Yes' | 'Leaning No' | 'Strong No' | string;
  confidence_score: number;
  rating: number;
  verified_skills: string[];
  missing_skills: string[];
  executive_summary?: string;
  created_at?: string;
}

export interface CopilotEvaluation {
  id: string;
  analysis_id: string;
  job_id: string;
  job_title: string;
  company: string;
  candidate_name: string;
  email: string;
  phone?: string;
  education?: string;
  stage: string;
  hiring_decision: string;
  decision_reasoning: string;
  confidence_score: number;
  rating: number;
  ats_score: number;
  match_score: number;
  executive_summary: string;
  strengths: Array<{
    title: string;
    description: string;
    evidence: string;
    impact: string;
  }>;
  concerns: Array<{
    title: string;
    description: string;
    severity: string;
    mitigation: string;
  }>;
  skill_gap_analysis: {
    verified_skills?: Array<{
      skill: string;
      status: string;
      proficiency: string;
      match_confidence: number;
    }>;
    critical_gaps?: Array<{
      skill: string;
      priority: string;
      risk_level: string;
      reasoning: string;
    }>;
    secondary_gaps?: Array<{
      skill: string;
      priority: string;
      risk_level: string;
      reasoning: string;
    }>;
  };
  interview_questions: InterviewQuestion[];
  recruiter_notes: string;
  created_at?: string;
  updated_at?: string;
}

export interface CopilotJobSummary {
  id: string;
  title: string;
  company: string;
  skills: string[];
  experience_level: string;
  candidate_count: number;
  shortlisted_count: number;
  average_ats_score: number;
  created_at?: string;
}

export interface CopilotAnalytics {
  total_screened: number;
  shortlisted_count: number;
  interview_count: number;
  offer_count: number;
  rejected_count: number;
  avg_ats_score: number;
  avg_match_score: number;
  hiring_velocity_days: number;
  stage_funnel: Array<{
    stage: string;
    count: number;
    percentage: number;
  }>;
  score_distribution: Array<{
    range: string;
    count: number;
    percentage: number;
  }>;
  top_pool_skill_gaps: Array<{
    skill: string;
    missing_in_candidates: number;
    pool_percentage: number;
  }>;
  decision_breakdown: Record<string, number>;
}




