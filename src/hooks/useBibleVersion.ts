import { useState, useEffect } from 'react';
import type { BibleVersion } from '../types';

const STORAGE_KEY = 'bible_app_version_v1';

/**
 * Hook that manages the active Bible translation version.
 * Persists the user's choice in localStorage.
 */
export function useBibleVersion() {
  const [bibleVersion, setBibleVersionState] = useState<BibleVersion>(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as BibleVersion | null;
    return saved === 'WEB' ? 'WEB' : 'KJV';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, bibleVersion);
  }, [bibleVersion]);

  const setBibleVersion = (version: BibleVersion) => {
    setBibleVersionState(version);
  };

  return { bibleVersion, setBibleVersion };
}
