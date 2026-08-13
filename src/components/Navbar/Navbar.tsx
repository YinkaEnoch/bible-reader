import React from 'react';
import { BookOpen, Sun, Moon, Download, WifiOff } from 'lucide-react';
import type { ThemeMode } from '../../types';

interface NavbarProps {
  theme: ThemeMode;
  onToggleTheme: () => void;
  isOffline: boolean;
  installPrompt: any;
  onInstall: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  theme,
  onToggleTheme,
  isOffline,
  installPrompt,
  onInstall,
}) => {
  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Brand Logo & Title */}
        <div className="navbar-logo-group">
          <div className="navbar-icon-box">
            <BookOpen size={20} strokeWidth={2.5} />
          </div>
          <div className="navbar-title-box">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <h1>Bible Reader</h1>
              <span className="badge-pill">PWA</span>
            </div>
            <div className="navbar-subtitle">
              <span>Offline Daily Scripture</span>
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
