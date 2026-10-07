import React from 'react';
import { CheckCircle2, AlertTriangle, AlertOctagon } from 'lucide-react';
import { ResumeIssue } from '@/types';

interface AuditFindingCardProps {
  issue: ResumeIssue;
}

export const AuditFindingCard: React.FC<AuditFindingCardProps> = ({ issue }) => {
  const isPassed = issue.severity === 'Passed';
  const isWarning = issue.severity === 'Warning';
  const isCritical = issue.severity === 'Critical';

  let config = {
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
    icon: CheckCircle2,
    iconColor: 'text-emerald-500',
    border: 'border-zinc-200 dark:border-zinc-800',
  };

  if (isWarning) {
    config = {
      badge: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800',
      icon: AlertTriangle,
      iconColor: 'text-amber-500',
      border: 'border-amber-200 dark:border-amber-900/60',
    };
  } else if (isCritical) {
    config = {
      badge: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800',
      icon: AlertOctagon,
      iconColor: 'text-rose-500',
      border: 'border-rose-200 dark:border-rose-900/60',
    };
  }

  const Icon = config.icon;

  return (
    <div className={`p-4 rounded-xl border bg-white dark:bg-zinc-900 transition-all hover:shadow-xs ${config.border}`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2.5">
          <div className={`p-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 shrink-0 ${config.iconColor}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {issue.title}
            </h4>
            <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
              Category: {issue.category}
            </span>
          </div>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${config.badge}`}>
          {issue.severity}
        </span>
      </div>

      <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 leading-relaxed">
        {issue.description}
      </p>

      {issue.recommendation && (
        <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800 flex items-start gap-1.5 text-xs text-zinc-700 dark:text-zinc-300">
          <span className="font-semibold text-zinc-900 dark:text-zinc-100 shrink-0">Action:</span>
          <span>{issue.recommendation}</span>
        </div>
      )}
    </div>
  );
};
