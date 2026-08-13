import React from 'react';
import { X, Award, CheckCircle2, Flame, Sparkles } from 'lucide-react';
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

  const strokeDashoffset = 283 - (283 * Math.min(stats.completionRate, 100)) / 100;

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <button onClick={onClose} className="modal-close" aria-label="Close modal">
          <X size={16} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="navbar-icon-box" style={{ width: '44px', height: '44px', borderRadius: '14px' }}>
            <Award size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--accent-gold)', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase' }}>
              <Sparkles size={12} />
              <span>Scripture Journey</span>
            </div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700 }}>
              {formatMonthYear(currentMonth)}
            </h3>
          </div>
        </div>

        {/* Gauge */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', padding: '0.5rem 0' }}>
          <div style={{ position: 'relative', width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }} viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" stroke="var(--bg-tertiary)" strokeWidth="8" fill="transparent" />
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="var(--accent-gold)"
                strokeWidth="8"
                strokeDasharray="283"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                style={{ transition: 'stroke-dashoffset 1s ease' }}
              />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', paddingTop: '1.75rem' }}>
              <span style={{ fontSize: '1.6rem', fontWeight: 900, fontFamily: 'var(--font-heading)' }}>
                {stats.completionRate}%
              </span>
              <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Completed
              </span>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', textAlign: 'center' }}>
          <div style={{ padding: '0.85rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
            <Flame size={22} color="#f59e0b" fill="#f59e0b" style={{ margin: '0 auto 4px auto' }} />
            <div style={{ fontSize: '1.4rem', fontWeight: 900, fontFamily: 'var(--font-heading)' }}>{stats.monthCompleted}</div>
            <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Month Streak</div>
          </div>

          <div style={{ padding: '0.85rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
            <CheckCircle2 size={22} color="#10b981" style={{ margin: '0 auto 4px auto' }} />
            <div style={{ fontSize: '1.4rem', fontWeight: 900, fontFamily: 'var(--font-heading)' }}>{stats.totalCompleted}</div>
            <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Days</div>
          </div>
        </div>

        <button onClick={onClose} className="btn-primary" style={{ width: '100%', fontSize: '0.9rem' }}>
          Continue Reading
        </button>
      </div>
    </div>
  );
};
