import type { Verse } from '../../types';
import { parseChapterRef } from '../bible-text/index';

/**
 * Source data shape for each per-book JSON file (WEB translation).
 * Identical schema to the KJV bible-text index.
 */
export interface BookData {
  book: string;
  chapters: Record<string, Verse[]>;
}

/**
 * Lazy import map: book display name → dynamic import function.
 * Vite will code-split each WEB book into its own chunk.
 */
const bookImports: Record<string, () => Promise<{ default: BookData }>> = {
  'Genesis':          () => import('./genesis.json'),
  'Exodus':           () => import('./exodus.json'),
  'Leviticus':        () => import('./leviticus.json'),
  'Numbers':          () => import('./numbers.json'),
  'Deuteronomy':      () => import('./deuteronomy.json'),
  'Joshua':           () => import('./joshua.json'),
  'Judges':           () => import('./judges.json'),
  'Ruth':             () => import('./ruth.json'),
  '1 Samuel':         () => import('./1-samuel.json'),
  '2 Samuel':         () => import('./2-samuel.json'),
  '1 Kings':          () => import('./1-kings.json'),
  '2 Kings':          () => import('./2-kings.json'),
  '1 Chronicles':     () => import('./1-chronicles.json'),
  '2 Chronicles':     () => import('./2-chronicles.json'),
  'Ezra':             () => import('./ezra.json'),
  'Nehemiah':         () => import('./nehemiah.json'),
  'Esther':           () => import('./esther.json'),
  'Job':              () => import('./job.json'),
  'Psalms':           () => import('./psalms.json'),
  'Proverbs':         () => import('./proverbs.json'),
  'Ecclesiastes':     () => import('./ecclesiastes.json'),
  'Song of Solomon':  () => import('./song-of-solomon.json'),
  'Isaiah':           () => import('./isaiah.json'),
  'Jeremiah':         () => import('./jeremiah.json'),
  'Lamentations':     () => import('./lamentations.json'),
  'Ezekiel':          () => import('./ezekiel.json'),
  'Daniel':           () => import('./daniel.json'),
  'Hosea':            () => import('./hosea.json'),
  'Joel':             () => import('./joel.json'),
  'Amos':             () => import('./amos.json'),
  'Obadiah':          () => import('./obadiah.json'),
  'Jonah':            () => import('./jonah.json'),
  'Micah':            () => import('./micah.json'),
  'Nahum':            () => import('./nahum.json'),
  'Habakkuk':         () => import('./habakkuk.json'),
  'Zephaniah':        () => import('./zephaniah.json'),
  'Haggai':           () => import('./haggai.json'),
  'Zechariah':        () => import('./zechariah.json'),
  'Malachi':          () => import('./malachi.json'),
  'Matthew':          () => import('./matthew.json'),
  'Mark':             () => import('./mark.json'),
  'Luke':             () => import('./luke.json'),
  'John':             () => import('./john.json'),
  'Acts':             () => import('./acts.json'),
  'Romans':           () => import('./romans.json'),
  '1 Corinthians':    () => import('./1-corinthians.json'),
  '2 Corinthians':    () => import('./2-corinthians.json'),
  'Galatians':        () => import('./galatians.json'),
  'Ephesians':        () => import('./ephesians.json'),
  'Philippians':      () => import('./philippians.json'),
  'Colossians':       () => import('./colossians.json'),
  '1 Thessalonians':  () => import('./1-thessalonians.json'),
  '2 Thessalonians':  () => import('./2-thessalonians.json'),
  '1 Timothy':        () => import('./1-timothy.json'),
  '2 Timothy':        () => import('./2-timothy.json'),
  'Titus':            () => import('./titus.json'),
  'Philemon':         () => import('./philemon.json'),
  'Hebrews':          () => import('./hebrews.json'),
  'James':            () => import('./james.json'),
  '1 Peter':          () => import('./1-peter.json'),
  '2 Peter':          () => import('./2-peter.json'),
  '1 John':           () => import('./1-john.json'),
  '2 John':           () => import('./2-john.json'),
  '3 John':           () => import('./3-john.json'),
  'Jude':             () => import('./jude.json'),
  'Revelation':       () => import('./revelation.json'),
};

/** Simple in-memory cache so repeated lookups for the same book are instant. */
const bookCache = new Map<string, BookData>();

/**
 * Load a WEB book's data, using the cache when available.
 */
async function loadBook(book: string): Promise<BookData | null> {
  if (bookCache.has(book)) {
    return bookCache.get(book)!;
  }

  const loader = bookImports[book];
  if (!loader) return null;

  try {
    const module = await loader();
    const data = module.default;
    bookCache.set(book, data);
    return data;
  } catch (err) {
    console.warn(`[WEB] Failed to load Bible text for "${book}":`, err);
    return null;
  }
}

/**
 * Get WEB verses for a specific book and chapter/verse reference.
 * Uses the same parseChapterRef logic as KJV via a shared import.
 *
 * @param book - Book name (e.g. "Genesis", "1 Chronicles")
 * @param chaptersRef - Chapter/verse reference (e.g. "1", "3:1-8")
 * @returns Array of Verse objects matching the reference
 */
export async function getWEBVerses(book: string, chaptersRef: string): Promise<Verse[]> {
  // Reading plan typo: Philippians 1-3, 4-7, 8-22, 23-25 → Philemon
  let targetBook = book;
  if (book === 'Philippians' && ['1-3', '4-7', '8-22', '23-25'].includes(chaptersRef?.trim())) {
    targetBook = 'Philemon';
  }

  const data = await loadBook(targetBook);
  if (!data) return [];

  // Re-use KJV's battle-tested reference parser (already a static import)
  return parseChapterRef(data.chapters, chaptersRef);
}
