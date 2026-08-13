import React from 'react';
import { BookOpen, Sun, Moon, WifiOff } from 'lucide-react';
import type { ThemeMode } from '../../types';

interface NavbarProps {
  theme: ThemeMode;
  onToggleTheme: () => void;
  isOffline: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  theme,
  onToggleTheme,
  isOffline,
}) => {
  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Top Row: Brand & Theme Toggle */}
        <div className="navbar-top-row">
          <div className="navbar-logo-group">
            <div className="navbar-icon-box">
              <BookOpen size={20} strokeWidth={2.5} />
            </div>
            <div className="navbar-title-box">
              <h1>Bible Reader</h1>
            </div>
          </div>

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

        {/* Bottom Row: Subtitle & Offline Status */}
        <div className="navbar-bottom-row">
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
    </header>
  );
};
