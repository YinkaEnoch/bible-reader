import React, { useState } from 'react';
import { BookOpen, Sun, Moon, Download, WifiOff, CheckCircle, X, Smartphone, Monitor } from 'lucide-react';
import type { ThemeMode } from '../../types';

interface NavbarProps {
  theme: ThemeMode;
  onToggleTheme: () => void;
  isOffline: boolean;
  installPrompt: any;
  isInstalled?: boolean;
  onInstall: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  theme,
  onToggleTheme,
  isOffline,
  installPrompt,
  isInstalled,
  onInstall,
}) => {
  const [showInstallGuide, setShowInstallGuide] = useState<boolean>(false);

  const handleInstallClick = () => {
    if (installPrompt) {
      onInstall();
    } else {
      setShowInstallGuide(true);
    }
  };

  return (
    <>
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

          {/* Bottom Row: Subtitle & PWA Install Controls */}
          <div className="navbar-bottom-row">
            <div className="navbar-subtitle">
              <span>Offline Daily Scripture</span>
              {isOffline && (
                <span className="badge-pill" style={{ color: '#d97706', borderColor: 'rgba(217,119,6,0.3)' }}>
                  <WifiOff size={10} /> Offline
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span className="badge-pill">PWA</span>

              {!isInstalled ? (
                <button
                  onClick={handleInstallClick}
                  className="btn-primary"
                  style={{ minHeight: '32px', padding: '0.3rem 0.75rem', borderRadius: '9999px', fontSize: '0.78rem' }}
                  title="Install PWA for offline reading"
                >
                  <Download size={13} />
                  <span>Install App</span>
                </button>
              ) : (
                <span className="badge-pill badge-success" style={{ padding: '0.25rem 0.65rem' }}>
                  <CheckCircle size={11} /> Installed
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* PWA Installation Guidance Modal */}
      {showInstallGuide && (
        <div className="modal-overlay" onClick={() => setShowInstallGuide(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowInstallGuide(false)} className="modal-close" aria-label="Close">
              <X size={16} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div className="navbar-icon-box" style={{ width: '44px', height: '44px', borderRadius: '14px' }}>
                <Download size={22} />
              </div>
              <div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 700 }}>
                  Install Bible Reader App
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Use completely offline from your home screen
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.85rem' }}>
              <div style={{ padding: '0.85rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <Smartphone size={22} color="var(--accent-gold)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontWeight: 700, marginBottom: '2px' }}>iPhone / iPad (iOS Safari)</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Tap the <strong>Share button</strong> in Safari → select <strong>"Add to Home Screen"</strong>.
                  </div>
                </div>
              </div>

              <div style={{ padding: '0.85rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <Monitor size={22} color="var(--accent-gold)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontWeight: 700, marginBottom: '2px' }}>Android & Desktop (Chrome / Edge)</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Click the browser menu (<strong>⋮</strong> or <strong>...</strong>) → select <strong>"Install App"</strong> or <strong>"Add to Home Screen"</strong>.
                  </div>
                </div>
              </div>
            </div>

            <button onClick={() => setShowInstallGuide(false)} className="btn-primary" style={{ width: '100%', marginTop: '0.25rem' }}>
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
};
