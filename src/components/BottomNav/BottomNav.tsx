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
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-[var(--bg-primary)]/95 backdrop-blur-md border-t border-[var(--border-color)] px-4 py-2 sm:hidden transition-colors">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {/* Calendar View Tab */}
        <button
          onClick={() => onSelectView('calendar')}
          className={`flex flex-col items-center space-y-1 py-1 px-4 rounded-xl transition-all ${
            activeView === 'calendar'
              ? 'text-[var(--accent-gold)] font-bold'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Calendar</span>
        </button>

        {/* Reading View Tab */}
        <button
          onClick={() => onSelectView('reading')}
          className={`flex flex-col items-center space-y-1 py-1 px-4 rounded-xl relative transition-all ${
            activeView === 'reading'
              ? 'text-[var(--accent-gold)] font-bold'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Reading</span>
          {hasCurrentReadings && activeView !== 'reading' && (
            <span className="absolute top-1 right-3 w-2 h-2 rounded-full bg-[var(--accent-gold)] animate-pulse" />
          )}
        </button>

        {/* Progress Tab */}
        <button
          onClick={onOpenStats}
          className="flex flex-col items-center space-y-1 py-1 px-4 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all"
        >
          <Award className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Progress</span>
        </button>
      </div>
    </nav>
  );
};
