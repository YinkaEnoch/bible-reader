import React, { useState, useEffect } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, CheckCircle2, Volume2, VolumeX, Type, Bookmark, BookOpen } from 'lucide-react';
import type { Passage, ReaderFontSize } from '../../types';
import { formatFullDate } from '../../lib/dateUtils';

interface ReadingViewProps {
  selectedDate: Date;
  passages: Passage[];
  isCompleted: boolean;
  onToggleComplete: () => void;
  onBackToCalendar: () => void;
  onPrevDay: () => void;
  onNextDay: () => void;
}

export const ReadingView: React.FC<ReadingViewProps> = ({
  selectedDate,
  passages,
  isCompleted,
  onToggleComplete,
  onBackToCalendar,
  onPrevDay,
  onNextDay,
}) => {
  const [fontSize, setFontSize] = useState<ReaderFontSize>('md');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [speechSupported, setSpeechSupported] = useState<boolean>(false);

  useEffect(() => {
    setSpeechSupported('speechSynthesis' in window);
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [selectedDate]);

  const toggleSpeech = () => {
    if (!speechSupported) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Build text from passages
    const fullText = passages
      .map(
        (p) =>
          `${p.book} chapter ${p.chapters}. ${
            p.versesText?.map((v) => `Verse ${v.number}: ${v.text}`).join(' ') || ''
          }`
      )
      .join('. ');

    if (!fullText) return;

    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'sm': return 'font-size-sm';
      case 'lg': return 'font-size-lg';
      case 'xl': return 'font-size-xl';
      default: return 'font-size-md';
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-24">
      {/* Top Reader Navigation Bar */}
      <div className="flex items-center justify-between gap-2 py-2 border-b border-[var(--border-subtle)]">
        <button
          onClick={onBackToCalendar}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] transition-colors border border-[var(--border-color)]"
          aria-label="Back to Calendar"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Calendar</span>
        </button>

        {/* Previous / Next Day Quick Navigation */}
        <div className="flex items-center space-x-1">
          <button
            onClick={onPrevDay}
            className="w-8 h-8 rounded-lg flex items-center justify-center bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] transition-colors border border-[var(--border-color)]"
            title="Previous Day's Reading"
            aria-label="Previous Day's Reading"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={onNextDay}
            className="w-8 h-8 rounded-lg flex items-center justify-center bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] transition-colors border border-[var(--border-color)]"
            title="Next Day's Reading"
            aria-label="Next Day's Reading"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Mark as Completed Button */}
        <button
          onClick={onToggleComplete}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
            isCompleted
              ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
              : 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] border-[var(--border-color)] hover:bg-[var(--bg-hover)]'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{isCompleted ? 'Completed' : 'Mark Completed'}</span>
        </button>
      </div>

      {/* Title Header */}
      <div className="text-center space-y-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--accent-gold)]">
          Daily Scripture Passage
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold font-heading text-[var(--text-primary)]">
          {formatFullDate(selectedDate)}
        </h2>
      </div>

      {/* Reader Controls Toolbar (Font Size, Audio) */}
      <div className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs">
        <div className="flex items-center space-x-1">
          <Type className="w-4 h-4 text-[var(--text-muted)] mr-1" />
          {(['sm', 'md', 'lg', 'xl'] as ReaderFontSize[]).map((size) => (
            <button
              key={size}
              onClick={() => setFontSize(size)}
              className={`w-7 h-7 rounded-md font-semibold transition-colors uppercase ${
                fontSize === size
                  ? 'bg-[var(--accent-gold)] text-white'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
              }`}
            >
              {size}
            </button>
          ))}
        </div>

        {speechSupported && (
          <button
            onClick={toggleSpeech}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-md font-medium transition-colors ${
              isSpeaking
                ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
            }`}
            title="Audio Read-Aloud"
          >
            {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span className="hidden sm:inline">{isSpeaking ? 'Stop Audio' : 'Listen'}</span>
          </button>
        )}
      </div>

      {/* Passages List */}
      {passages.length > 0 ? (
        <div className="space-y-8">
          {passages.map((passage, pIdx) => (
            <article
              key={pIdx}
              className="surface-card p-6 sm:p-8 space-y-6 shadow-sm border border-[var(--border-color)]"
            >
              {/* Passage Title Header */}
              <div className="border-b border-[var(--border-subtle)] pb-4 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[var(--accent-gold-subtle)] text-[var(--accent-gold)]">
                    {passage.category || 'Scripture'}
                  </span>
                  <Bookmark className="w-4 h-4 text-[var(--text-muted)] opacity-60" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold font-heading text-[var(--text-primary)]">
                  {passage.book} {passage.chapters}
                </h3>
              </div>

              {/* Verses Content */}
              {passage.versesText && passage.versesText.length > 0 ? (
                <div className={`space-y-4 font-serif text-[var(--text-primary)] ${getFontSizeClass()}`}>
                  {passage.versesText.map((verse) => (
                    <p key={verse.number} className="relative pl-6 leading-relaxed">
                      <sup className="absolute left-0 top-1 text-xs font-sans font-bold text-[var(--accent-gold)] select-none">
                        {verse.number}
                      </sup>
                      <span>{verse.text}</span>
                    </p>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-sm text-[var(--text-muted)] italic font-serif">
                  Refer to {passage.book} {passage.chapters} in your preferred printed or audio Bible translation.
                </div>
              )}
            </article>
          ))}
        </div>
      ) : (
        <div className="surface-card p-8 text-center space-y-4">
          <BookOpen className="w-10 h-10 mx-auto text-[var(--text-muted)] opacity-50" />
          <h3 className="text-lg font-bold font-heading text-[var(--text-primary)]">
            No Assigned Reading
          </h3>
          <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
            There are no assigned scripture passages for {formatFullDate(selectedDate)}.
            Use the navigation buttons above to view other dates.
          </p>
        </div>
      )}

      {/* Bottom Completion Banner */}
      <div className="pt-4 flex justify-center">
        <button
          onClick={onToggleComplete}
          className={`btn-primary flex items-center space-x-2 text-sm px-6 py-3 shadow-md ${
            isCompleted ? 'bg-emerald-600 hover:bg-emerald-700' : ''
          }`}
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>{isCompleted ? 'Marked as Completed!' : 'Complete Today\'s Reading'}</span>
        </button>
      </div>
    </div>
  );
};
