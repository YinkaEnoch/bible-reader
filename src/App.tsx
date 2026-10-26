import { useState, useCallback, useEffect } from "react";
import { useTheme } from "./hooks/useTheme";
import { usePWA } from "./hooks/usePWA";
import { useReadings } from "./hooks/useReadings";
import { useBibleVersion } from "./hooks/useBibleVersion";
import { useAndroidBackButton } from "./hooks/useAndroidBackButton";
import { useRandomScripture } from "./hooks/useRandomScripture";
import { Navbar } from "./components/Navbar/Navbar";
import { CalendarView } from "./components/Calendar/CalendarView";
import { ReadingView } from "./components/ReadingView/ReadingView";
import { AboutModal, type AboutTab } from "./components/About/AboutModal";
import type { PaperTheme } from "./types";

export function App() {
  const { theme, toggleTheme } = useTheme();
  const { isOffline } = usePWA();
  const { bibleVersion, setBibleVersion } = useBibleVersion();
  const {
    scripture: randomScripture,
    refreshScripture,
    isLoading: isLoadingScripture,
  } = useRandomScripture();
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
  const [aboutModalOpen, setAboutModalOpen] = useState<boolean>(false);
  const [aboutModalTab, setAboutModalTab] = useState<AboutTab>("about");

  const handleOpenAbout = (tab: AboutTab = "about") => {
    setAboutModalTab(tab);
    setAboutModalOpen(true);
  };

  // Intercept the Android hardware back button.
  // When a modal or reading view is open, dismiss/navigate back instead of exiting.
  const handleBackButton = useCallback(() => {
    if (aboutModalOpen) {
      setAboutModalOpen(false);
      return true; // event handled — don't exit
    }
    if (activeView === "reading") {
      setActiveView("calendar");
      return true; // event handled — don't exit
    }
    return false; // let Capacitor's default "exit app" run
  }, [aboutModalOpen, activeView]);

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
        onOpenAbout={() => handleOpenAbout("about")}
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
          <>
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
              randomScripture={randomScripture}
              onRefreshScripture={refreshScripture}
              isLoadingScripture={isLoadingScripture}
            />
            <footer
              style={{
                marginTop: "1.5rem",
                paddingTop: "1.25rem",
                borderTop: "1px solid var(--border-subtle)",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "0.6rem",
                  alignItems: "center",
                  flexWrap: "wrap",
                  justifyContent: "center",
                }}
              >
                <button
                  type="button"
                  onClick={() => handleOpenAbout("about")}
                  className="footer-link-btn"
                >
                  About
                </button>
                <span style={{ color: "var(--border-color)", fontSize: "0.7rem" }}>•</span>
                <button
                  type="button"
                  onClick={() => handleOpenAbout("privacy")}
                  className="footer-link-btn"
                >
                  Privacy Policy
                </button>
                <span style={{ color: "var(--border-color)", fontSize: "0.7rem" }}>•</span>
                <button
                  type="button"
                  onClick={() => handleOpenAbout("credits")}
                  className="footer-link-btn"
                >
                  Credits
                </button>
              </div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                Developed by{" "}
                <a
                  href="https://yinkaenoch.netlify.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "var(--accent-gold)",
                    textDecoration: "none",
                    fontWeight: 600,
                  }}
                >
                  Yinka Enoch Adedokun
                </a>
              </div>
            </footer>
          </>
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

      {/* About, Privacy & Credits Modal */}
      <AboutModal
        isOpen={aboutModalOpen}
        onClose={() => setAboutModalOpen(false)}
        initialTab={aboutModalTab}
      />
    </div>
  );
}

export default App;
