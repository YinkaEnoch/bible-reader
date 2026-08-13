import React from 'react';
import { BookOpen, Sun, Moon, Download, WifiOff, Flame } from 'lucide-react';
import type { ThemeMode } from '../../types';

interface NavbarProps {
  theme: ThemeMode;
  onToggleTheme: () => void;
  isOffline: boolean;
  installPrompt: any;
  onInstall: () => void;
  onOpenStats: () => void;
  monthCompleted: number;
  totalCompleted: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  theme,
  onToggleTheme,
  isOffline,
  installPrompt,
  onInstall,
  onOpenStats,
  monthCompleted,
  totalCompleted,
}) => {
  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Brand Logo & Title */}
        <div className="navbar-logo-group" onClick={onOpenStats}>
          <div className="navbar-icon-box">
            <BookOpen size={20} strokeWidth={2.5} />
          </div>
          <div className="navbar-title-box">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <h1>Scripture</h1>
              <span className="badge-pill">PWA</span>
            </div>
            <div className="navbar-subtitle">
              <span>Daily Bible Reader</span>
              {isOffline && (
                <span className="badge-pill" style={{ color: '#d97706', borderColor: 'rgba(217,119,6,0.3)' }}>
                  <WifiOff size={10} /> Offline
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="navbar-actions">
          <button
            onClick={onOpenStats}
            className="btn-secondary"
            style={{ borderRadius: '9999px', padding: '0.4rem 0.85rem' }}
            title="View Progress & Stats"
          >
            <Flame size={16} color="#f59e0b" fill="#f59e0b" />
            <span style={{ fontWeight: 700 }}>{monthCompleted}</span>
            <span style={{ opacity: 0.75 }}>Done ({totalCompleted} Total)</span>
          </button>

          {installPrompt && (
            <button onClick={onInstall} className="btn-primary" style={{ minHeight: '36px', padding: '0.4rem 0.85rem', borderRadius: '9999px' }}>
              <Download size={14} />
              <span>Install</span>
            </button>
          )}

          <button
            onClick={onToggleTheme}
            className="btn-icon"
            style={{ borderRadius: '9999px' }}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={18} color="#fbbf24" /> : <Moon size={18} color="#334155" />}
          </button>
        </div>
      </div>
    </header>
  );
};
