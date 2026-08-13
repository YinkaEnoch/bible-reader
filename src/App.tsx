import { useState } from "react";
import { useTheme } from "./hooks/useTheme";
import { usePWA } from "./hooks/usePWA";
import { useReadings } from "./hooks/useReadings";
import { Navbar } from "./components/Navbar/Navbar";
import { CalendarView } from "./components/Calendar/CalendarView";
import { ReadingView } from "./components/ReadingView/ReadingView";
import type { PaperTheme } from "./types";
import { CheckCircle, Wifi, WifiOff } from "lucide-react";

export function App() {
  const { theme, toggleTheme } = useTheme();
  const { isOffline, installPrompt, triggerInstall, swRegistered } = usePWA();
  const {
    bibleData,
    selectedDate,
    currentMonth,
    currentReadings,
    selectDate,
    nextMonth,
    prevMonth,
    goToToday,
    goToNextDay,
    goToPrevDay,
  } = useReadings();

  const [activeView, setActiveView] = useState<"calendar" | "reading">(
    "calendar",
  );
  const [paperTheme, setPaperTheme] = useState<PaperTheme>(() => {
    return theme === "dark" ? "midnight" : "parchment";
  });

  const handleOpenReadingView = () => {
    setActiveView("reading");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackToCalendar = () => {
    setActiveView("calendar");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
        installPrompt={installPrompt}
        onInstall={triggerInstall}
      />

      {/* Main Viewport Container */}
      <main
        className="app-viewport"
        style={{ paddingTop: "1.25rem", paddingBottom: "3.5rem" }}
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
            onBackToCalendar={handleBackToCalendar}
            onPrevDay={goToPrevDay}
            onNextDay={goToNextDay}
          />
        )}
      </main>
    </div>
  );
}

export default App;
