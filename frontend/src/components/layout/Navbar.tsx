'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

export const Navbar: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-900 shadow-xs group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-5 h-5 text-indigo-400 dark:text-indigo-600" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              ResumeIQ <span className="text-indigo-600 dark:text-indigo-400">AI</span>
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-600 dark:text-zinc-400">
          <Link href="/#how-it-works" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            How It Works
          </Link>
          <Link href="/#features" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            Features
          </Link>
          <Link href="/#demo" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            ATS Demo
          </Link>
          <Link href="/pricing" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            Pricing
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 px-3 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/analyze"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-all shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-indigo-400 dark:text-indigo-600" />
            <span>Analyze Resume</span>
            <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
          </Link>
        </div>
      </div>
    </header>
  );
};
