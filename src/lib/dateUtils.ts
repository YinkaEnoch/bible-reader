import type { CalendarDay, BibleReadingsMap, ReadingStatusMap } from '../types';

/**
 * Format a Date object to YYYY-MM-DD string format
 */
export function formatDateKey(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Parse YYYY-MM-DD string back to Date object
 */
export function parseDateKey(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Check if two Date objects fall on the exact same day
 */
export function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

/**
 * Format date for human display (e.g., "Thursday, August 13, 2026")
 */
export function formatFullDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

/**
 * Format month & year for header (e.g., "August 2026")
 */
export function formatMonthYear(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(date);
}

/**
 * Generate grid matrix of days for a given month view (including padding days from prev/next months)
 */
export function getCalendarGridDays(
  currentMonth: Date,
  selectedDate: Date,
  readingsData: BibleReadingsMap,
  completedMap: ReadingStatusMap
): CalendarDay[] {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const today = new Date();

  // First day of current month
  const firstDayOfMonth = new Date(year, month, 1);
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 (Sun) - 6 (Sat)

  // Last day of current month
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const totalDaysInMonth = lastDayOfMonth.getDate();

  const gridDays: CalendarDay[] = [];

  // Previous month padding days
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, prevMonthLastDay - i);
    const dateStr = formatDateKey(d);
    const hasReading = Boolean(readingsData[dateStr]?.length);
    const readingCount = readingsData[dateStr]?.length || 0;

    gridDays.push({
      date: d,
      dateString: dateStr,
      dayNumber: d.getDate(),
      isCurrentMonth: false,
      isToday: isSameDay(d, today),
      isSelected: isSameDay(d, selectedDate),
      hasReading,
      isCompleted: Boolean(completedMap[dateStr]),
      readingCount,
    });
  }

  // Current month days
  for (let dayNum = 1; dayNum <= totalDaysInMonth; dayNum++) {
    const d = new Date(year, month, dayNum);
    const dateStr = formatDateKey(d);
    const hasReading = Boolean(readingsData[dateStr]?.length);
    const readingCount = readingsData[dateStr]?.length || 0;

    gridDays.push({
      date: d,
      dateString: dateStr,
      dayNumber: dayNum,
      isCurrentMonth: true,
      isToday: isSameDay(d, today),
      isSelected: isSameDay(d, selectedDate),
      hasReading,
      isCompleted: Boolean(completedMap[dateStr]),
      readingCount,
    });
  }

  // Next month padding days to complete 35 or 42 grid cells
  const remainingCells = (7 - (gridDays.length % 7)) % 7;
  for (let i = 1; i <= remainingCells; i++) {
    const d = new Date(year, month + 1, i);
    const dateStr = formatDateKey(d);
    const hasReading = Boolean(readingsData[dateStr]?.length);
    const readingCount = readingsData[dateStr]?.length || 0;

    gridDays.push({
      date: d,
      dateString: dateStr,
      dayNumber: i,
      isCurrentMonth: false,
      isToday: isSameDay(d, today),
      isSelected: isSameDay(d, selectedDate),
      hasReading,
      isCompleted: Boolean(completedMap[dateStr]),
      readingCount,
    });
  }

  return gridDays;
}
