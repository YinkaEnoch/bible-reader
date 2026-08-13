import React from 'react';
import { BookOpen, Sun, Moon, Download, WifiOff, Award } from 'lucide-react';
import type { ThemeMode } from '../../types';

interface NavbarProps {
  theme: ThemeMode;
  onToggleTheme: () => void;
  isOffline: boolean;
  installPrompt: any;
  onInstall: () => void;
  onOpenStats: () => void;
  monthCompleted: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  theme,
  onToggleTheme,
  isOffline,
  installPrompt,
  onInstall,
  onOpenStats,
  monthCompleted,
}) => {
  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-[var(--bg-primary)]/90 border-b border-[var(--border-color)] transition-colors">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* App Title & Icon */}
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--accent-gold)] to-[var(--accent-gold-hover)] flex items-center justify-center text-white shadow-sm">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-[var(--text-primary)] font-heading leading-none">
              Bible Reader
            </h1>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <span className="text-[11px] font-medium text-[var(--text-muted)] tracking-wide uppercase">
                Offline PWA
              </span>
              {isOffline && (
                <span className="inline-flex items-center px-1.5 py-0.2 text-[10px] font-semibold rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  <WifiOff className="w-2.5 h-2.5 mr-1" />
                  Offline
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          {/* Progress / Stats Button */}
          <button
            onClick={onOpenStats}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors border border-[var(--border-color)]"
            title="View Reading Progress"
            aria-label="View Reading Progress"
          >
            <Award className="w-4 h-4 text-[var(--accent-gold)]" />
            <span className="hidden sm:inline">{monthCompleted} Done</span>
          </button>

          {/* Install PWA Button if available */}
          {installPrompt && (
            <button
              onClick={onInstall}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--accent-gold)] text-white hover:bg-[var(--accent-gold-hover)] transition-all shadow-sm"
              title="Install App Offline"
              aria-label="Install App Offline"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install</span>
            </button>
          )}

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={onToggleTheme}
            className="w-9 h-9 rounded-lg flex items-center justify-center bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors border border-[var(--border-color)]"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
