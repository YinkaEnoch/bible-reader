import React from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle2, BookOpen, ArrowRight, Info } from 'lucide-react';
import type { BibleReadingsMap, ReadingStatusMap } from '../../types';
import { getCalendarGridDays, formatMonthYear, formatFullDate, formatDateKey } from '../../lib/dateUtils';

interface CalendarViewProps {
  currentMonth: Date;
  selectedDate: Date;
  readingsData: BibleReadingsMap;
  completedMap: ReadingStatusMap;
  onSelectDate: (date: Date) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onGoToToday: () => void;
  onOpenReadingView: () => void;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const CalendarView: React.FC<CalendarViewProps> = ({
  currentMonth,
  selectedDate,
  readingsData,
  completedMap,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
  onGoToToday,
  onOpenReadingView,
}) => {
  const gridDays = getCalendarGridDays(currentMonth, selectedDate, readingsData, completedMap);
  const selectedDateStr = formatDateKey(selectedDate);
  const selectedReadings = readingsData[selectedDateStr] || [];
  const isSelectedCompleted = Boolean(completedMap[selectedDateStr]);

  return (
    <div className="space-y-6 pb-20">
      {/* Calendar Card Container */}
      <div className="surface-card p-4 sm:p-6 space-y-4 shadow-sm">
        {/* Calendar Header Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="w-5 h-5 text-[var(--accent-gold)]" />
            <h2 className="text-xl font-bold font-heading text-[var(--text-primary)]">
              {formatMonthYear(currentMonth)}
            </h2>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={onGoToToday}
              className="px-2.5 py-1 text-xs font-semibold rounded-md bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] transition-colors border border-[var(--border-color)]"
              title="Go to Today"
            >
              Today
            </button>
            <button
              onClick={onPrevMonth}
              className="w-8 h-8 rounded-md flex items-center justify-center bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] transition-colors border border-[var(--border-color)]"
              title="Previous Month"
              aria-label="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={onNextMonth}
              className="w-8 h-8 rounded-md flex items-center justify-center bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] transition-colors border border-[var(--border-color)]"
              title="Next Month"
              aria-label="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-xs text-[var(--text-muted)] pt-1 border-t border-[var(--border-subtle)]">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-[var(--accent-gold)]"></span>
              <span>Has Reading</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Completed</span>
            </div>
          </div>
        </div>

        {/* Days of Week Row */}
        <div className="grid grid-cols-7 gap-1 text-center font-semibold text-xs text-[var(--text-muted)] py-1">
          {WEEKDAYS.map((day) => (
            <div key={day} className="py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid Cells */}
        <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
          {gridDays.map((dayItem, idx) => {
            const { date, dayNumber, isCurrentMonth, isToday, isSelected, hasReading, isCompleted } = dayItem;

            let cellBgClass = 'bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)]';
            
            if (!isCurrentMonth) {
              cellBgClass = 'opacity-40 text-[var(--text-muted)] hover:opacity-70';
            }

            if (isSelected) {
              cellBgClass = 'bg-[var(--accent-gold)] text-white font-bold shadow-md transform scale-[1.03] z-10';
            }

            return (
              <button
                key={idx}
                onClick={() => onSelectDate(date)}
                className={`relative min-h-[50px] sm:min-h-[58px] p-1 rounded-xl flex flex-col items-center justify-between border transition-all duration-150 ${
                  isSelected ? 'border-[var(--accent-gold-hover)]' : isToday ? 'border-[var(--accent-gold)] bg-[var(--accent-gold-subtle)]' : 'border-[var(--border-subtle)]'
                } ${cellBgClass}`}
                aria-label={`${formatFullDate(date)}${hasReading ? ', has readings' : ''}${isCompleted ? ', completed' : ''}`}
              >
                {/* Top Row: Day Number & Today indicator */}
                <div className="w-full flex items-center justify-between px-1">
                  <span className={`text-xs sm:text-sm font-semibold ${isToday && !isSelected ? 'text-[var(--accent-gold)]' : ''}`}>
                    {dayNumber}
                  </span>

                  {isCompleted && (
                    <CheckCircle2
                      className={`w-3.5 h-3.5 ${
                        isSelected ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    />
                  )}
                </div>

                {/* Bottom Row: Reading Indicator */}
                <div className="w-full flex items-center justify-center pb-1">
                  {hasReading ? (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isSelected ? 'bg-white' : 'bg-[var(--accent-gold)]'
                      }`}
                    />
                  ) : (
                    <span className="w-1.5 h-1.5 opacity-0" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Date Reading Preview Banner Card */}
      <div className="surface-card p-5 sm:p-6 space-y-4 border-l-4 border-l-[var(--accent-gold)] shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--accent-gold)]">
              Selected Date
            </span>
            <h3 className="text-lg font-bold font-heading text-[var(--text-primary)]">
              {formatFullDate(selectedDate)}
            </h3>
          </div>

          {isSelectedCompleted && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 self-start sm:self-auto">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Completed
            </span>
          )}
        </div>

        {/* Assigned Readings List */}
        {selectedReadings.length > 0 ? (
          <div className="space-y-3">
            <div className="grid gap-2.5">
              {selectedReadings.map((p, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)]"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--accent-gold)] font-bold text-xs">
                      {idx + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-[var(--text-primary)] font-heading">
                        {p.book} {p.chapters}
                      </div>
                      {p.category && (
                        <div className="text-[11px] text-[var(--text-muted)]">
                          {p.category}
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-[var(--text-muted)] font-medium">
                    {p.versesText?.length || 0} Verses
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={onOpenReadingView}
              className="w-full btn-primary flex items-center justify-center space-x-2 text-sm mt-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>Read Scripture Passage</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="p-4 rounded-lg bg-[var(--bg-tertiary)] text-center space-y-2 border border-[var(--border-color)]">
            <Info className="w-5 h-5 mx-auto text-[var(--text-muted)]" />
            <p className="text-xs text-[var(--text-secondary)]">
              No assigned Bible reading for this date.
            </p>
            <button
              onClick={onGoToToday}
              className="text-xs font-semibold text-[var(--accent-gold)] hover:underline"
            >
              Jump to Today's Reading →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
