import { useState } from 'react';
import { useTheme } from './hooks/useTheme';
import { usePWA } from './hooks/usePWA';
import { useReadings } from './hooks/useReadings';
import { Navbar } from './components/Navbar/Navbar';
import { CalendarView } from './components/Calendar/CalendarView';
import { ReadingView } from './components/ReadingView/ReadingView';
import { ProgressModal } from './components/Progress/ProgressModal';
import { BottomNav } from './components/BottomNav/BottomNav';
import type { PaperTheme } from './types';
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
  const [paperTheme, setPaperTheme] = useState<PaperTheme>(() => {
    return theme === 'dark' ? 'midnight' : 'parchment';
  });

  const handleOpenReadingView = () => {
    setActiveView('reading');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToCalendar = () => {
    setActiveView('calendar');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div
      style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
      data-paper={paperTheme}
    >
      {/* Top Navbar */}
      <Navbar
        theme={theme}
        onToggleTheme={toggleTheme}
        isOffline={isOffline}
        installPrompt={installPrompt}
        onInstall={triggerInstall}
        onOpenStats={() => setIsStatsOpen(true)}
        monthCompleted={stats.monthCompleted}
        totalCompleted={stats.totalCompleted}
      />

      {/* Main Viewport Container */}
      <main className="app-viewport" style={{ paddingTop: '1.25rem', paddingBottom: '3.5rem' }}>
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
            paperTheme={paperTheme}
            onSelectPaperTheme={setPaperTheme}
            onToggleComplete={toggleComplete}
            onBackToCalendar={handleBackToCalendar}
            onPrevDay={goToPrevDay}
            onNextDay={goToNextDay}
          />
        )}
      </main>

      {/* Footer */}
      <footer style={{ marginTop: 'auto', padding: '1.25rem 1rem', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
        <div style={{ maxWidth: '820px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {isOffline ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#d97706', fontWeight: 600 }}>
                <WifiOff size={14} />
                <span>Offline Mode (Cached Assets Ready)</span>
              </span>
            ) : (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#10b981', fontWeight: 600 }}>
                <Wifi size={14} />
                <span>PWA Active — Standalone Ready</span>
              </span>
            )}
            {swRegistered && (
              <span className="badge-pill badge-success" style={{ fontSize: '0.65rem' }}>
                <CheckCircle size={10} /> SW Active
              </span>
            )}
          </div>

          <div>Scripture Reader PWA — Lightweight Offline Daily Bible</div>
        </div>
      </footer>

      {/* Bottom Nav */}
      <BottomNav
        activeView={activeView}
        onSelectView={(v) => {
          setActiveView(v);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenStats={() => setIsStatsOpen(true)}
        hasCurrentReadings={currentReadings.length > 0}
      />

      {/* Stats Modal */}
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
