import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type ScoreTier = 'excellent' | 'strong' | 'good' | 'needs-improvement' | 'poor';

export function getScoreTier(score: number): ScoreTier {
  if (score >= 90) return 'excellent';
  if (score >= 80) return 'strong';
  if (score >= 70) return 'good';
  if (score >= 60) return 'needs-improvement';
  return 'poor';
}

export function getScoreLabel(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Strong';
  if (score >= 70) return 'Good';
  if (score >= 60) return 'Needs Improvement';
  return 'Poor';
}

export function getScoreColor(score: number): {
  stroke: string;
  text: string;
  bg: string;
  border: string;
  badge: string;
} {
  const tier = getScoreTier(score);
  switch (tier) {
    case 'excellent':
      return {
        stroke: '#10b981', // emerald-500
        text: 'text-emerald-500',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
        badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      };
    case 'strong':
      return {
        stroke: '#0ea5e9', // sky-500
        text: 'text-sky-500',
        bg: 'bg-sky-500/10',
        border: 'border-sky-500/20',
        badge: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
      };
    case 'good':
      return {
        stroke: '#6366f1', // indigo-500
        text: 'text-indigo-500',
        bg: 'bg-indigo-500/10',
        border: 'border-indigo-500/20',
        badge: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      };
    case 'needs-improvement':
      return {
        stroke: '#f59e0b', // amber-500
        text: 'text-amber-500',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20',
        badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      };
    case 'poor':
    default:
      return {
        stroke: '#ef4444', // red-500
        text: 'text-red-500',
        bg: 'bg-red-500/10',
        border: 'border-red-500/20',
        badge: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
      };
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function formatDate(dateString?: string): string {
  if (!dateString) return 'Oct 07, 2026';
  try {
    const datePart = dateString.split('T')[0];
    const parts = datePart.split('-');
    if (parts.length === 3) {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthIdx = parseInt(parts[1], 10) - 1;
      return `${months[monthIdx] || parts[1]} ${parts[2]}, ${parts[0]}`;
    }
  } catch {}
  return dateString.slice(0, 10);
}
