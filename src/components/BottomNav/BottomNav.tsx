import React from 'react';
import { Calendar, BookOpen, Award } from 'lucide-react';

interface BottomNavProps {
  activeView: 'calendar' | 'reading';
  onSelectView: (view: 'calendar' | 'reading') => void;
  onOpenStats: () => void;
  hasCurrentReadings: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeView,
  onSelectView,
  onOpenStats,
  hasCurrentReadings,
}) => {
  return (
    <nav className="bottom-nav">
      <button
        onClick={() => onSelectView('calendar')}
        className={`bottom-tab ${activeView === 'calendar' ? 'active' : ''}`}
      >
        <Calendar size={20} />
        <span>Calendar</span>
      </button>

      <button
        onClick={() => onSelectView('reading')}
        className={`bottom-tab ${activeView === 'reading' ? 'active' : ''}`}
        style={{ position: 'relative' }}
      >
        <BookOpen size={20} />
        <span>Reading</span>
        {hasCurrentReadings && activeView !== 'reading' && (
          <span style={{ position: 'absolute', top: '4px', right: '16px', width: '7px', height: '7px', borderRadius: '9999px', backgroundColor: 'var(--accent-gold)' }} />
        )}
      </button>

      <button onClick={onOpenStats} className="bottom-tab">
        <Award size={20} />
        <span>Progress</span>
      </button>
    </nav>
  );
};
