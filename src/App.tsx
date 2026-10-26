import { useState, useCallback, useEffect } from "react";
import { useTheme } from "./hooks/useTheme";
import { usePWA } from "./hooks/usePWA";
import { useReadings } from "./hooks/useReadings";
import { useBibleVersion } from "./hooks/useBibleVersion";
import { useAndroidBackButton } from "./hooks/useAndroidBackButton";
import { Navbar } from "./components/Navbar/Navbar";
import { CalendarView } from "./components/Calendar/CalendarView";
import { ReadingView } from "./components/ReadingView/ReadingView";
import type { PaperTheme } from "./types";

export function App() {
  const { theme, toggleTheme } = useTheme();
  const { isOffline } = usePWA();
  const { bibleVersion, setBibleVersion } = useBibleVersion();
  const {
    bibleData,
    selectedDate,
    currentMonth,
    currentReadings,
    isLoadingVerses,
    completedMap,
    isPassageRead,
    togglePassageRead,
    selectDate,
    nextMonth,
    prevMonth,
    goToToday,
    goToNextDay,
    goToPrevDay,
  } = useReadings(bibleVersion);

  const [activeView, setActiveView] = useState<"calendar" | "reading">("calendar");
  const [selectedPassageIndex, setSelectedPassageIndex] = useState<number>(0);

  // Intercept the Android hardware back button.
  // When the reading view is open, go back to the calendar instead of exiting.
  const handleBackButton = useCallback(() => {
    if (activeView === "reading") {
      setActiveView("calendar");
      return true; // event handled — don't exit
    }
    return false; // let Capacitor's default "exit app" run
  }, [activeView]);

  useAndroidBackButton(handleBackButton);

  const handleOpenReadingView = (passageIndex: number = 0) => {
    setSelectedPassageIndex(passageIndex);
    setActiveView("reading");
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  // Derive the initial paper theme from the resolved theme value so the two
  // systems start in sync. When the user explicitly picks a paper theme inside
  // the ReadingView, `setPaperTheme` overrides this derived value (that's fine
  // — the override only lasts for the session; on the next cold-start the hook
  // initialiser re-derives from localStorage / system preference again).
  const [paperTheme, setPaperTheme] = useState<PaperTheme>(
    theme === "dark" ? "midnight" : "parchment"
  );

  // Keep paperTheme in sync whenever the top-level theme toggle changes so
  // that toggling dark/light mode is immediately reflected in the reading view
  // paper style. A user-selected paperTheme (e.g. "sepia") is intentionally
  // overwritten here because the theme toggle always signals intent to go dark
  // or light — the user can re-select their preferred paper after switching.
  useEffect(() => {
    setPaperTheme(theme === "dark" ? "midnight" : "parchment");
  }, [theme]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "var(--bg-primary)",
        color: "var(--text-primary)",
      }}
      data-paper={paperTheme}
    >
      {/* Top Navbar */}
      <Navbar
        theme={theme}
        onToggleTheme={toggleTheme}
        isOffline={isOffline}
      />

      {/* Main Viewport Container */}
      <main
        className="app-viewport"
        style={{
          paddingTop: "1.25rem",
          paddingBottom: "3.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
        }}
      >
        {activeView === "calendar" ? (
          <CalendarView
            currentMonth={currentMonth}
            selectedDate={selectedDate}
            readingsData={bibleData}
            completedMap={completedMap}
            isPassageRead={isPassageRead}
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
            paperTheme={paperTheme}
            onSelectPaperTheme={setPaperTheme}
            bibleVersion={bibleVersion}
            onSelectBibleVersion={setBibleVersion}
            onBackToCalendar={() => setActiveView("calendar")}
            onPrevDay={goToPrevDay}
            onNextDay={goToNextDay}
            initialPassageIndex={selectedPassageIndex}
            isLoadingVerses={isLoadingVerses}
            isPassageRead={isPassageRead}
            onTogglePassageRead={togglePassageRead}
          />
        )}
      </main>
    </div>
  );
}

export default App;
