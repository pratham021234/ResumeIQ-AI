import React from 'react';
import { SkillGap } from '@/types';

interface SkillBarProps {
  skill: SkillGap;
}

export const SkillBar: React.FC<SkillBarProps> = ({ skill }) => {
  const percentage = Math.max(0, Math.min(100, skill.match_percentage));

  const priorityStyles = {
    'Must Have': 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-900',
    'Good to Have': 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-900',
    'Bonus': 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700',
  };

  const getBarColor = (pct: number) => {
    if (pct >= 80) return 'bg-emerald-500';
    if (pct >= 40) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="py-2.5">
      <div className="flex items-center justify-between text-xs mb-1.5">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">
            {skill.skill_name}
          </span>
          <span
            className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${priorityStyles[skill.priority]}`}
          >
            {skill.priority}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-zinc-500 dark:text-zinc-400">
            {skill.in_resume ? 'Matched' : 'Gap'}
          </span>
          <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
            {Math.round(percentage)}%
          </span>
        </div>
      </div>

      <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${getBarColor(percentage)}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
