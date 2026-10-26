import React from 'react';
import { Sun, Moon, WifiOff, Info } from 'lucide-react';
import type { ThemeMode } from '../../types';
import { APP_VERSION } from '../../version';
import { AppLogo } from '../Logo/AppLogo';

interface NavbarProps {
  theme: ThemeMode;
  onToggleTheme: () => void;
  isOffline: boolean;
  onOpenAbout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  theme,
  onToggleTheme,
  isOffline,
  onOpenAbout,
}) => {
  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Top Row: Brand & Theme Toggle */}
        <div className="navbar-top-row">
          <div className="navbar-logo-group">
            <AppLogo size={34} />
            <div className="navbar-title-box">
              <h1>Bible Reader</h1>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {onOpenAbout && (
              <button
                onClick={onOpenAbout}
                className="btn-icon"
                style={{ borderRadius: '9999px' }}
                title="About Bible Reader"
                aria-label="About Bible Reader"
              >
                <Info size={18} color="var(--text-secondary)" />
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

        {/* Bottom Row: Subtitle & Offline Status */}
        <div className="navbar-bottom-row">
          <div className="navbar-subtitle">
            <span>Offline Daily Scripture</span>
            <span
              className="badge-pill"
              style={{
                fontSize: '0.65rem',
                padding: '0.1rem 0.45rem',
                opacity: 0.85,
              }}
            >
              v{APP_VERSION}
            </span>
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
