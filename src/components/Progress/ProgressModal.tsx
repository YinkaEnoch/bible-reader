import React from 'react';
import { X, Award, CheckCircle2, Flame } from 'lucide-react';
import { formatMonthYear } from '../../lib/dateUtils';

interface ProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMonth: Date;
  stats: {
    totalCompleted: number;
    monthCompleted: number;
    totalMonthReadings: number;
    completionRate: number;
  };
}

export const ProgressModal: React.FC<ProgressModalProps> = ({
  isOpen,
  onClose,
  currentMonth,
  stats,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="surface-card max-w-sm w-full p-6 space-y-6 shadow-2xl relative border border-[var(--border-color)]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center bg-[var(--bg-tertiary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent-gold-subtle)] text-[var(--accent-gold)] flex items-center justify-center font-bold">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold font-heading text-[var(--text-primary)]">
              Reading Progress
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              {formatMonthYear(currentMonth)}
            </p>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="p-3.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] space-y-1">
            <Flame className="w-5 h-5 mx-auto text-amber-500" />
            <div className="text-2xl font-bold font-heading text-[var(--text-primary)]">
              {stats.monthCompleted}
            </div>
            <div className="text-[11px] font-semibold text-[var(--text-muted)]">
              This Month
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] space-y-1">
            <CheckCircle2 className="w-5 h-5 mx-auto text-emerald-500" />
            <div className="text-2xl font-bold font-heading text-[var(--text-primary)]">
              {stats.totalCompleted}
            </div>
            <div className="text-[11px] font-semibold text-[var(--text-muted)]">
              Total Readings
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-[var(--text-secondary)]">Month Goal</span>
            <span className="text-[var(--accent-gold)]">{stats.completionRate}%</span>
          </div>
          <div className="w-full h-3 rounded-full bg-[var(--bg-tertiary)] overflow-hidden border border-[var(--border-subtle)]">
            <div
              className="h-full bg-gradient-to-r from-[var(--accent-gold)] to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(stats.completionRate, 100)}%` }}
            />
          </div>
          <p className="text-[11px] text-[var(--text-muted)] text-center pt-1">
            {stats.monthCompleted} of {stats.totalMonthReadings} scheduled readings completed.
          </p>
        </div>

        {/* Done CTA */}
        <button
          onClick={onClose}
          className="w-full btn-primary text-sm py-2.5"
        >
          Keep Reading
        </button>
      </div>
    </div>
  );
};
