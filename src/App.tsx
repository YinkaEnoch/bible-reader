import { useState } from 'react';
import { useTheme } from './hooks/useTheme';
import { usePWA } from './hooks/usePWA';
import { useReadings } from './hooks/useReadings';
import { Navbar } from './components/Navbar/Navbar';
import { CalendarView } from './components/Calendar/CalendarView';
import { ReadingView } from './components/ReadingView/ReadingView';
import { ProgressModal } from './components/Progress/ProgressModal';
import { BottomNav } from './components/BottomNav/BottomNav';
import { CheckCircle, Wifi, WifiOff } from 'lucide-react';

export function App() {
  const { theme, toggleTheme } = useTheme();
  const { isOffline, installPrompt, triggerInstall, swRegistered } = usePWA();
  const {
    bibleData,
    selectedDate,
    currentMonth,
    currentReadings,
    isSelectedCompleted,
    completedMap,
    stats,
    selectDate,
    nextMonth,
    prevMonth,
    goToToday,
    goToNextDay,
    goToPrevDay,
    toggleComplete,
  } = useReadings();

  const [activeView, setActiveView] = useState<'calendar' | 'reading'>('calendar');
  const [isStatsOpen, setIsStatsOpen] = useState<boolean>(false);

  const handleOpenReadingView = () => {
    setActiveView('reading');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToCalendar = () => {
    setActiveView('calendar');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors selection:bg-[var(--accent-gold-light)] selection:text-[var(--accent-gold)]">
      {/* Top Bar Navigation */}
      <Navbar
        theme={theme}
        onToggleTheme={toggleTheme}
        isOffline={isOffline}
        installPrompt={installPrompt}
        onInstall={triggerInstall}
        onOpenStats={() => setIsStatsOpen(true)}
        monthCompleted={stats.monthCompleted}
      />

      {/* Main Content Area */}
      <main className="app-container pt-6 pb-12 flex-1">
        {/* View Switcher: Calendar vs Reading */}
        {activeView === 'calendar' ? (
          <CalendarView
            currentMonth={currentMonth}
            selectedDate={selectedDate}
            readingsData={bibleData}
            completedMap={completedMap}
            onSelectDate={(date) => selectDate(date)}
            onPrevMonth={prevMonth}
            onNextMonth={nextMonth}
            onGoToToday={goToToday}
            onOpenReadingView={handleOpenReadingView}
          />
        ) : (
          <ReadingView
            selectedDate={selectedDate}
            passages={currentReadings}
            isCompleted={isSelectedCompleted}
            onToggleComplete={toggleComplete}
            onBackToCalendar={handleBackToCalendar}
            onPrevDay={goToPrevDay}
            onNextDay={goToNextDay}
          />
        )}
      </main>

      {/* Desktop / Footer Details */}
      <footer className="mt-auto py-6 border-t border-[var(--border-color)] bg-[var(--bg-secondary)]/50 text-center text-xs text-[var(--text-muted)] transition-colors">
        <div className="max-w-3xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            {isOffline ? (
              <span className="flex items-center space-x-1 text-amber-600 dark:text-amber-400">
                <WifiOff className="w-3.5 h-3.5" />
                <span>Offline Mode (Cached & Available)</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400">
                <Wifi className="w-3.5 h-3.5" />
                <span>Online — PWA Ready</span>
              </span>
            )}
            {swRegistered && (
              <span className="inline-flex items-center text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                <CheckCircle className="w-3 h-3 mr-1" /> Cache Ready
              </span>
            )}
          </div>

          <div>
            Bible Reader PWA — Lightweight, Offline-First Daily Scripture
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        activeView={activeView}
        onSelectView={(v) => {
          setActiveView(v);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenStats={() => setIsStatsOpen(true)}
        hasCurrentReadings={currentReadings.length > 0}
      />

      {/* Progress & Stats Modal */}
      <ProgressModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        currentMonth={currentMonth}
        stats={stats}
      />
    </div>
  );
}

export default App;
