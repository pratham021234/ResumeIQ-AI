import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, ArrowUpRight } from 'lucide-react';
import { KeywordMatch } from '@/types';

interface KeywordChipProps {
  keyword: KeywordMatch;
  onClickSection?: (section: string) => void;
}

export const KeywordChip: React.FC<KeywordChipProps> = ({ keyword, onClickSection }) => {
  const isFound = keyword.category === 'Already Found' || keyword.status === 'found';
  const isCritical = keyword.category === 'Critical Missing';

  let badgeStyle = '';
  let Icon = CheckCircle2;

  if (isFound) {
    badgeStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60';
    Icon = CheckCircle2;
  } else if (isCritical) {
    badgeStyle = 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/60';
    Icon = XCircle;
  } else {
    badgeStyle = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60';
    Icon = AlertTriangle;
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all hover:shadow-xs ${badgeStyle}`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span className="font-semibold">{keyword.keyword}</span>

      {!isFound && keyword.section_suggestion && (
        <span
          onClick={() => onClickSection && onClickSection(keyword.section_suggestion!)}
          className="ml-1 px-1.5 py-0.5 rounded text-[10px] bg-black/5 dark:bg-white/10 uppercase tracking-wider opacity-85 hover:underline cursor-pointer flex items-center gap-0.5"
          title={`Suggested Section: ${keyword.section_suggestion}`}
        >
          +{keyword.section_suggestion}
          <ArrowUpRight className="w-2.5 h-2.5" />
        </span>
      )}
    </div>
  );
};
