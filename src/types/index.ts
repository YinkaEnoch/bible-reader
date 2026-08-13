export interface Verse {
  number: number;
  text: string;
}

export interface Passage {
  book: string;
  chapters: string;
  category?: string;
  versesText?: Verse[];
}

export type BibleReadingsMap = Record<string, Passage[]>;

export type ReadingStatusMap = Record<string, boolean>;

export type PaperTheme = 'parchment' | 'sepia' | 'midnight' | 'oled';

export type FontStyle = 'serif' | 'sans';

export type ThemeMode = 'light' | 'dark' | 'system';

export type ReaderFontSize = 'sm' | 'md' | 'lg' | 'xl';

export interface CalendarDay {
  date: Date;
  dateString: string; // YYYY-MM-DD
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  hasReading: boolean;
  isCompleted: boolean;
  readingCount: number;
}
