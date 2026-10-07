'use client';

import React from 'react';
import { getScoreColor, getScoreLabel } from '@/lib/utils';

interface CircularScoreProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  showStatus?: boolean;
}

export const CircularScore: React.FC<CircularScoreProps> = ({
  score,
  size = 140,
  strokeWidth = 10,
  label,
  sublabel,
  showStatus = true,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const validScore = Math.max(0, Math.min(100, score || 0));
  const strokeDashoffset = circumference - (validScore / 100) * circumference;
  const colors = getScoreColor(validScore);
  const statusLabel = getScoreLabel(validScore);

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-zinc-200 dark:text-zinc-800"
            fill="transparent"
          />
          {/* Foreground progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colors.stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
            {Math.round(validScore)}
          </span>
          <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
            / 100
          </span>
        </div>
      </div>

      {label && (
        <div className="mt-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {label}
        </div>
      )}

      {showStatus && (
        <span
          className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors.badge}`}
        >
          {statusLabel}
        </span>
      )}

      {sublabel && (
        <span className="mt-1 text-xs text-zinc-500 text-center max-w-[140px]">
          {sublabel}
        </span>
      )}
    </div>
  );
};
