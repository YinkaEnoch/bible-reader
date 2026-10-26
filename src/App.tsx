import { useState } from "react";
import { useTheme } from "./hooks/useTheme";
import { usePWA } from "./hooks/usePWA";
import { useReadings } from "./hooks/useReadings";
import { Navbar } from "./components/Navbar/Navbar";
import { CalendarView } from "./components/Calendar/CalendarView";
import { ReadingView } from "./components/ReadingView/ReadingView";
import type { PaperTheme } from "./types";

export function App() {
  const { theme, toggleTheme } = useTheme();
  const { isOffline } = usePWA();
  const {
    bibleData,
    selectedDate,
    currentMonth,
    currentReadings,
    isLoadingVerses,
    selectDate,
    nextMonth,
    prevMonth,
    goToToday,
    goToNextDay,
    goToPrevDay,
  } = useReadings();

  const [activeView, setActiveView] = useState<"calendar" | "reading">("calendar");
  const [selectedPassageIndex, setSelectedPassageIndex] = useState<number>(0);

  const handleOpenReadingView = (passageIndex: number = 0) => {
    setSelectedPassageIndex(passageIndex);
    setActiveView("reading");
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const [paperTheme, setPaperTheme] = useState<PaperTheme>(() => {
    return theme === "dark" ? "midnight" : "parchment";
  });

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
            onBackToCalendar={() => setActiveView("calendar")}
            onPrevDay={goToPrevDay}
            onNextDay={goToNextDay}
            initialPassageIndex={selectedPassageIndex}
            isLoadingVerses={isLoadingVerses}
          />
        )}
      </main>
    </div>
  );
}

export default App;
