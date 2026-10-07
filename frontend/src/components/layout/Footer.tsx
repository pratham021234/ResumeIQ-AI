import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Check } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-900">
                <ShieldCheck className="w-4 h-4 text-indigo-400 dark:text-indigo-600" />
              </div>
              <span className="text-base font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
                ResumeIQ AI
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              AI-powered ATS Resume Analyzer and Optimization SaaS engineered to help candidates beat applicant tracking algorithms and land interviews.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>ATS Scoring Engine Online</span>
            </div>
          </div>

          {/* Product links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 mb-4">
              Product
            </h4>
            <ul className="space-y-2.5 text-xs text-zinc-600 dark:text-zinc-400">
              <li><Link href="/analyze" className="hover:text-zinc-900 dark:hover:text-zinc-100">Analyze Resume</Link></li>
              <li><Link href="/editor" className="hover:text-zinc-900 dark:hover:text-zinc-100">AI Bullet Improver</Link></li>
              <li><Link href="/cover-letter" className="hover:text-zinc-900 dark:hover:text-zinc-100">Cover Letter Generator</Link></li>
              <li><Link href="/pricing" className="hover:text-zinc-900 dark:hover:text-zinc-100">Pricing & Plans</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 mb-4">
              ATS Resources
            </h4>
            <ul className="space-y-2.5 text-xs text-zinc-600 dark:text-zinc-400">
              <li><Link href="/#how-it-works" className="hover:text-zinc-900 dark:hover:text-zinc-100">ATS Parsing Guide</Link></li>
              <li><Link href="/#faq" className="hover:text-zinc-900 dark:hover:text-zinc-100">Frequently Asked Questions</Link></li>
              <li><Link href="/resumes" className="hover:text-zinc-900 dark:hover:text-zinc-100">Resume Formats</Link></li>
              <li><Link href="/recruiter" className="hover:text-zinc-900 dark:hover:text-zinc-100">Recruiter Portal</Link></li>
            </ul>
          </div>

          {/* Compliance */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 mb-4">
              Security & Privacy
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed mb-3">
              We never share your resume data or train public models on your personal information.
            </p>
            <div className="flex flex-col gap-2 text-xs text-zinc-600 dark:text-zinc-400">
              <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> AES-256 Encryption</div>
              <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> Deterministic Scoring</div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 gap-4">
          <p>© 2026 ResumeIQ AI Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/pricing" className="hover:underline">Terms</Link>
            <Link href="/pricing" className="hover:underline">Privacy</Link>
            <Link href="/recruiter" className="hover:underline">Recruiter Beta</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
