import type { Verse, RandomScripture } from '../../types';

/**
 * Source data shape for each per-book JSON file.
 * Chapters are keyed by chapter number (string), each containing an array of verses.
 */
export interface BookData {
  book: string;
  chapters: Record<string, Verse[]>;
}

/**
 * Lazy import map: book display name → dynamic import function.
 * Vite will code-split each book into its own chunk.
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
 * Load a book's data, using the cache when available.
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
    console.warn(`Failed to load Bible text for "${book}":`, err);
    return null;
  }
}

/**
 * Parse a chapter/verse reference string and extract the matching verses.
 *
 * Supported formats (from bible-readings.json):
 *   "1"          → whole chapter 1
 *   "11-12"      → whole chapters 11 through 12
 *   "3:1-8"      → chapter 3, verses 1–8
 *   "1:26-56"    → chapter 1, verses 26–56
 *   "10:1-11:1"  → chapter 10 verse 1 through chapter 11 verse 1
 *   ""           → empty, no verses
 */
/**
 * Parse a chapter/verse reference string and extract the matching verses.
 *
 * Supported formats (from bible-readings.json):
 *   "1"          → whole chapter 1
 *   "11-12"      → whole chapters 11 through 12
 *   "3:1-8"      → chapter 3, verses 1–8 (supports letter suffixes like "29:1-22a", "29:22b-30")
 *   "12-13:1"    → chapter 12 through chapter 13 verse 1
 *   "1:26-56"    → chapter 1, verses 26–56
 *   "10:1-11:1"  → chapter 10 verse 1 through chapter 11 verse 1
 *   "15-21"      → in 1-chapter books (e.g. Obadiah, Philemon), verses 15–21
 *   ""           → empty, no verses
 */
export function parseChapterRef(
  chapters: Record<string, Verse[]>,
  ref: string,
): Verse[] {
  if (!ref || ref.trim() === '') return [];

  const trimmed = ref.trim();

  // Pattern 1: cross-chapter range "10:1-11:3" or "10:1a-11:3b"
  const crossChapterMatch = trimmed.match(/^(\d+):(\d+)[a-z]?-(\d+):(\d+)[a-z]?$/i);
  if (crossChapterMatch) {
    const startChap = parseInt(crossChapterMatch[1], 10);
    const startVerse = parseInt(crossChapterMatch[2], 10);
    const endChap = parseInt(crossChapterMatch[3], 10);
    const endVerse = parseInt(crossChapterMatch[4], 10);

    const result: Verse[] = [];
    for (let c = startChap; c <= endChap; c++) {
      const chapVerses = chapters[String(c)];
      if (!chapVerses) continue;

      for (const v of chapVerses) {
        if (c === startChap && v.number < startVerse) continue;
        if (c === endChap && v.number > endVerse) continue;
        result.push(v);
      }
    }
    return result;
  }

  // Pattern 2: chapter-to-chapter:verse range "12-13:1"
  const chapToChapVerseMatch = trimmed.match(/^(\d+)-(\d+):(\d+)[a-z]?$/i);
  if (chapToChapVerseMatch) {
    const startChap = parseInt(chapToChapVerseMatch[1], 10);
    const endChap = parseInt(chapToChapVerseMatch[2], 10);
    const endVerse = parseInt(chapToChapVerseMatch[3], 10);

    const result: Verse[] = [];
    for (let c = startChap; c <= endChap; c++) {
      const chapVerses = chapters[String(c)];
      if (!chapVerses) continue;

      for (const v of chapVerses) {
        if (c === endChap && v.number > endVerse) continue;
        result.push(v);
      }
    }
    return result;
  }

  // Pattern 3: single-chapter verse range "3:1-8" or "29:1-22a" or "29:22b-30"
  const verseRangeMatch = trimmed.match(/^(\d+):(\d+)[a-z]?-(\d+)[a-z]?$/i);
  if (verseRangeMatch) {
    let chap = verseRangeMatch[1];
    const startVerse = parseInt(verseRangeMatch[2], 10);
    const endVerse = parseInt(verseRangeMatch[3], 10);

    // Reading plan typo correction: Psalm 19:89-176 is Psalm 119:89-176
    if (chap === '19' && startVerse >= 89 && !chapters['19']?.some((v) => v.number >= 89) && chapters['119']) {
      chap = '119';
    }

    const chapVerses = chapters[chap];
    if (!chapVerses) return [];

    return chapVerses.filter((v) => v.number >= startVerse && v.number <= endVerse);
  }

  // Pattern 4: single-chapter single verse "3:16"
  const singleVerseMatch = trimmed.match(/^(\d+):(\d+)[a-z]?$/i);
  if (singleVerseMatch) {
    const chap = singleVerseMatch[1];
    const verseNum = parseInt(singleVerseMatch[2], 10);
    const chapVerses = chapters[chap];
    if (!chapVerses) return [];
    return chapVerses.filter((v) => v.number === verseNum);
  }

  // Pattern 5: whole chapter range "11-12"
  const chapterRangeMatch = trimmed.match(/^(\d+)-(\d+)$/);
  if (chapterRangeMatch) {
    const startChap = parseInt(chapterRangeMatch[1], 10);
    const endChap = parseInt(chapterRangeMatch[2], 10);

    // Edge case: single-chapter books (like Obadiah or Philemon) where a range like "15-21"
    // refers to verses in chapter 1, not chapters 15-21
    const chapterKeys = Object.keys(chapters);
    if (chapterKeys.length === 1 && !chapters[String(startChap)]) {
      const onlyChap = chapters[chapterKeys[0]];
      if (onlyChap) {
        return onlyChap.filter((v) => v.number >= startChap && v.number <= endChap);
      }
    }

    const result: Verse[] = [];
    for (let c = startChap; c <= endChap; c++) {
      const chapVerses = chapters[String(c)];
      if (chapVerses) result.push(...chapVerses);
    }
    return result;
  }

  // Pattern 6: single whole chapter "1" or "100"
  const wholeChapterMatch = trimmed.match(/^(\d+)$/);
  if (wholeChapterMatch) {
    return chapters[wholeChapterMatch[1]] || [];
  }

  // Fallback: unknown format
  console.warn(`Unknown chapter reference format: "${ref}"`);
  return [];
}

/**
 * Get verses for a specific book and chapter/verse reference.
 * This is the main API used by the app.
 *
 * @param book - Book name (e.g. "Genesis", "1 Chronicles")
 * @param chaptersRef - Chapter/verse reference (e.g. "1", "3:1-8", "10:1-11:1")
 * @returns Array of Verse objects matching the reference
 */
export async function getVerses(book: string, chaptersRef: string): Promise<Verse[]> {
  // Reading plan typo: Philippians 1-3, 4-7, 8-22, 23-25 is actually Philemon 1-3, 4-7, 8-22, 23-25
  let targetBook = book;
  if (book === 'Philippians' && ['1-3', '4-7', '8-22', '23-25'].includes(chaptersRef?.trim())) {
    targetBook = 'Philemon';
  }

  const data = await loadBook(targetBook);
  if (!data) return [];

  return parseChapterRef(data.chapters, chaptersRef);
}

export const DEFAULT_SCRIPTURE: RandomScripture = {
  book: 'Psalms',
  chapter: '119',
  verse: 105,
  text: 'Thy word is a lamp unto my feet, and a light unto my path.',
  reference: 'Psalm 119:105',
};

/**
 * Retrieves a random verse from any book in the King James Version (KJV).
 * Loads the selected book on-demand via dynamic chunk import.
 */
export async function getRandomVerse(): Promise<RandomScripture> {
  const books = Object.keys(bookImports);
  if (books.length === 0) return DEFAULT_SCRIPTURE;

  // Try up to 3 times in case of unexpected empty chapters or load errors
  for (let attempt = 0; attempt < 3; attempt++) {
    const randomBook = books[Math.floor(Math.random() * books.length)];
    const bookData = await loadBook(randomBook);
    if (!bookData || !bookData.chapters) continue;

    const chapters = Object.keys(bookData.chapters);
    if (chapters.length === 0) continue;

    const randomChapter = chapters[Math.floor(Math.random() * chapters.length)];
    const verses = bookData.chapters[randomChapter];
    if (!verses || verses.length === 0) continue;

    const randomVerse = verses[Math.floor(Math.random() * verses.length)];
    const bookDisplayName = bookData.book === 'Psalms' ? 'Psalm' : bookData.book;

    return {
      book: bookData.book,
      chapter: randomChapter,
      verse: randomVerse.number,
      text: randomVerse.text.trim(),
      reference: `${bookDisplayName} ${randomChapter}:${randomVerse.number}`,
    };
  }

  return DEFAULT_SCRIPTURE;
}

