import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  BookOpen,
  Info,
  Sparkles,
  Grid,
  Columns,
} from "lucide-react";
import type { BibleReadingsMap } from "../../types";
import {
  getCalendarGridDays,
  formatMonthYear,
  formatFullDate,
  formatDateKey,
} from "../../lib/dateUtils";

interface CalendarViewProps {
  currentMonth: Date;
  selectedDate: Date;
  readingsData: BibleReadingsMap;
  onSelectDate: (date: Date) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onGoToToday: () => void;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const CalendarView: React.FC<CalendarViewProps> = ({
  currentMonth,
  selectedDate,
  readingsData,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
  onGoToToday,
}) => {
  const [viewMode, setViewMode] = useState<"grid" | "week">("grid");

  const gridDays = getCalendarGridDays(
    currentMonth,
    selectedDate,
    readingsData,
    {},
  );
  const selectedDateStr = formatDateKey(selectedDate);
  const selectedReadings = readingsData[selectedDateStr] || [];

  const selectedIndex = gridDays.findIndex((d) => d.isSelected);
  const weekDays =
    selectedIndex >= 0
      ? gridDays.slice(
          Math.max(0, selectedIndex - 3),
          Math.min(gridDays.length, selectedIndex + 4),
        )
      : gridDays.slice(0, 7);

  const activeDaysList = viewMode === "grid" ? gridDays : weekDays;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Reflection Banner */}
      <div className="quote-banner">
        <div className="quote-banner-content">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              color: "var(--accent-gold)",
              fontSize: "0.75rem",
              fontWeight: 800,
              textTransform: "uppercase",
            }}
          >
            <Sparkles size={14} />
            <span>Daily Scripture</span>
          </div>
          <p className="quote-text">
            "Thy word is a lamp unto my feet, and a light unto my path."
          </p>
          <div className="quote-author">— Psalm 119:105</div>
        </div>
      </div>

      {/* Calendar Card */}
      <div className="card-surface calendar-card">
        {/* Header Controls */}
        <div className="calendar-top-bar">
          <div className="calendar-month-title">
            <div
              className="navbar-icon-box"
              style={{ width: "36px", height: "36px" }}
            >
              <CalendarIcon size={18} />
            </div>
            <div>
              <h2>{formatMonthYear(currentMonth)}</h2>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                Select a date to open assigned Bible readings
              </span>
            </div>
          </div>

          <div className="calendar-controls">
            <div
              style={{
                display: "flex",
                backgroundColor: "var(--bg-tertiary)",
                padding: "2px",
                borderRadius: "8px",
                border: "1px solid var(--border-color)",
              }}
            >
              <button
                onClick={() => setViewMode("grid")}
                className="btn-icon"
                style={{
                  width: "30px",
                  height: "30px",
                  backgroundColor:
                    viewMode === "grid" ? "var(--bg-secondary)" : "transparent",
                  border: "none",
                }}
                title="Month Grid View"
              >
                <Grid
                  size={14}
                  color={
                    viewMode === "grid"
                      ? "var(--accent-gold)"
                      : "var(--text-muted)"
                  }
                />
              </button>
              <button
                onClick={() => setViewMode("week")}
                className="btn-icon"
                style={{
                  width: "30px",
                  height: "30px",
                  backgroundColor:
                    viewMode === "week" ? "var(--bg-secondary)" : "transparent",
                  border: "none",
                }}
                title="Week Strip View"
              >
                <Columns
                  size={14}
                  color={
                    viewMode === "week"
                      ? "var(--accent-gold)"
                      : "var(--text-muted)"
                  }
                />
              </button>
            </div>

            <button
              onClick={onGoToToday}
              className="btn-secondary"
              style={{ padding: "0.35rem 0.75rem", minHeight: "32px" }}
            >
              Today
            </button>

            <button
              onClick={onPrevMonth}
              className="btn-icon"
              style={{ width: "32px", height: "32px" }}
              title="Previous Month"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={onNextMonth}
              className="btn-icon"
              style={{ width: "32px", height: "32px" }}
              title="Next Month"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="calendar-weekdays">
          {WEEKDAYS.map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>

        {/* Calendar Grid Cells */}
        <div className="calendar-grid">
          {activeDaysList.map((dayItem, idx) => {
            const {
              date,
              dayNumber,
              isCurrentMonth,
              isToday,
              isSelected,
              hasReading,
            } = dayItem;

            let cellClass = "calendar-cell";
            if (!isCurrentMonth) cellClass += " muted";
            if (isToday) cellClass += " today";
            if (isSelected) cellClass += " selected";

            return (
              <button
                key={idx}
                onClick={() => onSelectDate(date)}
                className={cellClass}
                aria-label={`${formatFullDate(date)}${hasReading ? ", has reading" : ""}`}
              >
                <div className="cell-top-row">
                  <span className="cell-day-num">{dayNumber}</span>
                </div>

                <div className="cell-dot-row">
                  {!hasReading ? <span className="no-reading-dot" /> : null}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Date Reading Card */}
      <div className="card-surface reading-preview-card">
        <div className="preview-header">
          <div>
            <span
              style={{
                fontSize: "0.72rem",
                fontWeight: 800,
                textTransform: "uppercase",
                color: "var(--accent-gold)",
              }}
            >
              Selected Date
            </span>
            <h3
              style={{
                marginTop: "0.2rem",
                fontFamily: "var(--font-heading)",
                fontSize: "1.3rem",
                fontWeight: 700,
              }}
            >
              {formatFullDate(selectedDate)}
            </h3>
          </div>

          {selectedReadings.length > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.85rem",
                fontSize: "0.8rem",
                color: "var(--text-muted)",
                fontWeight: 600,
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.3rem",
                }}
              >
                <BookOpen size={15} color="var(--accent-gold)" />
                {selectedReadings.length} Passages
              </span>
            </div>
          )}
        </div>

        {selectedReadings.length > 0 ? (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}
          >
            <div className="preview-passages-list">
              {selectedReadings.map((p, idx) => (
                <div key={idx} className="passage-card-item">
                  <div className="passage-card-info">
                    <div className="passage-num-badge">{idx + 1}</div>
                    <div>
                      <div className="passage-book-title">
                        {p.book} {p.chapters}
                      </div>
                      {p.category && (
                        <div className="passage-category">{p.category}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div
            style={{
              padding: "1.5rem",
              textAlign: "center",
              backgroundColor: "var(--bg-tertiary)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-color)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <Info size={24} color="var(--text-muted)" />
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              No assigned Bible reading for this date.
            </p>
            <button
              onClick={onGoToToday}
              className="btn-secondary"
              style={{ border: "none", color: "var(--accent-gold)" }}
            >
              Jump to Today's Reading →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
