import { useState, useEffect, useCallback } from 'react';
import { getRandomVerse, DEFAULT_SCRIPTURE } from '../data/bible-text';
import type { RandomScripture } from '../types';

/**
 * Hook to provide a random KJV Bible verse loaded dynamically on application start.
 * Also provides a refresh function to manually fetch another random scripture.
 */
export function useRandomScripture() {
  const [scripture, setScripture] = useState<RandomScripture>(DEFAULT_SCRIPTURE);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const refreshScripture = useCallback(async () => {
    setIsLoading(true);
    try {
      const verse = await getRandomVerse();
      setScripture(verse);
    } catch (err) {
      console.warn('Failed to load random scripture:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Automatically fetch a random scripture whenever the app loads
    refreshScripture();
  }, [refreshScripture]);

  return {
    scripture,
    isLoading,
    refreshScripture,
  };
}
