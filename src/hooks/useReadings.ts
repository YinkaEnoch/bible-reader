import { useState, useMemo, useEffect } from 'react';
import bibleDataRaw from '../data/bible-readings.json';
import type { BibleReadingsMap, ReadingStatusMap, Passage, BibleVersion } from '../types';
import { formatDateKey, parseDateKey } from '../lib/dateUtils';
import { getVerses } from '../data/bible-text';
import { getWEBVerses } from '../data/bible-text-web';

const bibleData = bibleDataRaw as BibleReadingsMap;

const PASSAGE_STORAGE_KEY = 'bible_reader_passage_read_v1';

function getStoredPassageProgress(): { year: number; passages: Record<string, boolean> } {
  const currentYear = new Date().getFullYear();
  try {
    const raw = localStorage.getItem(PASSAGE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Annual reset check: If stored year matches current calendar year, preserve readings.
      // If year rolled over to a new year (Jan 1st of new year), reset progress.
      if (typeof parsed?.year === 'number' && parsed.year === currentYear) {
        return {
          year: currentYear,
          passages: parsed.passages || {},
        };
      }
    }
  } catch (err) {
    console.warn('Failed to parse passage progress from localStorage', err);
  }
  // Reset for the new year
  const fresh = { year: currentYear, passages: {} };
  try {
    localStorage.setItem(PASSAGE_STORAGE_KEY, JSON.stringify(fresh));
  } catch {}
  return fresh;
}

export function useReadings(bibleVersion: BibleVersion = 'KJV') {
  // Determine initial date. If current today date has reading, use today.
  // Default to August 13, 2026 if today is in a different year.
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const today = new Date();
    const todayStr = formatDateKey(today);
    if (bibleData[todayStr]) return today;
    // Fallback to current year 2026-08-13 sample date
    return new Date(2026, 7, 13);
  });

  const [currentMonth, setCurrentMonth] = useState<Date>(() => new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));

  // Passage read status map from LocalStorage with annual Jan 1st reset
  const [passageReadState, setPassageReadState] = useState<{
    year: number;
    passages: Record<string, boolean>;
  }>(getStoredPassageProgress);

  // Periodically & on window focus check if calendar year rolled over past Jan 1st
  useEffect(() => {
    const checkYearReset = () => {
      const currentYear = new Date().getFullYear();
      setPassageReadState((prev) => {
        if (prev.year !== currentYear) {
          const fresh = { year: currentYear, passages: {} };
          try {
            localStorage.setItem(PASSAGE_STORAGE_KEY, JSON.stringify(fresh));
          } catch {}
          return fresh;
        }
        return prev;
      });
    };

    window.addEventListener('focus', checkYearReset);
    const timer = setInterval(checkYearReset, 60000);
    return () => {
      window.removeEventListener('focus', checkYearReset);
      clearInterval(timer);
    };
  }, []);

  const passageReadMap = passageReadState.passages;

  const isPassageRead = (dateStr: string, passageIndex: number): boolean => {
    return Boolean(passageReadMap[`${dateStr}:${passageIndex}`]);
  };

  const togglePassageRead = (dateStr: string, passageIndex: number) => {
    const key = `${dateStr}:${passageIndex}`;
    const currentYear = new Date().getFullYear();
    setPassageReadState((prev) => {
      const yearToUse = prev.year === currentYear ? prev.year : currentYear;
      const basePassages = prev.year === currentYear ? prev.passages : {};
      const nextPassages = {
        ...basePassages,
        [key]: !basePassages[key],
      };
      const updated = {
        year: yearToUse,
        passages: nextPassages,
      };
      try {
        localStorage.setItem(PASSAGE_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save passage progress to localStorage', e);
      }
      return updated;
    });
  };

  // Derive completed days from passageReadMap: a day is complete if all assigned passages are read
  const completedMap = useMemo<ReadingStatusMap>(() => {
    const map: ReadingStatusMap = {};
    for (const [dateStr, passages] of Object.entries(bibleData)) {
      if (passages && passages.length > 0) {
        const allRead = passages.every((_, idx) => Boolean(passageReadMap[`${dateStr}:${idx}`]));
        if (allRead) {
          map[dateStr] = true;
        }
      }
    }
    return map;
  }, [passageReadMap]);

  const selectedDateStr = useMemo(() => formatDateKey(selectedDate), [selectedDate]);

  const rawReadings = useMemo<Passage[]>(() => {
    return bibleData[selectedDateStr] || [];
  }, [selectedDateStr]);

  // Cache of hydrated passages by "dateKey:version" compound key
  const [hydratedMap, setHydratedMap] = useState<Record<string, Passage[]>>({});
  const [isLoadingVerses, setIsLoadingVerses] = useState<boolean>(false);

  // Compound cache key so switching version forces re-hydration
  const hydratedKey = `${selectedDateStr}:${bibleVersion}`;

  useEffect(() => {
    if (rawReadings.length === 0) {
      setIsLoadingVerses(false);
      return;
    }

    if (hydratedMap[hydratedKey]) {
      setIsLoadingVerses(false);
      return;
    }

    let cancelled = false;
    setIsLoadingVerses(true);

    const fetchVerses = bibleVersion === 'WEB' ? getWEBVerses : getVerses;

    Promise.all(
      rawReadings.map(async (passage) => {
        const versesText = await fetchVerses(passage.book, passage.chapters);
        return { ...passage, versesText };
      }),
    )
      .then((hydrated) => {
        if (!cancelled) {
          setHydratedMap((prev) => ({ ...prev, [hydratedKey]: hydrated }));
          setIsLoadingVerses(false);
        }
      })
      .catch((err) => {
        console.warn('Failed to hydrate Bible verses:', err);
        if (!cancelled) {
          setHydratedMap((prev) => ({ ...prev, [hydratedKey]: rawReadings }));
          setIsLoadingVerses(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [rawReadings, hydratedKey, bibleVersion, hydratedMap]);

  const currentReadings = useMemo<Passage[]>(() => {
    return hydratedMap[hydratedKey] || rawReadings;
  }, [hydratedMap, hydratedKey, rawReadings]);

  const isSelectedCompleted = useMemo(() => {
    return Boolean(completedMap[selectedDateStr]);
  }, [completedMap, selectedDateStr]);

  const toggleComplete = (dateStr: string = selectedDateStr) => {
    const passagesForDate = bibleData[dateStr] || [];
    const isCurrentlyComplete = Boolean(completedMap[dateStr]);
    const targetStatus = !isCurrentlyComplete;
    const currentYear = new Date().getFullYear();

    setPassageReadState((prev) => {
      const yearToUse = prev.year === currentYear ? prev.year : currentYear;
      const basePassages = prev.year === currentYear ? { ...prev.passages } : {};
      passagesForDate.forEach((_, idx) => {
        basePassages[`${dateStr}:${idx}`] = targetStatus;
      });
      const updated = {
        year: yearToUse,
        passages: basePassages,
      };
      try {
        localStorage.setItem(PASSAGE_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save passage progress to localStorage', e);
      }
      return updated;
    });
  };

  const selectDate = (date: Date) => {
    setSelectedDate(date);
    // Keep currentMonth in sync if date is outside active month
    if (date.getMonth() !== currentMonth.getMonth() || date.getFullYear() !== currentMonth.getFullYear()) {
      setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    }
  };

  const nextMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToToday = () => {
    const today = new Date(2026, 7, 13); // 2026-08-13 default or current real date
    selectDate(today);
  };

  const goToNextDay = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    selectDate(next);
  };

  const goToPrevDay = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 1);
    selectDate(prev);
  };

  // Streak & stats calculations
  const stats = useMemo(() => {
    const keys = Object.keys(completedMap).filter((k) => completedMap[k]);
    const totalCompleted = keys.length;

    // Calculate completion count for active month
    const activeYear = currentMonth.getFullYear();
    const activeMonth = currentMonth.getMonth();
    const monthKeys = keys.filter((k) => {
      const d = parseDateKey(k);
      return d.getFullYear() === activeYear && d.getMonth() === activeMonth;
    });

    // Calculate total days with readings in active month
    const totalMonthReadings = Object.keys(bibleData).filter((k) => {
      const d = parseDateKey(k);
      return d.getFullYear() === activeYear && d.getMonth() === activeMonth;
    }).length;

    return {
      totalCompleted,
      monthCompleted: monthKeys.length,
      totalMonthReadings: totalMonthReadings || 30,
      completionRate: totalMonthReadings ? Math.round((monthKeys.length / totalMonthReadings) * 100) : 0,
    };
  }, [completedMap, currentMonth]);

  return {
    bibleData,
    selectedDate,
    selectedDateStr,
    currentMonth,
    currentReadings,
    isLoadingVerses,
    isSelectedCompleted,
    completedMap,
    passageReadMap,
    isPassageRead,
    togglePassageRead,
    stats,
    selectDate,
    setCurrentMonth,
    nextMonth,
    prevMonth,
    goToToday,
    goToNextDay,
    goToPrevDay,
    toggleComplete,
  };
}
