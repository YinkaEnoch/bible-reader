import { useState, useMemo, useEffect } from 'react';
import bibleDataRaw from '../data/bible-readings.json';
import type { BibleReadingsMap, ReadingStatusMap, Passage, BibleVersion } from '../types';
import { formatDateKey, parseDateKey } from '../lib/dateUtils';
import { getVerses } from '../data/bible-text';
import { getWEBVerses } from '../data/bible-text-web';

const bibleData = bibleDataRaw as BibleReadingsMap;

const LOCAL_STORAGE_KEY = 'bible_reader_completed_v1';

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

  // Completed status map from LocalStorage
  const [completedMap, setCompletedMap] = useState<ReadingStatusMap>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(completedMap));
    } catch (e) {
      console.warn('Failed to save reading progress to localStorage', e);
    }
  }, [completedMap]);

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
    setCompletedMap((prev) => ({
      ...prev,
      [dateStr]: !prev[dateStr],
    }));
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
