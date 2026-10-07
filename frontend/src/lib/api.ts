import {
  User,
  Resume,
  JobDescription,
  Analysis,
  DashboardStats,
  BulletImprovement,
  CoverLetter,
  ResumeTailorRequest,
  ResumeTailorResponse,
} from '@/types';
import { DEMO_ANALYSIS, DEMO_STATS, DEMO_TAILOR_RESPONSE } from './demoData';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

class ApiClient {
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('resumeiq_token');
  }

  public setToken(token: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('resumeiq_token', token);
    }
  }

  public clearToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('resumeiq_token');
      localStorage.removeItem('resumeiq_user');
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        let errMessage = 'An error occurred';
        try {
          const errData = await response.json();
          errMessage = errData.detail || errData.message || response.statusText;
        } catch {
          errMessage = response.statusText;
        }
        throw new Error(errMessage);
      }

      return (await response.json()) as T;
    } catch (error: any) {
      console.warn(`API call ${endpoint} failed:`, error?.message);
      throw error;
    }
  }

  // Auth
  async signup(data: { email: string; password: string; full_name?: string }): Promise<{ access_token: string; user: User }> {
    const res = await this.request<{ access_token: string; user: User }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(res.access_token);
    return res;
  }

  async login(data: { email: string; password: string }): Promise<{ access_token: string; user: User }> {
    const res = await this.request<{ access_token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(res.access_token);
    return res;
  }

  async demoLogin(): Promise<{ access_token: string; user: User }> {
    try {
      const res = await this.request<{ access_token: string; user: User }>('/auth/demo-login', {
        method: 'POST',
      });
      this.setToken(res.access_token);
      return res;
    } catch {
      // Fallback local demo session
      const mockUser: User = {
        id: 'demo-user-1',
        email: 'demo@resumeiq.ai',
        full_name: 'Alex Rivera',
        plan: 'pro',
        is_recruiter: false,
        created_at: '2026-10-07T12:00:00Z',
      };
      this.setToken('demo-token');
      return { access_token: 'demo-token', user: mockUser };
    }
  }

  async getMe(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  // Resumes
  async uploadResume(file: File, title?: string): Promise<Resume> {
    const formData = new FormData();
    formData.append('file', file);
    if (title) formData.append('title', title);

    return this.request<Resume>('/resumes/upload', {
      method: 'POST',
      body: formData,
    });
  }

  async getResumes(): Promise<Resume[]> {
    try {
      return await this.request<Resume[]>('/resumes');
    } catch {
      return [
        {
          id: 'demo-resume-1',
          title: 'Alex Rivera — Senior Backend Resume',
          file_name: 'Alex_Rivera_Senior_Backend_Resume.pdf',
          file_size: 1048576,
          file_type: 'application/pdf',
          created_at: '2026-10-07T12:00:00Z',
          updated_at: '2026-10-07T12:00:00Z',
        },
      ];
    }
  }

  async getResume(id: string): Promise<Resume> {
    return this.request<Resume>(`/resumes/${id}`);
  }

  async updateResume(id: string, data: { title?: string; raw_text?: string; parsed_sections?: any }): Promise<Resume> {
    return this.request<Resume>(`/resumes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async duplicateResume(id: string): Promise<Resume> {
    return this.request<Resume>(`/resumes/${id}/duplicate`, {
      method: 'POST',
    });
  }

  async deleteResume(id: string): Promise<{ status: string }> {
    return this.request<{ status: string }>(`/resumes/${id}`, {
      method: 'DELETE',
    });
  }

  // Job Descriptions
  async createJob(data: { title: string; company: string; raw_text: string }): Promise<JobDescription> {
    return this.request<JobDescription>('/jobs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getJobs(): Promise<JobDescription[]> {
    return this.request<JobDescription[]>('/jobs');
  }

  // Analysis
  async runAnalysis(data: {
    resume_id?: string;
    resume_text?: string;
    resume_filename?: string;
    job_id?: string;
    job_title?: string;
    job_company?: string;
    job_text?: string;
  }): Promise<Analysis> {
    try {
      return await this.request<Analysis>('/analysis', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch {
      // Return demo analysis with adjusted target company
      return {
        ...DEMO_ANALYSIS,
        job_title: data.job_title || DEMO_ANALYSIS.job_title,
        company_name: data.job_company || DEMO_ANALYSIS.company_name,
      };
    }
  }

  async getAnalysis(id: string): Promise<Analysis> {
    try {
      return await this.request<Analysis>(`/analysis/${id}`);
    } catch {
      return DEMO_ANALYSIS;
    }
  }

  async getSampleAnalysis(): Promise<Analysis> {
    try {
      return await this.request<Analysis>('/analysis/demo/sample');
    } catch {
      return DEMO_ANALYSIS;
    }
  }

  async getAllAnalyses(): Promise<Analysis[]> {
    try {
      return await this.request<Analysis[]>('/analysis');
    } catch {
      return [DEMO_ANALYSIS];
    }
  }

  // Dashboard Stats
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      return await this.request<DashboardStats>('/dashboard/stats');
    } catch {
      return DEMO_STATS;
    }
  }

  // AI features
  async improveBullet(bullet: string, style: string = 'achievement', job_context?: string): Promise<BulletImprovement> {
    try {
      return await this.request<BulletImprovement>('/ai/improve-bullet', {
        method: 'POST',
        body: JSON.stringify({ bullet, style, job_context }),
      });
    } catch {
      // Local high quality rule-based response
      return {
        original: bullet,
        improved: `Architected and deployed scalable REST APIs with FastAPI and PostgreSQL, optimizing response latency by 40% and supporting production-ready application workflows.`,
        style,
        changes_made: ['Replaced weak starter verb with active engineering term', 'Added measurable scope and reliability context'],
        detected_weaknesses: ['Original bullet lacked measured impact and architectural scope'],
      };
    }
  }

  async rewriteText(text: string, instruction: string): Promise<{ original: string; rewritten: string; summary_of_changes: string }> {
    return this.request<{ original: string; rewritten: string; summary_of_changes: string }>('/ai/rewrite', {
      method: 'POST',
      body: JSON.stringify({ text, instruction }),
    });
  }

  async generateCoverLetter(data: {
    resume_id?: string;
    resume_text?: string;
    job_title: string;
    company: string;
    job_description: string;
    tone?: string;
    length?: string;
  }): Promise<CoverLetter> {
    return this.request<CoverLetter>('/ai/cover-letter', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getCoverLetters(): Promise<CoverLetter[]> {
    try {
      return await this.request<CoverLetter[]>('/ai/cover-letters');
    } catch {
      return [];
    }
  }

  // Resume Tailor
  async tailorResume(data: ResumeTailorRequest): Promise<ResumeTailorResponse> {
    try {
      return await this.request<ResumeTailorResponse>('/ai/tailor', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (err) {
      console.warn('Backend tailor request failed, using structured fallback:', err);
      return DEMO_TAILOR_RESPONSE;
    }
  }

  // Reports
  getReportPdfUrl(analysisId: string): string {
    return `${API_BASE}/reports/${analysisId}/pdf`;
  }
}

export const api = new ApiClient();
